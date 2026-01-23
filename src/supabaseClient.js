import { createClient } from '@supabase/supabase-client'

// Use your Project URL here
const supabaseUrl = 'https://tqifawxmxsxtcauuzvwt.supabase.co' 

// Use the LONG PUBLIC key you just sent (the first one)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaWZhd3hteHN0Y2F1dXp2d3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY2NTMsImV4cCI6MjA4MzY2MjY1M30.Wo5e5gdPA45FaBd8g0DFTspxky2qt3nhYFtXob3eN0U'

export const supabase = createClient(supabaseUrl, supabaseKey)