import React, { useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  Check, 
  Zap, 
  Shield, 
  Clock, 
  Loader2,
  AlertCircle,
  BarChart3,
  Lock,
  Trophy,
  Sparkles
} from 'lucide-react';
import { 
  useGetBillingPlanQuery, 
  useCreateCheckoutMutation, 
  useVerifySubscriptionMutation 
} from '../api/billingApi';
import { useSelector } from 'react-redux';
import { selectUser } from '../../auth/slices/authSlice';
import { selectActiveWorkspace } from '../../workspace/slices/workspaceSlice';
import { toast } from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Skeleton from '../../../components/shared/Skeleton';

const PricingCard = ({ plan, currentPlan, onSelect, isLoading }) => {
  const isCurrent = currentPlan === plan.plan;
  const isPro = plan.plan === 'Pro';
  const isEnterprise = plan.plan === 'Enterprise';

  const features = {
    'Pro': [
      '50 High-Fidelity Meetings',
      'Priority Bot Access',
      'AI Summary Engine',
      'Advanced Semantic Search',
      'Priority Email Support'
    ],
    'Enterprise': [
      'Unlimited Meeting Processing',
      'Custom Bot Infrastructure',
      'Dedicated AI Instances',
      'Advanced Governance Tools',
      '24/7 Dedicated Manager'
    ]
  };

  const planFeatures = features[plan.plan] || [];

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative flex flex-col p-8 md:p-10 rounded-[2rem] border transition-all duration-300 bg-brand-surface/40 backdrop-blur-xl ${
        isPro 
          ? 'border-brand-primary/60 shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-1 ring-brand-primary/30 z-10' 
          : 'border-brand-border/60 hover:border-brand-primary/30 shadow-xl shadow-black/10'
      }`}
    >
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 flex items-center gap-1.5">
          <Sparkles size={10} className="text-white animate-pulse" />
          Recommended
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted opacity-70">
             {plan.name} Tier
           </span>
           {isEnterprise ? (
             <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
               <Trophy size={14} />
             </span>
           ) : (
             <span className={`p-1.5 rounded-lg ${isPro ? 'bg-brand-primary/10 text-brand-primary' : 'bg-text-muted/10 text-text-muted'}`}>
               <Zap size={14} />
             </span>
           )}
        </div>
        
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-sm font-semibold text-text-muted mr-1 opacity-70">₹</span>
          <span className="text-5xl font-extrabold tracking-tight text-text-main">
            {Math.floor(plan.price).toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-semibold text-text-muted opacity-50 ml-1">/month</span>
        </div>
        <p className="text-[11px] text-text-muted font-medium mt-1">
          {isPro ? 'Ideal for growing teams and active creators.' : 'Custom limits for large scale organizations.'}
        </p>
      </div>

      <div className="w-full h-px bg-brand-border/50 mb-8" />

      <div className="flex-1 space-y-4 mb-8">
        {planFeatures.map((feature, i) => (
          <div key={i} className="flex items-start gap-3 group/item">
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPro 
                ? 'bg-brand-primary/10 group-hover/item:bg-brand-primary/20 text-brand-primary' 
                : 'bg-brand-highlight/85 group-hover/item:bg-brand-highlight text-text-muted'
            }`}>
              <Check className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium text-text-muted transition-colors group-hover/item:text-text-main tracking-tight leading-relaxed">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelect(plan.plan)}
        disabled={isCurrent || isLoading}
        className={`w-full py-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          isCurrent 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
            : isPro 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30' 
              : 'bg-text-main text-brand-surface hover:opacity-90 shadow-md'
        }`}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin mx-auto" />
        ) : isCurrent ? (
          'Active Subscription'
        ) : (
          `Upgrade to ${plan.name}`
        )}
      </button>
    </motion.div>
  );
};

const UsageMetric = ({ label, value, max, unit }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border/60 p-6 rounded-2xl shadow-lg relative overflow-hidden group w-full md:min-w-[280px]">
       <div className="flex justify-between items-start mb-4">
          <div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-60 mb-1">{label}</p>
             <h4 className="text-2xl font-black text-text-main tracking-tight">
               {value} <span className="text-xs font-semibold text-text-muted opacity-50">/ {max === -1 ? '∞' : max} {unit}</span>
             </h4>
          </div>
          <div className="p-2.5 bg-brand-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300 text-brand-primary">
             <BarChart3 size={18} />
          </div>
       </div>
       <div className="h-2 w-full bg-brand-highlight/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            style={{ width: `${max === -1 ? 0 : percentage}%` }}
          />
       </div>
    </div>
  );
};

const BillingSkeleton = () => {
  return (
    <AppLayout>
      <div className="relative min-h-screen bg-brand-bg overflow-hidden">
        <div className="max-w-7xl mx-auto py-16 px-8 relative z-10">
          {/* Header & Usage Metric Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="space-y-3">
              <Skeleton className="w-48 h-10" />
              <Skeleton className="w-80 h-4" />
              <Skeleton className="w-40 h-6 rounded-full" />
            </div>
            <div className="w-full md:w-auto self-start">
              {/* Usage Metric Card Skeleton */}
              <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl shadow-lg w-full md:min-w-[280px] space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-32 h-8" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
            </div>
          </div>

          {/* Pricing Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col p-8 md:p-10 rounded-[2rem] border border-brand-border bg-brand-surface/40 backdrop-blur-xl space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <Skeleton className="w-32 h-12" />
                  </div>
                  <Skeleton className="w-48 h-3" />
                </div>
                <div className="w-full h-px bg-brand-border/50" />
                <div className="space-y-4 flex-1">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                      <Skeleton className="w-2/3 h-4" />
                    </div>
                  ))}
                </div>
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            ))}
          </div>

          {/* Footer Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-brand-border/60">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-28 h-4" />
                  <Skeleton className="w-full h-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const BillingPage = () => {
  const user = useSelector(selectUser);
  const activeWorkspace = useSelector(selectActiveWorkspace);
  const isOrganisationWorkspace = activeWorkspace?.type === 'organisation';
  const { data: planRes, isLoading: planLoading, isError, error } = useGetBillingPlanQuery();
  const [createCheckout, { isLoading: isCreating }] = useCreateCheckoutMutation();
  const [verifySubscription, { isLoading: isVerifying }] = useVerifySubscriptionMutation();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlanName = planRes?.data?.plan || 'Free';
  const availablePlans = planRes?.data?.available_plans || [];
  const meetingsUsed = planRes?.data?.meetings_used || 0;
  const meetingsLimit = planRes?.data?.meetings_limit || 0;

  const handleSubscribe = async (planName) => {
    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK is not loaded. If you are using Brave or an adblocker, please disable it for this site and refresh the page.');
      }
      setIsProcessing(true);
      const res = await createCheckout({ plan: planName }).unwrap();
      console.log('Checkout response:', res);
      
      const subscription_id = res?.data?.subscription_id;
      const razorpay_key = res?.data?.razorpay_key;
      
      if (!subscription_id || !razorpay_key) {
        throw new Error('Invalid response received from checkout handshake.');
      }

      const options = {
        key: razorpay_key,
        subscription_id: subscription_id,
        name: 'Audicle',
        description: `${planName} Subscription`,
        handler: async (response) => {
          try {
            await verifySubscription({
              razorpay_order_id: response.razorpay_order_id || subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }).unwrap();
            toast.success('Plan Upgraded Successfully');
            window.location.reload();
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            toast.error(verifyErr.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.full_name,
          email: user?.email
        },
        theme: { color: '#2563eb' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Handshake error:', err);
      toast.error(err.data?.message || err.message || 'Handshake failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (planLoading) {
    return <BillingSkeleton />;
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-40 bg-brand-bg relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          <AlertCircle className="w-12 h-12 text-red-500/80 mb-4" />
          <h3 className="text-base font-black text-text-main mb-2 tracking-tight">Failed to Load Billing Plans</h3>
          <p className="text-xs text-text-muted mb-8 max-w-md text-center leading-relaxed">
            {error?.data?.message || 'Could not connect to the billing service. Please check if backend services are running.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-primary hover:bg-opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-brand-bg transition-colors duration-500 overflow-hidden">
        
        {/* Ambient mesh glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto py-16 px-8 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16"
          >
             <div>
                <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">Billing & Plans</h1>
                <p className="text-sm font-medium text-text-muted">Manage your subscription and monitor your workspace usage.</p>
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                  isOrganisationWorkspace
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOrganisationWorkspace ? 'bg-indigo-400' : 'bg-emerald-400'} animate-pulse`} />
                  {isOrganisationWorkspace ? 'Organisation' : 'Personal'} workspace — {activeWorkspace?.name || 'Personal'}
                </div>
             </div>
             <div className="flex gap-4 w-full md:w-auto self-start">
                <UsageMetric label="Meetings Used" value={meetingsUsed} max={meetingsLimit} unit="Meetings" />
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24"
          >
            {availablePlans.map((plan) => (
              <PricingCard 
                key={plan.plan} 
                plan={plan} 
                currentPlan={currentPlanName} 
                onSelect={handleSubscribe}
                isLoading={isProcessing || isCreating || isVerifying}
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-brand-border/60">
             <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] text-brand-primary">
                   <Lock size={18} />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-text-main mb-1 uppercase tracking-[0.15em]">Secure Processing</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed font-medium">Bank-grade encryption for all financial handshakes and data transmission.</p>
                </div>
             </div>
             <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] text-purple-400">
                   <Shield size={18} />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-text-main mb-1 uppercase tracking-[0.15em]">Data Isolation</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed font-medium">Your data is strictly partitioned and accessible only via authenticated sessions.</p>
                </div>
             </div>
             <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-400">
                   <Clock size={18} />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-text-main mb-1 uppercase tracking-[0.15em]">Auto-Scaling</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed font-medium">Your meeting capacity resets automatically at the start of each billing cycle.</p>
                </div>
             </div>
          </div>

          <div className="mt-12 pt-8 border-t border-brand-border/60 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300">
             <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-text-muted" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">PCI-DSS Secure Transmission Enabled</span>
             </div>
             <div className="flex gap-8 grayscale hover:grayscale-0 transition-all duration-300">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
             </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default BillingPage;
