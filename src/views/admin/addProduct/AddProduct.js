import React, { useState, useEffect } from 'react';
import { AlertCircle, Scan } from 'lucide-react';
import { productService } from '../../../api/services/productService';
import { useApi } from '../../../hooks/useApi';

const NotificationBar = ({ notification }) => (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`${notification?.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-4 flex items-center justify-center shadow-lg`}>
            <AlertCircle className="mr-2" />
            <span className="text-lg font-semibold">{notification?.text}</span>
        </div>
    </div>
);

const AddProduct = () => {
    const [notification, setNotification] = useState(null);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');
    const [lastKeypressTime, setLastKeypressTime] = useState(0);
    const [lastScannedProduct, setLastScannedProduct] = useState(null);
    const [price, setPrice] = useState('');

    const {
        execute: addProduct,
        loading,
        error
    } = useApi(productService.addProduct);

    const handlePriceChange = (event) => {
        const value = event.target.value;
        // Allow only numbers and one decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            setPrice(value);
        }
    };

    useEffect(() => {
        const handleKeyPress = async (event) => {
            const currentTime = Date.now();

            // Reset buffer if there's been a pause in typing
            if (currentTime - lastKeypressTime > 100) {
                setBarcodeBuffer('');
            }

            setLastKeypressTime(currentTime);

            // Only accept digits
            if (/^\d$/.test(event.key)) {
                setBarcodeBuffer(prev => prev + event.key);
            } else if (event.key === 'Enter' && barcodeBuffer) {
                if (!price) {
                    setNotification({
                        text: 'Bitte geben Sie einen Preis ein',
                        type: 'error',
                        timestamp: Date.now()
                    });
                    return;
                }

                try {
                    const result = await addProduct({
                        barcode: barcodeBuffer,
                        price: parseFloat(price)
                    });
                    setLastScannedProduct(result);
                    setNotification({
                        text: `Produkt ${result.name} wurde erfolgreich hinzugefügt`,
                        type: 'success',
                        timestamp: Date.now()
                    });
                    // Reset price after successful addition
                    setPrice('');
                } catch (error) {
                    setNotification({
                        text: error.message || 'Fehler beim Hinzufügen des Produkts',
                        type: 'error',
                        timestamp: Date.now()
                    });
                }
                setBarcodeBuffer('');
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [barcodeBuffer, lastKeypressTime, addProduct, price]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <div className="min-h-screen p-4">
            <NotificationBar notification={notification} />

            <div className="max-w-2xl mx-auto mt-16">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Produkt hinzufügen</h1>
                        <p className="text-gray-600">
                            Geben Sie den Preis ein und scannen Sie den Barcode eines neuen Produkts.
                        </p>
                    </div>

                    {/* Price Input */}
                    <div className="mb-6">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            Preis (€)
                        </label>
                        <input
                            type="text"
                            id="price"
                            value={price}
                            onChange={handlePriceChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Scanning Status */}
                    <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg mb-8">
                        {loading ? (
                            <div className="flex items-center text-blue-500">
                                <Scan className="animate-pulse mr-2" size={24} />
                                <span>Verarbeite Barcode...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <Scan className="mb-2" size={32} />
                                <span>Warte auf Barcode-Scan...</span>
                            </div>
                        )}
                    </div>

                    {/* Last Scanned Product */}
                    {lastScannedProduct && (
                        <div className="border-t pt-6">
                            <h2 className="text-lg font-semibold mb-4">Zuletzt hinzugefügtes Produkt:</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="font-medium">{lastScannedProduct.name}</div>
                                <div className="text-gray-600 text-sm mt-1">
                                    Name: {lastScannedProduct.name}
                                </div>
                                <div className="text-gray-600 text-sm mt-1">
                                    Barcode: {lastScannedProduct.barcodeId}
                                </div>
                                <div className="text-gray-600 text-sm mt-1">
                                    Preis: {lastScannedProduct.price.toFixed(2)}€
                                </div>
                                {lastScannedProduct.pledgeAmount > 0 && (
                                    <div className="text-green-600 font-medium mt-1">
                                        Pfand: {lastScannedProduct.pledgeAmount.toFixed(2)}€
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProduct;