import crypto from 'crypto';
import { supabase, hasSupabase } from '../config/supabase.js';
import {
  initialStops,
  initialRoutes,
  initialRouteStops,
  initialSchedules,
  initialFares
} from '../data/seedTransitData.js';

// Fallback in-memory state
const memStore = {
  stops: [...initialStops],
  routes: [...initialRoutes],
  routeStops: [...initialRouteStops],
  schedules: [...initialSchedules],
  fares: [...initialFares],
  profiles: [
    {
      id: 'u0000001-0000-0000-0000-000000000001',
      email: 'demo@busmate.ai',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      full_name: 'Student Demo User',
      preferred_mode: 'Balanced',
      is_student: true,
      student_id: 'BUS-2026-STU',
      avatar_url: '',
      is_admin: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'u0000001-0000-0000-0000-000000000002',
      email: 'admin@busmate.ai',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      full_name: 'Transit Admin',
      preferred_mode: 'Fastest',
      is_student: false,
      student_id: '',
      avatar_url: '',
      is_admin: true,
      created_at: new Date().toISOString()
    }
  ],
  favoritePlaces: [],
  favoriteRoutes: [],
  searchHistory: [],
  routeFeedback: []
};

function generateId() {
  return crypto.randomUUID();
}

export const dbService = {
  // STOPS
  async getAllStops(query = '') {
    if (hasSupabase) {
      try {
        let req = supabase.from('bus_stops').select('*').eq('is_active', true).order('name');
        if (query) {
          req = req.ilike('name', `%${query}%`);
        }
        const { data, error } = await req;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getAllStops fallback:', e.message);
      }
    }
    const q = query.trim().toLowerCase();
    if (!q) return memStore.stops.filter(s => s.is_active !== false);
    return memStore.stops.filter(s =>
      s.is_active !== false &&
      (s.name.toLowerCase().includes(q) || s.locality.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    );
  },

  async getStopById(id) {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('bus_stops').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.stops.find(s => s.id === id || s.code.toLowerCase() === id.toLowerCase() || s.name.toLowerCase() === id.toLowerCase());
  },

  // ROUTES
  async getAllRoutes() {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('bus_routes').select('*').eq('is_active', true);
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.routes.filter(r => r.is_active !== false);
  },

  async getRouteById(id) {
    let route = null;
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('bus_routes').select('*').eq('id', id).single();
        if (!error && data) route = data;
      } catch (e) {
        // fallback
      }
    }
    if (!route) {
      route = memStore.routes.find(r => r.id === id || r.route_number.toLowerCase() === id.toLowerCase());
    }
    if (!route) return null;

    // Attach origin and destination stop names
    const originStop = await this.getStopById(route.origin_stop_id);
    const destStop = await this.getStopById(route.destination_stop_id);
    const stops = await this.getRouteStops(route.id);
    const schedules = await this.getSchedulesByRoute(route.id);

    return {
      ...route,
      origin_stop_name: originStop?.name || 'Origin',
      destination_stop_name: destStop?.name || 'Destination',
      stops,
      schedules
    };
  },

  async getRouteStops(routeId) {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase
          .from('route_stops')
          .select('*, bus_stops(*)')
          .eq('route_id', routeId)
          .order('stop_sequence');
        if (!error && data && data.length > 0) {
          return data.map(rs => ({
            ...rs,
            stop_name: rs.bus_stops?.name || 'Stop',
            locality: rs.bus_stops?.locality,
            landmark: rs.bus_stops?.landmark,
            code: rs.bus_stops?.code,
            latitude: rs.bus_stops?.latitude,
            longitude: rs.bus_stops?.longitude
          }));
        }
      } catch (e) {
        // fallback
      }
    }
    const rStops = memStore.routeStops
      .filter(rs => rs.route_id === routeId)
      .sort((a, b) => a.stop_sequence - b.stop_sequence);

    return rStops.map(rs => {
      const stop = memStore.stops.find(s => s.id === rs.stop_id);
      return {
        ...rs,
        stop_name: stop?.name || 'Stop',
        locality: stop?.locality,
        landmark: stop?.landmark,
        code: stop?.code,
        latitude: stop?.latitude,
        longitude: stop?.longitude
      };
    });
  },

  async getAllRouteStops() {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('route_stops').select('*').order('stop_sequence');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.routeStops;
  },

  async getSchedulesByRoute(routeId) {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('bus_schedules').select('*').eq('route_id', routeId);
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.schedules.filter(s => s.route_id === routeId);
  },

  async getAllFares() {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('route_fares').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.fares;
  },

  // USERS & PROFILES
  async findUserByEmail(email) {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.profiles.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async findUserById(id) {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.profiles.find(u => u.id === id);
  },

  async createUser({ email, password_hash, full_name, is_student = true, student_id = '' }) {
    const newUser = {
      id: generateId(),
      email: email.toLowerCase(),
      password_hash,
      full_name,
      phone_number: '',
      preferred_mode: 'Balanced',
      is_student,
      student_id,
      avatar_url: '',
      is_admin: false,
      created_at: new Date().toISOString()
    };

    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('profiles').insert([newUser]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createUser fallback:', e.message);
      }
    }
    memStore.profiles.push(newUser);
    return newUser;
  },

  async updateUserProfile(userId, updates) {
    const allowed = ['full_name', 'phone_number', 'preferred_mode', 'is_student', 'student_id', 'avatar_url'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }
    filtered.updated_at = new Date().toISOString();

    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('profiles').update(filtered).eq('id', userId).select().single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    const user = memStore.profiles.find(u => u.id === userId);
    if (user) {
      Object.assign(user, filtered);
      return user;
    }
    return null;
  },

  // FAVORITES
  async getUserFavorites(userId) {
    let places = [];
    let routes = [];

    if (hasSupabase) {
      try {
        const [placesRes, routesRes] = await Promise.all([
          supabase.from('favorite_places').select('*, bus_stops(*)').eq('user_id', userId),
          supabase.from('favorite_routes').select('*, bus_routes(*)').eq('user_id', userId)
        ]);
        if (!placesRes.error && placesRes.data && placesRes.data.length > 0) {
          places = placesRes.data.map(p => {
            const stop = p.bus_stops || memStore.stops.find(s => s.id === p.stop_id || s.name === p.stop_id);
            return { ...p, stop };
          });
        }
        if (!routesRes.error && routesRes.data && routesRes.data.length > 0) {
          routes = routesRes.data.map(r => {
            const fromStop = memStore.stops.find(s => s.id === r.from_stop_id || s.name === r.from_stop_id);
            const toStop = memStore.stops.find(s => s.id === r.to_stop_id || s.name === r.to_stop_id);
            return {
              ...r,
              from_stop_name: fromStop?.name || r.from_stop_id,
              to_stop_name: toStop?.name || r.to_stop_id
            };
          });
        }
      } catch (e) {
        // fallback
      }
    }

    if (places.length === 0) {
      let userPlaces = memStore.favoritePlaces.filter(p => p.user_id === userId);
      
      // If user has no saved places yet, initialize starter favorites for Mangalore
      if (userPlaces.length === 0) {
        const starterPlaces = [
          {
            id: generateId(),
            user_id: userId,
            label: 'Home',
            stop_id: 'b0000001-0000-0000-0000-000000000025', // Kunjathbail
            custom_name: 'Home (Kunjathbail)',
            icon: 'Home',
            created_at: new Date().toISOString()
          },
          {
            id: generateId(),
            user_id: userId,
            label: 'University / College',
            stop_id: 'b0000001-0000-0000-0000-000000000011', // NITK Surathkal
            custom_name: 'NITK Surathkal Campus',
            icon: 'GraduationCap',
            created_at: new Date().toISOString()
          },
          {
            id: generateId(),
            user_id: userId,
            label: 'Central Transit Hub',
            stop_id: 'b0000001-0000-0000-0000-000000000001', // State Bank
            custom_name: 'State Bank Service Bus Stand',
            icon: 'Building',
            created_at: new Date().toISOString()
          }
        ];
        memStore.favoritePlaces.push(...starterPlaces);
        userPlaces = starterPlaces;
      }

      places = userPlaces.map(p => {
        const stop = memStore.stops.find(s => s.id === p.stop_id || s.name === p.stop_id);
        return { ...p, stop };
      });
    }

    if (routes.length === 0) {
      let userRoutes = memStore.favoriteRoutes.filter(r => r.user_id === userId);

      // If user has no saved routes yet, initialize starter favorite route
      if (userRoutes.length === 0) {
        const starterRoutes = [
          {
            id: generateId(),
            user_id: userId,
            route_id: 'r0000001-0000-0000-0000-000000000013',
            from_stop_id: 'b0000001-0000-0000-0000-000000000025', // Kunjathbail
            to_stop_id: 'b0000001-0000-0000-0000-000000000001', // State Bank
            custom_label: 'Bus 13: Kunjathbail to State Bank Express',
            created_at: new Date().toISOString()
          }
        ];
        memStore.favoriteRoutes.push(...starterRoutes);
        userRoutes = starterRoutes;
      }

      routes = userRoutes.map(r => {
        const route = memStore.routes.find(rt => rt.id === r.route_id);
        const fromStop = memStore.stops.find(s => s.id === r.from_stop_id || s.name === r.from_stop_id);
        const toStop = memStore.stops.find(s => s.id === r.to_stop_id || s.name === r.to_stop_id);
        return {
          ...r,
          route,
          from_stop_name: fromStop?.name || r.from_stop_id,
          to_stop_name: toStop?.name || r.to_stop_id
        };
      });
    }

    return { places, routes };
  },

  async addFavoritePlace(userId, { label, stop_id, custom_name, icon = 'MapPin' }) {
    // Resolve stop by ID or name
    const foundStop = memStore.stops.find(s => s.id === stop_id || s.name?.toLowerCase() === stop_id?.toLowerCase());
    const validStopId = foundStop ? foundStop.id : stop_id;

    const newPlace = {
      id: generateId(),
      user_id: userId,
      label,
      stop_id: validStopId,
      custom_name: custom_name || label,
      icon,
      created_at: new Date().toISOString()
    };
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('favorite_places').insert([newPlace]).select().single();
        if (!error && data) return { ...data, stop: foundStop };
      } catch (e) {
        // fallback
      }
    }
    memStore.favoritePlaces.push(newPlace);
    return { ...newPlace, stop: foundStop };
  },

  async addFavoriteRoute(userId, { route_id, from_stop_id, to_stop_id, custom_label }) {
    // Resolve stop IDs if stop names were passed
    const fromStop = memStore.stops.find(s => s.id === from_stop_id || s.name?.toLowerCase() === from_stop_id?.toLowerCase());
    const toStop = memStore.stops.find(s => s.id === to_stop_id || s.name?.toLowerCase() === to_stop_id?.toLowerCase());
    const validFromId = fromStop ? fromStop.id : from_stop_id;
    const validToId = toStop ? toStop.id : to_stop_id;

    const newRoute = {
      id: generateId(),
      user_id: userId,
      route_id,
      from_stop_id: validFromId,
      to_stop_id: validToId,
      custom_label: custom_label || `${fromStop?.name || validFromId} ➔ ${toStop?.name || validToId}`,
      created_at: new Date().toISOString()
    };
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('favorite_routes').insert([newRoute]).select().single();
        if (!error && data) return { ...data, from_stop_name: fromStop?.name, to_stop_name: toStop?.name };
      } catch (e) {
        // fallback
      }
    }
    memStore.favoriteRoutes.push(newRoute);
    const route = memStore.routes.find(r => r.id === route_id);
    return { ...newRoute, route, from_stop_name: fromStop?.name, to_stop_name: toStop?.name };
  },

  async deleteFavorite(userId, id) {
    if (hasSupabase) {
      try {
        await Promise.all([
          supabase.from('favorite_places').delete().eq('id', id).eq('user_id', userId),
          supabase.from('favorite_routes').delete().eq('id', id).eq('user_id', userId)
        ]);
      } catch (e) {
        // fallback
      }
    }
    memStore.favoritePlaces = memStore.favoritePlaces.filter(p => !(p.id === id && p.user_id === userId));
    memStore.favoriteRoutes = memStore.favoriteRoutes.filter(r => !(r.id === id && r.user_id === userId));
    return true;
  },

  // SEARCH HISTORY
  async getUserHistory(userId) {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase
          .from('search_history')
          .select('*, origin:bus_stops!origin_stop_id(name, locality), dest:bus_stops!destination_stop_id(name, locality)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        if (!error && data && data.length > 0) {
          return data.map(h => ({
            ...h,
            origin_name: h.origin?.name || 'Origin',
            destination_name: h.dest?.name || 'Destination'
          }));
        }
      } catch (e) {
        // fallback
      }
    }
    return memStore.searchHistory
      .filter(h => h.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(h => {
        const origin = memStore.stops.find(s => s.id === h.origin_stop_id);
        const dest = memStore.stops.find(s => s.id === h.destination_stop_id);
        return {
          ...h,
          origin_name: origin?.name || 'Origin',
          destination_name: dest?.name || 'Destination'
        };
      });
  },

  async addSearchHistory(userId, { origin_stop_id, destination_stop_id, preference = 'Balanced', max_transfers = 1 }) {
    const entry = {
      id: generateId(),
      user_id: userId,
      origin_stop_id,
      destination_stop_id,
      preference,
      max_transfers,
      travel_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    if (hasSupabase) {
      try {
        await supabase.from('search_history').insert([entry]);
      } catch (e) {
        // fallback
      }
    }
    memStore.searchHistory.unshift(entry);
    if (memStore.searchHistory.length > 100) memStore.searchHistory.pop();
    return entry;
  },

  async deleteHistory(userId, id) {
    if (hasSupabase) {
      try {
        await supabase.from('search_history').delete().eq('id', id).eq('user_id', userId);
      } catch (e) {
        // fallback
      }
    }
    memStore.searchHistory = memStore.searchHistory.filter(h => !(h.id === id && h.user_id === userId));
    return true;
  },

  // FEEDBACK
  async addFeedback(userId, { route_id, rating, crowd_level = 'Moderate', punctuality_status = 'On Time', comment = '' }) {
    const feedback = {
      id: generateId(),
      user_id: userId,
      route_id,
      rating: Number(rating),
      crowd_level,
      punctuality_status,
      comment,
      created_at: new Date().toISOString()
    };
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('route_feedback').insert([feedback]).select().single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    memStore.routeFeedback.unshift(feedback);
    return feedback;
  },

  async getFeedbackByRoute(routeId) {
    if (hasSupabase) {
      try {
        const { data, error } = await supabase
          .from('route_feedback')
          .select('*, profiles(full_name, avatar_url)')
          .eq('route_id', routeId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    return memStore.routeFeedback
      .filter(f => f.route_id === routeId)
      .map(f => {
        const user = memStore.profiles.find(u => u.id === f.user_id);
        return {
          ...f,
          user_name: user?.full_name || 'Passenger',
          user_avatar: user?.avatar_url
        };
      });
  },

  // ADMIN OPERATIONS
  async adminAddRoute(routeData) {
    const newRoute = {
      id: generateId(),
      ...routeData,
      is_active: true,
      created_at: new Date().toISOString()
    };
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('bus_routes').insert([newRoute]).select().single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    memStore.routes.push(newRoute);
    return newRoute;
  },

  async adminAddStop(stopData) {
    const newStop = {
      id: generateId(),
      ...stopData,
      is_active: true,
      created_at: new Date().toISOString()
    };
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('bus_stops').insert([newStop]).select().single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    memStore.stops.push(newStop);
    return newStop;
  },

  async adminAddSchedule(scheduleData) {
    const newSchedule = {
      id: generateId(),
      ...scheduleData,
      created_at: new Date().toISOString()
    };
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('bus_schedules').insert([newSchedule]).select().single();
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    memStore.schedules.push(newSchedule);
    return newSchedule;
  },

  async getAdminStats() {
    return {
      totalRoutes: memStore.routes.length,
      totalStops: memStore.stops.length,
      totalSchedules: memStore.schedules.length,
      totalFeedback: memStore.routeFeedback.length,
      totalUsers: memStore.profiles.length
    };
  }
};
