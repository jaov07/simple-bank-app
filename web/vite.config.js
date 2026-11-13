import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Lê o PORT do .env do backend (uma pasta acima) para o proxy não sair do lugar.
  const env = loadEnv(mode, '..', '')
  const portaApi = Number(env.PORT) || 3000

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/users': `http://localhost:${portaApi}`
      }
    }
  }
})
