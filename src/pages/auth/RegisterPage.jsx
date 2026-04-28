// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { setAuth } from '../../redux/slices/authSlice';
// import { setAxiosToken } from '../../api/axiosInstance';
// import API from '../../api/axiosInstance';
// import { toast } from 'react-hot-toast';
// import { User, Building2 } from 'lucide-react';

// const RegisterPage = () => {
//     const [step, setStep] = useState(1);
//     const [formData, setFormData] = useState({
//         email: '',
//         first_name: '',
//         last_name: '',
//         password: '',
//         confirm_password: '',
//         account_type: 'individual',
//         org_name: '',
//         org_slug: '',
//         invite_code: ''
//     });

//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     // Helper: Auto-generate slug from Org Name
//     const handleOrgNameChange = (e) => {
//         const name = e.target.value;
//         const slug = name.toLowerCase().trim().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
//         setFormData({ ...formData, org_name: name, org_slug: slug });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await API.post('/accounts/register/', formData);
//             const { user, access_token } = res.data;

//             // Give the token to the axios interceptor
//             setAxiosToken(access_token);

//             // Update Redux store
//             dispatch(setAuth({ user, token: access_token }));

//             toast.success('Account created! Welcome to Audicle.');
//             navigate('/dashboard');
//         } catch (err) {
//             toast.error(err.response?.data?.error || "Registration failed. Please try again.");
//         }
//     };

//     return (
//         <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6">
//             <div className="max-w-md w-full bg-brand-surface p-8 rounded-xl border border-brand-border shadow-2xl">
                
//                 <div className="text-center mb-8">
//                     <Link to="/" className="flex items-center justify-center gap-2 text-white font-bold text-lg no-underline mb-6">
//                         <span className="w-2 h-2 rounded-full bg-blue-400" />
//                         Audicle
//                     </Link>
//                 </div>

//                 {/* Step 1: Choose Account Type */}
//                 {step === 1 && (
//                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                         <h2 className="text-3xl font-semibold text-white tracking-tight text-center">Join Audicle.</h2>
//                         <p className="text-gray-500 text-center mt-2 mb-8">How will you be using the platform?</p>

//                         <div className="space-y-4">
//                             <button
//                                 onClick={() => { setFormData({...formData, account_type: 'individual'}); setStep(2); }}
//                                 className="w-full flex items-center p-5 bg-[#111] border border-white/5 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group"
//                             >
//                                 <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mr-4 group-hover:scale-110 transition-transform">
//                                     <User size={20} />
//                                 </div>
//                                 <div>
//                                     <p className="font-bold text-white text-sm">Individual</p>
//                                     <p className="text-xs text-gray-500">For personal recordings and notes.</p>
//                                 </div>
//                             </button>

//                             <button
//                                 onClick={() => { setFormData({...formData, account_type: 'create_org'}); setStep(2); }}
//                                 className="w-full flex items-center p-5 bg-[#111] border border-white/5 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group"
//                             >
//                                 <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mr-4 group-hover:scale-110 transition-transform">
//                                     <Building2 size={20} />
//                                 </div>
//                                 <div>
//                                     <p className="font-bold text-white text-sm">Creative Organisation</p>
//                                     <p className="text-xs text-gray-500">Manage a team and shared recordings.</p>
//                                 </div>
//                             </button>
//                         </div>

//                         <div className="mt-8 text-center">
//                             <p className="text-sm text-gray-500">
//                                 Already have an account?{' '}
//                                 <Link to="/login" className="text-blue-500 font-bold hover:text-blue-400 no-underline ml-1">
//                                     Sign In
//                                 </Link>
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Step 2: Personal & Org Details */}
//                 {step === 2 && (
//                     <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
//                         <div>
//                             <h2 className="text-2xl font-semibold text-white tracking-tight">Create your account.</h2>
//                             <p className="text-gray-500 mt-1">Fill in your details to get started.</p>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">First Name</label>
//                                 <input type="text" placeholder="John" required className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none"
//                                     onChange={e => setFormData({...formData, first_name: e.target.value})} />
//                             </div>
//                             <div>
//                                 <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Last Name</label>
//                                 <input type="text" placeholder="Doe" required className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none"
//                                     onChange={e => setFormData({...formData, last_name: e.target.value})} />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Email Address</label>
//                             <input type="email" placeholder="john@example.com" required className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none"
//                                 onChange={e => setFormData({...formData, email: e.target.value})} />
//                         </div>

//                         <div>
//                             <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Password</label>
//                             <input type="password" placeholder="••••••••" required className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none"
//                                 onChange={e => setFormData({...formData, password: e.target.value})} />
//                         </div>

//                         <div>
//                             <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Confirm Password</label>
//                             <input type="password" placeholder="••••••••" required className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none"
//                                 onChange={e => setFormData({...formData, confirm_password: e.target.value})} />
//                         </div>

//                         {/* Show Org fields ONLY if type is create_org */}
//                         {formData.account_type === 'create_org' && (
//                             <div className="pt-4 border-t border-white/5 space-y-4 animate-in fade-in duration-700">
//                                 <div>
//                                     <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-blue-500 mb-2 ml-1">Organisation Name</label>
//                                     <input type="text" placeholder="Acme Inc." required className="w-full px-4 py-3 bg-[#111] border border-blue-500/20 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none"
//                                         onChange={handleOrgNameChange} />
//                                     <div className="mt-2 text-[0.65rem] text-gray-600 italic">Slug: audicle.app/{formData.org_slug}</div>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="flex gap-4 pt-4">
//                             <button type="button" onClick={() => setStep(1)} className="flex-1 px-5 py-3 bg-transparent text-white border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold tracking-widest transition-all">
//                                 BACK
//                             </button>
//                             <button type="submit" className="flex-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold tracking-widest transition-all shadow-lg shadow-blue-600/10">
//                                 CREATE ACCOUNT
//                             </button>
//                         </div>
//                     </form>
//                 )}
//             </div>
            
//             <div className="mt-8 text-[0.65rem] text-gray-600 tracking-widest uppercase flex gap-4">
//                 <span>© 2024 Audicle Inc.</span>
//                 <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
//                 <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
//             </div>
//         </div>
//     );
// };


// export default RegisterPage;


import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { register, googleLogin, clearError, selectIsLoading, selectError } from '../../redux/slices/authSlice'

export default function RegisterPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isLoading = useSelector(selectIsLoading)
  const error     = useSelector(selectError)

  // extract invite info from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const email  = params.get('email')
    const code   = params.get('code')
    const type   = params.get('type')

    if (email) {
      setForm(prev => ({ ...prev, email }))
    }
    if (type === 'join_org' && code) {
      setForm(prev => ({ ...prev, account_type: 'join_org', invite_code: code }))
    }
  }, [location])

  // clear errors on mount
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // clear errors on mount
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const [form, setForm] = useState({
    email:            '',
    first_name:       '',
    last_name:        '',
    password:         '',
    confirm_password: '',
    account_type:     'individual',
    org_name:         '',
    org_slug:         '',
    invite_code:      '',
  })

  // We should also have Google Auth for registration
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const result = await dispatch(googleLogin(tokenResponse.access_token))
      if (googleLogin.fulfilled.match(result)) {
        navigate('/dashboard')
      }
    },
    onError: () => {
      console.error('Google login failed')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // auto generate slug from org name
      ...(name === 'org_name' && {
        org_slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      })
    }))
    if (error) dispatch(clearError())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      email:            form.email,
      first_name:       form.first_name,
      last_name:        form.last_name,
      password:         form.password,
      confirm_password: form.confirm_password,
      account_type:     form.account_type,
    }

    if (form.account_type === 'create_org') {
      payload.org_name = form.org_name
      payload.org_slug = form.org_slug
    }

    if (form.invite_code) {
      payload.invite_code = form.invite_code
    }

    const result = await dispatch(register(payload))
    if (register.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  const getFieldError = (field) => {
    if (!error) return null
    if (typeof error === 'string') return null
    
    const fieldError = error[field]
    if (Array.isArray(fieldError)) return fieldError[0]
    if (typeof fieldError === 'string') return fieldError
    return null
  }
  
  const generalError = getFieldError('non_field_errors') ||
                       getFieldError('detail') ||
                       getFieldError('message') ||
                       (typeof error === 'string' ? error : (error?.message || error?.detail || null))


  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-gray-400 flex flex-col items-center justify-center p-6 md:p-10" style={{ background: '#050505' }}>
      <div 
        className="w-full max-w-4xl p-10 md:p-12 rounded-3xl border border-white/5 shadow-2xl transition-all flex flex-col my-auto"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-stretch min-h-[480px]">
          
          {/* Left Column (Brand & Info) */}
          <div className="w-full md:w-5/12 flex flex-col justify-between h-full py-2">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 text-white font-bold text-2xl no-underline mb-6">
                <span className="w-3 h-3 rounded-full bg-blue-400" />
                Audicle
              </Link>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Join Audicle and build a searchable memory of every decision, idea, and commitment.
              </p>
            </div>

            {/* Google button moved to the side */}
            <div className="mt-8 md:mt-auto">
              <div className="text-[0.65rem] font-bold tracking-widest text-gray-600 uppercase mb-4">
                Register with Google
              </div>
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-[#111] hover:bg-white/5 text-white border border-white/5 rounded-xl text-xs font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                CONTINUE
              </button>
              <p className="text-gray-500 text-sm mt-6">
                Already have an account?{' '}
                <Link to='/login' className="text-blue-500 font-medium hover:text-blue-400 no-underline transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="w-full md:w-7/12 md:pl-2 flex flex-col justify-center">
            
            {generalError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                {generalError}
              </div>
            )}

            {/* Account type selector */}
            <div className="flex gap-3 mb-6">
              {['individual', 'create_org'].map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => setForm({ ...form, account_type: type })}
                  className={`flex-1 py-3 px-4 text-center rounded-xl text-xs sm:text-sm font-bold tracking-widest uppercase transition-all ${
                    form.account_type === type 
                      ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-[#111] border border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {type === 'individual' ? 'Personal' : 'Organization'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-4">
                {['first_name', 'last_name'].map((field) => (
                  <div key={field} className="flex-1">
                    <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-1.5 ml-1">
                      {field === 'first_name' ? 'First Name' : 'Last Name'}
                    </label>
                    <input
                      type='text'
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-[#111] border ${getFieldError(field) ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-blue-500/50'} rounded-xl text-white placeholder-gray-600 focus:ring-1 outline-none transition-all text-sm`}
                    />
                    {getFieldError(field) && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{getFieldError(field)}</p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='you@example.com'
                  required
                  className={`w-full px-4 py-3 bg-[#111] border ${getFieldError('email') ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-blue-500/50'} rounded-xl text-white placeholder-gray-600 focus:ring-1 outline-none transition-all text-sm`}
                />
                {getFieldError('email') && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{getFieldError('email')}</p>
                )}
              </div>

              {form.account_type === 'create_org' && (
                <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-300">
                  <div className="flex-1">
                    <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-blue-400 mb-1.5 ml-1">
                      Org Name
                    </label>
                    <input
                      type='text'
                      name='org_name'
                      value={form.org_name}
                      onChange={handleChange}
                      placeholder='Acme Corp'
                      required
                      className={`w-full px-4 py-3 bg-[#111] border ${getFieldError('org_name') ? 'border-red-500/50 focus:border-red-500' : 'border-blue-500/20 focus:border-blue-500/50'} rounded-xl text-white placeholder-gray-600 focus:ring-1 outline-none transition-all text-sm`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-blue-400 mb-1.5 ml-1 flex justify-between items-center">
                      <span>URL Slug</span>
                      <span className="text-[0.6rem] text-gray-500 normal-case tracking-normal">audicle.app/</span>
                    </label>
                    <input
                      type='text'
                      name='org_slug'
                      value={form.org_slug}
                      onChange={handleChange}
                      placeholder='acme-corp'
                      required
                      className={`w-full px-4 py-3 bg-[#111] border ${getFieldError('org_slug') ? 'border-red-500/50 focus:border-red-500' : 'border-blue-500/20 focus:border-blue-500/50'} rounded-xl text-white placeholder-gray-600 focus:ring-1 outline-none transition-all text-sm`}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {['password', 'confirm_password'].map((field) => (
                  <div key={field} className="flex-1">
                    <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-1.5 ml-1">
                      {field === 'password' ? 'Password' : 'Confirm'}
                    </label>
                    <input
                      type='password'
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      placeholder='••••••••'
                      required
                      className={`w-full px-4 py-3 bg-[#111] border ${getFieldError(field) ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-blue-500/50'} rounded-xl text-white placeholder-gray-600 focus:ring-1 outline-none transition-all text-sm`}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  type='submit'
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-colors shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}