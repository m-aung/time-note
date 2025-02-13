export interface TimePass {
  id: string;
  persona_id: string;
  label: string;
  expire_at: string;
  created_at: string;
  is_active: boolean;
}

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  image_url?: string;
  created_at: string;
  // TODO: one of these should be removed
  category: string;
  type: string;
  activePasses: TimePass[];
  expiredPasses: TimePass[];
}

export interface PersonaStats {
  totalPasses: number;
  activePasses: number;
  expiredPasses: number;
  averageDuration: number;
} 