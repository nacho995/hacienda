'use client';

import React, { useState, useEffect } from 'react';
import './cookie-banner.css'; // Importamos los estilos

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
        // Aquí podrías añadir lógica para cargar scripts de terceros si es necesario
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div id="cookie-banner" className="cookie-banner show"> {/* La clase 'show' ahora se controla por el estado isVisible */}
            <p>
                Este sitio web utiliza cookies para asegurar que obtengas la mejor experiencia. 
                <a href="/privacidad">Más información</a>
            </p>
            <div className="cookie-banner-buttons">
                <button id="accept-cookies" onClick={handleAccept}>Aceptar</button>
                <button id="decline-cookies" onClick={handleDecline}>Rechazar</button>
            </div>
        </div>
    );
};

export default CookieBanner; 