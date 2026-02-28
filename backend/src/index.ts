import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;

// =============================================
// GLOBAL CRASH HANDLERS
// =============================================
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
});

// =============================================
// APP SETUP
// =============================================
const app = express();
const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'filper-secret';

// =============================================
// CORS - MANUAL Y ABSOLUTO (sin librería cors)
// Poner esto PRIMERO para que SIEMPRE se envíen las cabeceras
// =============================================
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Responder preflight inmediatamente
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());

// =============================================
// STARTUP DIAGNOSTICS
// =============================================
console.log('\n=== 🚀 FILPER BACKEND STARTING ===');
console.log('TIME   :', new Date().toISOString());
console.log('PORT   :', PORT);
console.log('DB URL :', process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌');
console.log('==================================\n');

// =============================================
// DATABASE - PRISMA 7 ADAPTER
// =============================================
let prisma: PrismaClient | null = null;

if (process.env.DATABASE_URL) {
    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
        prisma.$connect()
            .then(() => console.log('✅ DB CONNECTED'))
            .catch((e: Error) => console.error('❌ DB CONNECTION FAILED:', e.message));
    } catch (e: any) {
        console.error('❌ PRISMA INIT FAILED:', e.message);
    }
} else {
    console.warn('⚠️  No DATABASE_URL set. DB calls will fail.');
}

// =============================================
// HELPER
// =============================================
const generateToken = (userId: string) =>
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

// =============================================
// ROUTES
// =============================================

// Root
app.get('/', (_req: Request, res: Response) => {
    res.send(`
        <!DOCTYPE html><html><head><title>FILPER API</title></head>
        <body style="font-family:sans-serif;background:#0f172a;color:#fff;text-align:center;padding:60px">
            <h1 style="color:#38bdf8">🚀 FILPER API IS ONLINE</h1>
            <p>El backend está funcionando en el puerto <strong>${PORT}</strong>.</p>
            <p>DB Status: <strong>${prisma ? '✅ Conectada' : '❌ Sin conexión'}</strong></p>
        </body></html>
    `);
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime(), db: !!prisma });
});

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { email, password, name } = req.body || {};
    console.log('📥 REGISTER:', email);

    if (!prisma) return res.status(503).json({ error: 'Base de datos no disponible' });
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'El usuario ya existe' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashed, name: name || '' },
        });
        const token = generateToken(user.id);
        return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (e: any) {
        console.error('❌ REGISTER ERROR:', e.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    console.log('📥 LOGIN:', email);

    if (!prisma) return res.status(503).json({ error: 'Base de datos no disponible' });
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = generateToken(user.id);
        return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (e: any) {
        console.error('❌ LOGIN ERROR:', e.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Stats
app.get('/api/stats', (_req: Request, res: Response) => {
    res.json({
        accountsCount: 0,
        scheduledVideos: 0,
        postedVideos: 0,
        newFollowers: '0'
    });
});

// TikTok Accounts
app.get('/api/accounts', async (_req: Request, res: Response) => {
    if (!prisma) return res.status(503).json({ error: 'DB no disponible' });
    try {
        const accounts = await prisma.tikTokAccount.findMany();
        res.json(accounts);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// N8N Proxy (Fixes CORS)
app.post('/api/n8n/proxy', async (req: Request, res: Response) => {
    console.log('--- 🛡️ N8N PROXY DEBUG ---');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const body = req.body || {};
    const url = body.url;
    const apiKey = body.apiKey;
    const endpoint = body.endpoint;
    const method = body.method;
    const dataToSend = body.body;
    
    if (!url || !apiKey || !endpoint) {
        console.warn('❌ Missing:', { url: !!url, apiKey: !!apiKey, endpoint: !!endpoint });
        return res.status(400).json({ 
            error: 'Faltan parámetros requeridos', 
            received: { url: !!url, apiKey: !!apiKey, endpoint: !!endpoint },
            debug_body: req.body 
        });
    }

    try {
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http')) {
            cleanUrl = `https://${cleanUrl}`;
        }
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }
        
        const targetUrl = `${cleanUrl}/api/v1/${endpoint}`;
        
        console.log(`📡 N8N Proxy: ${method || 'GET'} ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: method || 'GET',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: dataToSend ? JSON.stringify(dataToSend) : undefined
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (e: any) {
        console.error('❌ N8N Proxy Error:', e.message);
        return res.status(500).json({ error: 'Fallo al conectar con N8N: ' + e.message });
    }
});

// Catch-all 404
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Ruta no encontrada', path: req.url });
});

// =============================================
// START SERVER
// =============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🛸 FILPER BACKEND READY → http://0.0.0.0:${PORT}\n`);
});
