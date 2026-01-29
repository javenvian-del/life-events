export interface Event {
  id: string
  user_id: string
  title: string
  event_date: string
  description?: string
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface CreateEventInput {
  title: string
  event_date: string
  description?: string
  photo?: File
}

export interface UpdateEventInput {
  id: string
  title?: string
  event_date?: string
  description?: string
  photo?: File
}
