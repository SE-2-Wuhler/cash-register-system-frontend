import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Complete() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 30000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleManualNavigation = () => {
    clearTimeout(timer); // Timer stoppen, falls der Button geklickt wird
    navigate('/');
  };
    let timer;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-16 max-w-lg w-full mx-auto text-center">
        <h1 className="text-5xl font-bold mb-8 text-green-700 tracking-tight">Vielen Dank!</h1> {/* Größere Überschrift */}
        <p className="text-xl text-gray-700 mb-10 leading-relaxed"> {/* Größerer Text, verbesserte Zeilenhöhe */}
          Deine Bestellung wurde erfolgreich bearbeitet.
        </p>

        <div className="mb-8"> {/* Container für den Button */}
        <button
          onClick={handleManualNavigation}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg w-auto" // Deutlich größerer, grüner Button
        >
          Neuen Einkauf starten
        </button>
        </div>
        <div className="animate-pulse text-gray-500 mt-4">Du wirst in Kürze automatisch weitergeleitet...</div> {/* Nach unten verschoben */}

      </div>
    </div>
  );
}

export default Complete;