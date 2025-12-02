import { resolve } from 'path';

export default {
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        promo: resolve(__dirname, 'promo/index.html'),
        products: resolve(__dirname, 'products/index.html'),
        contacts: resolve(__dirname, 'contacts/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        services: resolve(__dirname, 'services/index.html'),
        servicesOformlenie: resolve(__dirname, 'services/oformlenie/index.html'),
        blagoustroistvo: resolve(__dirname, 'services/blagoustroistvo/index.html'),
      },
    },
  },
};