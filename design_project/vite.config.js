import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../Design_Project_Sem5_Backend/dist', // Your output directory
    manifest: true, // Optional: Generates a manifest.json file
    emptyOutDir: true, // Allows Vite to empty the output directory even if it's outside the root
  },
})