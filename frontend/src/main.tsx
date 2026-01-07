import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProdutoProvider } from './context/ProdutoContext'
import { SaidaProvider } from './context/SaidaContext'
import { LogsExclusaoProvider } from './context/LogsExclusaoContext'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProdutoProvider>
        <SaidaProvider>
          <LogsExclusaoProvider>
            <App />
          </LogsExclusaoProvider>
        </SaidaProvider>
      </ProdutoProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
