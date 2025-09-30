import { useState, useEffect } from 'react'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../services/budgets'
import { formatDate, formatCurrency, calculateBudgetProgress, getBudgetProgressColor } from '../../utils/helpers'
import BudgetForm from './BudgetForm'

const BudgetList = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [period, setPeriod] = useState('month') // Фільтр за періодом

  // Завантаження бюджетів
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true)
        const budgetsData = await getBudgets(period)
        setBudgets(budgetsData)
      } catch (err) {
        setError(err.toString())
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
      setBudgets([...budgets, newBudget])
      setShowForm(false)
    } catch (err) {
      throw err
    }
  }

  // Оновлення існуючого бюджету
  const handleUpdateBudget = async (formData) => {
    try {
      const updatedBudget = await updateBudget(editingBudget.id, formData)
      
      setBudgets(
        budgets.map(budget => 
          budget.id === editingBudget.id ? updatedBudget : budget
        )
      )
      
      setEditingBudget(null)
      setShowForm(false)
    } catch (err) {
      throw err
    }
  }

  // Видалення бюджету
  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей бюджет?')) {
      return
    }

    try {
      await deleteBudget(id)
      setBudgets(budgets.filter(budget => budget.id !== id))
    } catch (err) {
      setError(err.toString())
    }
  }

  // Відкриття форми для редагування
  const openEditForm = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  // Закриття форми
  const closeForm = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  // Отримання тексту для відображення періоду
  const getPeriodText = (period) => {
    switch (period) {
      case 'week': return 'Тиждень'
      case 'month': return 'Місяць'
      case 'year': return 'Рік'
      default: return period
    }
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
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          Створити бюджет
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}
      
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
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Фільтр за періодом</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setPeriod('week')}
            className={`btn ${period === 'week' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Тиждень
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`btn ${period === 'month' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Місяць
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`btn ${period === 'year' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Рік
          </button>
          <button
            onClick={() => setPeriod('')}
            className={`btn ${period === '' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Усі
          </button>
        </div>
      </div>

      {/* Список бюджетів */}
      {budgets.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">Бюджети не знайдено. Створіть новий бюджет, натиснувши кнопку вгорі.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = calculateBudgetProgress(budget.spent, budget.amount)
            const progressColor = getBudgetProgressColor(progress)
            
            return (
              <div key={budget.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{budget.category_name}</h3>
                    <p className="text-sm text-gray-500">
                      {getPeriodText(budget.period)}: {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                    </p>
                  </div>
                  <div 
                    className="h-6 w-6 rounded-full" 
                    style={{ backgroundColor: budget.category_color || '#808080' }}
                  ></div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(budget.spent)} з {formatCurrency(budget.amount)}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`${progressColor} h-2.5 rounded-full`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Залишилося: <span className="font-semibold">{formatCurrency(budget.remaining)}</span>
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditForm(budget)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Видалити
                    </button>
                  </div>
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