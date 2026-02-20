import { Grid3x3, User } from 'lucide-react'

/**
 * LayoutSelector Component - Switch between Grid and Speaker view
 */

const LayoutSelector = ({ layout, onLayoutChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-1">
      <button
        onClick={() => onLayoutChange('grid')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          layout === 'grid'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        }`}
        title="Grid View"
      >
        <Grid3x3 className="w-4 h-4" />
        <span className="text-sm font-medium">Grid</span>
      </button>
      
      <button
        onClick={() => onLayoutChange('speaker')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          layout === 'speaker'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        }`}
        title="Speaker View"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">Speaker</span>
      </button>
    </div>
  )
}

export default LayoutSelector
