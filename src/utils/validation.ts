export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateImage = (file: File) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > MAX_SIZE) {
    throw new Error('Image size must be less than 5MB');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Image must be JPEG, PNG or WebP');
  }
};

export const validatePersona = (name: string, imageUri?: string) => {
  if (!name.trim()) {
    return 'Name is required';
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }
  return null;
};

export const validateTimePass = (data: {
  label: string;
  duration: number;
  type: string;
}) => {
  if (!data.label.trim()) {
    return 'Label is required';
  }
  if (data.label.length < 2) {
    return 'Label must be at least 2 characters';
  }
  if (data.label.length > 50) {
    return 'Label must be less than 50 characters';
  }
  if (!data.duration || data.duration < 1) {
    return 'Duration must be at least 1 minute';
  }
  if (data.duration > 720) {
    return 'Duration cannot exceed 12 hours';
  }
  if (!['entertainment', 'education', 'exercise', 'other'].includes(data.type)) {
    return 'Invalid type';
  }
  return null;
};

export const validatePersonaId = (personaId: string): string | null => {
  if (!personaId) {
    return 'Persona ID is required';
  }

  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(personaId)) {
    return 'Invalid persona ID format';
  }

  return null;
}; 