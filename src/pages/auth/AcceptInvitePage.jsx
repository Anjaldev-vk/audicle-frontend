import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import SplashScreen from '../../components/SplashScreen'

export default function AcceptInvitePage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [inviteData, setInviteData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await axiosInstance.get(`accounts/invite/${code}/`)
        setInviteData(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvite()
  }, [code])

  if (isLoading) return <SplashScreen />

  if (error) {
    return (
      <div className="font-[Inter,sans-serif] min-h-screen text-gray-400 flex flex-col items-center justify-center p-6" style={{ background: '#050505' }}>
        <div className="w-full max-w-md p-12 rounded-3xl border border-red-500/10 shadow-2xl text-center bg-[#0a0a0a]">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 15c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Invitation Error</h2>
          <p className="text-gray-500 text-sm mb-8">{error}</p>
          <Link to="/login" className="inline-block px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold tracking-widest transition-all">
            GO TO LOGIN
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-gray-400 flex flex-col items-center justify-center p-6" style={{ background: '#050505' }}>
      <div 
        className="w-full max-w-lg p-12 rounded-3xl border border-white/5 shadow-2xl transition-all text-center"
        style={{ background: '#0a0a0a' }}
      >
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Join {inviteData.organisation}</h2>
        <p className="text-gray-500 text-sm mb-10 leading-relaxed">
          You've been invited to join <strong>{inviteData.organisation}</strong> as a <strong>{inviteData.role}</strong>. 
          Create an account below to accept the invitation.
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            to={`/register?code=${code}&email=${inviteData.email}&type=join_org`}
            className="w-full px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 no-underline"
          >
            CREATE ACCOUNT & JOIN
          </Link>
          <Link 
            to="/login"
            className="w-full px-5 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold tracking-widest transition-all border border-white/5 no-underline"
          >
            ALREADY HAVE AN ACCOUNT? LOG IN
          </Link>
        </div>

        <p className="mt-8 text-[0.65rem] text-gray-600 uppercase tracking-widest">
          Invited email: {inviteData.email}
        </p>
      </div>
    </div>
  )
}
