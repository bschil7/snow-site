import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/snow-site/', // 👈 Add this line
  plugins: [react()],
})
