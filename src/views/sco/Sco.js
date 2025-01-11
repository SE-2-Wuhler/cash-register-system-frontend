import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, Plus, Minus, CreditCard, XCircle } from 'lucide-react';
import { productService } from '../../api/services/productService';
import { useApi } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import CancelDialog from '../../utils/components/CancelDialog';


// Previous component definitions remain the same
const NotificationBar = ({ notification }) => (
    <div className={`fixed top-0 left-0 right-0 transition-transform duration-500 ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-green-500 text-white p-4 flex items-center justify-center shadow-lg">
            <AlertCircle className="mr-2" />
            <span className="text-lg font-semibold">{notification?.text}</span>
        </div>
    </div>
);

const ProductButton = ({ item, onScan }) => (
    <button
        onClick={() => onScan(item)}
        className="bg-green-100 hover:bg-green-200 p-3 rounded-lg text-center transition-colors w-full flex items-center gap-3"
    >
        {/* Image container - only shown if there's a valid image URL */}
        {item.imageUrl && (
            <div className="w-12 h-12 flex-shrink-0">
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                        // Remove the image container if loading fails
                        e.target.parentElement.style.display = 'none';
                    }}
                />
            </div>
        )}

        {/* Text content container */}
        <div className="flex-1 text-left">
            <div className="font-medium text-base mb-0.5">{item.name}</div>
            <div className="text-gray-600 text-sm">
                {item.price.toFixed(2)}€/{item.unit}
                {item.isOrganic && (
                    <span className="text-green-600 ml-2">Bio</span>
                )}
            </div>
        </div>
    </button>
);

// Updated CartItem with image
const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
    <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-4 flex-1">
            {/* Image container - only shown if there's a valid image URL */}
            {item.imageUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Remove the image container if loading fails
                            e.target.parentElement.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="flex-1">
                <div className="font-semibold text-xl">{item.name}</div>
                <div className="text-gray-600 text-lg">
                    {item.price}€ {item.isOrganic && <span className="text-green-600 ml-2">Bio</span>}
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="p-2 hover:bg-gray-100 rounded"
                >
                    <Minus size={24} />
                </button>
                <span className="w-10 text-center text-xl">{item.quantity}</span>
                <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="p-2 hover:bg-gray-100 rounded"
                >
                    <Plus size={24} />
                </button>
            </div>
            <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-700 p-2"
            >
                <Trash2 size={24} />
            </button>
        </div>
    </div>
);


const Sco = () => {
    const navigate = useNavigate();
    const [scannedItems, setScannedItems] = useState([]);
    const [notification, setNotification] = useState(null);
    const [produceItems, setProduceItems] = useState([]);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');
    const [lastKeypressTime, setLastKeypressTime] = useState(0);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const {
        data: items,
        loading,
        error,
        execute: fetchProduceItems
    } = useApi(productService.getAllProduce);

    const {
        execute: fetchProductByBarcode,
        loading: barcodeLoading,
        error: barcodeError
    } = useApi(productService.getProductByBarcode);

    useEffect(() => {
        fetchProduceItems();
    }, [fetchProduceItems]);

    useEffect(() => {
        if (items) {
            setProduceItems(items);
        }
    }, [items]);

    useEffect(() => {
        const handleKeyPress = async (event) => {
            const currentTime = Date.now();

            // If the time between keystrokes is > 100ms, reset the buffer
            // This helps distinguish between regular keyboard input and barcode scanner
            if (currentTime - lastKeypressTime > 100) {
                setBarcodeBuffer('');
            }

            setLastKeypressTime(currentTime);

            // Only accept numeric input and Enter key
            if (/^\d$/.test(event.key)) {
                setBarcodeBuffer(prev => prev + event.key);
            } else if (event.key === 'Enter' && barcodeBuffer) {
                // When Enter is pressed and we have a barcode, process it
                try {
                    const product = await fetchProductByBarcode(barcodeBuffer);
                    if (product) {
                        handleScan(product);
                    } else {
                        setNotification({
                            text: `Produkt mit Barcode ${barcodeBuffer} nicht gefunden`,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    setNotification({
                        text: 'Fehler beim Scannen des Produkts',
                        timestamp: Date.now()
                    });
                }
                setBarcodeBuffer('');
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [barcodeBuffer, lastKeypressTime, fetchProductByBarcode]);

    const handleScan = (item) => {
        // Check if the item already exists in scannedItems
        const existingItemIndex = scannedItems.findIndex(
            scanItem => scanItem.name === item.name
        );

        if (existingItemIndex !== -1) {
            // If item exists, update its quantity
            setScannedItems(prev => prev.map((scanItem, index) =>
                index === existingItemIndex
                    ? { ...scanItem, quantity: scanItem.quantity + 1 }
                    : scanItem
            ));
        } else {
        // If item doesn't exist, add it as new
            const newItem = {
                ...item,
                id: Date.now(),
                quantity: 1,
            };
            setScannedItems(prev => [...prev, newItem]);
        }
        showNotification(item.name);
    };

    const showNotification = (itemName) => {
        setNotification({
            text: `${itemName} wurde hinzugefügt`,
            timestamp: Date.now()
        });
        setTimeout(() => setNotification(null), 3000);
    };

    const updateQuantity = (id, change) => {
        setScannedItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(0, item.quantity + change) }
                : item
        ).filter(item => item.quantity > 0));
    };

    const removeItem = (id) => {
        setScannedItems(prev => prev.filter(item => item.id !== id));
    };

    const groupedItems = produceItems.reduce((groups, item) => {
        const key = item.category;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});

    const handleCancel = () => {
        if (scannedItems.length > 0) {
            setShowCancelDialog(true);
        } else {
            setScannedItems([]);
            navigate('/');
        }
    };

    const handleCancelConfirm = () => {
        setScannedItems([]);
        setShowCancelDialog(false);
        navigate('/');
    }

    const calculateTotal = () => {
        return scannedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePayment = () => {
        navigate('/sco/pay', { bookingId: '1' });
    };

    return (
        <div className="h-screen p-4 bg-green-50">
            <NotificationBar notification={notification} />

            <CancelDialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                onConfirm={handleCancelConfirm}
                message="Möchtest du den aktuellen Vorgang wirklich abbrechen? Alle gescannten Artikel gehen verloren."
            />

            {barcodeLoading && (
                <div className="fixed top-4 right-4 bg-yellow-100 p-2 rounded">
                    Scanning...
                </div>
            )}

            <div className="mt-16 flex gap-6 h-[calc(100vh-8rem)]">
                {/* Left side - Scanned Items with fixed payment section */}
                <div className="w-1/2 bg-white rounded-lg shadow flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold">Gescannte Artikel</h2>
                    </div>

                    {/* Scrollable cart items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {scannedItems.length === 0 ? (
                            <div className="text-gray-500 text-center py-8 text-xl">
                                Noch keine Artikel gescannt
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {scannedItems.map(item => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fixed payment section */}
                    <div className="border-t p-6 bg-white">
                        <div className="flex justify-between items-center">
                            <div className="font-bold text-2xl">
                                <span>Gesamt:</span>
                                <span className="ml-3">{calculateTotal().toFixed(2)}€</span>
                            </div>
                            <div className="flex gap-3">
                                    <button
                                    onClick={handleCancel}
                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center space-x-3 transition-colors text-lg"
                                    >
                                        <XCircle size={24} />
                                        <span>Abbrechen</span>
                                </button>
                                <button
                                    onClick={handlePayment}
                                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg flex items-center space-x-3 transition-colors text-lg"
                                    disabled={scannedItems.length === 0}
                                >
                                    <CreditCard size={24} />
                                    <span>Bezahlen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side bleibt gleich... */}
                <div className="w-1/2 bg-white rounded-lg shadow p-4 overflow-y-auto">
                    <h2 className="text-lg font-bold mb-4">Obst & Gemüse</h2>
                    {loading ? (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600 text-sm">Lade Produkte...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-6 text-red-500 text-sm">
                            {error}
                            <button
                                onClick={fetchProduceItems}
                                className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                            >
                                Erneut versuchen
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category} className="mb-4">
                                <h3 className="text-sm font-semibold mb-2 capitalize">
                                    {category === 'fruit' ? 'Obst' : 'Gemüse'}
                                </h3>
                                <div className="grid grid-cols-3 gap-2 auto-rows-fr">
                                    {items.map(item => (
                                        <ProductButton key={item.id} item={item} onScan={handleScan} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sco;