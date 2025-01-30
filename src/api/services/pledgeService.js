import { apiClient } from "../client";


export const pledgeService = {

    createPledge: async (itemsWithQuantity) => {
        // if (typeof totalAmount !== 'number' || totalAmount <= 0) {
        //     throw new Error('Invalid totalAmount. It must be a positive number.');
        // }

        const payload =
            itemsWithQuantity;

        console.log('payload', payload);
        try {
            console.log('Creating pledge with payload:', payload);
            const response = await apiClient.post('/pledge/create', payload);
            console.log('Pledge created:', response);
            return response;
        } catch (error) {
            console.error('Error creating pledge:', error.message);
            throw error;
        }
    },

    getAllItemsWithPledge: async () => {
        try {
            console.log('Fetching all items with pledge');
            const response = await apiClient.get('/pledge/get-all-products-with-pledge');
            console.log('Items with pledge fetched:', response);
            return response;
        } catch (error) {
            console.error('Error fetching items with pledge:', error.message);
            throw error;
        }
    }
};

// Error class for PledgeService
export class PledgeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PledgeError';
    }
}
