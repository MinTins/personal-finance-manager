import { useState, useEffect } from 'react'
import { getAccounts, deleteAccount } from '../../services/accounts'
import AccountForm from './AccountForm'

const AccountList = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const data = await getAccounts()
      setAccounts(data)
      setError('')
    } catch (err) {
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async () => {
    await loadAccounts()
    setShowForm(false)
  }

  const handleUpdateAccount = async () => {
    await loadAccounts()
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей рахунок? Всі пов\'язані транзакції також будуть видалені.')) {
      try {
        await deleteAccount(id)
        await loadAccounts()
      } catch (err) {
        setError(err.toString())
      }
    }
  }

  const handleEditClick = (account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)
  }

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'UAH': '₴',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    }
    return symbols[currency] || currency
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Рахунки</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          + Створити рахунок
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Форма створення/редагування */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {editingAccount ? 'Редагувати рахунок' : 'Новий рахунок'}
          </h2>
          <AccountForm 
            account={editingAccount}
            onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Загальний баланс */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <h2 className="text-lg font-semibold mb-2">Загальний баланс</h2>
        <p className="text-3xl font-bold">
          {getTotalBalance().toFixed(2)} ₴
        </p>
        <p className="text-sm opacity-90 mt-1">
          По всіх активних рахунках
        </p>
      </div>

      {/* Список рахунків */}
      {accounts.length === 0 ? (
        <div className="card p-6 text-center">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-500 mb-4">
            Рахунків не знайдено. Створіть свій перший рахунок!
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Створити рахунок
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className={`card hover:shadow-lg transition-shadow ${
                account.is_active ? '' : 'opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold">{account.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    account.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.is_active ? 'Активний' : 'Неактивний'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(account)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Редагувати"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Видалити"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-2xl font-bold text-primary-600">
                  {parseFloat(account.balance).toFixed(2)} {getCurrencySymbol(account.currency)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Баланс</p>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Створено: {new Date(account.created_at).toLocaleDateString('uk-UA')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccountList