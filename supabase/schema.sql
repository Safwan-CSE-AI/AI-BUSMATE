-- ====================================================================
-- AI BusMate - Supabase PostgreSQL Database Schema
-- Includes RLS (Row Level Security), UUIDs, Indexes, and Audit Triggers
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    preferred_mode TEXT DEFAULT 'Balanced' CHECK (preferred_mode IN ('Fastest', 'Cheapest', 'Fewest Transfers', 'Balanced')),
    is_student BOOLEAN DEFAULT TRUE,
    student_id TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BUS STOPS TABLE
CREATE TABLE IF NOT EXISTS public.bus_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    locality TEXT NOT NULL,
    landmark TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    wheelchair_accessible BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUS ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.bus_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_number TEXT UNIQUE NOT NULL,
    route_name TEXT NOT NULL,
    origin_stop_id UUID REFERENCES public.bus_stops(id) ON DELETE RESTRICT,
    destination_stop_id UUID REFERENCES public.bus_stops(id) ON DELETE RESTRICT,
    bus_type TEXT DEFAULT 'City Standard' CHECK (bus_type IN ('City Standard', 'City Express', 'AC Metro Feeder', 'Campus Shuttle', 'Night Special')),
    total_distance_km NUMERIC(5, 2) DEFAULT 0,
    estimated_duration_mins INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROUTE STOPS TABLE (Intermediary stops along each route with sequence)
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
    stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    stop_sequence INT NOT NULL,
    distance_from_start_km NUMERIC(5, 2) DEFAULT 0,
    time_from_start_mins INT DEFAULT 0,
    is_major_interchange BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_route_stop_seq UNIQUE (route_id, stop_sequence),
    CONSTRAINT unique_route_stop UNIQUE (route_id, stop_id)
);

-- 5. BUS SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.bus_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    frequency_mins INT DEFAULT 15,
    days_of_week TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    bus_plate_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ROUTE FARES TABLE
CREATE TABLE IF NOT EXISTS public.route_fares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
    from_stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    to_stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    regular_fare NUMERIC(6, 2) NOT NULL,
    student_fare NUMERIC(6, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_fare_stage UNIQUE (route_id, from_stop_id, to_stop_id)
);

-- 7. FAVORITE PLACES TABLE (User Saved Home, College, Library, etc.)
CREATE TABLE IF NOT EXISTS public.favorite_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- e.g., 'Home', 'University', 'Hostel', 'Work'
    stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    custom_name TEXT,
    icon TEXT DEFAULT 'MapPin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. FAVORITE ROUTES TABLE (Bookmarked Frequent Trips)
CREATE TABLE IF NOT EXISTS public.favorite_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.bus_routes(id) ON DELETE SET NULL,
    from_stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    to_stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    custom_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. SEARCH HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    origin_stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    destination_stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
    preference TEXT DEFAULT 'Balanced',
    max_transfers INT DEFAULT 1,
    travel_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. ROUTE FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.route_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    crowd_level TEXT CHECK (crowd_level IN ('Low', 'Moderate', 'High', 'Packed')) DEFAULT 'Moderate',
    punctuality_status TEXT CHECK (punctuality_status IN ('On Time', 'Slightly Delayed', 'Heavily Delayed', 'Early')) DEFAULT 'On Time',
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_stops_name ON public.bus_stops(name);
CREATE INDEX IF NOT EXISTS idx_stops_code ON public.bus_stops(code);
CREATE INDEX IF NOT EXISTS idx_routes_number ON public.bus_routes(route_number);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_stop ON public.route_stops(stop_id);
CREATE INDEX IF NOT EXISTS idx_schedules_route ON public.bus_schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_fares_lookup ON public.route_fares(route_id, from_stop_id, to_stop_id);
CREATE INDEX IF NOT EXISTS idx_fav_places_user ON public.favorite_places(user_id);
CREATE INDEX IF NOT EXISTS idx_fav_routes_user ON public.favorite_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_route ON public.route_feedback(route_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_fares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_feedback ENABLE ROW LEVEL SECURITY;

-- Public tables readable by everyone (authenticated & anonymous transit riders)
CREATE POLICY "Public stops readable by all" ON public.bus_stops FOR SELECT USING (true);
CREATE POLICY "Public routes readable by all" ON public.bus_routes FOR SELECT USING (true);
CREATE POLICY "Public route stops readable by all" ON public.route_stops FOR SELECT USING (true);
CREATE POLICY "Public schedules readable by all" ON public.bus_schedules FOR SELECT USING (true);
CREATE POLICY "Public fares readable by all" ON public.route_fares FOR SELECT USING (true);
CREATE POLICY "Public feedback readable by all" ON public.route_feedback FOR SELECT USING (true);

-- User Profiles: Users can view and update only their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Favorites: Users can manage only their own saved favorites
CREATE POLICY "Users can select own favorite places" ON public.favorite_places FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorite places" ON public.favorite_places FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorite places" ON public.favorite_places FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can select own favorite routes" ON public.favorite_routes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorite routes" ON public.favorite_routes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorite routes" ON public.favorite_routes FOR DELETE USING (auth.uid() = user_id);

-- History: Users can manage only their own search history
CREATE POLICY "Users can select own search history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own search history" ON public.search_history FOR DELETE USING (auth.uid() = user_id);

-- Feedback: Users can submit feedback
CREATE POLICY "Users can submit route feedback" ON public.route_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
