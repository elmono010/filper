'use client';

import { useState, useEffect } from 'react';

interface N8NConfig {
    url: string;
    apiKey: string;
    workflowId: string;
    credentialId: string;
    credentialData: string;
}

export default function N8NPage() {
    const [config, setConfig] = useState<N8NConfig>({
        url: '',
        apiKey: '',
        workflowId: '',
        credentialId: '',
        credentialData: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
    const [savedConfigs, setSavedConfigs] = useState<N8NConfig[]>([]);
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('n8n_configs');
        if (saved) setSavedConfigs(JSON.parse(saved));
        const lastConfig = localStorage.getItem('n8n_last_config');
        if (lastConfig) setConfig(JSON.parse(lastConfig));
    }, []);

    const testConnection = async () => {
        if (!config.url || !config.apiKey) {
            setMessage('Ingresa la URL y la API Key de N8N primero.');
            setTestStatus('fail');
            return;
        }
        setTestStatus('testing');
        setMessage('Probando conexión...');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/n8n/proxy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: config.url,
                    apiKey: config.apiKey,
                    method: 'GET',
                    endpoint: 'workflows'
                })
            });
            
            if (res.ok) {
                setTestStatus('ok');
                setMessage('✅ Conexión exitosa con N8N.');
            } else {
                setTestStatus('fail');
                setMessage(`❌ Error: Verifica la URL y API Key.`);
            }
        } catch {
            setTestStatus('fail');
            setMessage('❌ No se pudo conectar. Verifica que la URL sea correcta.');
        }
    };

    const updateCredential = async () => {
        if (!config.url || !config.apiKey || !config.credentialId) {
            setMessage('Completa la URL, API Key y el ID de la credencial.');
            setStatus('error');
            return;
        }

        let parsedData: any = {};
        try {
            parsedData = JSON.parse(config.credentialData);
        } catch {
            setMessage('❌ El JSON de credenciales no es válido. Verifica el formato.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setMessage('Actualizando credencial en N8N...');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/n8n/proxy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: config.url,
                    apiKey: config.apiKey,
                    method: 'PATCH',
                    endpoint: `credentials/${config.credentialId}`,
                    body: { data: parsedData }
                })
            });

            if (res.ok) {
                setStatus('success');
                setMessage('✅ Credencial actualizada exitosamente en N8N.');
                localStorage.setItem('n8n_last_config', JSON.stringify(config));
            } else {
                const err = await res.json();
                setStatus('error');
                setMessage(`❌ Error: ${err.error || 'Fallo en la actualización'}`);
            }
        } catch (e) {
            setStatus('error');
            setMessage('❌ No se pudo conectar con N8N a través del proxy.');
        }
    };

    const triggerWorkflow = async () => {
        if (!config.url || !config.apiKey || !config.workflowId) {
            setMessage('Completa la URL, API Key y el ID del Workflow.');
            setStatus('error');
            return;
        }
        setStatus('loading');
        setMessage('Ejecutando workflow...');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/n8n/proxy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: config.url,
                    apiKey: config.apiKey,
                    method: 'POST',
                    endpoint: `workflows/${config.workflowId}/activate`
                })
            });

            if (res.ok) {
                setStatus('success');
                setMessage('✅ Workflow activado correctamente.');
            } else {
                setStatus('error');
                setMessage(`❌ Error activando workflow.`);
            }
        } catch {
            setStatus('error');
            setMessage('❌ Error de conexión al intentar activar el workflow.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                    ⚡
                </div>
                <div>
                    <h2 className="text-2xl font-black">Integración con N8N</h2>
                    <p style={{ color: 'var(--text-muted)' }} className="text-sm">
                        Conecta y controla tus workflows de N8N directamente desde FILPER
                    </p>
                </div>
            </div>

            {/* Status message */}
            {message && (
                <div className={`p-4 rounded-2xl text-sm font-medium border ${
                    status === 'success' || testStatus === 'ok'
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : status === 'error' || testStatus === 'fail'
                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                        : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                }`}>
                    {message}
                </div>
            )}

            {/* Connection Config */}
            <div className="rounded-3xl p-6 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔗</span>
                    <h3 className="font-bold text-lg">Conexión con N8N</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* N8N URL */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                            URL de tu instancia N8N *
                        </label>
                        <input
                            type="url"
                            placeholder="https://tu-n8n.com"
                            value={config.url}
                            onChange={e => setConfig({ ...config, url: e.target.value })}
                            className="input-field w-full px-4 py-3 rounded-2xl text-sm"
                        />
                    </div>

                    {/* API Key */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                            API Key de N8N *
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                placeholder="n8n_api_xxxxxxxxxxxxx"
                                value={config.apiKey}
                                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                                className="input-field w-full px-4 py-3 pr-12 rounded-2xl text-sm font-mono"
                            />
                            <button
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-50 hover:opacity-100 transition-opacity"
                            >{showApiKey ? '🙈' : '👁️'}</button>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Encuéntralo en N8N → Settings → API → Create API Key
                        </p>
                    </div>
                </div>

                <button
                    onClick={testConnection}
                    disabled={testStatus === 'testing'}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--primary)' }}
                >
                    {testStatus === 'testing' ? '⏳ Probando...' : testStatus === 'ok' ? '✅ Conectado' : '🔌 Probar Conexión'}
                </button>
            </div>

            {/* Credential Update */}
            <div className="rounded-3xl p-6 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔑</span>
                    <h3 className="font-bold text-lg">Actualizar Credencial en Nodo</h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Ingresa los datos que quieres guardar en la credencial de un nodo específico de N8N.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                            ID de la Credencial *
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: 5"
                            value={config.credentialId}
                            onChange={e => setConfig({ ...config, credentialId: e.target.value })}
                            className="input-field w-full px-4 py-3 rounded-2xl text-sm font-mono"
                        />
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            ID que aparece en N8N al editar la credencial
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                            ID del Workflow (opcional)
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: abc123"
                            value={config.workflowId}
                            onChange={e => setConfig({ ...config, workflowId: e.target.value })}
                            className="input-field w-full px-4 py-3 rounded-2xl text-sm font-mono"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                            Datos de la Credencial (JSON) *
                        </label>
                        <textarea
                            rows={5}
                            placeholder={`{\n  "sessionCookie": "tu-cookie-aqui",\n  "username": "tu-usuario"\n}`}
                            value={config.credentialData}
                            onChange={e => setConfig({ ...config, credentialData: e.target.value })}
                            className="input-field w-full px-4 py-3 rounded-2xl text-sm font-mono resize-none"
                        />
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Los campos deben coincidir exactamente con los que usa el nodo en N8N.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                        onClick={updateCredential}
                        disabled={status === 'loading'}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold pulse-green"
                    >
                        {status === 'loading' ? '⏳ Actualizando...' : '💾 Actualizar Credencial en N8N'}
                    </button>
                    <button
                        onClick={triggerWorkflow}
                        disabled={status === 'loading'}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
                    >
                        ▶️ Activar Workflow
                    </button>
                </div>
            </div>

            {/* How-to guide */}
            <div className="rounded-3xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📖</span>
                    <h3 className="font-bold">Guía Rápida</h3>
                </div>
                <ol className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {[
                        'En N8N, ve a Settings → API y crea una API Key.',
                        'Copia la URL de tu instancia de N8N (ej: https://mi-n8n.com).',
                        'En N8N, abre la credencial del nodo que quieres configurar y copia su ID desde la URL del navegador.',
                        'Ingresa los datos de la credencial en formato JSON. Los campos deben coincidir con el tipo de credencial del nodo.',
                        'Haz clic en "Actualizar Credencial" para enviar los datos a N8N automáticamente.',
                    ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                                style={{ background: 'var(--primary)' }}>
                                {i + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
