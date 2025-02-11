export interface TimePass {
  id: string;
  label: string;
  personaId: string;
  duration: number;
  category: 'entertainment' | 'education' | 'exercise' | 'other';
  createdAt: string;
  expireAt: string;
  status: 'active' | 'expired' | 'cancelled';
}

export type TimePassInput = Omit<TimePass, 'id' | 'status' | 'createdAt' | 'expireAt'>; 