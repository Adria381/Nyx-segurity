/**
 * tokens.js
 * Interfaz para el manejo de tokens, utiliza el tokenManager internamente
 */

const tokenManager = require('./utils/tokenManager');
const security = require('./utils/security');

/**
 * Procesa un token, lo divide y almacena
 * @param {string} originalToken - Token original a procesar
 * @returns {Promise<Object>} - Información sobre el proceso
 */
async function processToken(originalToken) {
  try {
    // Validar el token antes de procesar
    if (!originalToken || typeof originalToken !== 'string') {
      throw new Error('Token inválido');
    }
    
    // Dividir el token
    const tokenParts = tokenManager.splitToken(originalToken);
    
    // Guardar las partes
    await tokenManager.saveTokenParts(tokenParts);
    
    return {
      success: true,
      message: 'Token procesado correctamente',
      partsCount: tokenParts.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al procesar el token: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Recupera y reconstruye un token almacenado
 * @returns {Promise<Object>} - Token reconstruido e información
 */
async function retrieveToken() {
  try {
    // Obtener las partes del token
    const tokenParts = await tokenManager.getTokenParts();
    
    // Reconstruir el token
    const reconstructedToken = tokenManager.reconstructToken(tokenParts);
    
    return {
      success: true,
      token: reconstructedToken,
      message: 'Token recuperado correctamente',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al recuperar el token: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Verifica si un token proporcionado coincide con el almacenado
 * @param {string} token - Token a verificar
 * @returns {Promise<Object>} - Resultado de la verificación
 */
async function verifyToken(token) {
  try {
    const { success, token: storedToken } = await retrieveToken();
    
    if (!success) {
      throw new Error('No se pudo recuperar el token almacenado');
    }
    
    const isValid = token === storedToken;
    
    return {
      success: true,
      isValid,
      message: isValid ? 'Token verificado correctamente' : 'El token no coincide',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al verificar el token: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Genera un nuevo token aleatorio
 * @param {number} length - Longitud del token
 * @returns {Promise<Object>} - Token generado e información
 */
async function generateToken(length = 64) {
  try {
    const newToken = security.generateRandomToken(length);
    
    // Procesar y almacenar el token
    await processToken(newToken);
    
    return {
      success: true,
      token: newToken,
      message: 'Token generado y almacenado correctamente',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al generar el token: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  processToken,
  retrieveToken,
  verifyToken,
  generateToken
};