export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
    ENDPOINTS: {
        PRODUCE: '/produce',
        SCAN: '/scan',
        ORDERS: '/orders'
    },
    TIMEOUT: 5000
};