import { useState, useEffect } from 'react'
import { getCategories } from '../../services/categories'

const BudgetForm = ({ budget = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'month',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Завантаження категорій витрат та заповнення форми для редагування
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Завантажуємо тільки категорії витрат, оскільки бюджет можна створити тільки для витрат
        const categoriesData = await getCategories('expense')
        setCategories(categoriesData)
      } catch (err) {
        setError('Не вдалося завантажити категорії')
      }
    }

    loadCategories()

    // Якщо передано бюджет, заповнюємо форму його даними
    if (budget) {
      setFormData({
        category_id: budget.category_id || '',
        amount: budget.amount || '',
        period: budget.period || 'month',
        start_date: budget.start_date || new Date().toISOString().split('T')[0],
        end_date: budget.end_date || ''
      })
    }
  }, [budget])

  // Автоматичне встановлення кінцевої дати на основі періоду та початкової дати
  useEffect(() => {
    if (formData.start_date) {
      const startDate = new Date(formData.start_date)
      let endDate = new Date(startDate)

      switch (formData.period) {
        case 'week':
          endDate.setDate(startDate.getDate() + 6) // Тиждень - 7 днів
          break
        case 'month':
          endDate.setMonth(startDate.getMonth() + 1)
          endDate.setDate(endDate.getDate() - 1) // Останній день місяця
          break
        case 'year':
          endDate.setFullYear(startDate.getFullYear() + 1)
          endDate.setDate(endDate.getDate() - 1) // Останній день року
          break
      }

      setFormData({
        ...formData,
        end_date: endDate.toISOString().split('T')[0]
      })
    }
  }, [formData.start_date, formData.period])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Категорія витрат
        </label>
        <select
          id="category_id"
          name="category_id"
          required
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
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Сума бюджету
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
        <label htmlFor="period" className="block text-sm font-medium text-gray-700">
          Період
        </label>
        <select
          id="period"
          name="period"
          required
          className="form-input mt-1"
          value={formData.period}
          onChange={handleChange}
        >
          <option value="week">Тиждень</option>
          <option value="month">Місяць</option>
          <option value="year">Рік</option>
        </select>
      </div>

      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
          Початкова дата
        </label>
        <input
          id="start_date"
          name="start_date"
          type="date"
          required
          className="form-input mt-1"
          value={formData.start_date}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
          Кінцева дата
        </label>
        <input
          id="end_date"
          name="end_date"
          type="date"
          required
          className="form-input mt-1"
          value={formData.end_date}
          readOnly
        />
        <p className="mt-1 text-sm text-gray-500">
          Кінцева дата встановлюється автоматично на основі обраного періоду та початкової дати.
        </p>
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
          ) : budget ? 'Оновити' : 'Створити'}
        </button>
      </div>
    </form>
  )
}

export default BudgetForm