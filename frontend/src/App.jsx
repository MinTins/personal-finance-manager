import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser } from './services/auth'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard/Dashboard'
import TransactionList from './components/Transactions/TransactionList'
import BudgetList from './components/Budgets/BudgetList'
import CategoryList from './components/Categories/CategoryList'
import AccountList from './components/Accounts/AccountList'
import Navbar from './components/common/Navbar'
import Sidebar from './components/common/Sidebar'

// Імпорт компонентів адміністратора
import AdminDashboard from './components/Admin/AdminDashboard'
import UserManagement from './components/Admin/UserManagement'
import AdminLogs from './components/Admin/AdminLogs'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = await getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        <div className="flex flex-col h-screen">
          <Navbar user={user} onLogout={handleLogout} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar user={user} />
            <main className="flex-1 overflow-y-auto p-4">
              <Routes>
                {/* Маршрути для звичайних користувачів */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<AccountList />} />
                <Route path="/transactions" element={<TransactionList />} />
                <Route path="/categories" element={<CategoryList />} />
                <Route path="/budgets" element={<BudgetList />} />
                
                {/* Маршрути для адміністраторів */}
                {user.role === 'admin' && (
                  <>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/logs" element={<AdminLogs />} />
                  </>
                )}
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  )
}

export default App