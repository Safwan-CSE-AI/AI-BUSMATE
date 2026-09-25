-- ====================================================================
-- AI BusMate - Authentic Mangalore (Mangaluru / Kudla) Transit Network Seed
-- 42 Real Transit Stops, 22 Major Bus Routes, Sequential Stages & Schedules
-- Full Coverage: State Bank, Kunjathbail/Kunjethbail, Kavoor, Surathkal, Airport
-- ====================================================================

-- 1. Insert Mangalore Bus Stops
INSERT INTO public.bus_stops (id, code, name, locality, landmark, latitude, longitude, wheelchair_accessible) VALUES
('b0000001-0000-0000-0000-000000000001', 'SBK-01', 'State Bank (Service Bus Stand)', 'State Bank Central', 'Opposite DC Office & Town Hall, Nehru Maidan', 12.8617, 74.8390, true),
('b0000001-0000-0000-0000-000000000002', 'HPK-02', 'Hampankatta Circle', 'Hampankatta', 'Milagres Junction & Clock Tower', 12.8692, 74.8436, true),
('b0000001-0000-0000-0000-000000000003', 'BHC-03', 'Bunts Hostel Circle', 'Bunts Hostel', 'Beside Ramakrishna College', 12.8752, 74.8488, true),
('b0000001-0000-0000-0000-000000000004', 'LBG-04', 'Lalbagh (City Corporation)', 'Lalbagh', 'Beside Mangaluru City Corporation & Saibeen Complex', 12.8837, 74.8420, true),
('b0000001-0000-0000-0000-000000000005', 'KBJ-05', 'KSRTC Bus Stand Bejai', 'Bejai', 'KSRTC Main Inter-city Concourse Gate 1', 12.8890, 74.8488, true),
('b0000001-0000-0000-0000-000000000006', 'KTC-06', 'Kottara Chowki', 'Kottara', 'National Highway 66 Flyover Interchange', 12.9052, 74.8325, true),
('b0000001-0000-0000-0000-000000000007', 'KLR-07', 'Kulur Bridge Junction', 'Kulur', 'Phalguni River Bridge & Tannirbhavi Beach turn', 12.9230, 74.8210, true),
('b0000001-0000-0000-0000-000000000008', 'PNB-08', 'Panambur Beach / NMPT', 'Panambur', 'Panambur Beach Entrance & Coast Guard HQ', 12.9480, 74.8080, true),
('b0000001-0000-0000-0000-000000000009', 'BKP-09', 'Baikampady Industrial Estate', 'Baikampady', 'KIADB Industrial Zone Main Gate', 12.9620, 74.8095, true),
('b0000001-0000-0000-0000-000000000010', 'STK-10', 'Surathkal Junction', 'Surathkal', 'Surathkal NH Flyover & Daily Market', 12.9820, 74.7980, true),
('b0000001-0000-0000-0000-000000000011', 'NIT-11', 'NITK Surathkal Campus Gate', 'Srinivasnagar', 'National Institute of Tech Main Academic Entrance', 13.0110, 74.7930, true),
('b0000001-0000-0000-0000-000000000012', 'KKN-12', 'Kankanady Circle', 'Kankanady', 'Father Muller Hospital & College of Nursing', 12.8705, 74.8610, true),
('b0000001-0000-0000-0000-000000000013', 'PMP-13', 'Pumpwell (Mahaveer Circle)', 'Pumpwell', 'Southern Transit Hub & KSRTC Junction', 12.8610, 74.8680, true),
('b0000001-0000-0000-0000-000000000014', 'TKT-14', 'Thokkottu Overbridge', 'Thokkottu', 'Ullal Bypass & Highway Overpass', 12.8250, 74.8720, true),
('b0000001-0000-0000-0000-000000000015', 'DLK-15', 'Deralakatte Medical Hub', 'Deralakatte', 'KS Hegde & Yenepoya University Medical Campuses', 12.8120, 74.8890, true),
('b0000001-0000-0000-0000-000000000016', 'MU-N-16', 'Mangalore University North Gate', 'Konaje', 'Mangalagangotri Main Academic Quadrangle', 12.8190, 74.9270, true),
('b0000001-0000-0000-0000-000000000017', 'MU-S-17', 'Mangalore University South Gate', 'Konaje', 'Hostel Complex Block 3 & University Post Office', 12.8140, 74.9310, true),
('b0000001-0000-0000-0000-000000000018', 'MDP-18', 'Mudipu Infosys IT SEZ', 'Mudipu', 'Special Economic Zone Innovation Tower Gate 1', 12.8050, 74.9450, true),
('b0000001-0000-0000-0000-000000000019', 'KDR-19', 'Kadri Manjunatha Temple', 'Kadri', 'Historic Manjunatha Temple & Kadri Park', 12.8870, 74.8620, true),
('b0000001-0000-0000-0000-000000000020', 'MLK-20', 'Mallikatta Circle', 'Mallikatta', 'Near Lions Club & St. Agnes College', 12.8790, 74.8560, true),
('b0000001-0000-0000-0000-000000000021', 'MAQ-21', 'Mangalore Central Railway Station (MAQ)', 'Attavar', 'Platform 1 Main Booking Concourse', 12.8612, 74.8402, true),
('b0000001-0000-0000-0000-000000000022', 'MAJN-22', 'Mangalore Junction Railway Station (MAJN)', 'Padil', 'Junction Station Entrance Road', 12.8720, 74.8810, true),
('b0000001-0000-0000-0000-000000000023', 'IXE-23', 'Mangalore International Airport (IXE)', 'Bajpe / Kenjar', 'Terminal 1 Departure / Arrival Porch', 12.9610, 74.8900, true),
('b0000001-0000-0000-0000-000000000024', 'ULL-24', 'Ullal Rani Abbakka Circle', 'Ullal', 'Rani Abbakka Statue & Someshwar Beach Turn', 12.8050, 74.8560, true),
('b0000001-0000-0000-0000-000000000025', 'KJB-25', 'Kunjathbail / Kunjethbail (Main Bus Stand)', 'Kunjathbail / Kunjethbail', 'Near Kunjathbail Ganesha Temple & Main Bus Shelter', 12.9355, 74.8565, true),
('b0000001-0000-0000-0000-000000000026', 'KVR-26', 'Kavoor Junction', 'Kavoor', 'Kavoor Mahalingeshwara Temple & Police Station', 12.9248, 74.8540, true),
('b0000001-0000-0000-0000-000000000027', 'UWS-27', 'Urwa Stores Circle', 'Urwa Stores', 'Urwa Market & Canara High School', 12.8980, 74.8345, true),
('b0000001-0000-0000-0000-000000000028', 'LDH-28', 'Ladyhill Circle (Narayana Guru Circle)', 'Ladyhill', 'Brahmashree Narayana Guru Statue & Ladyhill School', 12.8885, 74.8360, true),
('b0000001-0000-0000-0000-000000000029', 'CST-29', 'Car Street (Sri Venkataramana Temple)', 'Car Street', 'Historic Temple Square & Flower Market', 12.8708, 74.8385, true),
('b0000001-0000-0000-0000-000000000030', 'MNG-30', 'Mannagudda Circle', 'Mannagudda', 'Near Sanghanikethan & Kudroli Temple road', 12.8780, 74.8340, true),
('b0000001-0000-0000-0000-000000000031', 'CHL-31', 'Chilimbi Junction', 'Chilimbi', 'Chilimbi Bus Shelter & City Hospital Annexe', 12.8928, 74.8335, true),
('b0000001-0000-0000-0000-000000000032', 'DRB-32', 'Derebail Church / Konchady', 'Derebail / Konchady', 'Derebail Most Holy Redeemer Church & Airport Road', 12.9125, 74.8475, true),
('b0000001-0000-0000-0000-000000000033', 'BND-33', 'Bondel Junction', 'Bondel', 'Bondel Church & MGC High School', 12.9260, 74.8690, true),
('b0000001-0000-0000-0000-000000000034', 'MYH-34', 'Maryhill / Helipad', 'Maryhill', 'Maryhill Police Grounds & Helipad', 12.9090, 74.8640, true),
('b0000001-0000-0000-0000-000000000035', 'NTR-35', 'Nanthoor Circle', 'Nanthoor', 'NH 66 & NH 73 Interchange Circle', 12.8765, 74.8670, true),
('b0000001-0000-0000-0000-000000000036', 'VMJ-36', 'Vamanjoor (SJEC Campus)', 'Vamanjoor', 'St. Joseph Engineering College & Pilikula Nisargadhama', 12.9110, 74.8980, true),
('b0000001-0000-0000-0000-000000000037', 'MGD-37', 'Mangaladevi Temple', 'Bolar / Mangaladevi', 'Historic Mangaladevi Temple Gate', 12.8490, 74.8430, true),
('b0000001-0000-0000-0000-000000000038', 'MKA-38', 'Mukka (Srinivas Institute)', 'Mukka', 'Srinivas Hospital & Medical College Campus', 13.0320, 74.7890, true),
('b0000001-0000-0000-0000-000000000039', 'KTP-39', 'Katipalla Kaikamba', 'Katipalla', 'Katipalla Main Market Junction', 12.9980, 74.8210, true),
('b0000001-0000-0000-0000-000000000040', 'TNB-40', 'Thannirbhavi Beach Gate', 'Thannirbhavi', 'Tree Park & Beach Concourse', 12.9000, 74.8150, true),
('b0000001-0000-0000-0000-000000000041', 'BJP-41', 'Bajpe Central Market', 'Bajpe', 'Bajpe Central Circle & Daily Market', 12.9690, 74.8810, true),
('b0000001-0000-0000-0000-000000000042', 'MKD-42', 'Marakada Junction', 'Marakada', 'Near Airport Road Marakada Bridge', 12.9420, 74.8650, true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  locality = EXCLUDED.locality,
  landmark = EXCLUDED.landmark;

-- 2. Insert Bus Routes
INSERT INTO public.bus_routes (id, route_number, route_name, origin_stop_id, destination_stop_id, bus_type, total_distance_km, estimated_duration_mins) VALUES
('r0000001-0000-0000-0000-000000000001', '15', 'State Bank - Surathkal NITK Express', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000011', 'City Express', 21.0, 45),
('r0000001-0000-0000-0000-000000000002', '11', 'State Bank - Mangalore University (Konaje)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000016', 'Campus Shuttle', 19.5, 42),
('r0000001-0000-0000-0000-000000000003', '42', 'State Bank - Mudipu Infosys IT SEZ', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000018', 'City Express', 24.0, 50),
('r0000001-0000-0000-0000-000000000004', '27', 'State Bank - Airport (Bajpe / IXE)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000023', 'AC Metro Feeder', 17.5, 38),
('r0000001-0000-0000-0000-000000000005', '24A', 'State Bank - Kottara Chowki Direct', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000006', 'City Standard', 7.8, 22),
('r0000001-0000-0000-0000-000000000006', '19', 'State Bank - Panambur Beach & Port', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000008', 'City Standard', 12.0, 28),
('r0000001-0000-0000-0000-000000000007', '3A', 'State Bank - Kadri Hills & Temple', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000019', 'City Standard', 5.5, 18),
('r0000001-0000-0000-0000-000000000008', '44', 'State Bank - Ullal Rani Abbakka Circle', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000024', 'City Standard', 12.5, 30),
('r0000001-0000-0000-0000-000000000009', '22', 'State Bank - Mangalore Junction (MAJN)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000022', 'City Standard', 7.2, 20),
('r0000001-0000-0000-0000-000000000010', '33', 'KSRTC Bejai - Mangalore University', 'b0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000016', 'Campus Shuttle', 18.0, 40),
('r0000001-0000-0000-0000-000000000011', '16', 'Kottara Chowki - Surathkal NITK Shuttle', 'b0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000011', 'City Standard', 13.5, 25),
('r0000001-0000-0000-0000-000000000012', '47', 'Deralakatte Medical - Mudipu IT SEZ', 'b0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000018', 'City Standard', 9.0, 20),
('r0000001-0000-0000-0000-000000000013', '1', 'State Bank - Kunjathbail (via Car St, Ladyhill, Kavoor)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000025', 'City Standard', 11.5, 32),
('r0000001-0000-0000-0000-000000000014', '1', 'Kunjathbail - State Bank (Return Direct)', 'b0000001-0000-0000-0000-000000000025', 'b0000001-0000-0000-0000-000000000001', 'City Standard', 11.5, 32),
('r0000001-0000-0000-0000-000000000015', '13', 'State Bank - Kunjathbail (via Bondel & Kavoor)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000025', 'City Standard', 12.8, 35),
('r0000001-0000-0000-0000-000000000016', '13', 'Kunjathbail - State Bank (via Bondel & KSRTC)', 'b0000001-0000-0000-0000-000000000025', 'b0000001-0000-0000-0000-000000000001', 'City Standard', 12.8, 35),
('r0000001-0000-0000-0000-000000000017', '2', 'State Bank - Mukka Srinivas (via Surathkal)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000038', 'City Express', 24.5, 50),
('r0000001-0000-0000-0000-000000000018', '3B', 'State Bank - Vamanjoor SJEC (via Nanthoor)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000036', 'City Standard', 11.0, 28),
('r0000001-0000-0000-0000-000000000019', '27B', 'State Bank - Mangaladevi Temple Direct', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000037', 'City Standard', 3.5, 12),
('r0000001-0000-0000-0000-000000000020', '45', 'State Bank - Katipalla Kaikamba', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000039', 'City Standard', 22.0, 46),
('r0000001-0000-0000-0000-000000000021', '1A', 'State Bank - Thannirbhavi Beach Gate', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000040', 'City Standard', 10.5, 25),
('r0000001-0000-0000-0000-000000000022', '19B', 'State Bank - Bondel Junction (via Urwa & Kavoor)', 'b0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000033', 'City Standard', 11.8, 30)
ON CONFLICT (id) DO UPDATE SET
  route_number = EXCLUDED.route_number,
  route_name = EXCLUDED.route_name;

-- 3. Route Stops
DELETE FROM public.route_stops;
INSERT INTO public.route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, time_from_start_mins, is_major_interchange) VALUES
-- Route 15: State Bank -> Surathkal NITK
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 2, 1.0, 4, false),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000004', 3, 3.5, 10, false),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000006', 4, 7.5, 20, true),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000007', 5, 10.2, 26, false),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000008', 6, 13.0, 31, true),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000009', 7, 15.5, 36, false),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000010', 8, 18.5, 40, true),
('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000011', 9, 21.0, 45, true),

-- Route 1: State Bank -> Kunjathbail (Direct)
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000001', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000029', 2, 1.2, 4, false),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000030', 3, 2.2, 7, false),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000028', 4, 3.5, 11, true),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000031', 5, 4.5, 14, false),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000027', 6, 5.6, 18, true),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000006', 7, 7.2, 23, true),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000026', 8, 9.8, 28, true),
('r0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000025', 9, 11.5, 32, true),

-- Route 1 (Return): Kunjathbail -> State Bank
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000025', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000026', 2, 1.7, 5, true),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000006', 3, 4.3, 12, true),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000027', 4, 5.9, 17, true),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000031', 5, 7.0, 20, false),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000028', 6, 8.0, 23, true),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000030', 7, 9.3, 26, false),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000029', 8, 10.3, 29, false),
('r0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000001', 9, 11.5, 32, true),

-- Route 13: State Bank -> Kunjathbail (via Bondel)
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000001', 1, 0.0, 0, true),
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000002', 2, 1.0, 4, false),
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000004', 3, 3.2, 10, false),
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000005', 4, 4.8, 14, true),
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000032', 5, 7.2, 20, true),
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000033', 6, 9.5, 26, true),
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000026', 7, 11.2, 31, true),
('r0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000025', 8, 12.8, 35, true);

-- 4. Bus Schedules
DELETE FROM public.bus_schedules;
INSERT INTO public.bus_schedules (route_id, departure_time, arrival_time, frequency_mins, bus_plate_number) VALUES
('r0000001-0000-0000-0000-000000000001', '06:00:00', '22:30:00', 8, 'KA-19-AB-1515'),
('r0000001-0000-0000-0000-000000000002', '06:15:00', '22:00:00', 10, 'KA-19-AC-1111'),
('r0000001-0000-0000-0000-000000000003', '06:30:00', '21:30:00', 15, 'KA-19-AD-4242'),
('r0000001-0000-0000-0000-000000000004', '06:00:00', '23:00:00', 25, 'KA-19-AE-2727'),
('r0000001-0000-0000-0000-000000000005', '06:00:00', '22:00:00', 8, 'KA-19-AF-2424'),
('r0000001-0000-0000-0000-000000000006', '07:00:00', '21:00:00', 15, 'KA-19-AG-1919'),
('r0000001-0000-0000-0000-000000000007', '06:30:00', '21:30:00', 12, 'KA-19-AH-0303'),
('r0000001-0000-0000-0000-000000000008', '06:45:00', '21:45:00', 15, 'KA-19-AJ-4444'),
('r0000001-0000-0000-0000-000000000009', '05:30:00', '23:30:00', 10, 'KA-19-AK-2222'),
('r0000001-0000-0000-0000-000000000010', '06:45:00', '21:00:00', 15, 'KA-19-AL-3333'),
('r0000001-0000-0000-0000-000000000011', '07:00:00', '20:30:00', 20, 'KA-19-AM-1616'),
('r0000001-0000-0000-0000-000000000012', '07:30:00', '20:00:00', 20, 'KA-19-AN-4747'),
('r0000001-0000-0000-0000-000000000013', '06:00:00', '22:15:00', 10, 'KA-19-C-0101'),
('r0000001-0000-0000-0000-000000000014', '06:15:00', '22:30:00', 10, 'KA-19-C-0102'),
('r0000001-0000-0000-0000-000000000015', '06:10:00', '22:00:00', 12, 'KA-19-C-1313'),
('r0000001-0000-0000-0000-000000000016', '06:25:00', '22:15:00', 12, 'KA-19-C-1314');
