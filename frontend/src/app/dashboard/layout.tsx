'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Vista General', icon: '📊' },
    { href: '/dashboard/accounts', label: 'Cuentas TikTok', icon: '📱' },
    { href: '/dashboard/schedule', label: 'Programación', icon: '📅' },
    { href: '/dashboard/videos', label: 'Biblioteca', icon: '🎥' },
    { href: '/dashboard/n8n', label: 'Integración N8N', icon: '⚡' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setDarkMode(savedTheme === 'dark');
    }, [router]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <div className="bg-mesh" />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed lg:sticky top-0 h-screen w-64 flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
                            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                            F
                        </div>
                        <span className="text-xl font-black tracking-tight text-gradient-primary">FILPER</span>
                    </div>
                    <button className="lg:hidden text-xl" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ href, label, icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${active
                                    ? 'sidebar-link-active text-white'
                                    : 'hover:bg-green-500/10'
                                    }`}
                                style={active ? {} : { color: 'var(--text-muted)' }}
                            >
                                <span className="text-lg">{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: Settings + Logout */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
                    <Link href="/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all hover:bg-green-500/10 mb-1"
                        style={{ color: 'var(--text-muted)' }}>
                        <span>⚙️</span> Configuración
                    </Link>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all hover:bg-red-500/10"
                        style={{ color: 'var(--text-muted)' }}>
                        <span>🚪</span> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 lg:px-8"
                    style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--sidebar-border)' }}>
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-xl p-2 rounded-xl hover:bg-green-500/10"
                            onClick={() => setSidebarOpen(true)}>☰</button>
                        <h1 className="font-bold text-lg">
                            {NAV_ITEMS.find(n => n.href === pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
                            title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        {/* User avatar */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="hidden sm:block text-sm font-medium">{user?.name || 'Usuario'}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
