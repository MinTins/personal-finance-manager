import { NavLink } from 'react-router-dom'
import { 
  FiHome, 
  FiDollarSign, 
  FiPieChart,
  FiFolder,
  FiCreditCard,
  FiSettings 
} from 'react-icons/fi'

const Sidebar = () => {
  // Клас для активного посилання
  const activeClass = "flex items-center px-4 py-2 text-primary-700 bg-primary-100 rounded-md"
  // Клас для неактивного посилання
  const inactiveClass = "flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
  
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:bg-white md:overflow-y-auto p-4">
      <div className="space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
          end
        >
          <FiHome className="mr-3 h-5 w-5" />
          Головна
        </NavLink>
        
        <NavLink 
          to="/accounts" 
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <FiCreditCard className="mr-3 h-5 w-5" />
          Рахунки
        </NavLink>
        
        <NavLink 
          to="/transactions" 
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <FiDollarSign className="mr-3 h-5 w-5" />
          Транзакції
        </NavLink>
        
        <NavLink 
          to="/categories" 
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <FiFolder className="mr-3 h-5 w-5" />
          Категорії
        </NavLink>
        
        <NavLink 
          to="/budgets" 
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <FiPieChart className="mr-3 h-5 w-5" />
          Бюджети
        </NavLink>
      </div>
      
      <div className="mt-auto pt-4 border-t">
        <a 
          href="https://github.com/MinTins/personal-finance-manager" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
        >
          <FiSettings className="mr-3 h-5 w-5" />
          Про проект
        </a>
      </div>
    </aside>
  )
}

export default Sidebar