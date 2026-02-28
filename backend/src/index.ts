import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Direct side-effect import is safer in ESM
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

// Global crash handlers
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
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];

// 1. CORS - ABSOLUTE PRIORITY
app.use(cors({
    origin: (origin, callback) => {
        // Permitir si no hay origin (como apps móviles o curl) o si está en la lista blanca
        if (!origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`🔒 CORS bloqueado para: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));
app.options('*', cors());
app.use(express.json());

// 2. STARTUP LOGS
console.log('\n--- 🚀 FILPER SYSTEM STARTUP ---');
console.log('TIME:', new Date().toISOString());
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || '(Default: *)');
console.log('DATABASE_URL EXISTS:', !!process.env.DATABASE_URL);
console.log('--------------------------------\n');

// 3. DATABASE (PRISMA 7 ADAPTER) - LAZY INIT
let prisma: PrismaClient | null = null;

try {
    if (process.env.DATABASE_URL) {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });

        prisma.$connect()
            .then(() => console.log('✅ Base de Datos: CONECTADA'))
            .catch(err => console.error('❌ Base de Datos: ERROR DE CONEXIÓN:', err.message));
    } else {
        console.error('⚠️ WARN: No DATABASE_URL found. API will run but DB calls will fail.');
    }
} catch (e: any) {
    console.error('❌ FATAL: Error inicializando Prisma:', e.message);
}

// --- HELPERS ---
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white; min-height: 100vh;">
            <h1 style="color: #38bdf8;">🚀 FILPER API IS ONLINE</h1>
            <p>El backend está respondiendo correctamente en el puerto ${PORT}.</p>
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; display: inline-block; margin-top: 20px;">
                <p><strong>Status:</strong> Operacional</p>
                <p><strong>Endpoint:</strong> api.silkroad-ao.xyz</p>
            </div>
            <p style="margin-top: 20px; opacity: 0.7;">Si ves esto, el CORS ya no es un problema.</p>
        </div>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        dbConnected: !!prisma
    });
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

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n================================`);
    console.log(`🛸 FILPER BACKEND READY`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌏 Host: 0.0.0.0`);
    console.log(`================================\n`);
});
