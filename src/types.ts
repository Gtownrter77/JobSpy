export interface JobPost {
  id: string;
  site: string;
  title: string;
  company: string;
  city: string;
  state: string;
  job_type: string;
  interval: string;
  min_amount: number | null;
  max_amount: number | null;
  currency: string;
  job_url: string;
  description: string;
  date_posted: string;
  is_remote: boolean;
}

export interface SearchParams {
  site_name: string[];
  search_term: string;
  location: string;
  results_wanted: number;
  is_remote: boolean;
  job_type: string;
}

export interface ScheduledInterview {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'phone_screen' | 'technical' | 'hiring_manager' | 'behavioral' | 'system_design' | 'final_round' | 'other';
  locationType: 'video' | 'phone' | 'onsite';
  meetingUrlOrLocation?: string;
  interviewer?: string;
  notes?: string;
  createdAt: number;
}
