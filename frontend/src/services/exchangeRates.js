import api from './api'

// Отримання курсів валют
export const getExchangeRates = async (baseCurrency = 'UAH', targetCurrencies = 'USD,EUR,GBP') => {
  try {
    const params = { base: baseCurrency, target: targetCurrencies }
    const response = await api.get('/exchange-rates', { params })
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch exchange rates'
  }
}

// Конвертація валют
export const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  try {
    const params = { from: fromCurrency, to: toCurrency, amount }
    const response = await api.get('/exchange-rates/convert', { params })
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to convert currency'
  }
}