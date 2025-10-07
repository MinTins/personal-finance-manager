import { useState, useEffect } from 'react'
import { 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp, 
  FiActivity,
  FiCreditCard,
  FiPieChart 
} from 'react-icons/fi'
import { getAdminDashboard } from '../../services/admin'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const data = await getAdminDashboard()
      setStats(data)
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити дані')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Всього користувачів',
      value: stats?.total_users || 0,
      icon: FiUsers,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Адміністраторів',
      value: stats?.total_admins || 0,
      icon: FiActivity,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Всього рахунків',
      value: stats?.total_accounts || 0,
      icon: FiCreditCard,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Всього транзакцій',
      value: stats?.total_transactions || 0,
      icon: FiDollarSign,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Категорій',
      value: stats?.total_custom_categories || 0,
      icon: FiPieChart,
      color: 'pink',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600'
    },
    {
      title: 'Загальний баланс',
      value: `${(stats?.total_balance || 0).toFixed(2)} UAH`,
      icon: FiTrendingUp,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Адміністративна панель
        </h1>
        <div className="text-sm text-gray-500">
          Нових користувачів сьогодні: <span className="font-semibold">{stats?.new_users_today || 0}</span>
        </div>
      </div>

      {/* Статистичні картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow p-6 flex items-center"
          >
            <div className={`${stat.bgColor} p-3 rounded-lg mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Топ користувачів */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Топ користувачів за активністю
          </h2>
        </div>
        <div className="p-6">
          {stats?.top_users && stats.top_users.length > 0 ? (
            <div className="space-y-3">
              {stats.top_users.map((user, index) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{user.username}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {user.transaction_count} транзакцій
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Немає даних про активних користувачів.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard