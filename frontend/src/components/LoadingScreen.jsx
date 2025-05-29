import React from 'react';
import logoVerde from '../assets/logo_verde.svg';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 overflow-hidden">
            {/* Logo con animación */}
            <div className="relative w-32 h-32">
                {/* Círculo exterior pulsante */}
                <div className="absolute inset-[-12px] border-4 border-emerald-500/20 rounded-full animate-pulse"></div>
                
                {/* Círculo giratorio */}
                <div className="absolute inset-[-4px] border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
                
                {/* Contenedor del logo */}
                <div className="absolute inset-0 bg-white/90 rounded-full p-4 shadow-2xl shadow-emerald-500/20 flex items-center justify-center">
                    <img 
                        src={logoVerde} 
                        alt="Geekdle" 
                        className="w-20 h-20 drop-shadow-sm"
                    />
                </div>
            </div>

            {/* Partículas animadas */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-float"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.6
                        }}
                    />
                ))}
            </div>

            {/* Texto de carga */}
            <div className="absolute bottom-12 flex items-center space-x-2">
                <span className="text-emerald-500 text-sm font-medium tracking-wider">CARGANDO</span>
                <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
} 