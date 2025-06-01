# Arquitectura del Sistema

## 🏗️ Estructura del Proyecto

### Frontend (React + Vite)

#### Componentes Principales

1. **Componentes de Juego**
   - `GameBoard`: Tablero principal del juego
     - Visualización de la cuadrícula de letras
     - Estados de letras (correcta, presente, ausente)
     - Animaciones con Framer Motion
     - Optimización de rendimiento con `useMemo` y `useCallback`
     - Sistema de grid responsive basado en wordLength
   
   - `VirtualKeyboard`: Teclado virtual
     - Entrada de texto con feedback táctil
     - Estados de letras con colores semánticos
     - Animaciones de pulsación
     - Soporte para teclado físico y virtual

   - `HintsModal`: Sistema de pistas
     - Pistas contextuales basadas en progreso
     - Sistema de pistas limitadas por día
     - Animaciones de transición con Framer Motion
     - Integración con sistema de puntos

   - `GameModeSelector`: Selector de modo de juego
     - Modos: daily, infinite
     - Configuración de categorías
     - Personalización de reglas
     - Persistencia de preferencias

   - `GameTitle`: Título del juego
     - Animaciones de texto
     - Efectos visuales
     - Versión responsive

2. **Componentes de Navegación**
   - `Navegacion`: Barra de navegación principal
     - Menú de usuario con animaciones
     - Estado de autenticación con JWT
     - Notificaciones en tiempo real
     - Sistema de rutas protegidas
   
   - `CategorySidebar`: Selector de categorías
     - Filtrado de palabras por categoría
     - Navegación por categorías
     - Estado de selección persistente
     - Caché de categorías

   - `PageTransition`: Transiciones entre páginas
     - Animaciones de transición
     - Efectos de carga
     - Estados de navegación

3. **Componentes Sociales**
   - `FriendsList`: Gestión de amigos
     - Lista de amigos con estado en tiempo real
     - Chat integrado con Socket.io
     - Sistema de notificaciones push
     - Gestión de estados de conexión
   
   - `FriendSearch`: Búsqueda de amigos
     - Búsqueda en tiempo real con debounce
     - Filtrado de resultados
     - Sugerencias de usuarios
     - Sistema de caché de resultados

   - `Ranking`: Sistema de clasificación
     - Tabla de puntuaciones con paginación
     - Estadísticas de jugadores
     - Filtros de clasificación
     - Actualización en tiempo real

4. **Componentes de UI/UX**
   - `Toast`: Sistema de notificaciones
     - Mensajes emergentes
     - Diferentes tipos (éxito, error, info)
     - Auto-cierre
   
   - `Popup`: Ventanas modales
     - Contenido dinámico
     - Acciones configurables
     - Temas personalizables

   - `LoadingScreen`: Pantallas de carga
     - Animaciones de carga
     - Mensajes de estado
     - Transiciones suaves

   - `AnimatedBackground`: Fondo animado
     - Efectos de partículas
     - Temas dinámicos
     - Animaciones suaves

   - `LevelUpAnimation`: Animación de nivel
     - Efectos de celebración
     - Mostrar nuevo nivel
     - Recompensas

   - `AuthPopup`: Ventana de autenticación
     - Login/Registro
     - Recuperación de contraseña
     - Integración con proveedores

#### Servicios

1. **Word Service** (Core del juego)
   ```javascript
   // Gestión de palabras y progreso
   checkPlayerProgress(mode = 'daily', category = null)
   getDailyWord(mode = 'daily', category = null, prompt = null)
   checkWord(word, mode = 'daily', category = null)
   updateProgress(mode, category, word, attempts, timeTaken, boardMapping, isCorrect)
   generateDailyWords()
   ```
   - **Funcionalidades**:
     - Validación de límites diarios por modo y categoría
     - Sistema de rotación de palabras con categorías
     - Caché de progreso del jugador
     - Generación de pistas contextuales
     - Cálculo de puntuación basado en intentos y tiempo
     - Sincronización con ranking y estadísticas

2. **History Service** (Progreso)
   ```javascript
   // Gestión del historial de partidas
   getGameHistory()
   getGameHistoryByMode(mode)
   clearCache()
   ```
   - **Características**:
     - Caché de 5 minutos para optimización
     - Paginación de resultados
     - Filtrado por modo de juego
     - Exportación de datos
     - Estadísticas por período
     - Gestión de tokens de autenticación

3. **Friend Service** (Sistema social)
   ```javascript
   // Gestión de amistades y social
   getFriends()
   searchUsers(query)
   sendFriendRequest(userId)
   acceptFriendRequest(requestId)
   removeFriend(friendId)
   getFriendsRanking()
   ```
   - **Funcionalidades**:
     - Búsqueda en tiempo real con debounce
     - Sistema de notificaciones push
     - Gestión de estados de conexión
     - Caché de lista de amigos
     - Ranking de amigos en tiempo real
     - Validación de límites de solicitudes

4. **Ranking Service** (Competitivo)
   ```javascript
   // Sistema de clasificación
   getGlobalRanking()
   getCategoryRanking(category)
   getUserStats(userId)
   getLeaderboard(period)
   ```
   - **Características**:
     - Paginación eficiente de resultados
     - Caché de rankings por período
     - Actualización en tiempo real
     - Estadísticas detalladas por usuario
     - Comparativas de rendimiento
     - Sistema de recompensas automáticas

5. **Admin Service** (Administración)
   ```javascript
   // Funciones administrativas
   getUserManagement()
   getSystemStats()
   manageCategories()
   moderateContent()
   ```
   - **Funcionalidades**:
     - Gestión avanzada de usuarios
     - Métricas del sistema en tiempo real
     - CRUD de categorías
     - Sistema de moderación automática
     - Logs de actividad
     - Alertas y notificaciones

6. **User Service** (Perfil)
   ```javascript
   // Gestión de usuario
   updateProfile()
   getUserPreferences()
   updateSettings()
   getUserStats()
   ```
   - **Características**:
     - Validación de datos de perfil
     - Persistencia de preferencias
     - Sincronización entre dispositivos
     - Gestión de configuración
     - Estadísticas detalladas
     - Sistema de logros

### Características Comunes de los Servicios

1. **Manejo de Errores**
   - Interceptores de errores globales
   - Mensajes de error personalizados
   - Reintentos automáticos
   - Logging de errores

2. **Caché y Optimización**
   - Caché local para datos frecuentes
   - Invalidación inteligente
   - Compresión de datos
   - Lazy loading

3. **Seguridad**
   - Validación de tokens JWT
   - Sanitización de datos
   - Rate limiting
   - Protección contra ataques

4. **Sincronización**
   - Actualización en tiempo real
   - Resolución de conflictos
   - Estado offline
   - Queue de operaciones

5. **API Integration**
   - Axios para peticiones HTTP
   - Interceptores personalizados
   - Transformación de datos
   - Manejo de headers

6. **Monitoreo**
   - Métricas de rendimiento
   - Logs de actividad
   - Alertas automáticas
   - Análisis de uso

#### Contextos

1. **AuthContext**
   - Estado de autenticación
   - Información de usuario
   - Métodos de login/logout
   - Gestión de tokens
   - Renovación automática
   - Protección de rutas

2. **GameModeContext**
   - Modo de juego actual
   - Configuración de dificultad
   - Reglas personalizadas
   - Persistencia de preferencias
   - Sincronización entre dispositivos
   - Restricciones por modo

3. **CategoryContext**
   - Categoría seleccionada
   - Filtrado de palabras
   - Estado de categoría
   - Caché de categorías
   - Estadísticas por categoría
   - Rotación de palabras

### Backend (Node.js + Express)

#### Endpoints Principales

1. **Word Endpoints**
   - `/word/check-progress`: Verifica progreso
     - Validación de límites
     - Caché de progreso
     - Sincronización
   - `/word`: Obtiene palabra
     - Selección aleatoria
     - Validación de categoría
     - Generación de pistas
   - `/word/check`: Valida palabra
     - Verificación de existencia
     - Generación de feedback
     - Actualización de estadísticas
   - `/word/generate-daily`: Genera palabras diarias
     - Programación de tareas
     - Distribución por categorías
     - Validación de dificultad

2. **Game Endpoints**
   - `/games/save-result`: Guarda resultado
     - Cálculo de puntuación
     - Actualización de ranking
     - Notificaciones
   - `/games/history`: Obtiene historial
     - Paginación
     - Filtrado
     - Caché
   - `/games/ranking`: Obtiene clasificación
     - Agregación de datos
     - Caché de resultados
     - Actualización en tiempo real

3. **Auth Endpoints**
   - `/auth/login`: Login
     - Validación de credenciales
     - Generación de tokens
     - Registro de sesión
   - `/auth/register`: Registro
     - Validación de datos
     - Creación de perfil
     - Bienvenida
   - `/auth/recover`: Recuperación
     - Validación de email
     - Tokens temporales
     - Notificaciones

#### Modelos

1. **User**
   - Información de usuario
   - Estadísticas
   - Preferencias
   - Seguridad
   - Actividad
   - Relaciones

2. **Game**
   - Estado del juego
   - Historial
   - Puntuaciones
   - Configuración
   - Progreso
   - Logros

3. **Word**
   - Diccionario
   - Categorías
   - Dificultad
   - Uso
   - Pistas
   - Estadísticas

4. **Friend**
   - Relaciones de amistad
   - Estado de conexión
   - Historial de interacciones

#### Middleware

1. **Auth**
   - Verificación de tokens
   - Roles de usuario
   - Permisos

2. **Validation**
   - Validación de datos
   - Sanitización
   - Formato

3. **Error Handling**
   - Manejo de errores
   - Logging
   - Respuestas

4. **Rate Limiting**
   - Límites de peticiones
   - Protección contra abusos
   - Monitoreo de uso

## 🎨 Sistema de Estilos

### Clases de Utilidad

1. **Layout**
   ```css
   .container
   .flex
   .grid
   .section
   ```

2. **Espaciado**
   ```css
   .p-{size}
   .m-{size}
   .gap-{size}
   ```