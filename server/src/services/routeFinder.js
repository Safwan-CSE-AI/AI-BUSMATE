import { dbService } from './dbService.js';

export async function findBusRoutes({
  originStopId,
  destinationStopId,
  travelTime = new Date().toISOString(),
  preference = 'Balanced',
  maxTransfers = 1,
  isStudent = true
}) {
  const allStops = await dbService.getAllStops();
  const allRoutes = await dbService.getAllRoutes();
  const allRouteStops = await dbService.getAllRouteStops();
  const allFares = await dbService.getAllFares();

  // Resolve origin and destination
  const originStop = allStops.find(s => s.id === originStopId || s.name.toLowerCase() === originStopId.toLowerCase() || s.code.toLowerCase() === originStopId.toLowerCase());
  const destStop = allStops.find(s => s.id === destinationStopId || s.name.toLowerCase() === destinationStopId.toLowerCase() || s.code.toLowerCase() === destinationStopId.toLowerCase());

  if (!originStop || !destStop) {
    return {
      success: false,
      error: 'Invalid origin or destination stop selected.',
      routes: [],
      origin: originStop || null,
      destination: destStop || null
    };
  }

  if (originStop.id === destStop.id) {
    return {
      success: false,
      error: 'Starting location and destination cannot be identical.',
      routes: [],
      origin: originStop,
      destination: destStop
    };
  }

  // Group route stops by route_id
  const stopsByRoute = new Map();
  for (const rs of allRouteStops) {
    if (!stopsByRoute.has(rs.route_id)) {
      stopsByRoute.set(rs.route_id, []);
    }
    stopsByRoute.get(rs.route_id).push(rs);
  }
  for (const [rId, list] of stopsByRoute.entries()) {
    list.sort((a, b) => a.stop_sequence - b.stop_sequence);
  }

  const candidateRoutes = [];

  // Helper to compute fare
  function getSegmentFare(routeId, fromId, toId, distanceKm) {
    const directFare = allFares.find(f => f.route_id === routeId && f.from_stop_id === fromId && f.to_stop_id === toId);
    if (directFare) {
      return {
        regular: Number(directFare.regular_fare),
        student: Number(directFare.student_fare)
      };
    }
    // Fallback formula: ₹10 base + ₹2.5/km
    const reg = Math.max(15, Math.round(10 + (distanceKm * 2.5)));
    return {
      regular: reg,
      student: Math.max(8, Math.round(reg * 0.5))
    };
  }

  // 1. Check DIRECT ROUTES
  for (const route of allRoutes) {
    const rStops = stopsByRoute.get(route.id);
    if (!rStops) continue;

    const originIdx = rStops.findIndex(rs => rs.stop_id === originStop.id);
    const destIdx = rStops.findIndex(rs => rs.stop_id === destStop.id);

    if (originIdx !== -1 && destIdx !== -1 && originIdx < destIdx) {
      const startRs = rStops[originIdx];
      const endRs = rStops[destIdx];
      const intermediate = rStops.slice(originIdx, destIdx + 1);
      const intermediateNames = intermediate.map(rs => {
        const s = allStops.find(stop => stop.id === rs.stop_id);
        return s ? s.name : 'Stop';
      });

      const dist = Math.max(1.0, Number((endRs.distance_from_start_km - startRs.distance_from_start_km).toFixed(1)));
      const duration = Math.max(10, endRs.time_from_start_mins - startRs.time_from_start_mins || Math.round(dist * 2.5));
      const fareInfo = getSegmentFare(route.id, originStop.id, destStop.id, dist);
      const appliedFare = isStudent ? fareInfo.student : fareInfo.regular;

      candidateRoutes.push({
        id: `direct-${route.id}`,
        bus: route.route_number,
        busType: route.bus_type,
        routeName: route.route_name,
        routeId: route.id,
        boardAt: originStop.name,
        getDownAt: destStop.name,
        transferPoint: null,
        transfers: 0,
        durationMinutes: duration,
        distanceKm: dist,
        fare: appliedFare,
        regularFare: fareInfo.regular,
        studentFare: fareInfo.student,
        stopsCount: intermediate.length - 1,
        intermediateStops: intermediateNames,
        instructions: `Board Bus ${route.route_number} (${route.bus_type}) at ${originStop.name}. Ride ${intermediate.length - 1} stops directly and get down at ${destStop.name}.`,
        steps: [
          {
            stepIndex: 1,
            type: 'board',
            title: `Board Bus ${route.route_number}`,
            stop: originStop.name,
            locality: originStop.locality,
            busNumber: route.route_number,
            busType: route.bus_type,
            details: `Board at platform/bay near ${originStop.landmark || originStop.locality}.`
          },
          {
            stepIndex: 2,
            type: 'travel',
            title: `Ride on Bus ${route.route_number}`,
            stopsCount: intermediate.length - 1,
            durationMins: duration,
            distanceKm: dist,
            details: `Passes through ${intermediateNames.slice(1, -1).join(' → ') || 'express route'}.`
          },
          {
            stepIndex: 3,
            type: 'arrive',
            title: `Alight at ${destStop.name}`,
            stop: destStop.name,
            locality: destStop.locality,
            details: `Get down at ${destStop.name}. You have reached your destination!`
          }
        ],
        legs: [
          {
            bus: route.route_number,
            busType: route.bus_type,
            from: originStop.name,
            to: destStop.name,
            stops: intermediateNames,
            durationMinutes: duration,
            fare: appliedFare
          }
        ]
      });
    }
  }

  // 2. Check 1-TRANSFER ROUTES (if maxTransfers >= 1)
  if (maxTransfers >= 1) {
    for (const routeA of allRoutes) {
      const rStopsA = stopsByRoute.get(routeA.id);
      if (!rStopsA) continue;
      const originIdx = rStopsA.findIndex(rs => rs.stop_id === originStop.id);
      if (originIdx === -1) continue;

      // Check each subsequent stop in Route A as possible transfer point
      for (let i = originIdx + 1; i < rStopsA.length; i++) {
        const transferStopA = rStopsA[i];
        if (transferStopA.stop_id === destStop.id) continue; // Already covered by direct

        // Look for Route B from this transfer stop to destination
        for (const routeB of allRoutes) {
          if (routeB.id === routeA.id) continue;
          const rStopsB = stopsByRoute.get(routeB.id);
          if (!rStopsB) continue;

          const transferIdxB = rStopsB.findIndex(rs => rs.stop_id === transferStopA.stop_id);
          const destIdxB = rStopsB.findIndex(rs => rs.stop_id === destStop.id);

          if (transferIdxB !== -1 && destIdxB !== -1 && transferIdxB < destIdxB) {
            const transferStopObj = allStops.find(s => s.id === transferStopA.stop_id);
            if (!transferStopObj) continue;

            const leg1Stops = rStopsA.slice(originIdx, i + 1);
            const leg2Stops = rStopsB.slice(transferIdxB, destIdxB + 1);

            const dist1 = Math.max(0.8, Number((transferStopA.distance_from_start_km - rStopsA[originIdx].distance_from_start_km).toFixed(1)));
            const dur1 = Math.max(8, transferStopA.time_from_start_mins - rStopsA[originIdx].time_from_start_mins || Math.round(dist1 * 2.5));
            const fare1 = getSegmentFare(routeA.id, originStop.id, transferStopA.stop_id, dist1);

            const dist2 = Math.max(0.8, Number((rStopsB[destIdxB].distance_from_start_km - rStopsB[transferIdxB].distance_from_start_km).toFixed(1)));
            const dur2 = Math.max(8, rStopsB[destIdxB].time_from_start_mins - rStopsB[transferIdxB].time_from_start_mins || Math.round(dist2 * 2.5));
            const fare2 = getSegmentFare(routeB.id, transferStopA.stop_id, destStop.id, dist2);

            const layoverMinutes = 10;
            const totalDuration = dur1 + dur2 + layoverMinutes;
            const totalDist = Number((dist1 + dist2).toFixed(1));
            const totalRegFare = fare1.regular + fare2.regular;
            const totalStuFare = fare1.student + fare2.student;
            const appliedFare = isStudent ? totalStuFare : totalRegFare;

            const leg1Names = leg1Stops.map(rs => allStops.find(s => s.id === rs.stop_id)?.name || 'Stop');
            const leg2Names = leg2Stops.map(rs => allStops.find(s => s.id === rs.stop_id)?.name || 'Stop');

            candidateRoutes.push({
              id: `transfer-${routeA.id}-${routeB.id}-${transferStopObj.id}`,
              bus: `${routeA.route_number} → ${routeB.route_number}`,
              busType: `${routeA.bus_type} + ${routeB.bus_type}`,
              routeName: `${routeA.route_name} to ${routeB.route_name}`,
              routeId: `${routeA.id}_${routeB.id}`,
              boardAt: originStop.name,
              getDownAt: destStop.name,
              transferPoint: transferStopObj.name,
              transfers: 1,
              durationMinutes: totalDuration,
              distanceKm: totalDist,
              fare: appliedFare,
              regularFare: totalRegFare,
              studentFare: totalStuFare,
              stopsCount: (leg1Stops.length - 1) + (leg2Stops.length - 1),
              intermediateStops: [...leg1Names, ...leg2Names.slice(1)],
              instructions: `Board Bus ${routeA.route_number} at ${originStop.name} to ${transferStopObj.name}. Change at ${transferStopObj.name} to Bus ${routeB.route_number} towards ${destStop.name}.`,
              steps: [
                {
                  stepIndex: 1,
                  type: 'board',
                  title: `Board Bus ${routeA.route_number}`,
                  stop: originStop.name,
                  locality: originStop.locality,
                  busNumber: routeA.route_number,
                  busType: routeA.bus_type,
                  details: `Board at ${originStop.name} towards ${transferStopObj.name}.`
                },
                {
                  stepIndex: 2,
                  type: 'travel',
                  title: `Ride on Bus ${routeA.route_number}`,
                  stopsCount: leg1Stops.length - 1,
                  durationMins: dur1,
                  distanceKm: dist1,
                  details: `Passes through ${leg1Names.slice(1, -1).join(' → ') || 'direct leg'}.`
                },
                {
                  stepIndex: 3,
                  type: 'transfer',
                  title: `Change Bus at ${transferStopObj.name}`,
                  stop: transferStopObj.name,
                  locality: transferStopObj.locality,
                  fromBus: routeA.route_number,
                  toBus: routeB.route_number,
                  layoverMins: layoverMinutes,
                  details: `Get down at ${transferStopObj.name}. Wait ~${layoverMinutes} mins at the interchange platform for connecting Bus ${routeB.route_number}.`
                },
                {
                  stepIndex: 4,
                  type: 'travel',
                  title: `Ride on Bus ${routeB.route_number}`,
                  stopsCount: leg2Stops.length - 1,
                  durationMins: dur2,
                  distanceKm: dist2,
                  details: `Passes through ${leg2Names.slice(1, -1).join(' → ') || 'direct leg'}.`
                },
                {
                  stepIndex: 5,
                  type: 'arrive',
                  title: `Alight at ${destStop.name}`,
                  stop: destStop.name,
                  locality: destStop.locality,
                  details: `Alight at ${destStop.name}. Journey complete!`
                }
              ],
              legs: [
                {
                  bus: routeA.route_number,
                  busType: routeA.bus_type,
                  from: originStop.name,
                  to: transferStopObj.name,
                  stops: leg1Names,
                  durationMinutes: dur1,
                  fare: isStudent ? fare1.student : fare1.regular
                },
                {
                  bus: routeB.route_number,
                  busType: routeB.bus_type,
                  from: transferStopObj.name,
                  to: destStop.name,
                  stops: leg2Names,
                  durationMinutes: dur2,
                  fare: isStudent ? fare2.student : fare2.regular
                }
              ]
            });
          }
        }
      }
    }
  }

  // Deduplicate and rank candidates based on preference
  const uniqueCandidates = [];
  const seenKey = new Set();
  for (const c of candidateRoutes) {
    const key = `${c.bus}_${c.boardAt}_${c.getDownAt}_${c.transferPoint || 'none'}`;
    if (!seenKey.has(key)) {
      seenKey.add(key);
      uniqueCandidates.push(c);
    }
  }

  if (uniqueCandidates.length === 0) {
    return {
      success: false,
      error: `No transit routes found connecting ${originStop.name} to ${destStop.name} with up to ${maxTransfers} transfer(s).`,
      routes: [],
      origin: originStop,
      destination: destStop
    };
  }

  // Sort based on preference
  uniqueCandidates.sort((a, b) => {
    switch (preference) {
      case 'Fastest':
        return a.durationMinutes - b.durationMinutes || a.transfers - b.transfers;
      case 'Cheapest':
        return a.fare - b.fare || a.durationMinutes - b.durationMinutes;
      case 'Fewest Transfers':
        return a.transfers - b.transfers || a.durationMinutes - b.durationMinutes;
      case 'Balanced':
      default: {
        const scoreA = (a.durationMinutes * 1.0) + (a.fare * 1.5) + (a.transfers * 35);
        const scoreB = (b.durationMinutes * 1.0) + (b.fare * 1.5) + (b.transfers * 35);
        return scoreA - scoreB;
      }
    }
  });

  return {
    success: true,
    origin: originStop,
    destination: destStop,
    routes: uniqueCandidates,
    recommended: uniqueCandidates[0],
    alternatives: uniqueCandidates.slice(1, 4)
  };
}
