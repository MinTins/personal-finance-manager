import { useState, useEffect } from 'react'
import { getCategories, deleteCategory } from '../../services/categories'
import CategoryForm from './CategoryForm'

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [filter, setFilter] = useState('') // 'income', 'expense', or ''

  useEffect(() => {
    loadCategories()
  }, [filter])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories(filter || null)
      setCategories(data)
      setError('')
    } catch (err) {
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (categoryData) => {
    await loadCategories()
    setShowForm(false)
  }

  const handleUpdateCategory = async (categoryData) => {
    await loadCategories()
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      try {
        await deleteCategory(id)
        await loadCategories()
      } catch (err) {
        setError(err.toString())
      }
    }
  }

  const handleEditClick = (category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

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
        <h1 className="text-2xl font-bold">Категорії</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          + Створити категорію
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
            {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
          </h2>
          <CategoryForm 
            category={editingCategory}
            onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Фільтр */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg ${filter === '' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
          >
            Всі
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-lg ${filter === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            Доходи
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-lg ${filter === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            Витрати
          </button>
        </div>
      </div>

      {/* Категорії доходів */}
      {(filter === '' || filter === 'income') && incomeCategories.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            Категорії доходів
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((category) => (
              <div 
                key={category.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${category.color || '#10B981'}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Дохід
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Редагувати"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Видалити"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Категорії витрат */}
      {(filter === '' || filter === 'expense') && expenseCategories.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            Категорії витрат
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category) => (
              <div 
                key={category.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${category.color || '#EF4444'}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Витрата
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Редагувати"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Видалити"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-gray-500">Категорій не знайдено. Створіть нову категорію, натиснувши кнопку вгорі.</p>
        </div>
      )}
    </div>
  )
}

export default CategoryList