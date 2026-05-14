const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}`

class WebSocketService {
  constructor() {
    this.sockets = new Map()
    this.reconnectInterval = 3000
  }

  connect(path, token, onMessage, onOpen, onClose) {
    if (this.sockets.has(path)) {
      return this.sockets.get(path)
    }

    const url = `${WS_URL}${path}?token=${token}`
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log(`[WS] Connected to ${path}`)
      if (onOpen) onOpen()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onMessage) onMessage(data)
      } catch (err) {
        console.error('[WS] Failed to parse message:', err)
      }
    }

    ws.onclose = () => {
      console.log(`[WS] Disconnected from ${path}`)
      this.sockets.delete(path)
      if (onClose) onClose()
      
      // Auto-reconnect logic
      setTimeout(() => {
        console.log(`[WS] Attempting to reconnect to ${path}...`)
        this.connect(path, token, onMessage, onOpen, onClose)
      }, this.reconnectInterval)
    }

    ws.onerror = (error) => {
      console.error(`[WS] Error on ${path}:`, error)
      ws.close()
    }

    this.sockets.set(path, ws)
    return ws
  }

  disconnect(path) {
    const ws = this.sockets.get(path)
    if (ws) {
      ws.onclose = null // Prevent auto-reconnect
      ws.close()
      this.sockets.delete(path)
    }
  }

  send(path, data) {
    const ws = this.sockets.get(path)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    } else {
      console.warn(`[WS] Cannot send message, socket not open: ${path}`)
    }
  }
}

const instance = new WebSocketService()
export default instance
