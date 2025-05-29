import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5
        }
    }
};

export default function Registro() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        try {
            await register({ username, email, password });
            navigate('/');
        } catch (err) {
            if (err.errors) {
                setError(Object.values(err.errors).flat().join(', '));
            } else {
                setError('Error al crear la cuenta');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center px-4 relative z-10 -mt-20">
                <div className="w-full max-w-md">
                    <motion.div 
                        className="w-full space-y-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Título */}
                        <motion.div className="text-center" variants={itemVariants}>
                            <h1 className="text-4xl font-black tracking-wider text-white mb-2">GEEKDLE</h1>
                            <p className="text-white/60 text-sm tracking-wide">Crea tu cuenta para jugar</p>
                        </motion.div>

                        {/* Formulario */}
                        <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
                            {error && (
                                <motion.div 
                                    className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <p className="text-red-400 text-sm tracking-wide">{error}</p>
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <motion.div variants={itemVariants}>
                                    <label htmlFor="username" className="block text-sm font-medium text-white/60 tracking-wide mb-1">
                                        Nombre de usuario
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all duration-300 text-sm tracking-wide"
                                        placeholder="Tu nombre de usuario"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label htmlFor="email" className="block text-sm font-medium text-white/60 tracking-wide mb-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all duration-300 text-sm tracking-wide"
                                        placeholder="tu@email.com"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label htmlFor="password" className="block text-sm font-medium text-white/60 tracking-wide mb-1">
                                        Contraseña
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all duration-300 text-sm tracking-wide"
                                        placeholder="••••••••"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-white/60 tracking-wide mb-1">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        id="passwordConfirmation"
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all duration-300 text-sm tracking-wide"
                                        placeholder="••••••••"
                                    />
                                </motion.div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                variants={itemVariants}
                            >
                                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                            </motion.button>

                            <motion.p 
                                className="text-center text-white/60 text-sm tracking-wide"
                                variants={itemVariants}
                            >
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-green-500 hover:text-green-400 transition-colors duration-300">
                                    Inicia sesión
                                </Link>
                            </motion.p>
                        </motion.form>
                    </motion.div>
                </div>
            </div>
        </>
    );
} 