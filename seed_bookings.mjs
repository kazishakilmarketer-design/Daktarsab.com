import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedBookings() {
  const { data, error } = await supabase
    .from('booking_requests')
    .insert([
      {
        user_name: 'আব্দুর রহমান',
        user_phone: '01711223344',
        service_type: 'doctor',
        provider_name: 'Dr. Shahin Miah',
        preferred_date: '2026-03-25',
        preferred_time: 'বিকেল ৫টা',
        notes: 'জ্বরের সমস্যা',
        status: 'new'
      },
      {
        user_name: 'করিম হোসেন',
        user_phone: '01899887766',
        service_type: 'lab_test',
        provider_name: 'Popular Diagnostic Center',
        preferred_date: '2026-03-22',
        preferred_time: 'সকাল ১০টা',
        notes: 'সিবিসি টেস্ট',
        status: 'contacted'
      }
    ])
    .select()
    
  if (error) {
    console.error('Error seeding bookings:', error)
  } else {
    console.log('Successfully seeded bookings:', data)
  }
}

seedBookings()
