import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.juanc.carbcounter',       // el que pusiste en el init
  appName: 'CarbCounter',
  webDir: 'dist',                        // Vite compila a /dist
  server: {
    // Apuntamos al backend desplegado en producción.
    // Mientras no tengas deploy, podés usar tu IP local para pruebas:
    // androidScheme: 'http'
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

VITE_API_URL=http://192.168.1.X:8000