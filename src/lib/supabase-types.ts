export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      charity: {
        Row: {
          id: number
          name?: string
          category?: string
          current_goal?: number
          funds_raised?: number
          description?: string
          created_at?: string
        }
        Insert: {
          id?: number
          name?: string
          category?: string
          current_goal?: number
          funds_raised?: number
          description?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: string
          current_goal?: number
          funds_raised?: number
          description?: string
          created_at?: string
        }
      }
      // Remove the specific donors table reference since it doesn't exist
      // Instead, make it more generic to match whatever table might have donor data
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
  }
}

