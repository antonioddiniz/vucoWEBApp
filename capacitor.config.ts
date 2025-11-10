import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vucovuco.app',
  appName: 'vuco-appweb2',
  webDir: 'dist/vuco-appweb2/browser',
  server: {
    // Permitir todas as origens
    allowNavigation: ['*']
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    GoogleAuth: {
      clientId: '158040947827-pk6mopf1d1lsnkm04271u7l261stjkr2.apps.googleusercontent.com', // Web Client ID
      scopes: ['profile', 'email'],
      serverClientId: '158040947827-pk6mopf1d1lsnkm04271u7l261stjkr2.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      androidClientId: '158040947827-l62ccvpkv83k4l6oj1e4jbogg407t0h8.apps.googleusercontent.com' // Android Client ID
    }
  }
};

export default config;
