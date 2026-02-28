import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'filper-super-secret-key';

// 1. CORS - FIRST THING (Ensures browsers get headers even if DB fails later)
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    optionsSuccessStatus: 200
}));

// Preflight handler explicit
app.options('*', cors());

app.use(express.json());

// 2. DIAGNOSTICS - LOG WHAT WE SEE
console.log('--- SYSTEM DIAGNOSTICS ---');
console.log('TIME:', new Date().toISOString());
console.log('PORT:', PORT);
if (process.env.DATABASE_URL) {
    const obscured = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
    console.log('DATABASE_URL:', obscured);
} else {
    console.error('❌ FATAL: DATABASE_URL is EMPTY');
}
console.log('---------------------------');

// 3. DATABASE SETUP (PRISMA 7 ADAPTER)
let prisma: PrismaClient;

try {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5, // Ligeramente más bajo para evitar saturar en arranque
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

    // Connection test background
    prisma.$connect()
        .then(() => console.log('✅ Base de Datos: Conexión Exitosa'))
        .catch(err => console.error('❌ Base de Datos: Fallo de Conexión:', err.message));

} catch (e: any) {
    console.error('❌ FATAL: Error crítico inicializando Prisma:', e.message);
}

// --- HELPERS ---
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// --- ROUTES ---

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'FILPER Backend decoupled is running' });
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// TikTok: Get Accounts (Requires Auth Placeholder)
app.get('/api/accounts', async (req, res) => {
    // In a real app, verify token and get userId from it
    try {
        const accounts = await prisma.tikTokAccount.findMany();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cuentas' });
    }
});

// Dashboard Stats (Placeholder)
app.get('/api/stats', async (req, res) => {
    res.json({
        accountsCount: 5,
        scheduledVideos: 128,
        postedVideos: 1042,
        newFollowers: '12.5k'
    });
});

app.listen(PORT, () => {
    console.log(`FILPER Backend running on port ${PORT}`);
});
