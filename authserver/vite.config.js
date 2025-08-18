import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'start-express-server',
      configureServer() {
        // Run the Express server using tsx
        const serverProcess = spawn('npx', ['tsx', '../authserver/authServer.ts'], {
          stdio: 'inherit',
          shell: true
        })

        process.on('exit', () => {
          serverProcess.kill()
        })
      }
    }
  ],
  optimizeDeps: {
    exclude: ['@bsv/sdk']
  }
})