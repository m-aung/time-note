export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'entertainment':
      return '🎮';
    case 'education':
      return '📚';
    case 'exercise':
      return '🏃‍♂️';
    default:
      return '📝';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'active':
      return '⏳';
    case 'expired':
      return '⌛';
    case 'cancelled':
      return '❌';
    default:
      return '❓';
  }
}; 