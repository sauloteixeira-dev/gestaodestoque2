import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProdutoProvider } from './context/ProdutoContext'
import { SaidaProvider } from './context/SaidaContext'
import { LogsExclusaoProvider } from './context/LogsExclusaoContext'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProdutoProvider>
          <SaidaProvider>
            <LogsExclusaoProvider>
              <App />
            </LogsExclusaoProvider>
          </SaidaProvider>
        </ProdutoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
