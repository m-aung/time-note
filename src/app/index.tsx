import { Redirect } from 'expo-router';
import { useAuth } from '../store/authStore';

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  return <Redirect href={isAuthenticated ? "/(app)/" : "/(auth)/"} />;
} 