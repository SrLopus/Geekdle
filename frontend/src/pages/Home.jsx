import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Bienvenido a Geekdle
                    </h1>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        El juego de palabras definitivo para geeks. Pon a prueba tus conocimientos
                        en tecnología, programación y cultura geek.
                    </p>
                    
                    {!isAuthenticated ? (
                        <div className="space-x-4">
                            <Link
                                to="/login"
                                className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/registro"
                                className="inline-block bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition-colors"
                            >
                                Registrarse
                            </Link>
                        </div>
                    ) : (
                        <Link
                            to="/jugar"
                            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                        >
                            ¡Jugar Ahora!
                        </Link>
                    )}
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                        <h3 className="text-xl font-semibold mb-3">Modo Diario</h3>
                        <p className="text-white/80">
                            Un nuevo desafío cada día. ¿Podrás resolverlo?
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                        <h3 className="text-xl font-semibold mb-3">Desafíos</h3>
                        <p className="text-white/80">
                            Reta a tus amigos y compite por la mejor puntuación.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                        <h3 className="text-xl font-semibold mb-3">Clasificación</h3>
                        <p className="text-white/80">
                            Sube en el ranking y demuestra quién es el mejor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 