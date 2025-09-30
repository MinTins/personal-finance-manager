import api from './api'

// Реєстрація нового користувача
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData)
    const { access_token, user } = response.data
    
    // Зберегти токен у localStorage
    localStorage.setItem('token', access_token)
    
    return user
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed'
  }
}

// Авторизація користувача
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)
    const { access_token, user } = response.data
    
    // Зберегти токен у localStorage
    localStorage.setItem('token', access_token)
    
    return user
  } catch (error) {
    throw error.response?.data?.error || 'Authentication failed'
  }
}

// Отримання інформації про поточного користувача
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me')
    return response.data.user
  } catch (error) {
    throw error.response?.data?.error || 'Failed to get user info'
  }
}