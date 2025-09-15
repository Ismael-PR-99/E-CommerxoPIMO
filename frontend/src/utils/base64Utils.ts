/**
 * Utilidad para convertir imágenes a formato Base64
 * 
 * Este archivo contiene:
 * 1. Una función para convertir archivos de imagen a base64
 * 2. Instrucciones para usar esta utilidad
 */

/**
 * Convierte una imagen a formato base64
 * Para usar en el navegador, debes añadir esto a un archivo HTML
 * 
 * @param {File} file - Archivo de imagen a convertir
 * @returns {Promise<string>} String en formato data URL con base64
 */
export function convertToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Resultado de la lectura no es un string'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * INSTRUCCIONES DE USO
 * 
 * PASO 1: Crea un HTML temporal con este código:
 * 
 * ```html
 * <!DOCTYPE html>
 * <html>
 * <head>
 *   <title>Conversor de imágenes a Base64</title>
 *   <style>
 *     body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
 *     .result { margin-top: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
 *     textarea { width: 100%; height: 200px; margin-top: 10px; }
 *   </style>
 * </head>
 * <body>
 *   <h1>Conversor de Imágenes a Base64</h1>
 *   <div>
 *     <input type="file" id="imageInput" accept="image/*" multiple>
 *     <button id="convertBtn">Convertir</button>
 *   </div>
 *   <div id="results"></div>
 *   
 *   <script>
 *     document.getElementById('convertBtn').addEventListener('click', async () => {
 *       const fileInput = document.getElementById('imageInput');
 *       const resultsDiv = document.getElementById('results');
 *       resultsDiv.innerHTML = '';
 *       
 *       for (const file of fileInput.files) {
 *         try {
 *           // Convertir imagen a base64
 *           const base64 = await new Promise((resolve, reject) => {
 *             const reader = new FileReader();
 *             reader.readAsDataURL(file);
 *             reader.onload = () => resolve(reader.result);
 *             reader.onerror = error => reject(error);
 *           });
 *           
 *           // Crear el nombre de variable JavaScript
 *           const fileName = file.name.split('.')[0]
 *             .replace(/[^a-zA-Z0-9]/g, '_')
 *             .toLowerCase();
 *           
 *           // Mostrar resultado
 *           const resultDiv = document.createElement('div');
 *           resultDiv.className = 'result';
 *           
 *           resultDiv.innerHTML = `
 *             <h3>${file.name}</h3>
 *             <p>Tamaño: ${Math.round(base64.length / 1024)} KB</p>
 *             <textarea>${base64}</textarea>
 *             <p><strong>Para añadir a las constantes:</strong></p>
 *             <textarea>${fileName}: '${base64}',</textarea>
 *           `;
 *           
 *           resultsDiv.appendChild(resultDiv);
 *         } catch (error) {
 *           console.error(`Error al procesar ${file.name}:`, error);
 *         }
 *       }
 *     });
 *   </script>
 * </body>
 * </html>
 * ```
 * 
 * PASO 2: Abre el HTML en un navegador
 * PASO 3: Sube las imágenes y haz clic en "Convertir"
 * PASO 4: Copia los resultados y pégalos en el archivo de constantes
 * 
 * NOTA: Las imágenes codificadas en base64 aumentan su tamaño aproximadamente un 33%
 * Por lo que es recomendable usarlo solo para imágenes pequeñas o optimizadas
 */