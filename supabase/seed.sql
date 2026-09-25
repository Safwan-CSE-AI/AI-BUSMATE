-- ====================================================================
-- AI BusMate - Seed Data for Realistic Bus Network
-- ====================================================================

-- 1. Insert Bus Stops
INSERT INTO public.bus_stops (id, code, name, locality, landmark, latitude, longitude, wheelchair_accessible) VALUES
('b0000001-0000-0000-0000-000000000001', 'CBS-01', 'Central Bus Stand', 'Statebank Central', 'Opposite Town Hall', 12.8654, 74.8425, true),
('b0000001-0000-0000-0000-000000000002', 'HKC-02', 'Hampankatta Circle', 'Hampankatta', 'Milagres Junction', 12.8698, 74.8451, true),
('b0000001-0000-0000-0000-000000000003', 'MOC-03', 'Mall of the City', 'Lalbagh', 'Beside City Corporation', 12.8832, 74.8412, true),
('b0000001-0000-0000-0000-000000000004', 'KTC-04', 'Kottara Chowki', 'Kottara', 'National Highway Flyover', 12.9056, 74.8329, true),
('b0000001-0000-0000-0000-000000000005', 'STP-05', 'Science & Tech Park', 'Kavoor', 'Aerospace Incubation Hub', 12.9214, 74.8488, true),
('b0000001-0000-0000-0000-000000000006', 'UCN-06', 'University Campus North', 'Konaje', 'Main Academic Quadrangle', 12.9431, 74.8622, true),
('b0000001-0000-0000-0000-000000000007', 'UCS-07', 'University Campus South Gate', 'Konaje', 'Hostel Block 3 Entrance', 12.9389, 74.8650, true),
('b0000001-0000-0000-0000-000000000008', 'CRS-08', 'City Railway Station', 'Station Road', 'Platform 1 Main Concourse', 12.8612, 74.8398, true),
('b0000001-0000-0000-0000-000000000009', 'MCH-09', 'Medical College & Hospital', 'KMC Road', 'Emergency Entrance', 12.8750, 74.8520, true),
('b0000001-0000-0000-0000-000000000010', 'ITZ-10', 'IT Special Economic Zone', 'Mudipu Tech Park', 'Innovation Tower Gate 2', 12.9150, 74.8900, true),
('b0000001-0000-0000-0000-000000000011', 'BRT-11', 'Beach Road Terminal', 'Panambur', 'Port Gate 1 & Coast Guard', 12.9480, 74.8080, true),
('b0000001-0000-0000-0000-000000000012', 'KKB-12', 'Kankanady Bypass', 'Kankanady', 'Father Muller Circle', 12.8705, 74.8610, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Bus Routes
INSERT INTO public.bus_routes (id, route_number, route_name, origin_stop_id, destination_stop_id, bus_type, total_distance_km, estimated_duration_mins) VALUES
('r0000001-0000-0000-0000-000000000001', '24A', 'Central Bus Stand - Kottara Direct', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000004', 'City Standard', 8.5, 30),
('r0000001-0000-0000-0000-000000000002', '11B', 'City Express - University Campus Express', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000006', 'Campus Shuttle', 18.2, 45),
('r0000001-0000-0000-0000-000000000003', '42X', 'Station to IT Tech Hub SuperFast', 'b0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000010', 'City Express', 16.4, 40),
('r0000001-0000-0000-0000-000000000004', '19C', 'Kottara to Panambur Beach AC Feeder', 'b0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000011', 'AC Metro Feeder', 9.0, 25),
('r0000001-0000-0000-0000-000000000005', '33S', 'MedCollege - South Campus Link', 'b0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000007', 'City Standard', 14.8, 38),
('r0000001-0000-0000-0000-000000000006', '07K', 'Central - Kankanady - Tech Park Connector', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000010', 'City Standard', 15.0, 42)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Route Stops (Stop sequences along each route)
-- Route 24A: Central (1) -> Hampankatta (2) -> Mall of City (3) -> Kottara (4)
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, time_from_start_mins, is_major_interchange) VALUES
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 2, 1.2, 5, false),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 3, 4.0, 15, false),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000004', 4, 8.5, 30, true)
ON CONFLICT DO NOTHING;

-- Route 11B: Central (1) -> Mall of City (2) -> Kottara (3) -> Science Park (4) -> Univ North (5)
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, time_from_start_mins, is_major_interchange) VALUES
('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 2, 3.8, 12, false),
('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000004', 3, 8.0, 24, true),
('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000005', 4, 13.5, 34, false),
('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000006', 5, 18.2, 45, true)
ON CONFLICT DO NOTHING;

-- Route 42X: Railway Station (1) -> Central (2) -> MedCollege (3) -> IT Park (4)
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, time_from_start_mins, is_major_interchange) VALUES
('r0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000008', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 2, 1.5, 6, true),
('r0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000009', 3, 5.2, 16, true),
('r0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000010', 4, 16.4, 40, true)
ON CONFLICT DO NOTHING;

-- Route 19C: Kottara (1) -> Beach Road (2)
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, time_from_start_mins, is_major_interchange) VALUES
('r0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000011', 2, 9.0, 25, true)
ON CONFLICT DO NOTHING;

-- Route 33S: MedCollege (1) -> Science Park (2) -> Univ South Gate (3)
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, time_from_start_mins, is_major_interchange) VALUES
('r0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000005', 2, 8.5, 22, false),
('r0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000007', 3, 14.8, 38, true)
ON CONFLICT DO NOTHING;

-- Route 07K: Central (1) -> Kankanady (2) -> IT Park (3)
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, time_from_start_mins, is_major_interchange) VALUES
('r0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000001', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000012', 2, 3.2, 10, true),
('r0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000010', 3, 15.0, 42, true)
ON CONFLICT DO NOTHING;

-- 4. Bus Schedules
INSERT INTO public.bus_schedules (route_id, departure_time, arrival_time, frequency_mins, bus_plate_number) VALUES
('r0000001-0000-0000-0000-000000000001', '06:00:00', '22:00:00', 10, 'KA-19-F-1024'),
('r0000001-0000-0000-0000-000000000002', '06:30:00', '21:30:00', 15, 'KA-19-F-2011'),
('r0000001-0000-0000-0000-000000000003', '07:00:00', '21:00:00', 20, 'KA-19-F-3042'),
('r0000001-0000-0000-0000-000000000004', '07:30:00', '20:30:00', 25, 'KA-19-F-4019'),
('r0000001-0000-0000-0000-000000000005', '06:45:00', '21:15:00', 20, 'KA-19-F-5033'),
('r0000001-0000-0000-0000-000000000006', '07:15:00', '21:45:00', 15, 'KA-19-F-6007')
ON CONFLICT DO NOTHING;

-- 5. Route Fares
INSERT INTO public.route_fares (route_id, from_stop_id, to_stop_id, regular_fare, student_fare) VALUES
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000004', 30.00, 15.00),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 20.00, 10.00),
('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000006', 45.00, 20.00),
('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000006', 25.00, 12.00),
('r0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000010', 50.00, 25.00),
('r0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000011', 35.00, 18.00),
('r0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000007', 40.00, 20.00),
('r0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000010', 45.00, 22.00)
ON CONFLICT DO NOTHING;
