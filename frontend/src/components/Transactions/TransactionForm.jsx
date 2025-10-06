import { useState, useEffect } from 'react'
import { getCategories } from '../../services/categories'
import { getAccounts } from '../../services/accounts'

const TransactionForm = ({ transaction = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    transaction_type: 'expense',
    account_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: ''
  })
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Завантажуємо категорії та рахунки
  useEffect(() => {
    const loadData = async () => {
      try {
        // Завантажуємо рахунки
        const accountsData = await getAccounts()
        setAccounts(accountsData)
        
        // Завантажуємо категорії відповідного типу
        const categoriesData = await getCategories(formData.transaction_type)
        setCategories(categoriesData)
        
        // Якщо передана транзакція, заповнюємо форму
        if (transaction) {
          setFormData({
            transaction_type: transaction.transaction_type || 'expense',
            account_id: transaction.account_id || '',
            amount: transaction.amount || '',
            description: transaction.description || '',
            date: transaction.date ? transaction.date.split(' ')[0] : new Date().toISOString().split('T')[0],
            category_id: transaction.category_id || ''
          })
        } else if (accountsData.length > 0 && !formData.account_id) {
          // Автоматично вибираємо перший рахунок, якщо він є
          setFormData(prev => ({ ...prev, account_id: accountsData[0].id.toString() }))
        }
      } catch (err) {
        setError('Не вдалося завантажити дані: ' + err.toString())
      }
    }

    loadData()
  }, [transaction, formData.transaction_type])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Якщо змінився тип транзакції, оновлюємо категорії
    if (name === 'transaction_type') {
      setFormData({ 
        ...formData, 
        transaction_type: value, 
        category_id: '' // Скидаємо вибрану категорію
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit(formData)
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

      {/* Тип транзакції */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип транзакції *
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="transaction_type"
              value="expense"
              checked={formData.transaction_type === 'expense'}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-red-600"
            />
            <span className="ml-2 text-gray-700">Витрата</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="transaction_type"
              value="income"
              checked={formData.transaction_type === 'income'}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-green-600"
            />
            <span className="ml-2 text-gray-700">Дохід</span>
          </label>
        </div>
      </div>

      {/* Рахунок */}
      <div>
        <label htmlFor="account_id" className="block text-sm font-medium text-gray-700">
          Рахунок *
        </label>
        <select
          id="account_id"
          name="account_id"
          required
          className="form-input mt-1"
          value={formData.account_id}
          onChange={handleChange}
        >
          <option value="">Виберіть рахунок</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.balance} {account.currency})
            </option>
          ))}
        </select>
        {accounts.length === 0 && (
          <p className="text-sm text-red-600 mt-1">
            ⚠️ У вас немає рахунків. Спочатку створіть рахунок.
          </p>
        )}
      </div>

      {/* Сума */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Сума *
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="form-input mt-1"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
        />
      </div>

      {/* Дата */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Дата *
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          className="form-input mt-1"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      {/* Категорія */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Категорія
        </label>
        <select
          id="category_id"
          name="category_id"
          className="form-input mt-1"
          value={formData.category_id}
          onChange={handleChange}
        >
          <option value="">Виберіть категорію (опціонально)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Опис */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Опис
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          className="form-input mt-1"
          placeholder="Додатковий опис транзакції..."
          value={formData.description}
          onChange={handleChange}
        ></textarea>
      </div>

      {/* Кнопки */}
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
          disabled={loading || accounts.length === 0}
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : transaction ? 'Оновити' : 'Додати'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm