/**
 * tokenManager.js
 * Maneja la división, almacenamiento y reconstrucción de tokens
 */

const fs = require('fs').promises;
const path = require('path');
const securityUtils = require('./security');

// Ruta al archivo de tokens
const TOKENS_FILE = path.join(__dirname, '..', 'tokens.json');

/**
 * Divide un token en tres partes
 * @param {string} token - Token original a dividir
 * @returns {Array} - Array con las tres partes del token
 */
function splitToken(token) {
  const tokenLength = token.length;
  
  // Calcular puntos de división para tener tres partes relativamente iguales
  const firstBreakpoint = Math.floor(tokenLength / 3);
  const secondBreakpoint = Math.floor(tokenLength * 2 / 3);
  
  // Dividir el token en tres partes
  const part1 = token.substring(0, firstBreakpoint);
  const part2 = token.substring(firstBreakpoint, secondBreakpoint);
  const part3 = token.substring(secondBreakpoint);
  
  return [part1, part2, part3];
}

/**
 * Guarda las partes del token en un archivo JSON
 * @param {Array} tokenParts - Array con las partes del token
 * @returns {Promise<void>}
 */
async function saveTokenParts(tokenParts) {
  try {
    // Cifrar cada parte del token para mayor seguridad
    const encryptedParts = tokenParts.map(part => securityUtils.encrypt(part));
    
    // Crear objeto para almacenar
    const tokenData = {
      parts: encryptedParts,
      createdAt: new Date().toISOString(),
      metadata: {
        version: '1.0',
        service: 'nyx-security'
      }
    };
    
    // Guardar en el archivo
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokenData, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Error al guardar las partes del token: ${error.message}`);
  }
}

/**
 * Recupera las partes del token desde el archivo
 * @returns {Promise<Array>} - Array con las partes del token descifradas
 */
async function getTokenParts() {
  try {
    // Leer el archivo
    const data = await fs.readFile(TOKENS_FILE, 'utf8');
    const tokenData = JSON.parse(data);
    
    // Descifrar cada parte
    const decryptedParts = tokenData.parts.map(part => securityUtils.decrypt(part));
    
    return decryptedParts;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('El archivo de tokens no existe');
    }
    throw new Error(`Error al recuperar las partes del token: ${error.message}`);
  }
}

/**
 * Reconstruye el token original a partir de sus partes
 * @param {Array} tokenParts - Array con las partes del token
 * @returns {string} - Token reconstruido
 */
function reconstructToken(tokenParts) {
  return tokenParts.join('');
}

module.exports = {
  splitToken,
  saveTokenParts,
  getTokenParts,
  reconstructToken
};
