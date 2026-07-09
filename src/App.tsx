import { AuthProvider } from './providers/AuthProvider'
import { AppRoutes } from './routes'
import { WhatsAppMessageProvider } from './features/whatsapp/providers/WhatsAppMessageProvider'

function App() {
  return (
    <AuthProvider>
      <WhatsAppMessageProvider>
        <AppRoutes />
      </WhatsAppMessageProvider>
    </AuthProvider>
  )
}

export default App
