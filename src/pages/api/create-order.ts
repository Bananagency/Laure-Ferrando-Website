import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    const endPoint = import.meta.env.PUBLIC_API_URL;
    const apiKey = import.meta.env.CLIENT_KEY;
    const apiSecret = import.meta.env.CLIENT_SECRET;

    if (!endPoint || !apiKey || !apiSecret) {
        return new Response(JSON.stringify({ error: 'Configuration API manquante' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const orderData = await request.json();
        
        const response = await fetch(`${endPoint}/wp-json/wc/v3/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(apiKey + ':' + apiSecret)
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de la commande');
        }

        const order = await response.json();
        
        return new Response(JSON.stringify(order), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 