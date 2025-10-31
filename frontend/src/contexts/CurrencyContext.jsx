import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CurrencyContext = createContext()

// Minimal currency mapping
const COUNTRY_TO_CURRENCY = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  IN: 'INR',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
}

export const CurrencyProvider = ({ children }) => {
  const [country, setCountry] = useState('US')
  const [currency, setCurrency] = useState('USD')

  // Auto-detect on mount
  useEffect(() => {
    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US'
      const region = locale.split('-')[1]?.toUpperCase() || 'US'
      const detectedCurrency = COUNTRY_TO_CURRENCY[region] || 'USD'
      setCountry(region)
      setCurrency(detectedCurrency)
    } catch {
      setCountry('US')
      setCurrency('USD')
    }
  }, [])

  const formatPrice = useMemo(() => {
    return (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
  }, [currency])

  const value = {
    country,
    currency,
    setCountry: (c) => {
      setCountry(c)
      const cur = COUNTRY_TO_CURRENCY[c] || currency
      setCurrency(cur)
    },
    setCurrency,
    formatPrice,
    countryOptions: Object.keys(COUNTRY_TO_CURRENCY).map(code => ({ code, currency: COUNTRY_TO_CURRENCY[code] })),
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
