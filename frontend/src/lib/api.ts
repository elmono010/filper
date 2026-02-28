const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Algo salió mal');
    }

    return response.json();
}
