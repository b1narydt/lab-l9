import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { createAuthMiddleware } from '@bsv/auth-express-middleware';
import { CompletedProtoWallet as Wallet, PrivateKey } from '@bsv/sdk';
import dotenv from 'dotenv';
dotenv.config();



const app = express();
app.use(bodyParser.json());


// Instantiate a BSV wallet to manage transactions
const privateKeyHex = process.env.PRIVATE_KEY;
if (!privateKeyHex) {
    throw new Error('Missing PRIVATE_KEY in environment');
}
const wallet = new Wallet(PrivateKey.fromHex(privateKeyHex));

// Configure the Auth middleware
const authMiddleware = createAuthMiddleware({ wallet, allowUnauthenticated: false });

// Enable CORS for frontend-backend communication
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Expose-Headers', 'Private-Network');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(authMiddleware)

// Configure a non-protected route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});


app.get('/protected', (req, res) => {
    if (req.auth && req.auth.identityKey !== 'unknown') {
      // The request is authenticated
      res.send(`Hello, authenticated peer with public key: ${req.auth.identityKey}`)
    } else {
      // Not authenticated
      res.status(401).send('Unauthorized')
    }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})