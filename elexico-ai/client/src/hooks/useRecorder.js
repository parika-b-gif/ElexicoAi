import { useState, useRef, useCallback } from 'react'

const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState([])
  const mediaRecorderRef = useRef(null)
  const recordedBlobsRef = useRef([])

  const startRecording = useCallback((stream) => {
    if (!stream) {
      console.error('No stream provided for recording')
      return false
    }

    try {

      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ]

      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      if (!selectedMimeType) {
        console.error('No supported mime type found')
        return false
      }

      const options = {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000,
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options)
      recordedBlobsRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedBlobsRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedBlobsRef.current, {
          type: selectedMimeType,
        })
        setRecordedChunks([blob])
      }

      mediaRecorderRef.current.start(100)
      setIsRecording(true)
      console.log('🔴 Recording started')
      return true
    } catch (error) {
      console.error('Error starting recording:', error)
      return false
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log('⏹️ Recording stopped')
    }
  }, [isRecording])

  const downloadRecording = useCallback(() => {
    if (recordedChunks.length === 0) {
      console.error('No recording to download')
      return
    }

    const blob = recordedChunks[0]
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `elexico-recording-${new Date().toISOString()}.webm`
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)

    console.log('💾 Recording downloaded')
  }, [recordedChunks])

  const clearRecording = useCallback(() => {
    setRecordedChunks([])
    recordedBlobsRef.current = []
  }, [])

  return {
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
  }
}

export default useRecorder
