# 🎮 Geekdle

<div align="center">
  <img src="frontend/public/logo.png" alt="Geekdle Logo" width="200"/>
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
  [![Laravel](https://img.shields.io/badge/Laravel-10.x-red)](https://laravel.com/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC)](https://tailwindcss.com/)
</div>

## 📚 Índice
- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Desarrollo](#-desarrollo)
- [Contribución](#-contribución)

## 🎯 Descripción

Geekdle es un juego de palabras inspirado en Wordle pero con temática geek. Los jugadores deben adivinar palabras relacionadas con tecnología, videojuegos, series, películas y cultura geek en general.

### 🎮 Demo
[Jugar Geekdle](https://geekdle.com)

## ✨ Características

### Sistema de Juego
- 🎯 10 categorías temáticas:
  - Tecnología
  - Programación
  - Videojuegos
  - Anime
  - Manga
  - Cómics
  - Películas
  - Series
  - Hardware
  - Internet
- 🎮 Modos de juego:
  - Modo Diario (nueva palabra cada día)
  - Modo Infinito (sin límites)
- 💡 Sistema de pistas progresivas
- ⌨️ Teclado virtual con retroalimentación visual
- ✨ Animaciones fluidas y efectos visuales
- 📱 Diseño responsive optimizado para móviles

### Características Sociales
- 👥 Sistema de amigos y desafíos
- 🏆 Ranking global y entre amigos
- 👤 Perfiles personalizables con avatares y colores
- 📊 Historial de partidas
- 🔗 Compartir resultados

### Sistema de Progresión
- 📈 Sistema de niveles
- 🎯 Puntos acumulados
- 🏅 Logros y medallas
- 📊 Estadísticas detalladas
- 📈 Gráficos de progreso

## 🛠️ Tecnologías

### Frontend
- React 18.2.0
- TailwindCSS 3.x
- Framer Motion
- Axios
- React Router

### Backend
- Laravel 10.x
- MySQL
- Redis (caché)
- JWT Authentication

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/SrLopus/Geekdle.git
cd Geekdle
```

2. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

3. Instalar dependencias del backend:
```bash
cd ../backend
composer install
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
```

5. Generar clave de aplicación:
```bash
php artisan key:generate
```

6. Ejecutar migraciones:
```bash
php artisan migrate
```

7. Iniciar servidores:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd ../backend
php artisan serve
```

## 💻 Desarrollo

### Estructura del Proyecto
```
Geekdle/
├── frontend/          # Aplicación React
└── backend/           # API Laravel
```

### Scripts Disponibles
```bash
# Frontend
npm run dev          # Desarrollo
npm run build        # Producción
npm run test         # Tests

# Backend
php artisan serve    # Servidor de desarrollo
php artisan test     # Tests
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.
