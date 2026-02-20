import { useState, useEffect, useRef } from 'react'

const useActiveSpeaker = (stream, threshold = -50) => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!stream) return

    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) return

    try {

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 512
      analyserRef.current.smoothingTimeConstant = 0.8

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const detectSpeaking = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length

        const decibels = 20 * Math.log10(average / 255)

        setIsSpeaking(decibels > threshold)

        animationFrameRef.current = requestAnimationFrame(detectSpeaking)
      }

      detectSpeaking()

    } catch (error) {
      console.error('Error setting up audio analysis:', error)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stream, threshold])

  return isSpeaking
}

export default useActiveSpeaker
