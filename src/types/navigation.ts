import { ParamListBase } from '@react-navigation/native';
import { Persona } from './persona';
import { TimePass } from './timePass';

// Define the route params for type safety
export type AppRouteParams = {
  // Auth routes
  '/(auth)/welcome': undefined;
  '/(auth)/forgot-password': undefined;
  
  // App routes
  '/(app)/dashboard': undefined;
  '/(app)/add-persona': undefined;
  '/(app)/persona-details': { id: string };
  '/(app)/add-time-pass': { personaId: string };
  '/(app)/settings': undefined;
  '/(app)/profile': undefined;
  '/(app)/notifications': undefined;
  '/(app)/notification-settings': undefined;
  '/(app)/notification-history': undefined;
}

// Extend the global navigation type
declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppRouteParams {}
  }
}

// Helper types for route names
export type AppRouteName = keyof AppRouteParams;

// Helper type for href strings
export type AppHref = `/${AppRouteName}`;

// Helper function to type-check route params
export function createHref<T extends AppRouteName>(
  route: T,
  params?: AppRouteParams[T]
): string {
  if (params) {
    const queryParams = new URLSearchParams(params as any).toString();
    return `${route}?${queryParams}`;
  }
  return route;
} 