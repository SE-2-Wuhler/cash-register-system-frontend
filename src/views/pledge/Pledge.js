import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { pledgeService } from '../../api/services/pledgeService';
import CancelDialog from '../../utils/components/CancelDialog';


const NotificationBar = ({ notification }) => (
    <div
        className={`
            fixed top-0 left-0 right-0 z-50 
            transition-all duration-500 transform
            ${notification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
        `}
    >
        <div
            className={`
                text-white p-4 flex items-center justify-center shadow-lg
                ${notification?.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
            `}
            style={{
                visibility: notification ? 'visible' : 'hidden'
            }}
        >
            <AlertCircle className="mr-2" />
            <span className="text-lg font-semibold">{notification?.text}</span>
        </div>
    </div>
);

const ScannedBottle = ({ item, quantity }) => (
    <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-4 flex-1">
            {item.imgUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={item.imgUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.parentElement.style.display = 'none';
                        }}
                    />
                </div>
            )}
            <div className="flex-1 flex justify-between items-center">
                <div className="font-semibold text-xl">
                    {quantity > 1 ? `${quantity} × ` : ''}{item.name}
                </div>
                <div className="text-gray-900 text-lg font-bold">
                    {(item.pledgeValue * quantity).toFixed(2)}€
                </div>
            </div>
        </div>
    </div>
);

const Pledge = () => {
    const navigate = useNavigate();
    const [scannedBottles, setScannedBottles] = useState([]);
    const [notification, setNotification] = useState(null);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');
    const [lastKeypressTime, setLastKeypressTime] = useState(0);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [pledgeProducts, setPledgeProducts] = useState({});

    const {
        execute: getAllItemsWithPledge,
        loading: productsLoading,
        error: productsError
    } = useApi(pledgeService.getAllItemsWithPledge);

    useEffect(() => {
        const loadPledgeProducts = async () => {
            try {
                const products = await getAllItemsWithPledge();
                // Create a map of barcode to product for faster lookups
                const productMap = products.reduce((acc, product) => {
                    acc[product.barcodeId] = product;
                    return acc;
                }, {});
                setPledgeProducts(productMap);
            } catch (error) {
                setNotification({
                    text: 'Fehler beim Laden der Pfandprodukte',
                    type: 'error',
                    timestamp: Date.now()
                });
            }
        };

        console.log('Loading pledge products...');
        loadPledgeProducts();
    }, [getAllItemsWithPledge]);

    const {
        execute: createPledgeApiCall,
        loading: pledgeLoading,
        error: pledgeError
    } = useApi(pledgeService.createPledge);

    // Group scanned bottles by product ID
    const groupedBottles = scannedBottles.reduce((groups, bottle) => {
        const key = bottle.id;
        if (!groups[key]) {
            groups[key] = {
                item: bottle,
                quantity: 1
            };
        } else {
            groups[key].quantity += 1;
        }
        return groups;
    }, {});

    useEffect(() => {
        const handleKeyPress = async (event) => {
            const currentTime = Date.now();

            if (currentTime - lastKeypressTime > 100) {
                setBarcodeBuffer('');
            }

            setLastKeypressTime(currentTime);

            if (/^\d$/.test(event.key)) {
                setBarcodeBuffer(prev => prev + event.key);
            } else if (event.key === 'Enter' && barcodeBuffer) {
                const product = pledgeProducts[barcodeBuffer];

                if (product) {
                    if (product.pledgeValue <= 0) {
                        setNotification({
                            text: 'Dieses Produkt hat kein Pfand',
                            type: 'error',
                            timestamp: Date.now()
                        });
                    } else {
                        handleScan(product);
                    }
                } else {
                    setNotification({
                        text: 'Produkt nicht gefunden',
                        type: 'error',
                        timestamp: Date.now()
                    });
                }
                setBarcodeBuffer('');
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [barcodeBuffer, lastKeypressTime, pledgeProducts]);

    const handleScan = (product) => {
        setScannedBottles(prev => [...prev, { ...product, scanId: Date.now() }]);

        // Count current quantity of this product
        const currentCount = scannedBottles.filter(b => b.id === product.id).length + 1;

        setNotification({
            text: `${product.name} wurde hinzugefügt (${currentCount}×)`,
            type: 'success',
            timestamp: Date.now()
        });
    };

    const calculateTotal = () => {
        return scannedBottles.reduce((sum, item) => sum + item.pledgeValue, 0);
    };

    const handleCreatePledge = async () => {
        const itemsWithQuantity = Object.values(groupedBottles).map(({ item, quantity }) => ({
            itemId: item.id,
            quantity,
        }

        ));

        try {
            await createPledgeApiCall(itemsWithQuantity);
            setNotification({
                text: 'Pfand-Bon wird gedruckt.',
                type: 'success',
                timestamp: Date.now(),
            });
            setScannedBottles([]);
            navigate('/');
        } catch (error) {
            setNotification({
                text: pledgeError || 'Fehler beim Erstellen des Pfand-Bons.',
                type: 'error',
                timestamp: Date.now(),
            });
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleCancel = () => {
        if (scannedBottles.length > 0) {
            setShowCancelDialog(true);
        } else {
            setScannedBottles([]);
            navigate('/');
        }
    };

    const handleCancelConfirm = () => {
        setScannedBottles([]);
        setShowCancelDialog(false);
        navigate('/');
    };

    if (productsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Lade Pfandprodukte...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 bg-blue-50">
            <NotificationBar notification={notification} />

            <CancelDialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                onConfirm={handleCancelConfirm}
                message="Möchten Sie den Vorgang wirklich abbrechen? Alle gescannten Flaschen werden gelöscht."
            />

            {pledgeLoading && (
                <div className="fixed top-4 right-4 bg-blue-100 p-2 rounded">
                    Erstelle Pfand-Bon...
                </div>
            )}

            <div className="max-w-2xl rounded-lg mx-auto mt-16">
                <div className="bg-white rounded-lg p-1 shadow-lg flex flex-col h-[calc(100vh-8rem)]">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold">Pfandrückgabe</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {scannedBottles.length === 0 ? (
                            <div className="text-gray-500 text-center py-8 text-xl">
                                Bitte scannen Sie Ihre Pfandflaschen
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.values(groupedBottles).map(({ item, quantity }) => (
                                    <ScannedBottle
                                        key={item.id}
                                        item={item}
                                        quantity={quantity}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t p-6 bg-white">
                        <div className="flex justify-between items-center">
                            <div className="font-bold text-2xl">
                                <span>Gesamt:</span>
                                <span className="ml-3">{calculateTotal().toFixed(2)}€</span>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center space-x-3 transition-colors text-lg"
                            >
                                <XCircle size={24} />
                                <span>Abbrechen</span>
                            </button>
                            <button
                                onClick={handleCreatePledge}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center space-x-3 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={scannedBottles.length === 0}
                            >
                                <CreditCard size={24} />
                                <span>Bon drucken</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pledge;