import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xixiuzlrmmnfwwttvcmw.supabase.co';
const supabaseKey = 'sb_publishable_0JrbQXdrwS7cnYS5yA0Bbg_8Pl3eWRX';

export const supabase = createClient(supabaseUrl, supabaseKey);
