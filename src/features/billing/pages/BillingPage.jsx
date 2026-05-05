import React from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { CreditCard } from 'lucide-react';
import EmptyState from '../../../components/shared/EmptyState';

const BillingPage = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-gray-500">Manage your payment methods and subscription plan.</p>
      </div>
      <EmptyState 
        icon={CreditCard}
        title="Billing Service"
        description="Subscription management is coming soon to your workspace."
      />
    </AppLayout>
  );
};

export default BillingPage;
