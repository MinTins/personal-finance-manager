import { useState, useEffect } from 'react'
import { getCategories } from '../../services/categories'
import FieldError from '../common/FieldError'
import ErrorAlert from '../common/ErrorAlert'

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
  const [validationErrors, setValidationErrors] = useState({})

  // Завантаження категорій витрат та заповнення форми для редагування
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories('expense')
        setCategories(categoriesData)
      } catch (err) {
        setError('Не вдалося завантажити категорії')
      }
    }

    loadCategories()

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
    if (formData.start_date && !budget) {
      const startDate = new Date(formData.start_date)
      let endDate = new Date(startDate)

      switch (formData.period) {
        case 'week':
          endDate.setDate(startDate.getDate() + 6)
          break
        case 'month':
          endDate.setMonth(startDate.getMonth() + 1)
          endDate.setDate(endDate.getDate() - 1)
          break
        case 'year':
          endDate.setFullYear(startDate.getFullYear() + 1)
          endDate.setDate(endDate.getDate() - 1)
          break
      }

      setFormData(prev => ({
        ...prev,
        end_date: endDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.start_date, formData.period, budget])

  // Валідація форми
  const validateForm = () => {
    const errors = {}

    // Валідація категорії
    if (!formData.category_id) {
      errors.category_id = 'Виберіть категорію'
    }

    // Валідація суми (максимум 15 цифр, 2 десяткові знаки, максимум 9999999999999.99)
    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount)) {
      errors.amount = 'Введіть суму бюджету'
    } else if (amount <= 0) {
      errors.amount = 'Сума повинна бути більше нуля'
    } else if (amount > 9999999999999.99) {
      errors.amount = 'Сума не може перевищувати 9,999,999,999,999.99'
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      errors.amount = 'Неправильний формат суми (максимум 2 знаки після коми)'
    }

    // Валідація дат
    if (!formData.start_date) {
      errors.start_date = 'Виберіть початкову дату'
    }

    if (!formData.end_date) {
      errors.end_date = 'Виберіть кінцеву дату'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (endDate <= startDate) {
        errors.end_date = 'Кінцева дата повинна бути пізніше початкової'
      }

      // Перевірка що дати не занадто далеко в майбутньому (наприклад, не більше 10 років)
      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() + 10)
      
      if (endDate > maxDate) {
        errors.end_date = 'Кінцева дата не може бути більше ніж через 10 років'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Очищення помилки для конкретного поля
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Валідація перед відправкою
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Підготовка даних для відправки
      const submitData = {
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount).toFixed(2),
        start_date: formData.start_date,
        end_date: formData.end_date
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(err.message || err.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert error={error} onClose={() => setError('')} />

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Категорія витрат <span className="text-red-500">*</span>
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          className={`form-input mt-1 ${validationErrors.category_id ? 'border-red-500' : ''}`}
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
        <FieldError error={validationErrors.category_id} />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Сума бюджету <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max="9999999999999.99"
          required
          className={`form-input mt-1 ${validationErrors.amount ? 'border-red-500' : ''}`}
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
        />
        <FieldError error={validationErrors.amount} />
        <p className="mt-1 text-xs text-gray-500">
          Максимальна сума: 9,999,999,999,999.99
        </p>
      </div>

      <div>
        <label htmlFor="period" className="block text-sm font-medium text-gray-700">
          Період <span className="text-red-500">*</span>
        </label>
        <select
          id="period"
          name="period"
          required
          className="form-input mt-1"
          value={formData.period}
          onChange={handleChange}
          disabled={!!budget}
        >
          <option value="week">Тиждень</option>
          <option value="month">Місяць</option>
          <option value="year">Рік</option>
        </select>
        {budget && (
          <p className="mt-1 text-xs text-gray-500">
            Період не можна змінити при редагуванні
          </p>
        )}
      </div>

      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
          Початкова дата <span className="text-red-500">*</span>
        </label>
        <input
          id="start_date"
          name="start_date"
          type="date"
          required
          className={`form-input mt-1 ${validationErrors.start_date ? 'border-red-500' : ''}`}
          value={formData.start_date}
          onChange={handleChange}
        />
        <FieldError error={validationErrors.start_date} />
      </div>

      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
          Кінцева дата <span className="text-red-500">*</span>
        </label>
        <input
          id="end_date"
          name="end_date"
          type="date"
          required
          className={`form-input mt-1 ${validationErrors.end_date ? 'border-red-500' : ''}`}
          value={formData.end_date}
          onChange={handleChange}
          readOnly={!budget}
        />
        <FieldError error={validationErrors.end_date} />
        {!budget && (
          <p className="mt-1 text-sm text-gray-500">
            Кінцева дата встановлюється автоматично на основі обраного періоду
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Скасувати
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Збереження...
            </span>
          ) : budget ? 'Оновити' : 'Створити'}
        </button>
      </div>
    </form>
  )
}

export default BudgetForm
