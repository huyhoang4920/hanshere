const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
// Chromium supports SVG displacement in backdrop-filter; Safari does not
if (!isSafari) document.documentElement.classList.add('glass-distort')
// Safari flashes when background-color animates inside a backdrop-filter parent
if (isSafari) document.documentElement.classList.add('is-safari')

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
