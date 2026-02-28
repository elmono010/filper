import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="bg-mesh" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-gradient-primary">
            FILPER
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="px-5 py-2 text-sm font-bold bg-primary rounded-full hover:scale-105 transition-transform">
              Regístrate
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-secondary border border-secondary/30 rounded-full glass">
            PLATAFORMA N°1 PARA AUTOMATIZACIÓN DE TIKTOK
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1]">
            Publica <span className="text-gradient-primary">1,000+ Videos</span> de forma Programática
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto">
            Impulsa tus perfiles de TikTok a escala masiva. Sube seguidores, programa contenido y domina el algoritmo sin esfuerzo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(255,0,80,0.5)] transition-all">
              Empieza Gratis Ahora
            </Link>
            <button className="px-8 py-4 glass text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors">
              Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Publicación Masiva"
              description="Sube cientos de videos a la vez. Nuestro sistema se encarga del resto, distribuyéndolos según tu estrategia."
              icon="🚀"
            />
            <FeatureCard
              title="Programación Inteligente"
              description="Elige los mejores horarios para maximizar el alcance. Deja que FILPER publique por ti mientras duermes."
              icon="📅"
            />
            <FeatureCard
              title="Crecimiento Acelerado"
              description="Herramientas integradas para aumentar seguidores y engagement de forma orgánica y programática."
              icon="⚡"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10 glass">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-foreground/50 text-sm">
            © 2024 FILPER. Desarrollado para dominación total en TikTok.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="p-8 rounded-3xl glass border border-white/5 hover:border-primary/50 transition-colors group">
      <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-foreground/60 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
