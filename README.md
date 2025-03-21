# Nyx-Security

Sistema de seguridad para manejo, división y almacenamiento seguro de tokens.

## Descripción

Nyx-Security es un sistema diseñado para aumentar la seguridad de los tokens dividiéndolos en tres partes y almacenándolos de forma cifrada. Esto previene que, en caso de una brecha de seguridad, el token completo sea comprometido.

## Estructura del Proyecto

```
nyx-security/
├── index.js           # Archivo principal
├── tokens.js          # Manejador de tokens
├── utils/             # Utilidades
│   ├── tokenManager.js # Funciones para manejar tokens
│   └── security.js     # Funciones de seguridad
├── config/            # Configuración
│   └── config.js      # Configuración general
└── tokens.json        # Archivo para almacenar los tokens divididos
```

## Características

- División de tokens en tres partes
- Cifrado AES-256-CBC para cada parte del token
- Almacenamiento seguro en formato JSON
- Reconstrucción de tokens cuando sea necesario
- Verificación de tokens
- Generación de nuevos tokens aleatorios

## Instalación

1. Clona este repositorio:
   ```
   git clone https://github.com/tu-usuario/nyx-security.git
   cd nyx-security
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las opciones de seguridad en `config/config.js`

## Uso

### Ejemplo Básico

```javascript
const tokenSystem = require('./tokens');

// Procesar un token existente
async function example() {
  // Procesar y dividir un token
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik55eCBTZWN1cml0eSIsImlhdCI6MTUxNjIzOTAyMn0";
  
  const processResult = await tokenSystem.processToken(token);
  console.log(processResult);
  
  // Recuperar el token
  const retrieveResult = await tokenSystem.retrieveToken();
  console.log(retrieveResult);
  
  // Verificar un token
  const verifyResult = await tokenSystem.verifyToken(token);
  console.log(verifyResult);
  
  // Generar un nuevo token
  const generateResult = await tokenSystem.generateToken();
  console.log(generateResult);
}

example();
```

## Seguridad

En un entorno de producción, deberías:

1. Almacenar las claves de cifrado en variables de entorno, no en el código
2. Usar un almacenamiento más seguro que archivos JSON (como una base de datos cifrada)
3. Implementar autenticación y autorización para acceder a los tokens
4. Configurar auditorías y logs para todas las operaciones con tokens

# Guía de Integración de Nyx-Security

Esta guía te muestra cómo integrar el sistema Nyx-Security con diferentes servicios y frameworks populares para proteger tus tokens de forma segura.

## Índice
- [Integración con Discord.js](#integración-con-discordjs)
- [Integración con Express.js (API REST)](#integración-con-expressjs-api-rest)
- [Integración con Aplicaciones de Telegram](#integración-con-aplicaciones-de-telegram)
- [Integración con Firebase](#integración-con-firebase)
- [Integración con Servicios OAuth](#integración-con-servicios-oauth)
- [Mejores Prácticas](#mejores-prácticas)

## Integración con Discord.js

### Instalación

Primero, asegúrate de tener instalados tanto Discord.js como Nyx-Security:

```bash
npm install discord.js
# Nyx-Security ya debe estar en tu proyecto
```

### Configuración Básica

```javascript
// bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const tokenSystem = require('./nyx-security/tokens');

// Iniciar el cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Función para iniciar el bot
async function startBot() {
  try {
    // Recuperar el token desde Nyx-Security
    const { success, token, message } = await tokenSystem.retrieveToken();
    
    if (!success) {
      console.error(`Error al recuperar el token: ${message}`);
      process.exit(1);
    }
    
    // Iniciar sesión con el token reconstruido
    await client.login(token);
    console.log('Bot conectado correctamente!');
  } catch (error) {
    console.error('Error al iniciar el bot:', error);
    process.exit(1);
  }
}

// Configurar eventos del bot
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // Lógica de tu bot aquí
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

// Iniciar el bot
startBot();
```

### Almacenamiento Inicial del Token

Necesitas ejecutar un script único para almacenar tu token de Discord la primera vez:

```javascript
// store-discord-token.js
const tokenSystem = require('./nyx-security/tokens');

async function storeToken() {
  // Reemplaza esto con tu token real de Discord
  const discordToken = 'TU_TOKEN_DE_DISCORD_AQUÍ';
  
  const result = await tokenSystem.processToken(discordToken);
  
  if (result.success) {
    console.log('Token de Discord almacenado correctamente');
  } else {
    console.error(`Error al almacenar el token: ${result.message}`);
  }
}

storeToken();
```

Ejecuta este script una sola vez:
```bash
node store-discord-token.js
```

## Integración con Express.js (API REST)

### Instalación

```bash
npm install express jsonwebtoken
```

### Ejemplo de API con Tokens JWT Protegidos

```javascript
// app.js
const express = require('express');
const jwt = require('jsonwebtoken');
const tokenSystem = require('./nyx-security/tokens');
const app = express();

app.use(express.json());

// Middleware para verificar JWT
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });
  
  try {
    // Recuperar la clave secreta JWT
    const { success, token: jwtSecret } = await tokenSystem.retrieveToken();
    
    if (!success) {
      return res.status(500).json({ message: 'Error en el sistema de seguridad' });
    }
    
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token inválido' });
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Ruta para login y generación de token
app.post('/login', async (req, res) => {
  // Aquí iría tu lógica de autenticación
  const { username, password } = req.body;
  
  // Ejemplo: verificar credenciales (reemplaza esto con tu lógica real)
  if (username === 'admin' && password === 'password') {
    try {
      // Recuperar la clave secreta JWT
      const { success, token: jwtSecret } = await tokenSystem.retrieveToken();
      
      if (!success) {
        return res.status(500).json({ message: 'Error en el sistema de seguridad' });
      }
      
      // Crear token JWT
      const accessToken = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
      
      res.json({ accessToken });
    } catch (error) {
      res.status(500).json({ message: 'Error al generar token' });
    }
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

// Ruta protegida
app.get('/recurso-protegido', authenticateToken, (req, res) => {
  res.json({ message: 'Acceso concedido', user: req.user });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('API en ejecución en http://localhost:3000');
});
```

### Almacenar la Clave Secreta JWT

```javascript
// store-jwt-secret.js
const tokenSystem = require('./nyx-security/tokens');
const crypto = require('crypto');

async function storeJWTSecret() {
  // Generar una clave segura para JWT
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  
  const result = await tokenSystem.processToken(jwtSecret);
  
  if (result.success) {
    console.log('Clave JWT almacenada correctamente');
  } else {
    console.error(`Error al almacenar la clave JWT: ${result.message}`);
  }
}

storeJWTSecret();
```

## Integración con Aplicaciones de Telegram

### Instalación

```bash
npm install node-telegram-bot-api
```

### Ejemplo de Bot de Telegram

```javascript
// telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');
const tokenSystem = require('./nyx-security/tokens');

async function startBot() {
  try {
    // Recuperar el token desde Nyx-Security
    const { success, token, message } = await tokenSystem.retrieveToken();
    
    if (!success) {
      console.error(`Error al recuperar el token: ${message}`);
      process.exit(1);
    }
    
    // Crear una instancia del bot con el token recuperado
    const bot = new TelegramBot(token, { polling: true });
    
    // Configurar comandos
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, '¡Hola! Soy un bot protegido con Nyx-Security.');
    });
    
    bot.onText(/\/ayuda/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 'Comandos disponibles: /start, /ayuda');
    });
    
    console.log('Bot de Telegram iniciado correctamente');
  } catch (error) {
    console.error('Error al iniciar el bot de Telegram:', error);
  }
}

startBot();
```

### Almacenar el Token de Telegram

```javascript
// store-telegram-token.js
const tokenSystem = require('./nyx-security/tokens');

async function storeTelegramToken() {
  // Reemplaza con tu token real de BotFather
  const telegramToken = 'TU_TOKEN_DE_TELEGRAM_AQUÍ';
  
  const result = await tokenSystem.processToken(telegramToken);
  
  if (result.success) {
    console.log('Token de Telegram almacenado correctamente');
  } else {
    console.error(`Error al almacenar el token: ${result.message}`);
  }
}

storeTelegramToken();
```

## Integración con Firebase

### Instalación

```bash
npm install firebase-admin
```

### Ejemplo de Integración con Firebase

```javascript
// firebase-service.js
const admin = require('firebase-admin');
const tokenSystem = require('./nyx-security/tokens');

async function initializeFirebase() {
  try {
    // Recuperar la clave privada de Firebase desde Nyx-Security
    const { success, token: serviceAccountJson, message } = await tokenSystem.retrieveToken();
    
    if (!success) {
      console.error(`Error al recuperar las credenciales: ${message}`);
      return false;
    }
    
    // Parsear el JSON de la cuenta de servicio
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Inicializar Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://tu-proyecto.firebaseio.com"
    });
    
    console.log('Firebase inicializado correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
    return false;
  }
}

// Exportar funciones útiles para trabajar con Firebase
async function getFirebaseDB() {
  const initialized = await initializeFirebase();
  if (!initialized) return null;
  
  return admin.firestore();
}

async function getFirebaseAuth() {
  const initialized = await initializeFirebase();
  if (!initialized) return null;
  
  return admin.auth();
}

module.exports = {
  initializeFirebase,
  getFirebaseDB,
  getFirebaseAuth
};
```

### Almacenar las Credenciales de Firebase

```javascript
// store-firebase-credentials.js
const tokenSystem = require('./nyx-security/tokens');
const fs = require('fs').promises;

async function storeFirebaseCredentials() {
  try {
    // Leer el archivo de cuenta de servicio
    const serviceAccountJson = await fs.readFile(
      './firebase-credentials.json', 
      'utf8'
    );
    
    const result = await tokenSystem.processToken(serviceAccountJson);
    
    if (result.success) {
      console.log('Credenciales de Firebase almacenadas correctamente');
      // Eliminar el archivo original por seguridad
      await fs.unlink('./firebase-credentials.json');
      console.log('Archivo original eliminado por seguridad');
    } else {
      console.error(`Error al almacenar las credenciales: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

storeFirebaseCredentials();
```

## Integración con Servicios OAuth

### Ejemplo con GitHub OAuth

```javascript
// github-oauth.js
const express = require('express');
const axios = require('axios');
const tokenSystem = require('./nyx-security/tokens');

const app = express();

// Configuración
const PORT = 3000;
let GITHUB_CLIENT_ID;
let GITHUB_CLIENT_SECRET;

// Cargar credenciales al inicio
async function loadCredentials() {
  try {
    // Recuperar credenciales de GitHub
    const { success, token: credentials } = await tokenSystem.retrieveToken();
    
    if (!success) {
      console.error('Error al cargar credenciales');
      process.exit(1);
    }
    
    const parsed = JSON.parse(credentials);
    GITHUB_CLIENT_ID = parsed.clientId;
    GITHUB_CLIENT_SECRET = parsed.clientSecret;
    
    console.log('Credenciales de GitHub cargadas correctamente');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Ruta para iniciar OAuth
app.get('/auth/github', (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user`);
});

// Callback de GitHub
app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    // Intercambiar código por token de acceso
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: {
        Accept: 'application/json'
      }
    });
    
    const accessToken = response.data.access_token;
    
    // Obtener información del usuario
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
    
    // Responder con información del usuario
    res.json({
      login: userResponse.data.login,
      name: userResponse.data.name,
      avatar: userResponse.data.avatar_url,
      message: 'Autenticación exitosa'
    });
    
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ message: 'Error en autenticación' });
  }
});

// Iniciar servidor
async function startServer() {
  await loadCredentials();
  
  app.listen(PORT, () => {
    console.log(`Servidor OAuth en http://localhost:${PORT}`);
  });
}

startServer();
```

### Almacenar Credenciales de GitHub

```javascript
// store-github-credentials.js
const tokenSystem = require('./nyx-security/tokens');

async function storeGitHubCredentials() {
  // Reemplaza con tus credenciales reales
  const credentials = JSON.stringify({
    clientId: 'TU_CLIENT_ID_DE_GITHUB',
    clientSecret: 'TU_CLIENT_SECRET_DE_GITHUB'
  });
  
  const result = await tokenSystem.processToken(credentials);
  
  if (result.success) {
    console.log('Credenciales de GitHub almacenadas correctamente');
  } else {
    console.error(`Error al almacenar las credenciales: ${result.message}`);
  }
}

storeGitHubCredentials();
```

## Mejores Prácticas

### 1. Seguridad de los Tokens

- **Nunca almacenes tokens en el código**: Usa Nyx-Security para manejarlos.
- **Usa variables de entorno** para configuraciones sensibles adicionales.
- **Rota los tokens periódicamente** para reducir los riesgos.

### 2. Configuración del Sistema

- **Modifica las claves de cifrado** en `config/config.js` antes de usar en producción.
- **Personaliza los algoritmos de cifrado** según tus necesidades.
- **Configura acceso restringido** al archivo `tokens.json`.

### 3. Uso en Producción

- **Implementa un sistema de logs** para registrar accesos a los tokens.
- **Configura alertas** para detectar accesos no autorizados.
- **Considera usar una base de datos** en lugar de archivos JSON.
- **Implementa un mecanismo de recuperación** en caso de pérdida de tokens.

### 4. Escalabilidad

Para sistemas más grandes, considera:

- **Implementar almacenamiento distribuido** para las partes del token.
- **Utilizar bases de datos cifradas** para mayor seguridad.
- **Crear un servicio API** para gestionar tokens de forma centralizada.

### 5. Monitoreo

- **Implementa heartbeats** para verificar el estado del sistema.
- **Monitorea intentos fallidos** de reconstrucción de tokens.
- **Registra todas las operaciones** relacionadas con tokens.

---

Esta guía cubre los escenarios más comunes de integración. Si necesitas ayuda con un caso específico, consulta la documentación completa o abre un issue en el repositorio de Nyx-Security.

## Licencia

MIT