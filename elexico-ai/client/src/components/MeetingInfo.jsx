import { useState } from 'react'
import { Info, Copy, Check, Link as LinkIcon, Phone, X } from 'lucide-react'

/**
 * MeetingInfo Component - Display meeting details and allow copying
 */

const MeetingInfo = ({ roomId, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Generate meeting URL
  const meetingUrl = `${window.location.origin}/room/${roomId}`
  
  // Generate dial-in code (mock - you'd get this from your PSTN integration)
  const dialInCode = roomId.split('').map(c => 
    '0123456789'.includes(c) ? c : String(c.charCodeAt(0) % 10)
  ).join('').slice(0, 10).match(/.{1,3}/g).join('-')

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'url') {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } else {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Meeting Info</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Meeting URL */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="w-4 h-4" />
            Meeting Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={meetingUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(meetingUrl, 'url')}
              className={`px-4 py-3 rounded-lg transition-all ${
                copiedUrl
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copiedUrl ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Room Code */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            Room Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomId}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(roomId, 'code')}
              className={`px-4 py-3 rounded-lg transition-all ${
                copiedCode
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copiedCode ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Dial-in Information */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-900 mb-2">Dial-in Number (Optional)</h3>
          <p className="text-sm text-blue-800 mb-1">
            Phone: <span className="font-mono">+1 (555) 123-4567</span>
          </p>
          <p className="text-sm text-blue-800">
            Access Code: <span className="font-mono">{dialInCode}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 text-sm font-semibold">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-900 font-medium">Share the meeting link</p>
              <p className="text-xs text-gray-600">Send the URL to participants via email or chat</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 text-sm font-semibold">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-900 font-medium">Or share the room code</p>
              <p className="text-xs text-gray-600">Participants can enter the code on the home page</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 text-sm font-semibold">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-900 font-medium">Dial-in option</p>
              <p className="text-xs text-gray-600">For participants without internet, share the phone number</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default MeetingInfo
