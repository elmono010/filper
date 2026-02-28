import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

// Configurar dotenv
dotenv.config();

// Global crash handlers - CRITICAL to see why it fails in Logs
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'filper-super-secret-key';

// 1. CORS - MUST BE FIRST
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    optionsSuccessStatus: 200
}));
app.options('*', cors());
app.use(express.json());

// 2. DIAGNOSTICS
console.log('--- SYSTEM STARTUP ---');
console.log('TIME:', new Date().toISOString());
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL EXISTS:', !!process.env.DATABASE_URL);
console.log('---------------------------');

// 3. DATABASE (PRISMA 7 ADAPTER)
let prisma: PrismaClient;

try {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

    // Background connect
    prisma.$connect()
        .then(() => console.log('✅ Base de Datos: CONECTADA'))
        .catch(err => console.error('❌ Base de Datos: ERROR DE CONEXIÓN:', err.message));

} catch (e: any) {
    console.error('❌ FATAL: Error inicializando Prisma:', e.message);
}

// --- HELPERS ---
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// --- ROUTES ---

// Health Check & Welcome (Para probar en el navegador directamente)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>🚀 FILPER API IS ONLINE</h1>
            <p>El backend está respondiendo correctamente.</p>
            <p><strong>Puerto:</strong> ${PORT}</p>
            <p><strong>Estado DB:</strong> Ver logs del servidor</p>
            <hr/>
            <p>Si ves esto, el CORS ya no debería dar problemas.</p>
        </div>
    `);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
    console.log('📥 Registro recibido:', req.body?.email);
    const { email, password, name } = req.body;

    if (!prisma) return res.status(500).json({ error: 'Base de datos no inicializada' });

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const token = generateToken(user.id);
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
        console.error('❌ Error en registro:', error.message);
        res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
    }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
    console.log('📥 Login recibido:', req.body?.email);
    const { email, password } = req.body;

    if (!prisma) return res.status(500).json({ error: 'Base de datos no inicializada' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
        console.error('❌ Error en login:', error.message);
        res.status(500).json({ error: 'Error en el servidor: ' + error.message });
    }
});

// TikTok: Get Accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await prisma.tikTokAccount.findMany();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cuentas' });
    }
});

// Dashboard Stats
app.get('/api/stats', async (req, res) => {
    res.json({
        accountsCount: 5,
        scheduledVideos: 128,
        postedVideos: 1042,
        newFollowers: '12.5k'
    });
});

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n================================`);
    console.log(`🛸 FILPER BACKEND READY`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌏 Host: 0.0.0.0`);
    console.log(`================================\n`);
});
