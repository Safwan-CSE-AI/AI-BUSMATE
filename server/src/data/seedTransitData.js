export const initialStops = [
  {
    id: 'b0000001-0000-0000-0000-000000000001',
    code: 'CBS-01',
    name: 'Central Bus Stand',
    locality: 'Statebank Central',
    landmark: 'Opposite Town Hall',
    latitude: 12.8654,
    longitude: 74.8425,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000002',
    code: 'HKC-02',
    name: 'Hampankatta Circle',
    locality: 'Hampankatta',
    landmark: 'Milagres Junction',
    latitude: 12.8698,
    longitude: 74.8451,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000003',
    code: 'MOC-03',
    name: 'Mall of the City',
    locality: 'Lalbagh',
    landmark: 'Beside City Corporation',
    latitude: 12.8832,
    longitude: 74.8412,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000004',
    code: 'KTC-04',
    name: 'Kottara Chowki',
    locality: 'Kottara',
    landmark: 'National Highway Flyover',
    latitude: 12.9056,
    longitude: 74.8329,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000005',
    code: 'STP-05',
    name: 'Science & Tech Park',
    locality: 'Kavoor',
    landmark: 'Aerospace Incubation Hub',
    latitude: 12.9214,
    longitude: 74.8488,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000006',
    code: 'UCN-06',
    name: 'University Campus North',
    locality: 'Konaje',
    landmark: 'Main Academic Quadrangle',
    latitude: 12.9431,
    longitude: 74.8622,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000007',
    code: 'UCS-07',
    name: 'University Campus South Gate',
    locality: 'Konaje',
    landmark: 'Hostel Block 3 Entrance',
    latitude: 12.9389,
    longitude: 74.8650,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000008',
    code: 'CRS-08',
    name: 'City Railway Station',
    locality: 'Station Road',
    landmark: 'Platform 1 Main Concourse',
    latitude: 12.8612,
    longitude: 74.8398,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000009',
    code: 'MCH-09',
    name: 'Medical College & Hospital',
    locality: 'KMC Road',
    landmark: 'Emergency Entrance',
    latitude: 12.8750,
    longitude: 74.8520,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000010',
    code: 'ITZ-10',
    name: 'IT Special Economic Zone',
    locality: 'Mudipu Tech Park',
    landmark: 'Innovation Tower Gate 2',
    latitude: 12.9150,
    longitude: 74.8900,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000011',
    code: 'BRT-11',
    name: 'Beach Road Terminal',
    locality: 'Panambur',
    landmark: 'Port Gate 1 & Coast Guard',
    latitude: 12.9480,
    longitude: 74.8080,
    wheelchair_accessible: true,
    is_active: true
  },
  {
    id: 'b0000001-0000-0000-0000-000000000012',
    code: 'KKB-12',
    name: 'Kankanady Bypass',
    locality: 'Kankanady',
    landmark: 'Father Muller Circle',
    latitude: 12.8705,
    longitude: 74.8610,
    wheelchair_accessible: true,
    is_active: true
  }
];

export const initialRoutes = [
  {
    id: 'r0000001-0000-0000-0000-000000000001',
    route_number: '24A',
    route_name: 'Central Bus Stand - Kottara Direct',
    origin_stop_id: 'b0000001-0000-0000-0000-000000000001',
    destination_stop_id: 'b0000001-0000-0000-0000-000000000004',
    bus_type: 'City Standard',
    total_distance_km: 8.5,
    estimated_duration_mins: 30,
    is_active: true
  },
  {
    id: 'r0000001-0000-0000-0000-000000000002',
    route_number: '11B',
    route_name: 'City Express - University Campus Express',
    origin_stop_id: 'b0000001-0000-0000-0000-000000000001',
    destination_stop_id: 'b0000001-0000-0000-0000-000000000006',
    bus_type: 'Campus Shuttle',
    total_distance_km: 18.2,
    estimated_duration_mins: 45,
    is_active: true
  },
  {
    id: 'r0000001-0000-0000-0000-000000000003',
    route_number: '42X',
    route_name: 'Station to IT Tech Hub SuperFast',
    origin_stop_id: 'b0000001-0000-0000-0000-000000000008',
    destination_stop_id: 'b0000001-0000-0000-0000-000000000010',
    bus_type: 'City Express',
    total_distance_km: 16.4,
    estimated_duration_mins: 40,
    is_active: true
  },
  {
    id: 'r0000001-0000-0000-0000-000000000004',
    route_number: '19C',
    route_name: 'Kottara to Panambur Beach AC Feeder',
    origin_stop_id: 'b0000001-0000-0000-0000-000000000004',
    destination_stop_id: 'b0000001-0000-0000-0000-000000000011',
    bus_type: 'AC Metro Feeder',
    total_distance_km: 9.0,
    estimated_duration_mins: 25,
    is_active: true
  },
  {
    id: 'r0000001-0000-0000-0000-000000000005',
    route_number: '33S',
    route_name: 'MedCollege - South Campus Link',
    origin_stop_id: 'b0000001-0000-0000-0000-000000000009',
    destination_stop_id: 'b0000001-0000-0000-0000-000000000007',
    bus_type: 'City Standard',
    total_distance_km: 14.8,
    estimated_duration_mins: 38,
    is_active: true
  },
  {
    id: 'r0000001-0000-0000-0000-000000000006',
    route_number: '07K',
    route_name: 'Central - Kankanady - Tech Park Connector',
    origin_stop_id: 'b0000001-0000-0000-0000-000000000001',
    destination_stop_id: 'b0000001-0000-0000-0000-000000000010',
    bus_type: 'City Standard',
    total_distance_km: 15.0,
    estimated_duration_mins: 42,
    is_active: true
  }
];

export const initialRouteStops = [
  // Route 24A
  { route_id: 'r0000001-0000-0000-0000-000000000001', stop_id: 'b0000001-0000-0000-0000-000000000001', stop_sequence: 1, distance_from_start_km: 0.0, time_from_start_mins: 0, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000001', stop_id: 'b0000001-0000-0000-0000-000000000002', stop_sequence: 2, distance_from_start_km: 1.2, time_from_start_mins: 5, is_major_interchange: false },
  { route_id: 'r0000001-0000-0000-0000-000000000001', stop_id: 'b0000001-0000-0000-0000-000000000003', stop_sequence: 3, distance_from_start_km: 4.0, time_from_start_mins: 15, is_major_interchange: false },
  { route_id: 'r0000001-0000-0000-0000-000000000001', stop_id: 'b0000001-0000-0000-0000-000000000004', stop_sequence: 4, distance_from_start_km: 8.5, time_from_start_mins: 30, is_major_interchange: true },

  // Route 11B
  { route_id: 'r0000001-0000-0000-0000-000000000002', stop_id: 'b0000001-0000-0000-0000-000000000001', stop_sequence: 1, distance_from_start_km: 0.0, time_from_start_mins: 0, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000002', stop_id: 'b0000001-0000-0000-0000-000000000003', stop_sequence: 2, distance_from_start_km: 3.8, time_from_start_mins: 12, is_major_interchange: false },
  { route_id: 'r0000001-0000-0000-0000-000000000002', stop_id: 'b0000001-0000-0000-0000-000000000004', stop_sequence: 3, distance_from_start_km: 8.0, time_from_start_mins: 24, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000002', stop_id: 'b0000001-0000-0000-0000-000000000005', stop_sequence: 4, distance_from_start_km: 13.5, time_from_start_mins: 34, is_major_interchange: false },
  { route_id: 'r0000001-0000-0000-0000-000000000002', stop_id: 'b0000001-0000-0000-0000-000000000006', stop_sequence: 5, distance_from_start_km: 18.2, time_from_start_mins: 45, is_major_interchange: true },

  // Route 42X
  { route_id: 'r0000001-0000-0000-0000-000000000003', stop_id: 'b0000001-0000-0000-0000-000000000008', stop_sequence: 1, distance_from_start_km: 0.0, time_from_start_mins: 0, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000003', stop_id: 'b0000001-0000-0000-0000-000000000001', stop_sequence: 2, distance_from_start_km: 1.5, time_from_start_mins: 6, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000003', stop_id: 'b0000001-0000-0000-0000-000000000009', stop_sequence: 3, distance_from_start_km: 5.2, time_from_start_mins: 16, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000003', stop_id: 'b0000001-0000-0000-0000-000000000010', stop_sequence: 4, distance_from_start_km: 16.4, time_from_start_mins: 40, is_major_interchange: true },

  // Route 19C
  { route_id: 'r0000001-0000-0000-0000-000000000004', stop_id: 'b0000001-0000-0000-0000-000000000004', stop_sequence: 1, distance_from_start_km: 0.0, time_from_start_mins: 0, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000004', stop_id: 'b0000001-0000-0000-0000-000000000011', stop_sequence: 2, distance_from_start_km: 9.0, time_from_start_mins: 25, is_major_interchange: true },

  // Route 33S
  { route_id: 'r0000001-0000-0000-0000-000000000005', stop_id: 'b0000001-0000-0000-0000-000000000009', stop_sequence: 1, distance_from_start_km: 0.0, time_from_start_mins: 0, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000005', stop_id: 'b0000001-0000-0000-0000-000000000005', stop_sequence: 2, distance_from_start_km: 8.5, time_from_start_mins: 22, is_major_interchange: false },
  { route_id: 'r0000001-0000-0000-0000-000000000005', stop_id: 'b0000001-0000-0000-0000-000000000007', stop_sequence: 3, distance_from_start_km: 14.8, time_from_start_mins: 38, is_major_interchange: true },

  // Route 07K
  { route_id: 'r0000001-0000-0000-0000-000000000006', stop_id: 'b0000001-0000-0000-0000-000000000001', stop_sequence: 1, distance_from_start_km: 0.0, time_from_start_mins: 0, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000006', stop_id: 'b0000001-0000-0000-0000-000000000012', stop_sequence: 2, distance_from_start_km: 3.2, time_from_start_mins: 10, is_major_interchange: true },
  { route_id: 'r0000001-0000-0000-0000-000000000006', stop_id: 'b0000001-0000-0000-0000-000000000010', stop_sequence: 3, distance_from_start_km: 15.0, time_from_start_mins: 42, is_major_interchange: true }
];

export const initialSchedules = [
  { id: 's01', route_id: 'r0000001-0000-0000-0000-000000000001', departure_time: '06:00:00', arrival_time: '22:00:00', frequency_mins: 10, bus_plate_number: 'KA-19-F-1024' },
  { id: 's02', route_id: 'r0000001-0000-0000-0000-000000000002', departure_time: '06:30:00', arrival_time: '21:30:00', frequency_mins: 15, bus_plate_number: 'KA-19-F-2011' },
  { id: 's03', route_id: 'r0000001-0000-0000-0000-000000000003', departure_time: '07:00:00', arrival_time: '21:00:00', frequency_mins: 20, bus_plate_number: 'KA-19-F-3042' },
  { id: 's04', route_id: 'r0000001-0000-0000-0000-000000000004', departure_time: '07:30:00', arrival_time: '20:30:00', frequency_mins: 25, bus_plate_number: 'KA-19-F-4019' },
  { id: 's05', route_id: 'r0000001-0000-0000-0000-000000000005', departure_time: '06:45:00', arrival_time: '21:15:00', frequency_mins: 20, bus_plate_number: 'KA-19-F-5033' },
  { id: 's06', route_id: 'r0000001-0000-0000-0000-000000000006', departure_time: '07:15:00', arrival_time: '21:45:00', frequency_mins: 15, bus_plate_number: 'KA-19-F-6007' }
];

export const initialFares = [
  { id: 'f01', route_id: 'r0000001-0000-0000-0000-000000000001', from_stop_id: 'b0000001-0000-0000-0000-000000000001', to_stop_id: 'b0000001-0000-0000-0000-000000000004', regular_fare: 30.00, student_fare: 15.00 },
  { id: 'f02', route_id: 'r0000001-0000-0000-0000-000000000001', from_stop_id: 'b0000001-0000-0000-0000-000000000001', to_stop_id: 'b0000001-0000-0000-0000-000000000003', regular_fare: 20.00, student_fare: 10.00 },
  { id: 'f03', route_id: 'r0000001-0000-0000-0000-000000000002', from_stop_id: 'b0000001-0000-0000-0000-000000000001', to_stop_id: 'b0000001-0000-0000-0000-000000000006', regular_fare: 45.00, student_fare: 20.00 },
  { id: 'f04', route_id: 'r0000001-0000-0000-0000-000000000002', from_stop_id: 'b0000001-0000-0000-0000-000000000004', to_stop_id: 'b0000001-0000-0000-0000-000000000006', regular_fare: 25.00, student_fare: 12.00 },
  { id: 'f05', route_id: 'r0000001-0000-0000-0000-000000000003', from_stop_id: 'b0000001-0000-0000-0000-000000000008', to_stop_id: 'b0000001-0000-0000-0000-000000000010', regular_fare: 50.00, student_fare: 25.00 },
  { id: 'f06', route_id: 'r0000001-0000-0000-0000-000000000004', from_stop_id: 'b0000001-0000-0000-0000-000000000004', to_stop_id: 'b0000001-0000-0000-0000-000000000011', regular_fare: 35.00, student_fare: 18.00 },
  { id: 'f07', route_id: 'r0000001-0000-0000-0000-000000000005', from_stop_id: 'b0000001-0000-0000-0000-000000000009', to_stop_id: 'b0000001-0000-0000-0000-000000000007', regular_fare: 40.00, student_fare: 20.00 },
  { id: 'f08', route_id: 'r0000001-0000-0000-0000-000000000006', from_stop_id: 'b0000001-0000-0000-0000-000000000001', to_stop_id: 'b0000001-0000-0000-0000-000000000010', regular_fare: 45.00, student_fare: 22.00 }
];
