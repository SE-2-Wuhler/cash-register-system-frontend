import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Recycle } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 flex items-center justify-center"> {/* Flexbox für vertikale Zentrierung */}
      <div className="max-w-4xl w-full mx-auto"> {/* w-full hinzugefügt für responsives Verhalten */}
        <div className="text-center mb-8">
          <img src={process.env.PUBLIC_URL + "/favicon.png"} alt="Wühlmarkt Logo" className="h-24 mx-auto" />
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Willkommen im Wühlmarkt</h1>
          <p className="text-lg text-gray-600">Was möchten Sie heute tun?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 px-4">
          <div
            onClick={() => navigate('/sco')}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Einkaufen</h2>
              <p className="text-gray-600">
                Starten Sie Ihren Einkauf mit unserem modernen Self-Checkout System
              </p>
            </div>
            <div className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700 transition-colors duration-300">
              <span className="text-white font-medium">Jetzt einkaufen →</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/pledge')}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Recycle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pfandrückgabe</h2>
              <p className="text-gray-600">
                Geben Sie Ihre Pfandflaschen zurück und erhalten Sie Ihren Pfandbon
              </p>
            </div>
            <div className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-colors duration-300">
              <span className="text-white font-medium">Zum Pfandautomaten →</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Benötigen Sie Hilfe? Unser Personal steht Ihnen gerne zur Verfügung.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;