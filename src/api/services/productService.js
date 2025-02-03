// src/api/services/productService.js

import { apiClient } from "../client";

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

    addProduct: async ({ barcode, price, pledgeValue }) => {
        if (!barcode || typeof barcode !== 'string') {
            throw new ProductError('Barcode ist erforderlich und muss eine Zeichenkette sein');
        }

        if (!price || typeof price !== 'number' || price <= 0) {
            throw new ProductError('Preis ist erforderlich und muss eine positive Zahl sein');
        }

        const payload = {
            barcodeId: barcode,
            price: price,
            pledgeValue: pledgeValue || 0
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