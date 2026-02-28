'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen relative flex items-center justify-center p-4">
            <div className="bg-mesh" />

            <div className="w-full max-w-md p-10 rounded-3xl glass animate-float">
                <div className="text-center mb-10">
                    <Link href="/" className="text-3xl font-black tracking-tighter text-gradient-primary inline-block mb-4">
                        FILPER
                    </Link>
                    <h2 className="text-2xl font-bold">Bienvenido de nuevo</h2>
                    <p className="text-foreground/50 mt-2">Ingresa a tu cuenta para gestionar tus videos</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-2 pl-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 pl-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_20px_rgba(255,0,80,0.3)] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Cargando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-foreground/50">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="text-secondary font-bold hover:underline transition-all">
                        Crea una aquí
                    </Link>
                </div>
            </div>
        </main>
    );
}
