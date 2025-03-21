/**
 * Nyx-Security - Sistema de Seguridad de Tokens
 * Archivo principal que inicia el sistema
 */

const tokenManager = require('./utils/tokenManager');
const config = require('./config/config');

// Función principal
async function main() {
  console.log('Iniciando Nyx-Security...');
  
  try {
    // Ejemplo: Crear un nuevo token
    const originalToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik55eCBTZWN1cml0eSIsImlhdCI6MTUxNjIzOTAyMn0";
    
    console.log('Token original:', originalToken);
    
    // Dividir el token en tres partes
    const tokenParts = tokenManager.splitToken(originalToken);
    console.log('Token dividido en tres partes:', tokenParts);
    
    // Guardar las partes del token
    await tokenManager.saveTokenParts(tokenParts);
    console.log('Partes del token guardadas correctamente');
    
    // Recuperar y reconstruir el token
    const recoveredParts = await tokenManager.getTokenParts();
    const reconstructedToken = tokenManager.reconstructToken(recoveredParts);
    
    console.log('Token reconstruido:', reconstructedToken);
    console.log('¿El token es válido?', originalToken === reconstructedToken);
    
  } catch (error) {
    console.error('Error en el sistema:', error.message);
  }
}

// Ejecutar la función principal
main().then(() => {
  console.log('Nyx-Security ha finalizado correctamente');
}).catch(err => {
  console.error('Error fatal en Nyx-Security:', err);
  process.exit(1);
});