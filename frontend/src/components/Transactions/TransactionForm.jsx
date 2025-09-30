import { useState, useEffect } from 'react'
import { getCategories } from '../../services/categories'

const TransactionForm = ({ transaction = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: ''
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Завантажуємо категорії та заповнюємо форму, якщо це редагування
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories(formData.type)
        setCategories(categoriesData)
      } catch (err) {
        setError('Не вдалося завантажити категорії')
      }
    }

    loadCategories()

    // Якщо передана транзакція, заповнюємо форму її даними
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        amount: transaction.amount || '',
        description: transaction.description || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        category_id: transaction.category_id || ''
      })
    }
  }, [transaction, formData.type])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Якщо змінився тип транзакції, потрібно оновити список категорій
    if (name === 'type') {
      setFormData({ 
        ...formData, 
        type: value, 
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Тип транзакції</label>
        <div className="mt-1 flex">
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-gray-700">Витрата</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-gray-700">Дохід</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Сума
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          required
          className="form-input mt-1"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Дата
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
          <option value="">Виберіть категорію</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Опис
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          className="form-input mt-1"
          placeholder="Опис транзакції..."
          value={formData.description}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2">
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
          ) : transaction ? 'Оновити' : 'Додати'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm