import { useState, useEffect } from 'react'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../services/budgets'
import { formatDate, formatCurrency, calculateBudgetProgress, getBudgetProgressColor } from '../../utils/helpers'
import BudgetForm from './BudgetForm'
import ErrorAlert from '../common/ErrorAlert'
import SuccessAlert from '../common/SuccessAlert'

const BudgetList = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [period, setPeriod] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Завантаження бюджетів
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true)
        setError('')
        const budgetsData = await getBudgets(period)
        setBudgets(budgetsData)
      } catch (err) {
        setError(err.message || err.toString())
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [period])

  // Додавання нового бюджету
  const handleAddBudget = async (formData) => {
    try {
      const newBudget = await createBudget(formData)
      setBudgets(prev => [newBudget, ...prev])
      setShowForm(false)
      setError('')
      setSuccessMessage('Бюджет успішно створено!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      throw new Error(err.message || err.toString())
    }
  }

  // Оновлення існуючого бюджету
  const handleUpdateBudget = async (formData) => {
    try {
      const updatedBudget = await updateBudget(editingBudget.id, formData)
      
      setBudgets(prev =>
        prev.map(budget => 
          budget.id === editingBudget.id ? updatedBudget : budget
        )
      )
      
      setEditingBudget(null)
      setShowForm(false)
      setError('')
      setSuccessMessage('Бюджет успішно оновлено!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      throw new Error(err.message || err.toString())
    }
  }

  // Видалення бюджету
  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей бюджет?')) {
      return
    }

    try {
      await deleteBudget(id)
      setBudgets(prev => prev.filter(budget => budget.id !== id))
      setError('')
      setSuccessMessage('Бюджет успішно видалено!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      setError(err.message || err.toString())
    }
  }

  // Відкриття форми для редагування
  const openEditForm = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
    setError('')
  }

  // Закриття форми
  const closeForm = () => {
    setShowForm(false)
    setEditingBudget(null)
    setError('')
  }

  // Функція для зміни фільтра періоду
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
  }

  // Відкриття форми для створення
  const openCreateForm = () => {
    setEditingBudget(null)
    setShowForm(true)
    setError('')
  }

  // Отримання кольору прогресу
  const getProgressColorClass = (progress) => {
    if (progress < 50) return 'bg-green-500'
    if (progress < 80) return 'bg-yellow-500'
    if (progress < 100) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading && budgets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Бюджети</h1>
        
        <button
          onClick={openCreateForm}
          className="btn btn-primary"
          disabled={showForm}
        >
          + Створити бюджет
        </button>
      </div>
      
      <ErrorAlert error={error} onClose={() => setError('')} />
      <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />
      
      {/* Форма для створення/редагування бюджету */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBudget ? 'Редагувати бюджет' : 'Новий бюджет'}
          </h2>
          <BudgetForm 
            budget={editingBudget}
            onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
            onCancel={closeForm}
          />
        </div>
      )}
      
      {/* Фільтр за періодом */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Фільтр за періодом</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePeriodChange('week')}
            className={`btn ${period === 'week' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Тиждень
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`btn ${period === 'month' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Місяць
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={`btn ${period === 'year' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Рік
          </button>
          <button
            onClick={() => handlePeriodChange('')}
            className={`btn ${period === '' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Усі
          </button>
        </div>
      </div>

      {/* Індикатор завантаження під час фільтрації */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            {period === '' 
              ? 'Бюджети не знайдено' 
              : 'Немає бюджетів для обраного періоду'
            }
          </p>
          <button
            onClick={openCreateForm}
            className="btn btn-primary"
          >
            Створити перший бюджет
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = calculateBudgetProgress(budget.spent || 0, budget.amount || 0)
            const progressColorClass = getProgressColorClass(progress)
            const isOverBudget = budget.remaining < 0
            
            return (
              <div key={budget.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {budget.category_name || 'Без категорії'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                    </p>
                  </div>
                  {isOverBudget && (
                    <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded">
                      Перевитрата
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Витрачено
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount || 0)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`${progressColorClass} h-3 rounded-full transition-all duration-300`} 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm font-medium ${
                      isOverBudget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isOverBudget ? 'Перевитрата' : 'Залишилося'}: {formatCurrency(Math.abs(budget.remaining || 0))}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-3 border-t">
                  <button
                    onClick={() => openEditForm(budget)}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    disabled={showForm}
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BudgetList
