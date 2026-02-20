/// <reference types="vite/client" />

import { useState, useRef, useCallback, useEffect } from 'react'
import SimplePeer from 'simple-peer'

interface ExtendedDisplayMediaOptions extends DisplayMediaStreamOptions {

  selfBrowserSurface?: 'include' | 'exclude'

  surfaceSwitching?: 'include' | 'exclude'

  systemAudio?: 'include' | 'exclude'

  monitorTypeSurfaces?: 'include' | 'exclude'

  preferCurrentTab?: boolean
}

export interface UseScreenShareOptions {

  localStreamRef: React.MutableRefObject<MediaStream | null>

  peersRef: React.MutableRefObject<Map<string, SimplePeer.Instance>>

  onStart?: (stream: MediaStream) => void

  onStop?: () => void

  onError?: (err: Error) => void
}

export interface UseScreenShareReturn {
  isScreenSharing: boolean
  screenStream:    MediaStream | null
  startScreenShare: () => Promise<void>
  stopScreenShare:  () => void
}

function getPeerConnection(peer: SimplePeer.Instance): RTCPeerConnection | null {
  return (peer as unknown as { _pc?: RTCPeerConnection })._pc ?? null
}

function getVideoSender(pc: RTCPeerConnection): RTCRtpSender | null {
  return pc.getSenders().find(s => s.track?.kind === 'video') ?? null
}

function getAudioSender(pc: RTCPeerConnection): RTCRtpSender | null {
  return pc.getSenders().find(s => s.track?.kind === 'audio') ?? null
}

async function replaceTrackOnAllPeers(
  peersRef: React.MutableRefObject<Map<string, SimplePeer.Instance>>,
  newVideoTrack: MediaStreamTrack | null,
  newAudioTrack?: MediaStreamTrack | null,
): Promise<void> {
  const ops: Promise<void>[] = []

  peersRef.current.forEach((peer, socketId) => {
    if (peer.destroyed) return

    const pc = getPeerConnection(peer)
    if (!pc) return

    if (newVideoTrack !== undefined) {
      const videoSender = getVideoSender(pc)
      if (videoSender) {
        ops.push(
          videoSender.replaceTrack(newVideoTrack).catch(err => {
            console.warn(`[ScreenShare] replaceTrack(video) failed for ${socketId.slice(0,6)}:`, err.message)
          })
        )
      }
    }

    if (newAudioTrack !== undefined) {
      const audioSender = getAudioSender(pc)
      if (audioSender && newAudioTrack) {
        ops.push(
          audioSender.replaceTrack(newAudioTrack).catch(err => {
            console.warn(`[ScreenShare] replaceTrack(audio) failed for ${socketId.slice(0,6)}:`, err.message)
          })
        )
      }
    }
  })

  await Promise.allSettled(ops)
}

function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach(t => t.stop())
}

export function useScreenShare({
  localStreamRef,
  peersRef,
  onStart,
  onStop,
  onError,
}: UseScreenShareOptions): UseScreenShareReturn {

  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream,    setScreenStream]    = useState<MediaStream | null>(null)

  const screenStreamRef = useRef<MediaStream | null>(null)

  const isStoppingRef   = useRef(false)

  const mountedRef      = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false

      stopStream(screenStreamRef.current)
      screenStreamRef.current = null
    }
  }, [])

  const stopScreenShare = useCallback(async () => {
    if (isStoppingRef.current) return
    isStoppingRef.current = true

    console.log('[ScreenShare] Stopping screen share…')

    const stream = screenStreamRef.current
    if (!stream) { isStoppingRef.current = false; return }

    stream.getVideoTracks().forEach(t => { t.onended = null })

    stopStream(stream)
    screenStreamRef.current = null

    const camVideoTrack = localStreamRef.current?.getVideoTracks()[0] ?? null
    await replaceTrackOnAllPeers(peersRef, camVideoTrack)

    if (mountedRef.current) {
      setIsScreenSharing(false)
      setScreenStream(null)
    }

    isStoppingRef.current = false
    console.log('[ScreenShare] Stopped — camera track restored on all peers')
    onStop?.()
  }, [localStreamRef, peersRef, onStop])

  const startScreenShare = useCallback(async () => {

    if (screenStreamRef.current) {
      console.warn('[ScreenShare] Already sharing — stop first')
      return
    }

    const constraints: ExtendedDisplayMediaOptions = {
      video: {
        width:       { ideal: 1920 },
        height:      { ideal: 1080 },
        frameRate:   { ideal: 30, max: 60 },

        displaySurface: 'monitor',
      } as MediaTrackConstraints & { displaySurface?: string },
      audio: {

        suppressLocalAudioPlayback: true,

        noiseSuppression: false,
        autoGainControl:  false,
        echoCancellation: false,
      } as unknown as MediaTrackConstraints,

      selfBrowserSurface:    'exclude',
      surfaceSwitching:      'include',
      systemAudio:           'include',
      monitorTypeSurfaces:   'include',
    }

    let screenStream: MediaStream

    try {

      screenStream = await navigator.mediaDevices.getDisplayMedia(constraints)
    } catch (err: unknown) {
      const e = err as Error

      if (e.name !== 'NotAllowedError') {
        console.error('[ScreenShare] getDisplayMedia failed:', e.message)
        onError?.(e)
      } else {
        console.log('[ScreenShare] User dismissed picker')
      }
      return
    }

    const screenVideoTrack = screenStream.getVideoTracks()[0]
    const screenAudioTrack = screenStream.getAudioTracks()[0] ?? null

    if (!screenVideoTrack) {
      console.error('[ScreenShare] No video track in display stream')
      stopStream(screenStream)
      return
    }

    const settings = screenVideoTrack.getSettings() as MediaTrackSettings & { displaySurface?: string }
    console.log('[ScreenShare] Capturing surface:', settings.displaySurface ?? 'unknown',
      `${settings.width}×${settings.height} @ ${settings.frameRate}fps`)

    if (settings.displaySurface === 'browser') {
      console.warn('[ScreenShare] ⚠️  User chose a browser tab — mirror risk if it is this app')
    }

    const handleTrackEnded = () => {
      console.log('[ScreenShare] Track ended by OS/user — restoring camera')
      stopScreenShare()
    }
    screenVideoTrack.addEventListener('ended', handleTrackEnded)

    screenStreamRef.current = screenStream

    await replaceTrackOnAllPeers(peersRef, screenVideoTrack, screenAudioTrack)

    if (!mountedRef.current) {

      stopStream(screenStream)
      screenStreamRef.current = null
      return
    }

    setIsScreenSharing(true)
    setScreenStream(screenStream)

    console.log('[ScreenShare] Started —', peersRef.current.size, 'peer(s) updated')
    onStart?.(screenStream)
  }, [localStreamRef, peersRef, onStart, onError, stopScreenShare])

  return {
    isScreenSharing,
    screenStream,
    startScreenShare,
    stopScreenShare,
  }
}

export default useScreenShare
