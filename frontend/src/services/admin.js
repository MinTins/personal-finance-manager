import api from './api'

// Dashboard
export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard')
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to load dashboard'
  }
}

// Users Management
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params })
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to load users'
  }
}

export const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to load user details'
  }
}

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData)
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update user'
  }
}

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete user'
  }
}

// Admin Logs
export const getAdminLogs = async (params = {}) => {
  try {
    const response = await api.get('/admin/logs', { params })
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to load logs'
  }
}

// System Info
export const getSystemInfo = async () => {
  try {
    const response = await api.get('/admin/system-info')
    return response.data
  } catch (error) {
    throw error.response?.data?.error || 'Failed to load system info'
  }
}