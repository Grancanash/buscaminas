import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',       // raíz del proyecto
    base: '/buscaminas/',      // paths relativos en producción
    server: {
        watch: {
            usePolling: true,  // polling para WSL
            interval: 100,     // cada 100ms revisa cambios
        }
    },
    build: {
        outDir: 'dist', // carpeta de producción
        rollupOptions: {
            input: {
                home: resolve(__dirname, 'index.html'), // página principal
                project1: resolve(__dirname, 'projects/buscaminas/index.html'),
            }
        }
    }
});
