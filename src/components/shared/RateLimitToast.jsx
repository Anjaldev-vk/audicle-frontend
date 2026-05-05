import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { selectRateLimitMessage, clearRateLimitToast } from '../../app/uiSlice'
import { AlertCircle } from 'lucide-react'

export default function RateLimitToast() {
  const message = useSelector(selectRateLimitMessage)
  const dispatch = useDispatch()

  useEffect(() => {
    if (message) {
      toast.error(message, {
        id: 'rate-limit-toast', // prevent duplicates
        duration: 5000,
        icon: <AlertCircle className="text-red-500" size={20} />,
        style: {
          background: '#161616',
          color: '#fff',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '12px 16px',
        },
      })
      
      // Clear the message from Redux after showing the toast
      // so it can be triggered again if another 429 occurs
      dispatch(clearRateLimitToast())
    }
  }, [message, dispatch])

  return null // This component only handles the toast logic
}
