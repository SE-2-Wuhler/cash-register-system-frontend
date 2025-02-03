import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CancelDialog from '../../../utils/components/CancelDialog';
import { QRCodeSVG } from 'qrcode.react'; // Import QRCode library
import { transactionService } from '../../../api/services/transactionService';

// PayPal API credentials
const PAYPAL_CLIENT_ID = 'AbV-7ICaqhM9Xn21eTHQakdRmE0F5IS83yhLr5QNQBIWvbDZcqPPytIFq3AEPKjh09a3lpmMaQMo2DyW';
const PAYPAL_SECRET = 'EP-G2hmsSpg8D_TYqvvJeHZbJYRDxvpXsSatgpyGrk99x1SuTFEKoaFNGlC757f9qjaqZL-SMh86SKtB';
const PAYPAL_API_BASE_URL = 'https://api-m.sandbox.paypal.com'; // Sandbox URL

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
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

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
        console.log("laökjfaöslfj");
        console.log(response)
        setGrossPrice(response.totalAmount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  // Function to get PayPal Access Token
  const getPayPalAccessToken = async () => {
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`); // Base64 encode client ID and secret

    try {
      const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      return data.access_token;
    } catch (err) {
      console.error('Fehler beim Abrufen des PayPal Access Tokens:', err);
      throw err;
    }
  };

  // Function to create PayPal Order
  const createPayPalOrder = async () => {
    try {
      const accessToken = await getPayPalAccessToken();

      const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'EUR',
                value: (grossPrice).toFixed(2),
              },
              reference_id: transactionId,
            },
          ],
          application_context: {
            shipping_preference: 'NO_SHIPPING', 
            user_action: 'PAY_NOW', 
            return_url: 'https://guthib.com/', 
            cancel_url: 'https://guthib.com/'
          },
        }),
      });

      const data = await response.json();
      if (data.id) {
        setPaypalOrderId(data.id);
        console.log(data)
        setQrCodeUrl(data.links.find(link => link.rel === 'approve').href); // Get approval URL for QR Code
      } else {
        throw new Error('PayPal-Order konnte nicht erstellt werden.');
      }
    } catch (err) {
      setPaymentError("Es gab einen Fehler bei der Erstellung der PayPal-Order.");
      console.error("PayPal Order Fehler:", err);
      console.log(err)
    }
  };

  // Function to check PayPal Order status
  const checkPaymentStatus = async () => {
    try {
      const accessToken = await getPayPalAccessToken();

      const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders/${paypalOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log(data)
      if (data.status === 'APPROVED') {
        setPaymentCompleted(true);
        navigate('/sco/complete');
      } else {
        setPaymentError("Die Zahlung wurde noch nicht abgeschlossen.");
      }
    } catch (err) {
      setPaymentError("Es gab einen Fehler bei der Überprüfung des Zahlungsstatus.");
      console.error("PayPal Status Fehler:", err);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <CancelDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        message="Möchtest du den aktuellen Vorgang wirklich abbrechen? Alle gescannten Artikel gehen verloren."
      />

      <div className="bg-white rounded-2xl shadow-xl p-4 max-w-2xl w-full mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-green-700 text-center tracking-tight">Checkout</h1>

        <div className="bg-gray-50 rounded-xl p-10 mb-8 shadow-inner">
          {displayPriceBreakdown()}
        </div>

        <div className="mb-10">
          {!paypalOrderId ? (
            <button
              onClick={createPayPalOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded w-full"
            >
              Mit QR-Code bei PayPal bezahlen
            </button>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={qrCodeUrl} />
              </div>
              <button
                onClick={checkPaymentStatus}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded w-full"
              >
                Zahlungsstatus überprüfen
              </button>
            </>
          )}

          {paymentError && <p className="mt-2 text-red-500 text-center">{paymentError}</p>}

          <button
            onClick={() => { navigate('/sco/complete') }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded w-full mt-6"
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
  );
}

export default Pay;