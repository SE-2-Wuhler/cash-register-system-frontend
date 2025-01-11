// src/api/services/productService.js

// Mock data for fruits and vegetables
const MOCK_PRODUCE = [
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
    // Produce functions
    getAllProduce: async () => {
        await delay(800);
        return MOCK_PRODUCE;
    },

    // Product functions
    getAllProducts: async () => {
        await delay(800);
        return MOCK_PRODUCTS;
    },

    getProductById: async (id) => {
        await delay(300);
        const product = MOCK_PRODUCTS.find(item => item.id === id);
        if (!product) {
            throw new ProductError('Produkt nicht gefunden');
        }
        return product;
    },

    getProductByBarcode: async (barcode) => {
        await delay(300);
        const product = MOCK_PRODUCTS.find(item => item.barcode === barcode);
        if (!product) {
            throw new ProductError(`Produkt mit Barcode ${barcode} nicht gefunden`);
        }
        return product;
    },

    searchProducts: async (query) => {
        await delay(500);
        const searchTerm = query.toLowerCase();
        return MOCK_PRODUCTS.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.barcode.includes(searchTerm)
        );
    }
};

// Error class
export class ProductError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProductError';
    }
}