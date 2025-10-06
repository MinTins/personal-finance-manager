import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi'

const Navbar = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Фінансовий Трекер
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Головна
              </Link>
              <Link 
                to="/accounts" 
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Рахунки
              </Link>
              <Link 
                to="/transactions" 
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Транзакції
              </Link>
              <Link 
                to="/categories" 
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Категорії
              </Link>
              <Link 
                to="/budgets" 
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Бюджети
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.username}
              </span>
              <div className="relative">
                <button
                  onClick={onLogout}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <span className="mr-1">Вийти</span>
                  <FiLogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Відкрити головне меню</span>
              {mobileMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобільне меню */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMobileMenu}
            >
              Головна
            </Link>
            <Link
              to="/accounts"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMobileMenu}
            >
              Рахунки
            </Link>
            <Link
              to="/transactions"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMobileMenu}
            >
              Транзакції
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMobileMenu}
            >
              Категорії
            </Link>
            <Link
              to="/budgets"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMobileMenu}
            >
              Бюджети
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                  <FiUser className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.username}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  onLogout()
                  toggleMobileMenu()
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Вийти
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar