import { apiClient } from "../client";

export const transactionService = {
    createTransaction: async (items, pledges = []) => {
        const payload = {
            items: items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity
            })),
            pledges: pledges
        };

        try {
            console.log('Creating transaction with payload:', payload);
            const response = await apiClient.post('/transaction/create', payload);
            console.log('Transaction created:', response);
            return response;
        } catch (error) {
            console.error('Error creating transaction:', error.message);
            throw new TransactionError(error.message);
        }
    },

    cancelTransaction: async (transactionId) => {
        try {
            if (!transactionId) {
                throw new TransactionError('Transaction ID is required');
            }

            console.log('Cancelling transaction:', transactionId);
            const response = await apiClient.post(`/transaction/cancel/${transactionId}`);
            console.log('Transaction cancelled:', response);
            return response;
        } catch (error) {
            console.error('Error cancelling transaction:', error.message);
            throw new TransactionError(error.message);
        }
    },

    getTransaction: async (transactionId) => {
        try {
            if (!transactionId) {
                throw new TransactionError('Transaction ID is required');
            }

            console.log('Fetching transaction:', transactionId);
            const response = await apiClient.get(`/transaction/${transactionId}`);
            console.log('Transaction fetched:', response);
            return response;
        } catch (error) {
            console.error('Error fetching transaction:', error.message);
            throw new TransactionError(error.message);
        }
    },

    completeTransaction: async (paypalOderId, transactionId) => {
        try {
            if (!paypalOderId) {
                throw new TransactionError('Transaction ID is required');
            }

            const payload = {
                orderId: paypalOderId,
                transactionId: transactionId
            };

            console.log('Completing transaction with payload:', payload);
            const response = await apiClient.post(`/transaction/complete`, payload);
            console.log('Transaction completed:', response);
            return response;
        } catch (error) {
            console.error('Error completing transaction:', error.message);
            throw new TransactionError(error.message);
        }
    }
};

// Error class for TransactionService
export class TransactionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TransactionError';
    }
}