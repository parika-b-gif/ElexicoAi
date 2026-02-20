import { motion } from 'framer-motion'

const EmojiPicker = ({ onSelect, onClose }) => {
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '👏', '🎉', '🔥', '✨', '💯']

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: 20 }}
      className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-4 shadow-2xl border border-gray-200"
    >
      <p className="text-xs text-gray-600 mb-2 text-center font-medium">Send a reaction</p>
      <div className="flex gap-2">
        {emojis.map((emoji) => (
          <motion.button
            key={emoji}
            onClick={() => onSelect(emoji)}
            whileHover={{ scale: 1.3, rotate: 10 }}
            whileTap={{ scale: 0.8 }}
            className="text-3xl p-2 hover:bg-gray-100 rounded-lg transition-colors relative group"
            title={`Send ${emoji}`}
          >
            {emoji}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Send {emoji}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default EmojiPicker
