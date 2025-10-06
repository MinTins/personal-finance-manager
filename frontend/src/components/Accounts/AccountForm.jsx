import { useState, useEffect } from 'react'
import { createAccount, updateAccount } from '../../services/accounts'

const AccountForm = ({ account = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    balance: '0',
    currency: 'UAH',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currencies = [
    { code: 'UAH', name: 'Гривня', symbol: '₴' },
    { code: 'USD', name: 'Долар США', symbol: '$' },
    { code: 'EUR', name: 'Євро', symbol: '€' },
    { code: 'GBP', name: 'Фунт стерлінгів', symbol: '£' },
  ]

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        balance: account.balance?.toString() || '0',
        currency: account.currency || 'UAH',
        is_active: account.is_active !== undefined ? account.is_active : true
      })
    }
  }, [account])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        balance: parseFloat(formData.balance)
      }

      if (account) {
        await updateAccount(account.id, submitData)
      } else {
        await createAccount(submitData)
      }
      onSubmit(submitData)
    } catch (err) {
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Назва рахунку *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="form-input mt-1"
          placeholder="Наприклад: Готівка, Картка ПриватБанк"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
          Початковий баланс *
        </label>
        <input
          id="balance"
          name="balance"
          type="number"
          step="0.01"
          required
          className="form-input mt-1"
          placeholder="0.00"
          value={formData.balance}
          onChange={handleChange}
        />
        <p className="text-sm text-gray-500 mt-1">
          Введіть поточний баланс цього рахунку
        </p>
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Валюта *
        </label>
        <select
          id="currency"
          name="currency"
          required
          className="form-input mt-1"
          value={formData.currency}
          onChange={handleChange}
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.symbol} {curr.name} ({curr.code})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={formData.is_active}
          onChange={handleChange}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Активний рахунок
        </label>
      </div>
      <p className="text-sm text-gray-500 ml-6 -mt-2">
        Неактивні рахунки не відображаються при створенні транзакцій
      </p>

      {/* Попередній перегляд */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Попередній перегляд:</p>
        <div className="card bg-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold">{formData.name || 'Назва рахунку'}</h3>
              <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                formData.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.is_active ? 'Активний' : 'Неактивний'}
              </span>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-2xl font-bold text-primary-600">
              {parseFloat(formData.balance || 0).toFixed(2)} {
                currencies.find(c => c.code === formData.currency)?.symbol || formData.currency
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">Баланс</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Скасувати
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : account ? 'Оновити' : 'Створити'}
        </button>
      </div>
    </form>
  )
}

export default AccountForm