import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kfdkhhhhfjhqhjefkgeq.supabase.co";

// ⚠️ Use the ANON public key here, NOT the service_role key
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);