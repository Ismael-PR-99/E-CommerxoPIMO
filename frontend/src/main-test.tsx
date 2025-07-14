import React from 'react'
import ReactDOM from 'react-dom/client'

const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ ¡React está funcionando!</h1>
      <p>Si puedes ver esto, significa que:</p>
      <ul>
        <li>✅ Vite está sirviendo correctamente</li>
        <li>✅ React se está cargando</li>
        <li>✅ El bundle se está generando correctamente</li>
      </ul>
      <p>Ahora podemos cargar la aplicación completa.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TestApp />)
