import api from './api'

// Отримання списку рахунків
export const getAccounts = async (isActive = null) => {
  try {
    const params = isActive !== null ? { is_active: isActive } : {}
    const response = await api.get('/accounts', { params })
    return response.data.accounts
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch accounts'
  }
}

// Створення нового рахунку
export const createAccount = async (accountData) => {
  try {
    const response = await api.post('/accounts', accountData)
    return response.data.account
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create account'
  }
}

// Оновлення існуючого рахунку
export const updateAccount = async (id, accountData) => {
  try {
    const response = await api.put(`/accounts/${id}`, accountData)
    return response.data.account
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update account'
  }
}

// Видалення рахунку
export const deleteAccount = async (id) => {
  try {
    const response = await api.delete(`/accounts/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete account'
  }
}

// Отримання конкретного рахунку
export const getAccount = async (id) => {
  try {
    const response = await api.get(`/accounts/${id}`)
    return response.data.account
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch account'
  }
}