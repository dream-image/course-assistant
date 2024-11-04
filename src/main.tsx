import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NextUIProvider, Spinner } from '@nextui-org/react'
import 'animate.css';
createRoot(document.getElementById('root')!).render(
  <NextUIProvider>
    <App />

  </NextUIProvider>

)
