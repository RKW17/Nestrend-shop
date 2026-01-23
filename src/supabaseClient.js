
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tqifawxmxstcauuzvwte.supabase.co'
const supabaseKey = process.env.sb_publishable_UhA0rRAcW4IvuwzueIDOtQ_xciyqqpr
export const supabase = createClient(supabaseUrl, supabaseKey)