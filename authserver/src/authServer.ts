import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { createAuthMiddleware, AuthRequest } from '@bsv/auth-express-middleware'
import { Setup } from '@bsv/wallet-toolbox'
import { Chain } from '@bsv/wallet-toolbox/out/src/sdk/types.js'

dotenv.config()

const {
  SERVER_PRIVATE_KEY = '055d459c8d7cba2f8d22155093beb97848cf6b903f3af0a3c4eb45bac2dc236e',
  WALLET_STORAGE_URL = 'https://storage.babbage.systems',
  HTTP_PORT = 3000,
  BSV_NETWORK = 'main',
} = process.env

const app = express()
app.use(bodyParser.json())

// CORS middleware (simple allow-all)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Expose-Headers', '*')
  res.header('Access-Control-Allow-Private-Network', 'true')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

async function init() {
  const wallet = await Setup.createWalletClientNoEnv({
    chain: BSV_NETWORK as Chain,
    rootKeyHex: SERVER_PRIVATE_KEY,
    storageUrl: WALLET_STORAGE_URL,
  })

  app.use(createAuthMiddleware({ wallet, allowUnauthenticated: false }))

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!')
  })

  app.get('/protected', (req: AuthRequest, res: Response) => {
    const identityKey = req.auth?.identityKey
    if (identityKey && identityKey !== 'unknown') {
      return res.send(`You are authenticated: ${identityKey}`)
    }
    return res.status(401).send('Unauthorized')
  })

  const port = Number(HTTP_PORT ?? 3000)
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

init()
