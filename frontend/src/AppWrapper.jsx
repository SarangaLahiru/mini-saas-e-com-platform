import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { AppProvider } from './contexts/AppContext'
import { WishlistProvider } from './contexts/WishlistContext'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { ToastProvider } from './contexts/ToastContext'

// Components
import ErrorBoundary from './components/common/ErrorBoundary'
import AuthErrorBoundary from './components/auth/AuthErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
})

const AppWrapper = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppProvider>
            <AuthProvider>
              <AuthErrorBoundary>
                <CurrencyProvider>
                  <WishlistProvider>
                    <CartProvider>
                      <ToastProvider>
                        {children}
                        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                      </ToastProvider>
                    </CartProvider>
                  </WishlistProvider>
                </CurrencyProvider>
              </AuthErrorBoundary>
            </AuthProvider>
          </AppProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default AppWrapper
