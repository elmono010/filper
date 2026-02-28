'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Stats {
    accountsCount: number;
    scheduledVideos: number;
    postedVideos: number;
    newFollowers: string | number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({ accountsCount: 0, scheduledVideos: 0, postedVideos: 0, newFollowers: '0' });

    useEffect(() => {
        apiFetch('/api/stats').then(setStats).catch(console.error);
    }, []);

    const statCards = [
        { label: 'Cuentas Conectadas', value: stats.accountsCount, icon: '📱', trend: '+1', trendUp: true },
        { label: 'Videos Programados', value: stats.scheduledVideos, icon: '📅', trend: '+12', trendUp: true },
        { label: 'Videos Publicados', value: stats.postedVideos, icon: '✅', trend: '+85', trendUp: true },
        { label: 'Nuevos Seguidores', value: stats.newFollowers, icon: '📈', trend: '+2.1k', trendUp: true },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome banner */}
            <div className="rounded-3xl p-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0, transparent 60%)' }} />
                <h2 className="text-2xl font-black text-white mb-1">Bienvenido a FILPER 🚀</h2>
                <p className="text-white/70 text-sm">Panel de control de tus automatizaciones de TikTok</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map(({ label, value, icon, trend, trendUp }) => (
                    <div key={label} className="rounded-3xl p-6 transition-all hover:scale-[1.02]"
                        style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">{icon}</span>
                            <span className="text-xs font-bold px-2 py-1 rounded-full"
                                style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--primary)' }}>
                                {trend}
                            </span>
                        </div>
                        <div className="text-3xl font-black mb-1">{value}</div>
                        <div className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent activity */}
                <div className="xl:col-span-2 rounded-3xl p-7"
                    style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Actividad Reciente</h3>
                        <button className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Ver todo →</button>
                    </div>
                    <div className="space-y-3">
                        {[
                            { title: 'Workflow TikTok activado', time: 'Hace 2 min', status: 'ok' },
                            { title: 'Video programado para 18:00', time: 'Hace 15 min', status: 'pending' },
                            { title: 'Credencial N8N actualizada', time: 'Hace 1 hora', status: 'ok' },
                            { title: 'Nuevo seguidor detectado', time: 'Hace 3 horas', status: 'ok' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                                style={{ background: 'var(--input-bg)' }}>
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.status === 'ok' ? 'bg-green-500' : 'bg-orange-400'}`} />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-3xl p-7"
                    style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                    <h3 className="text-lg font-bold mb-6">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Conectar cuenta TikTok', icon: '📱', href: '/dashboard/accounts' },
                            { label: 'Configurar N8N', icon: '⚡', href: '/dashboard/n8n' },
                            { label: 'Programar video', icon: '📅', href: '/dashboard/schedule' },
                            { label: 'Ver biblioteca', icon: '🎥', href: '/dashboard/videos' },
                        ].map(({ label, icon, href }) => (
                            <a key={label} href={href}
                                className="flex items-center gap-3 p-4 rounded-2xl font-medium text-sm transition-all hover:scale-[1.01]"
                                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}>
                                <span className="text-xl">{icon}</span>
                                {label}
                                <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>→</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
