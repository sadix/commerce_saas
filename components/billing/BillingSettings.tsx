'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';

interface SubscriptionInfo {
  plan: string;
  planName: string;
  status: string;
  provider: 'STRIPE' | 'SENEPAY' | null;
  locked: boolean;
  lockedReason: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    maxShops: number | null;
    maxProductsPerShop: number | null;
    themes: string[];
  };
}

export function BillingSettings() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    fetch('/api/billing/subscription')
      .then((res) => res.json())
      .then(setInfo)
      .catch((error) => console.error('Failed to load subscription info:', error));
  }, []);

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      if (!response.ok) throw new Error('Could not open billing portal');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Could not open the billing portal. Please try again.');
      setLoadingPortal(false);
    }
  };

  if (!info) {
    return <p className="text-sm text-gray-500">Loading subscription…</p>;
  }

  const daysLeftInTrial =
    info.status === 'TRIALING' && info.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(info.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : null;

  return (
    <div className="space-y-3">
      {info.locked && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{info.lockedReason}</p>
        </div>
      )}

      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{info.planName} plan</h3>
            <p className="text-sm text-gray-600 mt-1">
              Status: <span className="capitalize">{info.status.toLowerCase().replace('_', ' ')}</span>
              {info.cancelAtPeriodEnd && ' (cancels at period end)'}
            </p>
            {daysLeftInTrial !== null && (
              <p className="text-sm text-gray-500">
                {daysLeftInTrial > 0 ? `${daysLeftInTrial} day(s) left in your free trial` : 'Trial ended'}
              </p>
            )}
            {info.currentPeriodEnd && (
              <p className="text-sm text-gray-500">
                {info.provider === 'SENEPAY' ? 'Renewal due' : 'Renews'}{' '}
                {new Date(info.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          {info.provider === 'STRIPE' && (
            <button
              onClick={handleManageBilling}
              disabled={loadingPortal}
              className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Manage billing
            </button>
          )}
        </div>

        <div className="flex gap-4 text-xs text-gray-500 pt-2 border-t">
          <span>Shops: {info.limits.maxShops ?? 'Unlimited'}</span>
          <span>Products/shop: {info.limits.maxProductsPerShop ?? 'Unlimited'}</span>
          <span>Themes: {info.limits.themes.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}
