// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bvqrfiniofjiyzllnmcu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cXJmaW5pb2ZqaXl6bGxubWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NTMwODgsImV4cCI6MjEwODUyOTA4OH0.Q3N9T4seCf81nIS-E4X0BE14UgjoI0VDHBzbwwxMtBs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)