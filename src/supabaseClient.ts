import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rlkeuuirtufdbrlphquq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsa2V1dWlydHVmZGJybHBocXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTg3ODcxOCwiZXhwIjoyMDYxNDU0NzE4fQ.1PAQFUBgGocZFBXGAB7kdJCBlqYPf5wxUdTq1npdv1A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
