import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { createAuthMiddleware, AuthRequest } from '@bsv/auth-express-middleware';
import { CompletedProtoWallet as Wallet, PrivateKey } from '@bsv/sdk';



const wallet = new Wallet(PrivateKey.fromHex('055d459c8d7cba2f8d22155093beb97848cf6b903f3af0a3c4eb45bac2dc236e'));

const authMiddleware = createAuthMiddleware({
  wallet,
  allowUnauthenticated: false
})

const app = express();
app.use(bodyParser.json());

// Hint: Add middleware to set Access-Control-Allow-* headers (Origin, Headers, Methods, Expose-Headers, Private-Network) and handle OPTIONS requests with a 200 status
 // This middleware sets CORS headers.
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Expose-Headers', '*')
  res.header('Access-Control-Allow-Private-Network', 'true')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})


app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});


app.get('/protected', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.auth && req.auth.identityKey !== 'unknown') {
    return res.send(`You are authenticated: ${req.auth.identityKey}`)
  }
  res.status(401).send('Unauthorized')
})
 
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
