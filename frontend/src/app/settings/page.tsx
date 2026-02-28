'use client';

export default function SettingsPage() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="text-center p-10 rounded-3xl glass border border-white/10">
                <div className="text-5xl mb-4">⚙️</div>
                <h1 className="text-3xl font-black text-gradient-primary mb-2">Configuración</h1>
                <p className="text-foreground/50">Administra tu cuenta y preferencias aquí.</p>
            </div>
        </main>
    );
}
