import { defineConfig } from 'vite';
import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';

const root = resolve(__dirname);

export default defineConfig({
  root: '.',
  base: '/',
  plugins: [
    handlebars({
      partialDirectory: resolve(root, 'partials'),
    }),
  ],
  server: { port: 5173, open: false },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        products: resolve(root, 'products.html'),
        about: resolve(root, 'about.html'),
        contact: resolve(root, 'contact.html'),
        strawberries: resolve(root, 'products/strawberries.html'),
        blueberries: resolve(root, 'products/blueberries.html'),
        raspberries: resolve(root, 'products/raspberries.html'),
        berryMix: resolve(root, 'products/berry-mix.html'),
        mushrooms: resolve(root, 'products/mushrooms.html'),
      },
    },
  },
});
