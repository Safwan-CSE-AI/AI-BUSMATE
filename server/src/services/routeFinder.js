import { dbService } from './dbService.js';

function normalizeName(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveStop(term, allStops) {
  if (!term) return null;
  const t = term.trim().toLowerCase();
  const tNorm = normalizeName(term);

  // Exact ID match
  let found = allStops.find(s => s.id === term);
  if (found) return found;

  // Exact Code match
  found = allStops.find(s => s.code.toLowerCase() === t);
  if (found) return found;

  // Exact Name match (case-insensitive)
  found = allStops.find(s => s.name.toLowerCase() === t);
  if (found) return found;

  // Normalized substring matches (e.g. "kunjethbail" matches "Kunjathbail / Kunjethbail", "statebank" matches "State Bank")
  found = allStops.find(s => {
    const sNameNorm = normalizeName(s.name);
    const sLocNorm = normalizeName(s.locality);
    return (
      sNameNorm.includes(tNorm) ||
      tNorm.includes(sNameNorm) ||
      sLocNorm.includes(tNorm) ||
      tNorm.includes(sLocNorm)
    );
  });
  if (found) return found;

  // Keyword token match (e.g. "kunjethbail" or "kunjathbail" or "state bank")
  found = allStops.find(s => {
    const nameLower = s.name.toLowerCase();
    const locLower = s.locality.toLowerCase();
    if (t.includes('kunj') && (nameLower.includes('kunj') || locLower.includes('kunj'))) return true;
    if (t.includes('state') && (nameLower.includes('state') || locLower.includes('state'))) return true;
    return nameLower.includes(t) || locLower.includes(t);
  });

  return found || null;
}

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
  const originStop = resolveStop(originStopId, allStops);
  const destStop = resolveStop(destinationStopId, allStops);

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

  // Helper to compute fare
  function getSegmentFare(routeId, fromId, toId, distanceKm) {
    // Check direct fare table
    const directFare = allFares.find(
      f => f.route_id === routeId &&
      ((f.from_stop_id === fromId && f.to_stop_id === toId) ||
       (f.from_stop_id === toId && f.to_stop_id === fromId))
    );
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

  // Helper to extract leg details between any two stops on a route (bidirectional)
  function getLeg(route, fromStopId, toStopId) {
    const rStops = stopsByRoute.get(route.id);
    if (!rStops) return null;
    const fIdx = rStops.findIndex(rs => rs.stop_id === fromStopId);
    const tIdx = rStops.findIndex(rs => rs.stop_id === toStopId);
    if (fIdx === -1 || tIdx === -1 || fIdx === tIdx) return null;

    const isReverse = fIdx > tIdx;
    const intermediateStopsObjs = isReverse
      ? rStops.slice(tIdx, fIdx + 1).reverse()
      : rStops.slice(fIdx, tIdx + 1);

    const intermediateNames = intermediateStopsObjs.map(rs => {
      const s = allStops.find(stop => stop.id === rs.stop_id);
      return s ? s.name : 'Stop';
    });

    const dist = Math.max(0.8, Number(Math.abs(rStops[tIdx].distance_from_start_km - rStops[fIdx].distance_from_start_km).toFixed(1)));
    const duration = Math.max(8, Math.abs(rStops[tIdx].time_from_start_mins - rStops[fIdx].time_from_start_mins) || Math.round(dist * 2.5));
    const fareInfo = getSegmentFare(route.id, fromStopId, toStopId, dist);

    const termStop = isReverse
      ? allStops.find(s => s.id === rStops[0].stop_id)?.name || 'Terminus'
      : allStops.find(s => s.id === rStops[rStops.length - 1].stop_id)?.name || 'Terminus';

    return {
      isReverse,
      intermediateObjs: intermediateStopsObjs,
      intermediateNames,
      dist,
      duration,
      fareInfo,
      stopsCount: intermediateStopsObjs.length - 1,
      headingTowards: termStop
    };
  }

  const candidateRoutes = [];

  // 1. Check DIRECT ROUTES (both outbound and return/inbound directions)
  for (const route of allRoutes) {
    const leg = getLeg(route, originStop.id, destStop.id);
    if (!leg) continue;

    const appliedFare = isStudent ? leg.fareInfo.student : leg.fareInfo.regular;
    const busLabel = route.route_number;

    candidateRoutes.push({
      id: `direct-${route.id}-${leg.isReverse ? 'rev' : 'fwd'}`,
      bus: busLabel,
      busType: route.bus_type,
      routeName: route.route_name,
      routeId: route.id,
      boardAt: originStop.name,
      getDownAt: destStop.name,
      transferPoint: null,
      transfers: 0,
      durationMinutes: leg.duration,
      distanceKm: leg.dist,
      fare: appliedFare,
      regularFare: leg.fareInfo.regular,
      studentFare: leg.fareInfo.student,
      stopsCount: leg.stopsCount,
      intermediateStops: leg.intermediateNames,
      instructions: `Board Bus ${busLabel} (${route.bus_type}) towards ${leg.headingTowards} at ${originStop.name}. Ride ${leg.stopsCount} stops directly and alight at ${destStop.name}.`,
      steps: [
        {
          stepIndex: 1,
          type: 'board',
          title: `Board Bus ${busLabel}`,
          stop: originStop.name,
          locality: originStop.locality,
          busNumber: busLabel,
          busType: route.bus_type,
          details: `Board towards ${leg.headingTowards} at platform/bay near ${originStop.landmark || originStop.locality}.`
        },
        {
          stepIndex: 2,
          type: 'travel',
          title: `Ride on Bus ${busLabel}`,
          stopsCount: leg.stopsCount,
          durationMins: leg.duration,
          distanceKm: leg.dist,
          details: `Passes through ${leg.intermediateNames.slice(1, -1).join(' → ') || 'direct leg'}.`
        },
        {
          stepIndex: 3,
          type: 'arrive',
          title: `Alight at ${destStop.name}`,
          stop: destStop.name,
          locality: destStop.locality,
          details: `Alight at ${destStop.name}. You have reached your destination!`
        }
      ],
      legs: [
        {
          bus: busLabel,
          busType: route.bus_type,
          from: originStop.name,
          to: destStop.name,
          stops: leg.intermediateNames,
          durationMinutes: leg.duration,
          fare: appliedFare
        }
      ]
    });
  }

  // 2. Check 1-TRANSFER ROUTES (if maxTransfers >= 1)
  if (maxTransfers >= 1) {
    for (const routeA of allRoutes) {
      const rStopsA = stopsByRoute.get(routeA.id);
      if (!rStopsA) continue;
      const hasOrigin = rStopsA.some(rs => rs.stop_id === originStop.id);
      if (!hasOrigin) continue;

      for (const transferStopRs of rStopsA) {
        if (transferStopRs.stop_id === originStop.id || transferStopRs.stop_id === destStop.id) continue;
        const transferStopId = transferStopRs.stop_id;

        const leg1 = getLeg(routeA, originStop.id, transferStopId);
        if (!leg1) continue;

        // Look for Route B from transferStopId to destStop
        for (const routeB of allRoutes) {
          if (routeB.id === routeA.id) continue;
          if (routeB.route_number === routeA.route_number) continue;

          const leg2 = getLeg(routeB, transferStopId, destStop.id);
          if (!leg2) continue;

          const transferStopObj = allStops.find(s => s.id === transferStopId);
          if (!transferStopObj) continue;

          const layoverMinutes = 10;
          const totalDuration = leg1.duration + leg2.duration + layoverMinutes;
          const totalDist = Number((leg1.dist + leg2.dist).toFixed(1));
          const totalRegFare = leg1.fareInfo.regular + leg2.fareInfo.regular;
          const totalStuFare = leg1.fareInfo.student + leg2.fareInfo.student;
          const appliedFare = isStudent ? totalStuFare : totalRegFare;

          candidateRoutes.push({
            id: `transfer-${routeA.id}-${routeB.id}-${transferStopId}`,
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
            stopsCount: leg1.stopsCount + leg2.stopsCount,
            intermediateStops: [...leg1.intermediateNames, ...leg2.intermediateNames.slice(1)],
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
                stopsCount: leg1.stopsCount,
                durationMins: leg1.duration,
                distanceKm: leg1.dist,
                details: `Passes through ${leg1.intermediateNames.slice(1, -1).join(' → ') || 'direct leg'}.`
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
                details: `Alight at ${transferStopObj.name}. Wait ~${layoverMinutes} mins at the interchange platform for connecting Bus ${routeB.route_number}.`
              },
              {
                stepIndex: 4,
                type: 'travel',
                title: `Ride on Bus ${routeB.route_number}`,
                stopsCount: leg2.stopsCount,
                durationMins: leg2.duration,
                distanceKm: leg2.dist,
                details: `Passes through ${leg2.intermediateNames.slice(1, -1).join(' → ') || 'direct leg'}.`
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
                stops: leg1.intermediateNames,
                durationMinutes: leg1.duration,
                fare: isStudent ? leg1.fareInfo.student : leg1.fareInfo.regular
              },
              {
                bus: routeB.route_number,
                busType: routeB.bus_type,
                from: transferStopObj.name,
                to: destStop.name,
                stops: leg2.intermediateNames,
                durationMinutes: leg2.duration,
                fare: isStudent ? leg2.fareInfo.student : leg2.fareInfo.regular
              }
            ]
          });
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
