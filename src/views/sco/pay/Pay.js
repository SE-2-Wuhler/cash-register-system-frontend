import React, { useState } from 'react';
import QRCode from 'react-qr-code';

function StaticQRCodePayment() {
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const bankData = {
    name: "Deine Bank", // Ersetze mit deiner Bank
    iban: "DE000000000000000000", // Ersetze mit deiner IBAN
    bic: "XXXXXXXXXXX", // Ersetze mit deinem BIC
  };

  const amounts = [1, 5, 10, 20];

  const handlePayment = () => {
    setPaymentSuccessful(true);
    setTimeout(() => {
      setPaymentSuccessful(false); // Nachricht nach einigen Sekunden ausblenden
    }, 3000);
  };

  return (
    <div>
      <h1>Statische QR-Code Zahlung</h1>

      {amounts.map((amount) => (
        <div key={amount} style={{ display: 'inline-block', margin: '10px', textAlign: 'center' }}>
          <h2>{amount} €</h2>
          <QRCode
            value={`iban=${bankData.iban}&bic=${bankData.bic}&name=${bankData.name}&amount=${amount}`}
            size={128}
            level="H"
            title={`QR-Code für ${amount}€`}
          />
          <p>Scanne diesen QR-Code mit deiner Banking-App.</p>
          <button onClick={handlePayment} style={{marginTop: "5px"}}>Zahlung bestätigen (Simulation)</button>
        </div>
      ))}

      {paymentSuccessful && (
        <div style={{ backgroundColor: 'lightgreen', padding: '10px', marginTop: '20px' }}>
          Zahlung simuliert erfolgreich!
        </div>
      )}
    </div>
  );
}

export default StaticQRCodePayment;
