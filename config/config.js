/**
 * config.js
 * Configuración para el sistema Nyx-Security
 */

module.exports = {
  // Opciones de seguridad
  security: {
    // En un entorno real, esta clave debería estar en variables de entorno
    // Clave de 32 bytes (256 bits) para cifrado AES-256
    encryptionKey: '0123456789abcdef0123456789abcdef',
    
    // Opciones de hash
    hashAlgorithm: 'sha256',
    
    // Opciones para JWT (si se usa en el futuro)
    jwt: {
      secret: 'nyx-secret-key-change-in-production',
      expiresIn: '1h'
    }
  },
  
  // Opciones de sistema
  system: {
    logLevel: 'info', // debug, info, warn, error
    maxTokenLength: 2048,
    tokenTTL: 3600 // tiempo de vida del token en segundos
  },
  
  // Opciones de API (si se expone una API en el futuro)
  api: {
    port: 3000,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // límite de 100 solicitudes por windowMs
    }
  }
};
