'use client'
import { Toaster } from 'react-hot-toast'

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { background: '#071a3d', color: '#fff', borderRadius: '12px', fontWeight: 600 },
        success: { iconTheme: { primary: '#c59a42', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  )
}
