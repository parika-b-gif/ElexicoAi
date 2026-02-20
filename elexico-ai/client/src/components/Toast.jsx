import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const Toast = ({ message, type = 'info', isVisible, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  const icons = {
    warning: <AlertTriangle className="text-amber-600" size={20} />,
    success: <CheckCircle className="text-green-600" size={20} />,
    info: <Info className="text-blue-600" size={20} />,
  }

  const colors = {
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-20 left-1/2 z-[9999]"
        >
          <div className={`${colors[type]} border rounded-lg shadow-lg p-4 flex items-center space-x-3 min-w-[300px] max-w-md`}>
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-sm">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
