export const getCategoryIcon = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'entertainment':
      return '🎮';
    case 'education':
      return '📚';
    case 'exercise':
      return '🏃‍♂️';
    case 'work':
      return '💼';
    case 'social':
      return '👥';
    case 'health':
      return '❤️';
    case 'hobby':
      return '🎨';
    default:
      return '📝';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return '⏳';
    case 'expired':
      return '⌛';
    case 'cancelled':
      return '❌';
    case 'paused':
      return '⏸️';
    case 'completed':
      return '✅';
    default:
      return '❓';
  }
}; 