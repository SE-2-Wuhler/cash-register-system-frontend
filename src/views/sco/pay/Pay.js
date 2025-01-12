import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useLocation, useNavigate } from 'react-router-dom';
import CancelDialog from '../../../utils/components/CancelDialog';
import { transactionService } from '../../../api/services/transactionService';

function Pay() {
  const navigate = useNavigate();
  const location = useLocation();
  const transactionId = location?.state?.transactionId || null;

  const [grossPrice, setGrossPrice] = useState(null);
  const [vatRate, setVatRate] = useState(0.19);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionId) {
        setError(new Error('Keine Transaktions-ID gefunden'));
        setLoading(false);
        return;
      }

      try {
        const response = await transactionService.getTransaction(transactionId);
        if (response.status === 'paid') {
          navigate('/sco/complete');
        }
        setGrossPrice(response.totalAmount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  const displayTransactionInfo = () => {
    if (!transactionId) return null;

    return (
      <div className="mb-4 px-4 py-2 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">Transaktions-ID:</p>
        <p className="font-mono text-gray-800">{transactionId}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Transaktionsdaten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Fehler: {error.message}</div>;
  }

  const calculateVatAmount = (grossPrice) => {
    return grossPrice * (vatRate / (1 + vatRate));
  };

  const calculateNetPrice = (grossPrice) => {
    return grossPrice - calculateVatAmount(grossPrice);
  };

  const displayPriceBreakdown = () => {
    if (grossPrice) {
      const vatAmount = calculateVatAmount(grossPrice);
      const netPrice = calculateNetPrice(grossPrice);

      return (
        <div>
          <div className="flex justify-between items-center">
            <span className="text-lg text-gray-700">Nettopreis:</span>
            <span className="text-lg font-bold text-gray-700">{netPrice.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">+ {vatRate * 100}% MwSt.:</span>
            <span className="text-sm text-gray-500">{(vatAmount).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xl font-bold text-green-600">Bruttopreis:</span>
            <span className="text-xl font-bold text-green-600 tracking-tight">{grossPrice.toFixed(2)} €</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelDialog(false);
    navigate('/');
  };

  return (
    <PayPalScriptProvider options={{ "client-id": "AbV-7ICaqhM9Xn21eTHQakdRmE0F5IS83yhLr5QNQBIWvbDZcqPPytIFq3AEPKjh09a3lpmMaQMo2DyW", "currency": "EUR", "disable-funding": "card" }}>
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <CancelDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancelConfirm}
          message="Möchtest du den aktuellen Vorgang wirklich abbrechen? Alle gescannten Artikel gehen verloren."
        />

        <div className="bg-white rounded-2xl shadow-xl p-16 max-w-2xl w-full mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-700 text-center tracking-tight">Checkout</h1>

          {displayTransactionInfo()}

          <div className="bg-gray-50 rounded-xl p-10 mb-8 shadow-inner">
            {displayPriceBreakdown()}
          </div>

          <div className="mb-10">
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                tagline: false,
                height: 52,
                shape: 'rect',
                label: 'paypal'
              }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: calculateNetPrice(grossPrice).toFixed(2),
                      },
                      reference_id: transactionId,
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                try {
                  const details = await actions.order.capture();
                  await transactionService.completeTransaction(data.orderID);

                  navigate('/sco/complete');
                } catch (err) {
                  setPaymentError("Es gab einen Fehler bei der PayPal-Zahlung.");
                  console.error("PayPal Capture Fehler:", err);
                }
              }}
              onError={(err) => {
                setPaymentError("Es gab einen Fehler bei der PayPal-Zahlung.");
                console.error("PayPal Fehler:", err);
              }}
            />
            {paymentError && <p className="mt-2 text-red-500 text-center">{paymentError}</p>}

            <button
              onClick={() => { navigate('/sco/complete')}}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-8 rounded w-full mt-6"
            >
              Barzahlung
            </button>

            <button
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded w-full mt-6"
            >
              Abbrechen
            </button>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            Durch Klicken auf "Mit PayPal bezahlen" oder "Barzahlung" stimmen Sie unseren <a href="#" className="text-green-600">Nutzungsbedingungen</a> und <a href="#" className="text-green-600">Datenschutzbestimmungen</a> zu.
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

export default Pay;