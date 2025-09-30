import api from './api'

// Отримання списку транзакцій
export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get('/transactions', { params: filters })
    return response.data.transactions
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch transactions'
  }
}

// Створення нової транзакції
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData)
    return response.data.transaction
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create transaction'
  }
}

// Оновлення існуючої транзакції
export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData)
    return response.data.transaction
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update transaction'
  }
}

// Видалення транзакції
export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete transaction'
  }
}

// Отримання сумарної статистики по транзакціях
export const getTransactionsSummary = async (filters = {}) => {
  try {
    const response = await api.get('/transactions/summary', { params: filters })
    return response.data.summary
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch summary'
  }
}