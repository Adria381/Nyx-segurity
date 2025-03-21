/**
 * security.js
 * Proporciona funciones de seguridad para el sistema
 */

const crypto = require('crypto');
const config = require('../config/config');

// Clave de cifrado y vector de inicialización (en un entorno real, deberían estar en variables de entorno)
const ENCRYPTION_KEY = config.security.encryptionKey; // 32 bytes
const IV_LENGTH = 16; // Para AES, esto es siempre 16 bytes

/**
 * Cifra un texto usando AES-256-CBC
 * @param {string} text - Texto a cifrar
 * @returns {string} - Texto cifrado en formato hexadecimal con IV al inicio
 */
function encrypt(text) {
  // Crear un IV aleatorio
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Crear un cifrador
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  // Cifrar el texto
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Devolver IV + texto cifrado (IV es necesario para descifrar)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descifra un texto cifrado con AES-256-CBC
 * @param {string} encryptedText - Texto cifrado con IV al inicio
 * @returns {string} - Texto descifrado
 */
function decrypt(encryptedText) {
  // Separar IV y texto cifrado
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedData = textParts.join(':');
  
  // Crear descifrador
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  // Descifrar
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Genera un hash para una contraseña usando bcrypt
 * @param {string} password - Contraseña a hashear
 * @returns {string} - Hash resultante
 */
function hashPassword(password) {
  // En un sistema real usaríamos bcrypt, pero por simplicidad usamos SHA-256
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Genera un token aleatorio
 * @param {number} length - Longitud del token
 * @returns {string} - Token generado
 */
function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Verifica un hash de contraseña
 * @param {string} password - Contraseña a verificar
 * @param {string} hash - Hash almacenado
 * @returns {boolean} - Verdadero si coincide
 */
function verifyPassword(password, hash) {
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  return passwordHash === hash;
}

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateRandomToken
};
