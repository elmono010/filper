'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        accountsCount: '0',
        scheduledVideos: '0',
        postedVideos: '0',
        newFollowers: '0'
    });
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (storedUser) setUser(JSON.parse(storedUser));

        // Fetch stats
        apiFetch('/api/stats')
            .then(setStats)
            .catch(console.error);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) return <div className="min-h-screen bg-black" />;

    return (
        <main className="min-h-screen relative flex">
            <div className="bg-mesh" />

            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/10 hidden lg:flex flex-col p-6 z-10">
                <div className="text-2xl font-black tracking-tighter text-gradient-primary mb-10">
                    FILPER
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarLink href="/dashboard" label="Vista General" icon="📊" active />
                    <SidebarLink href="/dashboard/accounts" label="Cuentas TikTok" icon="📱" />
                    <SidebarLink href="/dashboard/schedule" label="Programación" icon="📅" />
                    <SidebarLink href="/dashboard/videos" label="Biblioteca" icon="🎥" />
                </nav>

                <div className="pt-6 border-t border-white/10">
                    <SidebarLink href="/settings" label="Configuración" icon="⚙️" />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-foreground/60 hover:bg-white/5"
                    >
                        <span>🚪</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-8 z-10">
                    <h1 className="font-bold text-lg">Panel de Control</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">Hola, {user.name || 'Usuario'}</div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
                    </div>
                </header>

                <section className="p-8 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard label="Cuentas Conectadas" value={stats.accountsCount} growth="+1" icon="📱" />
                        <StatCard label="Videos Programados" value={stats.scheduledVideos} growth="+12" icon="📅" />
                        <StatCard label="Videos Publicados" value={stats.postedVideos} growth="+85" icon="✅" />
                        <StatCard label="Nuevos Seguidores" value={stats.newFollowers} growth="+2.1k" icon="📈" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 rounded-3xl glass border border-white/10 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Actividad Reciente</h3>
                                <button className="text-secondary text-sm font-bold hover:underline">Ver todo</button>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 rounded-lg bg-white/10" />
                                            <div>
                                                <div className="font-bold">Video #{1000 + i}</div>
                                                <div className="text-xs text-foreground/50">Programado para hoy, 18:00</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-orange-500/20 text-orange-500 border border-orange-500/30">
                                            PENDIENTE
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl glass border border-white/10 p-8">
                            <h3 className="text-xl font-bold mb-8">Cuentas Activas</h3>
                            <div className="space-y-6">
                                {['@tiktok_guru', '@viral_cuts'].map((handle) => (
                                    <div key={handle} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10" />
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">{handle}</div>
                                            <div className="text-xs text-foreground/50">Estado: Activa</div>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                ))}
                                <button className="w-full py-4 mt-4 border border-dashed border-white/20 rounded-2xl text-sm font-bold hover:bg-white/5 transition-colors">
                                    + Conectar Nueva Cuenta
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function SidebarLink({ href, label, icon, active = false }: { href: string, label: string, icon: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${active ? 'bg-primary text-white' : 'text-foreground/60 hover:bg-white/5'
                }`}
        >
            <span>{icon}</span>
            {label}
        </Link>
    );
}

function StatCard({ label, value, growth, icon }: { label: string, value: string | number, growth: string, icon: string }) {
    return (
        <div className="p-6 rounded-3xl glass border border-white/10 group hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{growth}</span>
            </div>
            <div className="text-2xl font-black mb-1">{value}</div>
            <div className="text-xs text-foreground/40 font-bold tracking-tight uppercase">{label}</div>
        </div>
    );
}
