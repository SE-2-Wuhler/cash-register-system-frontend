import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';


function Pay() {
  const navigate = useNavigate();

  const [grossPrice, setGrossPrice] = useState(null);
  const [vatRate, setVatRate] = useState(0.19);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const mockedGrossPrice = 67.00;
        setGrossPrice(mockedGrossPrice);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 h-screen flex items-center justify-center"> {/* Flexbox für Zentrierung */}
        <div className="text-center"> {/* Innerer Container für Textzentrierung */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Preis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Fehler beim Laden des Preises: {error.message}</div>;
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
  return (
    <PayPalScriptProvider options={{ "client-id": "AbV-7ICaqhM9Xn21eTHQakdRmE0F5IS83yhLr5QNQBIWvbDZcqPPytIFq3AEPKjh09a3lpmMaQMo2DyW", "currency": "EUR", "disable-funding": "card" }}>
      <div className="min-h-screen flex items-center justify-center bg-green-50"> {/* Hauptcontainer für vertikale Zentrierung */}
        <div className="bg-white rounded-2xl shadow-xl p-16 max-w-2xl w-full mx-auto"> {/* Breite angepasst und Margin für horizontale Zentrierung */}
          <h1 className="text-4xl font-bold mb-8 text-green-700 text-center tracking-tight">Checkout</h1>

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
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                try {
                  const details = await actions.order.capture();
                  alert("Transaktion erfolgreich von " + details.payer.name.given_name + data.orderID);
                  
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