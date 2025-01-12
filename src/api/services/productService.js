// src/api/services/productService.js

import { apiClient } from "../client";

// Mock data for fruits and vegetables
let MOCK_PRODUCE = [
    {
        id: 'p1',
        name: 'Äpfel',
        price: 2.99,
        unit: 'kg',
        category: 'fruit',
        plu: '4131',
        isOrganic: false,
        origin: 'Deutschland',
        imageUrl: 'https://media.istockphoto.com/id/532048136/de/foto/frischen-roten-apfel-isoliert-auf-wei%C3%9F-mit-clipping-path.jpg?s=1024x1024&w=is&k=20&c=kFtuhfrrvyJ1Ver3XJEWj331J4ff8CGrhQAt8PEiBQ0=',
    },
    {
        id: 'p2',
        name: 'Bio-Bananen',
        price: 1.99,
        unit: 'kg',
        category: 'fruit',
        plu: '94011',
        isOrganic: true,
        origin: 'Ecuador'
    },
    {
        id: 'p3',
        name: 'Karotten',
        price: 1.49,
        unit: 'kg',
        category: 'vegetable',
        plu: '4562',
        isOrganic: false,
        origin: 'Deutschland'
    },
    {
        id: 'p4',
        name: 'Bio-Tomaten',
        price: 3.99,
        unit: 'kg',
        category: 'vegetable',
        plu: '93061',
        isOrganic: true,
        origin: 'Spanien'
    },
    {
        id: 'p5',
        name: 'Birnen',
        price: 2.49,
        unit: 'kg',
        category: 'fruit',
        plu: '4409',
        isOrganic: false,
        origin: 'Italien'
    },
    {
        id: 'p6',
        name: 'Kartoffeln',
        price: 0.99,
        unit: 'kg',
        category: 'vegetable',
        plu: '4072',
        isOrganic: false,
        origin: 'Deutschland'
    },
    {
        id: 'p7',
        name: 'Bio-Zwiebeln',
        price: 1.29,
        unit: 'kg',
        category: 'vegetable',
        plu: '94082',
        isOrganic: true,
        origin: 'Deutschland'
    },
    {
        id: 'p8',
        name: 'Orangen',
        price: 2.79,
        unit: 'kg',
        category: 'fruit',
        plu: '4012',
        isOrganic: false,
        origin: 'Spanien'
    }
];

// Mock data for barcode products
const MOCK_PRODUCTS = [
    {
        id: 'b1',
        name: 'Kaffe Sahne',
        price: 1.99,
        unit: 'stk',
        barcode: '4008230208001',
        imageUrl: 'https://www.saliter.de/wp-content/uploads/2021/08/Alpen_Kaffeesahne_250ml_753x1000.png',
        pledgeAmount: 0 // No deposit
    },
    {
        id: 'b2',
        name: 'Pepsi Cola',
        price: 1.99,
        unit: 'stk',
        barcode: '4062139002191',
        imageUrl: 'https://ip.prod.freshop.retail.ncrcloud.com/resize?url=https://images.freshop.ncrcloud.com/00012000001291/a9c31233160adbad246facc8695b9dcf_large.png&width=512&type=webp&quality=90',
        pledgeAmount: 0.25 // 25 cents deposit
    }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
    getNonScanableItems: async () => {
        try {
            console.log('Fetching non-scanable items');
            const response = await apiClient.get('/item/notscanables');
            console.log('Non-scanable items fetched:', response);

            if (!response) {
                throw new ProductError('Keine nicht-scanbaren Produkte gefunden');
            }

            return response;
        } catch (error) {
            console.error('Error fetching non-scanable items:', error);
            throw new ProductError(error.message || 'Fehler beim Abrufen der nicht-scanbaren Produkte');
        }
    },
    // Product functions
    getAllProducts: async () => {
        await delay(800);
        return MOCK_PRODUCTS;
    },

    getProductById: async (id) => {
        if (typeof id !== 'string') {
            throw new ProductError('Ungültige Produkt-ID');
        }

        const payload = {
            value: id,
        };

        try {
            console.log('Fetching product with id:', id);
            const response = await apiClient.post('/product/get', payload);
            console.log('Product fetched:', response);
            return response;
        } catch (error) {
            console.error('Error fetching product:', error.message);
            throw error;
        }
    },

    getProductByBarcode: async (barcode) => {
        if (!barcode || typeof barcode !== 'string') {
            throw new ProductError('Barcode ist erforderlich und muss eine Zeichenkette sein');
        }

        try {
            console.log('Fetching product with barcode:', barcode);
            const response = await apiClient.get(`/item/${barcode}`);
            console.log('Product fetched:', response);

            if (!response) {
                throw new ProductError(`Produkt mit Barcode ${barcode} nicht gefunden`);
            }

            return response;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw new ProductError(error.message || `Fehler beim Abrufen des Produkts mit Barcode ${barcode}`);
        }
    },


    searchProducts: async (query) => {
        await delay(500);
        const searchTerm = query.toLowerCase();
        return MOCK_PRODUCTS.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.barcode.includes(searchTerm)
        );
    },

    addProduct: async ({ barcode, price }) => {
        if (!barcode || typeof barcode !== 'string') {
            throw new ProductError('Barcode ist erforderlich und muss eine Zeichenkette sein');
        }

        if (!price || typeof price !== 'number' || price <= 0) {
            throw new ProductError('Preis ist erforderlich und muss eine positive Zahl sein');
        }

        const payload = {
            barcodeId: barcode,
            price: price
        };

        try {
            console.log('Adding product:', payload);
            const response = await apiClient.post('/product/create', payload);
            console.log('Product added:', response);
            return response;
        } catch (error) {
            console.error('Error adding product:', error);
            throw new ProductError(error.message || 'Fehler beim Hinzufügen des Produkts');
        }
    }
};

// Error class
export class ProductError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProductError';
    }
}