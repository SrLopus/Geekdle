# 🎮 Geekdle

Geekdle es un juego de palabras inspirado en Wordle, pero con un enfoque en la cultura geek. Adivina palabras relacionadas con tecnología, programación, videojuegos, anime, manga, cómics, películas, series, hardware e internet.

## 🌟 Características

- 🎯 **Múltiples Categorías**: Tecnología, Programación, Videojuegos, Anime, Manga, Cómics, Películas, Series, Hardware e Internet
- 🎮 **Dos Modos de Juego**:
  - Modo Diario: Una nueva palabra cada día a las 12:00 PM
  - Modo Infinito: Juega sin límites
- 🏆 **Sistema de Puntuación**: Gana puntos y sube de nivel
- 🎨 **Personalización**: Personaliza tu avatar con diferentes colores
- 📊 **Estadísticas**: Seguimiento de partidas, victorias y rachas
- 🌈 **Interfaz Moderna**: Diseño atractivo con animaciones fluidas
- 📱 **Responsive**: Juega en cualquier dispositivo

## 🚀 Tecnologías

### Frontend
- React
- Tailwind CSS
- Framer Motion
- Axios
- React Router
- Context API

### Backend
- Laravel
- MySQL
- JWT Authentication

## 📋 Requisitos

- Node.js >= 14.x
- PHP >= 8.0
- Composer
- MySQL >= 5.7

## 🎮 Cómo Jugar

1. **Modo Diario**:
   - Una nueva palabra cada día a las 12:00 PM
   - 6 intentos para adivinar la palabra
   - Pistas disponibles después de cada intento
   - Puntuación basada en la velocidad y número de intentos

2. **Modo Infinito**:
   - Juega sin límites
   - Nueva palabra después de cada partida
   - Acumula puntos y mejora tu nivel
   - Compite por la mejor racha

## 🎨 Personalización

- Cambia el color de tu avatar
- Desbloquea nuevos colores al subir de nivel
- Personaliza tu perfil con estadísticas

## 📊 Sistema de Puntuación

- **Modo Diario**:
  - 50 puntos por victoria
  - Bonus por velocidad
  - Bonus por intentos restantes

- **Modo Infinito**:
  - 10 puntos por victoria
  - Multiplicador por racha
  - Bonus por velocidad

## 🔒 Seguridad

- Autenticación JWT
- Protección de rutas
- Validación de datos
- Sanitización de entradas

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autores

- Raúl Jiménez - [@SrLopus](https://github.com/SrLopus)

## 🙏 Agradecimientos

- Inspirado en [Wordle](https://www.powerlanguage.co.uk/wordle/)
- Iconos por [Heroicons](https://heroicons.com/)
- Fuentes por [Google Fonts](https://fonts.google.com/)

## 📞 Soporte

Si tienes alguna pregunta o sugerencia, por favor abre un issue en el repositorio.

## 📚 Documentación de Métodos

### Frontend

#### Componentes Principales

##### Juego.jsx
- `handleKeyPress`: Maneja la entrada de teclas del usuario
  - Procesa teclas especiales (ENTER, BACKSPACE)
  - Valida la longitud de la palabra
  - Actualiza el estado del juego

- `submitGuess`: Procesa un intento de adivinanza
  - Valida la palabra
  - Actualiza el estado del tablero
  - Maneja la lógica de victoria/derrota

- `calculateLetterStates`: Calcula el estado de cada letra
  - Determina si la letra es correcta, presente o ausente
  - Actualiza el estado del teclado virtual

- `handleGameOver`: Maneja el final del juego
  - Actualiza estadísticas
  - Procesa la puntuación
  - Maneja la lógica de nivel up

##### GameBoard.jsx
- `getLetterState`: Determina el estado visual de cada letra
  - Maneja animaciones de revelación
  - Aplica estilos según el estado

##### VirtualKeyboard.jsx
- `getKeyState`: Determina el estado de cada tecla
  - Actualiza colores según uso
  - Maneja estados de hover y active

##### GameTitle.jsx
- `updateTimer`: Actualiza el contador de tiempo
  - Calcula tiempo restante
  - Maneja la actualización de la palabra diaria

### Backend

#### WordController.php
- `getDailyWord`: Obtiene la palabra del día
  - Verifica si existe una palabra para la fecha
  - Genera nueva palabra si es necesario
  - Maneja caché de palabras

- `generateDailyWord`: Genera una nueva palabra
  - Selecciona palabra aleatoria de la categoría
  - Genera pistas
  - Guarda en base de datos

#### UserController.php
- `updateAvatarColor`: Actualiza el color del avatar
  - Valida el color
  - Actualiza en base de datos
  - Devuelve usuario actualizado

#### GameController.php
- `updateProgress`: Actualiza el progreso del juego
  - Calcula puntos
  - Actualiza estadísticas
  - Maneja nivel up

### Servicios

#### wordService.js
- `getDailyWord`: Obtiene palabra del día
  - Maneja llamadas a API
  - Procesa respuesta
  - Maneja errores

- `updateProgress`: Actualiza progreso
  - Envía datos al backend
  - Procesa respuesta
  - Actualiza estado local

#### userService.js
- `updateAvatarColor`: Actualiza color de avatar
  - Maneja llamada a API
  - Procesa respuesta
  - Actualiza estado de usuario

### Contextos

#### AuthContext
- `login`: Maneja inicio de sesión
  - Valida credenciales
  - Almacena token
  - Actualiza estado de usuario

- `logout`: Maneja cierre de sesión
  - Limpia token
  - Resetea estado
  - Redirige a login

#### GameModeContext
- `setGameMode`: Cambia modo de juego
  - Actualiza estado
  - Resetea juego
  - Maneja transiciones

#### CategoryContext
- `setCategory`: Cambia categoría
  - Actualiza estado
  - Carga nueva palabra
  - Maneja estilos
