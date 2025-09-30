import api from './api'

// Отримання списку бюджетів
export const getBudgets = async (period = null) => {
  try {
    const params = period ? { period } : {}
    const response = await api.get('/budgets', { params })
    return response.data.budgets
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch budgets'
  }
}

// Створення нового бюджету
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/budgets', budgetData)
    return response.data.budget
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create budget'
  }
}

// Оновлення існуючого бюджету
export const updateBudget = async (id, budgetData) => {
  try {
    const response = await api.put(`/budgets/${id}`, budgetData)
    return response.data.budget
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update budget'
  }
}

// Видалення бюджету
export const deleteBudget = async (id) => {
  try {
    const response = await api.delete(`/budgets/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete budget'
  }
}