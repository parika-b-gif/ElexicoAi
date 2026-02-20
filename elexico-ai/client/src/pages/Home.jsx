import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Users, Shield, Sparkles, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import GoogleSignIn from '../components/GoogleSignIn'

function Home() {
  const [roomId, setRoomId] = useState('')
  const navigate = useNavigate()

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`)
    }
  }

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10)
    navigate(`/room/${newRoomId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        {/* Google Sign-In - Top Right */}
        <div className="flex justify-end mb-6">
          <GoogleSignIn />
        </div>

        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="bg-blue-600 rounded-2xl p-3 mr-4 shadow-lg">
              <Video size={40} className="text-white" />
            </div>
            <h1 className="text-5xl font-normal text-gray-800">
              Elexico <span className="font-semibold text-blue-600">AI</span>
            </h1>
          </motion.div>

          <p className="text-3xl text-gray-800 mb-2 font-light">
            Premium video meetings for teams
          </p>
          <p className="text-lg text-gray-600">
            Connect, collaborate, and celebrate from anywhere
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl p-8 mb-12 shadow-sm border border-gray-200"
        >
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCreateRoom}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Video size={20} />
                New meeting
              </button>

              <div className="flex-1 flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter a code or nickname"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!roomId.trim()}
                  className="bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-blue-600 disabled:text-gray-400 font-medium py-3 px-6 rounded-lg transition-all border border-gray-300"
                >
                  Join
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon={<Users size={28} />}
            title="Team Meetings"
            description="Connect with your team from anywhere"
          />
          <FeatureCard
            icon={<Shield size={28} />}
            title="Safe & Secure"
            description="Built with privacy and security in mind"
          />
          <FeatureCard
            icon={<Calendar size={28} />}
            title="Easy Scheduling"
            description="Create instant meetings or schedule for later"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg transition-all"
    >
      <div className="flex justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-gray-800 font-medium mb-2 text-lg">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  )
}

export default Home
