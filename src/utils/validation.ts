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

export const validateImage = (uri: string): boolean => {
  // Check if it's a valid image URL
  if (!uri) return false;

  // Check file extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const hasValidExtension = validExtensions.some(ext => 
    uri.toLowerCase().endsWith(ext)
  );

  // Check file size (if it's a local file)
  if (uri.startsWith('file://')) {
    // Add size check here if needed
  }

  return hasValidExtension;
};

export const validatePersona = (name: string, imageUrl?: string): string | null => {
  if (!name.trim()) {
    return 'Name is required';
  }

  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }

  if (imageUrl && !validateImage(imageUrl)) {
    return 'Invalid image format';
  }

  return null;
};

export const validateTimePass = (label: string, expireAt: string): string | null => {
  if (!label.trim()) {
    return 'Label is required';
  }

  if (label.length > 100) {
    return 'Label must be less than 100 characters';
  }

  const expireDate = new Date(expireAt);
  const now = new Date();

  if (isNaN(expireDate.getTime())) {
    return 'Invalid expiration date';
  }

  if (expireDate < now) {
    return 'Expiration date must be in the future';
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