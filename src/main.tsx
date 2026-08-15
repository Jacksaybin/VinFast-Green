import { createRoot } from 'react-dom/client'
import './i18n'
import './shadcn.css'
import App from './App'

const root = createRoot(document.getElementById('app')!)
root.render(<App />)
