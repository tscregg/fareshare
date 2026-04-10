export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          created_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          driver_id: string
          origin: string
          destination: string
          departure_date: string
          departure_time: string
          total_seats: number
          suggested_donation: number
          note: string | null
          status: 'open' | 'full' | 'cancelled' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          origin: string
          destination: string
          departure_date: string
          departure_time: string
          total_seats: number
          suggested_donation?: number
          note?: string | null
          status?: 'open' | 'full' | 'cancelled' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          origin?: string
          destination?: string
          departure_date?: string
          departure_time?: string
          total_seats?: number
          suggested_donation?: number
          note?: string | null
          status?: 'open' | 'full' | 'cancelled' | 'completed'
          created_at?: string
        }
      }
      seats: {
        Row: {
          id: string
          ride_id: string
          passenger_id: string
          claimed_at: string
        }
        Insert: {
          id?: string
          ride_id: string
          passenger_id: string
          claimed_at?: string
        }
        Update: {
          id?: string
          ride_id?: string
          passenger_id?: string
          claimed_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          requester_id: string
          origin: string
          destination: string
          preferred_date: string
          preferred_time: string | null
          note: string | null
          status: 'open' | 'claimed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          origin: string
          destination: string
          preferred_date: string
          preferred_time?: string | null
          note?: string | null
          status?: 'open' | 'claimed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          origin?: string
          destination?: string
          preferred_date?: string
          preferred_time?: string | null
          note?: string | null
          status?: 'open' | 'claimed' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
}
