import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Trash2, Plus, Minus, CreditCard, XCircle, ArrowLeft } from 'lucide-react';
import { productService } from '../../api/services/productService';
import { useApi } from '../../hooks/useApi';
import { transactionService } from '../../api/services/transactionService';

// --------------
// 1. SUB-COMPONENTS
// --------------

/**
 * CancelDialog
 */
const CancelDialog = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <p className="text-gray-800 text-lg mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Vorgang beenden
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * NotificationBar
 */
const NotificationBar = ({ notification }) => (
    <div
        className={`
            fixed top-0 left-0 right-0 z-50 
            transition-all duration-500 ease-in-out
            ${notification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
    >
        <div
            className={`
                text-white p-4 flex items-center justify-center shadow-lg
                transition-colors duration-300
                ${notification?.type === 'error' ? 'bg-red-500' : 'bg-green-500'}
            `}
        >
            <AlertCircle className="mr-2" />
            <span className="text-lg font-semibold">{notification?.text}</span>
        </div>
    </div>
);

/**
 * ProductButton
 * 
 * (Optional) We prevent Enter/Space from triggering the button via onKeyDown.
 */
const ProductButton = ({ item, onScan }) => (
    <button
        type="button"
        onClick={() => onScan(item)}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
            }
        }}
        className="bg-green-100 hover:bg-green-200 p-3 rounded-lg text-center transition-colors w-full flex items-center gap-3 focus:outline-none"
        tabIndex="-1"
    >
        {/* Image container - only shown if there's a valid image URL */}
        {item.imgUrl && (
            <div className="w-12 h-12 flex-shrink-0">
                <img
                    src={item.imgUrl}
                    alt={item.name}
                    className="w-full h-full object-contain rounded-md"
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
                {item.price.toFixed(2)}€ / Stück
                {item.isOrganic && <span className="text-green-600 ml-2">Bio</span>}
            </div>
        </div>
    </button>
);

/**
 * CartItem
 * 
 * Also prevents Enter/Space via onKeyDown.
 */
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const handleButtonClick = (change) => {
        onUpdateQuantity(item.id, change);
        document.activeElement.blur();
    };

    return (
        <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-4 flex-1">
                {!item.isPledge && item.imgUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden  flex-shrink-0">
                        <img
                            src={item.imgUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.parentElement.style.display = 'none';
                            }}
                        />
                    </div>
                )}
                <div className="flex-1">
                    <div className="font-semibold text-xl">
                        {item.name}
                        {item.isPledge && <span className="text-green-600 ml-2">(Pfand)</span>}
                    </div>
                    <div className="text-gray-600 text-lg">
                        + {item.price.toFixed(2) * item.quantity}€ ({item.price.toFixed(2)}€ / Stück)
                        {!item.isPledge && item.isOrganic &&
                            <span className="text-green-600 ml-2">Bio</span>
                        }
                    </div>
                    {item.pledgeValue > 0 &&
                        <div className="text-gray-500 text-sm">
                            <span className="">+ {item.pledgeValue.toFixed(2) * item.quantity}€ Pfand ({item.pledgeValue.toFixed(2)}€ / Stück)</span>
                        </div>
                    }
                </div>
            </div>
            <div className="flex items-center space-x-6">
                {!item.isPledge && (
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => handleButtonClick(-1)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                            }}
                            className="p-2 hover:bg-gray-100 rounded"
                        >
                            <Minus size={24} />
                        </button>
                        <span className="w-10 text-center text-xl">{item.quantity}</span>
                        <button
                            onClick={() => handleButtonClick(1)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                            }}
                            className="p-2 hover:bg-gray-100 rounded"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                )}
                <button
                    onClick={() => {
                        onRemove(item.id);
                        document.activeElement.blur();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                    }}
                    className="text-red-500 hover:text-red-700 p-2"
                >
                    <Trash2 size={24} />
                </button>
            </div>
        </div>
    );
};
// --------------
// 2. MAIN SCO COMPONENT
// --------------


const Sco = () => {
    const navigate = useNavigate();
    // [Previous state declarations remain the same...]

    // Add global click handler
    useEffect(() => {
        const handleGlobalClick = () => {
            // Small timeout to ensure click handling is complete
            setTimeout(() => {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }, 0);
        };

        window.addEventListener('click', handleGlobalClick);
        
        // Cleanup
        return () => {
            window.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    const [scannedItems, setScannedItems] = useState([]);
    const [notification, setNotification] = useState(null);
    const [produceItems, setProduceItems] = useState([]);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');
    const [lastKeypressTime, setLastKeypressTime] = useState(0);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);

    const {
        data: items,
        loading,
        error,
        execute: fetchProduceItems
    } = useApi(productService.getNonScanableItems);

    const {
        execute: fetchProductByBarcode,
        loading: barcodeLoading,
        error: barcodeError
    } = useApi(productService.getProductByBarcode);

    // Notification helper
    const showNotification = (message, type = 'success') => {
        if (window.notificationTimeout) {
            clearTimeout(window.notificationTimeout);
        }
        setNotification({
            text: message,
            type,
            timestamp: Date.now()
        });
        window.notificationTimeout = setTimeout(() => {
            setNotification(null);
        }, 2500);
    };

    // Fetch produce items on mount
    useEffect(() => {
        fetchProduceItems();
    }, [fetchProduceItems]);

    // Set produce items once available
    useEffect(() => {
        if (items) {
            setProduceItems(items);
        }
    }, [items]);

    useEffect(() => {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();

        return () => {
            document.body.removeAttribute('tabindex');
        };
    }, []);

    // Barcode scanning effect
    useEffect(() => {
        const handleKeyPress = async (event) => {
            const currentTime = Date.now();

            if (currentTime - lastKeypressTime > 100) {
                setBarcodeBuffer('');
            }
            setLastKeypressTime(currentTime);

            if (/^\d$/.test(event.key)) {
                setBarcodeBuffer((prev) => prev + event.key);
            } else if (event.key === 'Enter' && barcodeBuffer) {
                try {
                    const product = await fetchProductByBarcode(barcodeBuffer);
                    if (product) {
                        handleScan(product);
                    } else {
                        showNotification(`Produkt mit Barcode ${barcodeBuffer} nicht gefunden`, 'error');
                    }
                } catch (error) {
                    showNotification('Fehler beim Scannen des Produkts', 'error');
                }
                setBarcodeBuffer('');
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [barcodeBuffer, lastKeypressTime, fetchProductByBarcode]);

    // Handle scanning
    const handleScan = (item) => {
        if (item.pledge) {
            const pledgeAlreadyScanned = scannedItems.some(
                scanItem => scanItem.isPledge && scanItem.id === item.id
            );

            if (pledgeAlreadyScanned) {
                showNotification('Dieser Pfandbon wurde bereits gescannt', 'error');
                return;
            }

            const newItem = {
                id: item.id,
                name: 'Pfand Rückgabe',
                price: -item.value,
                quantity: 1,
                isPledge: true,
                barcodeId: item.barcodeId
            };
            setScannedItems(prev => [...prev, newItem]);
            showNotification(`Pfand (${item.value.toFixed(2)}€) wurde abgezogen`);
        } else {
            const existingItemIndex = scannedItems.findIndex(
                (scanItem) => scanItem.id === item.id
            );

            if (existingItemIndex !== -1) {
                setScannedItems((prev) =>
                    prev.map((scanItem, idx) =>
                        idx === existingItemIndex
                            ? { ...scanItem, quantity: scanItem.quantity + 1 }
                            : scanItem
                    )
                );
            } else {
                const newItem = {
                    ...item,
                    quantity: 1
                };
                setScannedItems((prev) => [...prev, newItem]);
            }
            showNotification(`${item.name} wurde hinzugefügt`);
        }
    };

    const updateQuantity = (id, change) => {
        setScannedItems((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: Math.max(0, item.quantity + change) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeItem = (id) => {
        setScannedItems((prev) => prev.filter((item) => item.id !== id));
    };

    const groupedItems = produceItems.reduce((groups, item) => {
        const category = item.category?.split(',')[0]?.trim() || 'Other';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(item);
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
    };

    const calculateTotal = () =>
        scannedItems.reduce((sum, item) => sum + (item.price + item.pledgeValue) * item.quantity, 0);

    const handlePayment = async () => {
        try {
            console.log('Creating transaction with items:', scannedItems);
            const items = scannedItems
                .filter(item => !item.isPledge)
                .map(item => ({
                    itemId: item.id,
                    quantity: item.quantity
                }));

            const pledges = scannedItems
                .filter(item => item.isPledge)
                .map(item => item.id);

            const response = await transactionService.createTransaction(items, pledges);

            if (response) {
                showNotification('Transaktion erfolgreich erstellt');
                navigate('/sco/pay', {
                    state: {
                        transactionId: response,
                    }
                });
            }
        } catch (error) {
            showNotification('Fehler beim Erstellen der Transaktion', 'error');
            console.error('Transaction error:', error);
        }
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
                                {scannedItems.map((item) => (
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

                {/* Right side - Produce items */}
                <div className="w-1/2 bg-white rounded-lg shadow p-4 overflow-y-auto">
                    {activeCategory ? (
                        <>
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="bg-green-100 hover:bg-green-200 p-3 rounded-lg text-center transition-colors flex items-center gap-3 focus:outline-none mb-4"
                                >
                                <ArrowLeft size={20} className="mr-2" />
                                Zurück zu Kategorien
                            </button>
                            <h2 className="text-lg font-bold mb-4">{activeCategory}</h2>
                            <div className="grid grid-cols-3 gap-2 auto-rows-fr">
                                {groupedItems[activeCategory]?.map((item) => (
                                    <ProductButton
                                        key={item.id}
                                        item={item}
                                        onScan={handleScan}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-bold mb-4">Kategorien</h2>
                            <div className="grid grid-cols-3 gap-2 auto-rows-fr">
                                {Object.keys(groupedItems).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className="relative overflow-hidden group w-full bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-xl text-center transition-all duration-300 shadow-sm hover:shadow-md border border-green-200/50"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                                                {category}
                                            </h3>
                                            <p className="text-sm text-gray-500 group-hover:text-gray-600">
                                                Produkte anzeigen
                                            </p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sco;