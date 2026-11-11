import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite settings. The React plugin lets Vite understand JSX/TSX files.
export default defineConfig({
  plugins: [react()],
});
