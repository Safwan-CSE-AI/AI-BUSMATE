import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient = null;
let supabaseAdminClient = null;

const isConfigured = Boolean(
  config.supabase.url &&
  config.supabase.anonKey &&
  !config.supabase.url.includes('example.com')
);

if (isConfigured) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);
    if (config.supabase.serviceRoleKey) {
      supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey);
    }
    console.log('✓ Supabase client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set or incomplete. Running with robust built-in data store.');
}

export const supabase = supabaseClient;
export const supabaseAdmin = supabaseAdminClient || supabaseClient;
export const hasSupabase = isConfigured && !!supabaseClient;
