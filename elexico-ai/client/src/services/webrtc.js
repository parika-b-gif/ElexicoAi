export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

export const createPeerConnection = () => {
  return new RTCPeerConnection(ICE_SERVERS)
}

export const createOffer = async (peerConnection) => {
  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })

    await peerConnection.setLocalDescription(offer)

    console.log('📤 Created and set local offer')
    return offer
  } catch (error) {
    console.error('❌ Error creating offer:', error)
    throw error
  }
}

export const createAnswer = async (peerConnection, offer) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    console.log('📥 Created and set local answer')
    return answer
  } catch (error) {
    console.error('❌ Error creating answer:', error)
    throw error
  }
}

export const addIceCandidate = async (peerConnection, candidate) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    console.log('🧊 Added ICE candidate')
  } catch (error) {
    console.error('❌ Error adding ICE candidate:', error)
  }
}

export const addStreamToPeer = (peerConnection, stream) => {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream)
    console.log(`➕ Added ${track.kind} track to peer connection`)
  })
}

export const replaceVideoTrack = async (peerConnection, newTrack) => {
  try {
    const sender = peerConnection
      .getSenders()
      .find((s) => s.track && s.track.kind === 'video')

    if (sender) {
      await sender.replaceTrack(newTrack)
      console.log(`🔄 Replaced video track with ${newTrack.label}`)
    }
  } catch (error) {
    console.error('❌ Error replacing track:', error)
  }
}

export const toggleTrack = (track, enabled) => {
  if (track) {
    track.enabled = enabled
    console.log(`${enabled ? '🔊' : '🔇'} ${track.kind} track ${enabled ? 'enabled' : 'disabled'}`)
  }
}

export const closePeerConnection = (peerConnection) => {
  if (peerConnection) {
    peerConnection.close()
    console.log('🔌 Peer connection closed')
  }
}

export const getConnectionState = (peerConnection) => {
  return peerConnection ? peerConnection.connectionState : 'closed'
}
