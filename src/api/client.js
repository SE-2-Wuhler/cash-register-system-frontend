import { API_CONFIG } from './config';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    console.log('Response:', response);
    return response.json();
};

const createApiClient = (baseURL) => {
    const fetchWithTimeout = async (url, options = {}) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    ...options.headers,
                },
            });
            return await handleResponse(response);
        } finally {
            clearTimeout(timeout);
        }
    };

    return {
        get: (endpoint) =>
            fetchWithTimeout(`${baseURL}${endpoint}`),

        post: (endpoint, data) =>
            fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        put: (endpoint, data) =>
            fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (endpoint) =>
            fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: 'DELETE',
            }),
    };
};

export const apiClient = createApiClient(API_CONFIG.BASE_URL);
