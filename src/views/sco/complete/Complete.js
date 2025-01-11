import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Complete() {
    const navigate = useNavigate();
    const jointRef = useRef(null);
    let timer; // Timer außerhalb des useEffect definieren

    useEffect(() => {
        timer = setTimeout(() => {
            navigate('/');
        }, 30000);

        return () => clearTimeout(timer); // Timer im Cleanup stoppen
    }, [navigate]);

    useEffect(() => {
        const joint = jointRef.current;
        if (joint) {
            let x = Math.random() * (window.innerWidth - joint.offsetWidth); // Zufällige Startposition
            let y = Math.random() * (window.innerHeight - joint.offsetHeight);
            let dx = (Math.random() - 0.5) * 8; // Zufällige Geschwindigkeit und Richtung
            let dy = (Math.random() - 0.5) * 8;

            joint.style.left = x + 'px';
            joint.style.top = y + 'px';

            const animateJoint = () => {
                x += dx;
                y += dy;

                if (x + joint.offsetWidth > window.innerWidth || x < 0) {
                    dx = -dx;
                }
                if (y + joint.offsetHeight > window.innerHeight || y < 0) {
                    dy = -dy;
                }

                joint.style.left = x + 'px';
                joint.style.top = y + 'px';

                requestAnimationFrame(animateJoint);
            };

            animateJoint();
        }
    }, []);

    const handleManualNavigation = () => {
        clearTimeout(timer); // Timer auch beim Button-Klick stoppen
        navigate('/');
    };

    const Smoke = ({ style }) => (
        <div
            style={{
                position: 'absolute',
                background: 'radial-gradient(circle, rgba(200,200,200,0.2) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%',
                animation: 'smoke 4s linear infinite',
                ...style,
            }}
        />
    );

    return (
        <div className="min-h-screen relative bg-green-50 overflow-hidden flex items-center justify-center">
            <div
                ref={jointRef}
                style={{
                    position: 'absolute',
                    width: '100px',
                    zIndex: 10,
                    filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
                }}
            >
                <img src={process.env.PUBLIC_URL + "/joint.png"} alt="Animierter Joint" />
                {[...Array(20)].map((_, i) => ( // Erzeugt 20 Rauchwolken
                    <Smoke
                        key={i}
                        style={{
                            width: `${20 + Math.random() * 60}px`, // Größere Variation in der Größe
                            height: `${20 + Math.random() * 60}px`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: 0.3 + Math.random() * 0.4, // Noch geringere Basis-Opazität
                        }}
                    />
                ))}

            </div>
            <style>
                {`
          @keyframes smoke {
            0% { transform: translate(0, 0) scale(1); opacity: 0;}
            50% { transform: translate(-10px, -20px) scale(1.5); opacity: 1;}
            100% { transform: translate(-20px, -40px) scale(2); opacity: 0;}
          }
        `}
            </style>
            <div className="flex items-center justify-center h-full">
                <div className="bg-white rounded-2xl shadow-xl p-16 max-w-lg w-full mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-8 text-green-700 tracking-tight">Vielen Dank!</h1>
                    <p className="text-xl text-gray-700 mb-10 leading-relaxed">
                        Deine Bestellung wurde erfolgreich bearbeitet.
                    </p>
                    <div className="mb-8">
                        <button
                            onClick={handleManualNavigation}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg w-auto"
                        >
                            Neuen Einkauf starten
                        </button>
                    </div>
                    <div className="animate-pulse text-gray-500 mt-4">Du wirst in Kürze automatisch weitergeleitet...</div>
                </div>
            </div>
        </div>
    );
}

export default Complete;