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

  return