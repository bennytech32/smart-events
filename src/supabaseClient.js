import { createClient } from '@supabase/supabase-js';

// Hizi ndio funguo zako za kishua kutoka Supabase
const supabaseUrl = 'https://ztixntfmpbrghnymybjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0aXhudGZtcGJyZ2hueW15YmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjc1ODAsImV4cCI6MjA4Nzc0MzU4MH0.i_bL3VCd44zrP_37TmqKt2IO7ZqP_PI5GNWR03RfSo4';

export const supabase = createClient(supabaseUrl, supabaseKey);