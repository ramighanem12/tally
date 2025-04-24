import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eungmnwynwgwdewyegsp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmdtbnd5bndnd2Rld3llZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MzgxMDEsImV4cCI6MjA1OTMxNDEwMX0.qWH_15GGhV0oXeAs03PjjaCSVmqTb1xULEDvKLnfSEI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)