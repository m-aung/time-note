// export interface TimePass {
//   id: string;
//   persona_id: string;
//   label: string;
//   duration: number;
//   type: 'entertainment' | 'education' | 'exercise' | 'other';
//   status: 'active' | 'paused' | 'expired' | 'completed' | 'cancelled';
//   started_at: string;
//   completed_at: string | null;
//   paused_at: string | null;
//   expire_at: string;
//   remaining_time: number | null;
//   created_at: string;
//   updated_at: string;
// }

import { Database } from "./database";

export type TimePass = Database['public']['Tables']['time_passes']['Row'];
export type TimePassInput = Database['public']['Tables']['time_passes']['Insert']; 