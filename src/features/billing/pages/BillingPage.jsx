import React, { useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  Check, 
  Zap, 
  Shield, 
  Clock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BarChart3,
  Globe,
  Lock,
  Cpu,
  Trophy
} from 'lucide-react';
import { 
  useGetBillingPlanQuery, 
  useCreateCheckoutMutation, 
  useVerifySubscriptionMutation 
} from '../api/billingApi';
import { useSelector } from 'react-redux';
import { selectUser } from '../../auth/slices/authSlice';
import { toast } from 'react-hot-toast';

const PricingCard = ({ plan, currentPlan, onSelect, isLoading }) => {
  const isCurrent = currentPlan === plan.plan;
  const isPro = plan.plan === 'Pro';
  const isEnterprise = plan.plan === 'Enterprise';

  const features = {
    'Pro': [
      '50 High-Fidelity Meetings',
      'Priority Bot Orchestration',
      'Neural Summary Engine',
      'Advanced Semantic Search',
      'Priority Email Support'
    ],
    'Enterprise': [
      'Unlimited Neural Processing',
      'Custom Bot Infrastructure',
      'Dedicated LLM Instances',
      'Advanced Governance Tools',
      '24/7 Dedicated Manager'
    ]
  };

  const planFeatures = features[plan.plan] || [];

  return (
    <div className={`relative flex flex-col p-10 rounded-[2.5rem] border transition-all duration-500 bg-brand-surface ${isPro ? 'border-brand-primary ring-4 ring-brand-primary/10 shadow-2xl scale-105 z-10' : 'border-brand-border hover:border-brand-primary/20 shadow-lg shadow-black/5'}`}>
      
      {isPro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/30">
          Recommended
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-60">{plan.name}</h3>
           {isEnterprise && <Trophy size={14} className="text-amber-500" />}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold tracking-tight text-text-main">₹{Math.floor(plan.price)}</span>
          <span className="text-xs font-medium text-text-muted opacity-50">/mo</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-10">
        {planFeatures.map((feature, i) => (
          <div key={i} className="flex items-center gap-3 group/item">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isPro ? 'bg-brand-primary/10 group-hover/item:bg-brand-primary/20' : 'bg-brand-highlight group-hover/item:bg-brand-highlight/20'}`}>
              <Check className={`w-3 h-3 ${isPro ? 'text-brand-primary' : 'text-text-muted'}`} />
            </div>
            <span className="text-xs font-semibold text-text-muted transition-colors group-hover/item:text-text-main tracking-tight">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelect(plan.plan)}
        disabled={isCurrent || isLoading}
        className={`w-full py-4 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          isCurrent 
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
            : isPro 
              ? 'bg-brand-primary text-white hover:bg-opacity-90 shadow-xl shadow-brand-primary/20' 
              : 'bg-text-main text-brand-surface hover:opacity-90'
        }`}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin mx-auto" />
        ) : isCurrent ? (
          'Current Strategic Tier'
        ) : (
          `Upgrade to ${plan.name}`
        )}
      </button>
    </div>
  );
};

const UsageMetric = ({ label, value, max, unit }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl shadow-sm flex-1">
       <div className="flex justify-between items-start mb-4">
          <div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 mb-1">{label}</p>
             <h4 className="text-xl font-bold text-text-main tracking-tight">{value} <span className="text-xs font-medium text-text-muted opacity-50">/ {max === -1 ? '∞' : max} {unit}</span></h4>
          </div>
          <div className="p-2 bg-brand-primary/10 rounded-lg">
             <BarChart3 className="text-brand-primary" size={16} />
          </div>
       </div>
       <div className="h-1.5 w-full bg-brand-highlight rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
            style={{ width: `${max === -1 ? 0 : percentage}%` }}
          />
       </div>
    </div>
  );
};

const BillingPage = () => {
  const user = useSelector(selectUser);
  const { data: planRes, isLoading: planLoading } = useGetBillingPlanQuery();
  const [createCheckout, { isLoading: isCreating }] = useCreateCheckoutMutation();
  const [verifySubscription, { isLoading: isVerifying }] = useVerifySubscriptionMutation();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlanName = planRes?.data?.plan || 'Free';
  const availablePlans = planRes?.data?.available_plans || [];
  const meetingsUsed = planRes?.data?.meetings_used || 0;
  const meetingsLimit = planRes?.data?.meetings_limit || 0;

  const handleSubscribe = async (planName) => {
    try {
      setIsProcessing(true);
      const res = await createCheckout({ plan: planName }).unwrap();
      const { subscription_id, razorpay_key } = res.data;

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
            toast.success('Strategy Upgraded Successfully');
            window.location.reload();
          } catch (err) {
            toast.error('Payment verification failed');
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
      toast.error(err.data?.message || 'Handshake failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (planLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-40 bg-brand-bg">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="mt-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] animate-pulse">Syncing Plan Registry...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-brand-bg transition-colors duration-500">
        <div className="max-w-7xl mx-auto py-16 px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
             <div>
                <h1 className="text-4xl font-bold text-text-main tracking-tight mb-2">Billing & Strategy</h1>
                <p className="text-sm font-medium text-text-muted">Manage your subscription and monitor your neural workspace capacity.</p>
             </div>
             <div className="flex gap-4 w-full md:w-auto">
                <UsageMetric label="Neural Capacity Used" value={meetingsUsed} max={meetingsLimit} unit="Meetings" />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            {availablePlans.map((plan) => (
              <PricingCard 
                key={plan.plan} 
                plan={plan} 
                currentPlan={currentPlanName} 
                onSelect={handleSubscribe}
                isLoading={isProcessing || isCreating || isVerifying}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-brand-border">
             <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                   <Lock className="text-brand-primary" size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-text-main mb-1 uppercase tracking-widest text-[10px]">Secure Processing</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed font-medium">Bank-grade encryption for all financial handshakes and data transmission.</p>
                </div>
             </div>
             <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                   <Shield className="text-purple-500" size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-text-main mb-1 uppercase tracking-widest text-[10px]">Neural Isolation</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed font-medium">Your intelligence nodes are strictly partitioned and accessible only via MFA.</p>
                </div>
             </div>
             <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                   <Clock className="text-emerald-500" size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-text-main mb-1 uppercase tracking-widest text-[10px]">Auto-Scaling</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed font-medium">Your meeting capacity resets automatically at the start of your neural cycle.</p>
                </div>
             </div>
          </div>

          <div className="mt-12 pt-8 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-text-muted" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">PCI-DSS Secure Transmission Enabled</span>
             </div>
             <div className="flex gap-8 grayscale hover:grayscale-0 transition-all">
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
