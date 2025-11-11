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
    SplashScreen: {
      launchShowDuration: 2000, // Duração em milissegundos (2 segundos)
      launchAutoHide: true, // Esconde automaticamente
      backgroundColor: '#ffffff', // Cor de fundo
      androidSplashResourceName: 'splash', // Nome do recurso no Android
      androidScaleType: 'CENTER_CROP', // Como a imagem é dimensionada
      showSpinner: false, // Mostrar spinner de carregamento
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true, // Tela cheia
      splashImmersive: true // Modo imersivo (esconde barra de status)
    },
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
