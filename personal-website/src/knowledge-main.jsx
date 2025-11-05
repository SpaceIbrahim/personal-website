import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KnowledgeMap from './components/KnowledgeMap/KnowledgeMap'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KnowledgeMap />
  </StrictMode>,
)
