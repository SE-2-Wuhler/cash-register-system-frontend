// src/api/services/produceService.js

// Mock data
const MOCK_PRODUCE = [
    {
        id: 'p1',
        name: 'Äpfel',
        price: 2.99,
        unit: 'kg',
        category: 'fruit',
        plu: '4131',
        isOrganic: false,
        origin: 'Deutschland'
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

// Hilfsfunktion für simulierte API-Verzögerung
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ProduceService
export const produceService = {
    // Alle Produkte abrufen
    getAllProduce: async () => {
        await delay(800); // Simuliere Netzwerkverzögerung
        return MOCK_PRODUCE;
    },

    // Produkt nach ID suchen
    getProduceById: async (id) => {
        await delay(300);
        const product = MOCK_PRODUCE.find(item => item.id === id);
        if (!product) {
            throw new Error('Produkt nicht gefunden');
        }
        return product;
    },

    // Produkte nach Kategorie filtern
    getProduceByCategory: async (category) => {
        await delay(500);
        return MOCK_PRODUCE.filter(item => item.category === category);
    },

    // Produkt nach PLU-Code suchen
    getProduceByPLU: async (plu) => {
        await delay(300);
        const product = MOCK_PRODUCE.find(item => item.plu === plu);
        if (!product) {
            throw new Error('PLU nicht gefunden');
        }
        return product;
    },

    // Bio-Produkte filtern
    getOrganicProduce: async () => {
        await delay(500);
        return MOCK_PRODUCE.filter(item => item.isOrganic);
    },

    // Preis für ein gewogenes Produkt berechnen
    calculateWeightPrice: async (plu, weight) => {
        const product = await produceService.getProduceByPLU(plu);
        return {
            product,
            weight,
            totalPrice: (product.price * weight).toFixed(2)
        };
    }
};

// Optional: Error-Klassen für spezifische Fehlerbehandlung
export class ProduceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProduceError';
    }
}

export class PLUNotFoundError extends ProduceError {
    constructor(plu) {
        super(`PLU ${plu} wurde nicht gefunden`);
        this.name = 'PLUNotFoundError';
        this.plu = plu;
    }
}