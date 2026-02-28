import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'filper-super-secret-key';

const prisma = new PrismaClient();

app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins for now to solve the issue
        callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());

// Interceptar todas las peticiones OPTIONS para asegurar que respondan con CORS
app.options('*', cors());

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
