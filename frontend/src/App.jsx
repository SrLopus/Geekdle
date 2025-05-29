import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { GameModeProvider } from './context/GameModeContext';
import { CategoryProvider } from './context/CategoryContext';
import Navegacion from './components/Navegacion';
import Juego from './pages/Juego';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import PageTransition from './components/PageTransition';
import AdminPanel from './pages/AdminPanel';
import Historial from './pages/Historial';
import Amigos from './pages/Amigos';

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                    <PageTransition>
                        <Juego />
                    </PageTransition>
                } />
                <Route path="/juego" element={
                    <PageTransition>
                        <Juego />
                    </PageTransition>
                } />
                <Route path="/login" element={
                    <PageTransition>
                        <Login />
                    </PageTransition>
                } />
                <Route path="/registro" element={
                    <PageTransition>
                        <Registro />
                    </PageTransition>
                } />
                <Route path="/perfil" element={
                    <PageTransition>
                        <Perfil />
                    </PageTransition>
                } />
                <Route path="/historial" element={
                    <PageTransition>
                        <Historial />
                    </PageTransition>
                } />
                <Route path="/admin" element={
                    <PageTransition>
                        <AdminPanel />
                    </PageTransition>
                } />
                <Route path="/amigos" element={
                    <PageTransition>
                        <Amigos />
                    </PageTransition>
                } />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <GameModeProvider>
                <CategoryProvider>
                    <Router>
                        <div className="min-h-screen bg-black">
                            <Navegacion />
                            <main className="relative" style={{ minHeight: 'calc(100vh - 4rem)' }}>
                                <AnimatedRoutes />
                            </main>
                        </div>
                    </Router>
                </CategoryProvider>
            </GameModeProvider>
        </AuthProvider>
    );
}
