import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TimeNote',
  slug: 'time-note',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'timenote',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.timenote',
    infoPlist: {
      NSPhotoLibraryUsageDescription: "Allow $(PRODUCT_NAME) to access your photos to let you choose a profile picture.",
      NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera to let you take a profile picture.",
      UIBackgroundModes: ['fetch'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.timenote',
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "RECEIVE_BOOT_COMPLETED",
      "WAKE_LOCK",
    ],
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
        sounds: ['./assets/notification.wav'],
      },
    ],
    'expo-background-fetch',
    'expo-image-picker',
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'your-project-id',
    },
  },
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
}); 