import { useState, useEffect } from 'react'
import { Blur, Image, X } from 'lucide-react'

/**
 * VideoSettings Component - Background Blur & Virtual Backgrounds
 * 
 * Note: Full background blur/replacement requires heavy processing.
 * For production, consider using libraries like:
 * - @mediapipe/selfie_segmentation
 * - @tensorflow/tfjs
 * - Or use Agora/Dyte SDK built-in effects
 */

const VideoSettings = ({ localStream, onClose }) => {
  const [backgroundEffect, setBackgroundEffect] = useState('none') // none, blur, image
  const [selectedBackground, setSelectedBackground] = useState(null)

  // Virtual background images
  const backgroundImages = [
    { id: 1, name: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
    { id: 2, name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
    { id: 3, name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
    { id: 4, name: 'City', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800' },
  ]

  const applyBackgroundBlur = () => {
    if (!localStream) return

    // This is a simplified version. For production, use:
    // - Canvas API with blur filter
    // - MediaPipe Selfie Segmentation
    // - Or WebRTC SDK background effects
    
    console.log('🎭 Background blur enabled')
    // In production, you'd process the video track here
    setBackgroundEffect('blur')
  }

  const applyVirtualBackground = (imageUrl) => {
    if (!localStream) return

    console.log('🖼️ Virtual background applied:', imageUrl)
    setBackgroundEffect('image')
    setSelectedBackground(imageUrl)
    
    // In production, you'd:
    // 1. Load background image
    // 2. Use selfie segmentation to detect person
    // 3. Composite person onto new background
    // 4. Replace video track
  }

  const removeEffect = () => {
    console.log('✅ Background effect removed')
    setBackgroundEffect('none')
    setSelectedBackground(null)
    // Restore original video track
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Video Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              autoPlay
              muted
              playsInline
              ref={(video) => {
                if (video && localStream) {
                  video.srcObject = localStream
                }
              }}
              className="w-full h-full object-cover"
            />
            {backgroundEffect !== 'none' && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {backgroundEffect === 'blur' ? '🎭 Blur Active' : '🖼️ Virtual BG'}
              </div>
            )}
          </div>
        </div>

        {/* Background Blur */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Blur className="w-4 h-4" />
            Background Blur
          </h3>
          <button
            onClick={backgroundEffect === 'blur' ? removeEffect : applyBackgroundBlur}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
              backgroundEffect === 'blur'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
          >
            {backgroundEffect === 'blur' ? '✓ Blur Enabled' : 'Enable Blur'}
          </button>
        </div>

        {/* Virtual Backgrounds */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Virtual Backgrounds
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {backgroundImages.map((bg) => (
              <button
                key={bg.id}
                onClick={() =>
                  selectedBackground === bg.url ? removeEffect() : applyVirtualBackground(bg.url)
                }
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  selectedBackground === bg.url
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={bg.url}
                  alt={bg.name}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
                  <span className="text-white text-xs font-medium">{bg.name}</span>
                </div>
                {selectedBackground === bg.url && (
                  <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Remove Effect Button */}
        {backgroundEffect !== 'none' && (
          <button
            onClick={removeEffect}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Remove Effect
          </button>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Full background processing requires additional libraries. 
            This demo shows the UI. For production, integrate @mediapipe/selfie_segmentation 
            or use SDK-provided effects.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VideoSettings
