import api from './api'

// Отримання списку категорій
export const getCategories = async (type = null) => {
  try {
    const params = type ? { type } : {}
    const response = await api.get('/categories', { params })
    return response.data.categories
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch categories'
  }
}

// Створення нової категорії
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData)
    return response.data.category
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create category'
  }
}

// Оновлення існуючої категорії
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data.category
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update category'
  }
}

// Видалення категорії
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete category'
  }
}