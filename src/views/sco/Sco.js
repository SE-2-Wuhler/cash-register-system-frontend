import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { produceService } from '../../api/services/produceService';
import { useApi } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';


// Extraktion der Notification-Komponente
const NotificationBar = ({ notification }) => (
    <div className={`fixed top-0 left-0 right-0 transition-transform duration-500 ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-green-500 text-white p-4 flex items-center justify-center shadow-lg">
            <AlertCircle className="mr-2" />
            <span className="text-lg font-semibold">{notification?.text}</span>
        </div>
    </div>
);

// Extraktion der Produkt-Schaltfläche
const ProductButton = ({ item, onScan }) => (
    <button
        onClick={() => onScan(item)}
        className="bg-green-100 hover:bg-green-200 p-4 rounded-lg text-center transition-colors"
    >
        <div className="font-semibold">{item.name}</div>
        <div className="text-gray-600">{item.price}€/{item.unit}</div>
        {item.isOrganic && (
            <div className="text-green-600 text-sm mt-1">Bio</div>
        )}
    </button>
);

// Extraktion des Warenkorb-Items
const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
    <div className="flex items-center justify-between border-b pb-2">
        <div className="flex-1">
            <div className="font-semibold">{item.name}</div>
            <div className="text-gray-600">
                {item.price}€ {item.isOrganic && <span className="text-green-600 ml-2">Bio</span>}
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <Minus size={20} />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <Plus size={20} />
                </button>
            </div>
            <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-700 p-1"
            >
                <Trash2 size={20} />
            </button>
        </div>
    </div>
);

const Sco = () => {
    const navigate = useNavigate();

    const [scannedItems, setScannedItems] = useState([]);
    const [notification, setNotification] = useState(null);
    const [produceItems, setProduceItems] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const {
        data: items,
        loading,
        error,
        execute: fetchProduceItems
    } = useApi(produceService.getAllProduce);

    useEffect(() => {
        fetchProduceItems();
    }, [fetchProduceItems]);

    useEffect(() => {
        if (items) {
            setProduceItems(items);
        }
    }, [items]);

    const handleScan = (item) => {
        const newItem = {
            ...item,
            id: Date.now(),
            quantity: 1,
        };
        setScannedItems(prev => [...prev, newItem]);
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

    const calculateTotal = () => {
        return scannedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePayment = () => {
        navigate('/sco/pay', { state: { scannedItems } });
        setIsPaymentModalOpen(true);
    };

    const groupedItems = produceItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto p-4">
            <NotificationBar notification={notification} />

            <div className="mt-16">
                {/* Obst & Gemüse Auswahl */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h2 className="text-xl font-bold mb-4">Obst & Gemüse</h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Lade Produkte...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            {error}
                            <button
                                onClick={fetchProduceItems}
                                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Erneut versuchen
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category} className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 capitalize">
                                    {category === 'fruit' ? 'Obst' : 'Gemüse'}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {items.map(item => (
                                        <ProductButton key={item.id} item={item} onScan={handleScan} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Warenkorb */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-bold mb-4">Gescannte Artikel</h2>
                    {scannedItems.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
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
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="font-bold text-xl">
                                        <span>Gesamt:</span>
                                        <span className="ml-2">{calculateTotal().toFixed(2)}€</span>
                                    </div>
                                    <button
                                        onClick={handlePayment}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                        disabled={scannedItems.length === 0}
                                    >
                                        <CreditCard size={20} />
                                        <span>Bezahlen</span>
                                    </button>
                                </div>
                            </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sco;