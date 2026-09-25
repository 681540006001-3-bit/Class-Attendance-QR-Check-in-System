import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  const basePath = process.env.VITE_BASE_PATH || (isVercel ? '/' : '/Class-Attendance-QR-Check-in-System/');

  return {
    plugins: [react()],
    base: basePath,
  };
})
