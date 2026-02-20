import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Monitor, Chrome, Square } from 'lucide-react'

const ScreenShareWarning = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9998]"
        >
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl shadow-2xl p-5 flex items-start space-x-4 max-w-xl">
            <div className="flex-shrink-0 bg-amber-100 rounded-full p-2">
              <AlertTriangle className="text-amber-600" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-900 font-bold text-base mb-2 flex items-center">
                <Monitor className="mr-2" size={18} />
                Screen Sharing Safety Tips
              </h3>
              <p className="text-amber-800 text-sm mb-3">
                To avoid the <strong>infinite mirror effect</strong>, please select:
              </p>
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-amber-900 bg-white rounded-lg p-2">
                  <Square className="mr-2 text-green-600" size={16} />
                  <span className="font-medium">✅ A specific window</span>
                </div>
                <div className="flex items-center text-sm text-amber-900 bg-white rounded-lg p-2">
                  <Chrome className="mr-2 text-green-600" size={16} />
                  <span className="font-medium">✅ A Chrome tab</span>
                </div>
                <div className="flex items-center text-sm text-red-900 bg-red-50 rounded-lg p-2">
                  <Monitor className="mr-2 text-red-600" size={16} />
                  <span className="font-medium">❌ NOT "Entire Screen"</span>
                </div>
              </div>
              <p className="text-xs text-amber-700 italic">
                Sharing your entire screen may show this meeting recursively.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors bg-white rounded-full p-1 hover:bg-amber-100"
              aria-label="Close warning"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ScreenShareWarning
