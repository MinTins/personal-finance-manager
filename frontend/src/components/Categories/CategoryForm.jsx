import { useState, useEffect } from 'react'
import { createCategory, updateCategory } from '../../services/categories'

const CategoryForm = ({ category = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Список популярних кольорів
  const popularColors = [
    '#EF4444', // red
    '#F59E0B', // orange
    '#10B981', // green
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange-500
    '#84CC16', // lime
    '#06B6D4', // cyan
    '#6B7280', // gray
  ]

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        type: category.type || 'expense',
        color: category.color || '#3B82F6'
      })
    }
  }, [category])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleColorSelect = (color) => {
    setFormData({ ...formData, color })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (category) {
        await updateCategory(category.id, formData)
      } else {
        await createCategory(formData)
      }
      onSubmit(formData)
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
          Назва категорії *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="form-input mt-1"
          placeholder="Наприклад: Продукти, Зарплата, Транспорт"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Тип категорії *
        </label>
        <select
          id="type"
          name="type"
          required
          className="form-input mt-1"
          value={formData.type}
          onChange={handleChange}
          disabled={category !== null}
        >
          <option value="income">Дохід</option>
          <option value="expense">Витрата</option>
        </select>
        {category && (
          <p className="text-sm text-gray-500 mt-1">
            Тип категорії не можна змінити при редагуванні
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Колір категорії
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {popularColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                formData.color === color 
                  ? 'border-gray-900 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="color" className="text-sm text-gray-600">
            Або виберіть власний:
          </label>
          <input
            id="color"
            name="color"
            type="color"
            className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            value={formData.color}
            onChange={handleChange}
          />
          <span className="text-sm font-mono text-gray-500">
            {formData.color}
          </span>
        </div>
      </div>

      {/* Попередній перегляд */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Попередній перегляд:</p>
        <div 
          className="border rounded-lg p-3 bg-white"
          style={{ borderLeft: `4px solid ${formData.color}` }}
        >
          <h3 className="font-semibold">{formData.name || 'Назва категорії'}</h3>
          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
            formData.type === 'income' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {formData.type === 'income' ? 'Дохід' : 'Витрата'}
          </span>
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
          ) : category ? 'Оновити' : 'Створити'}
        </button>
      </div>
    </form>
  )
}

export default CategoryForm