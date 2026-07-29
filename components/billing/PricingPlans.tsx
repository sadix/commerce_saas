'use client';

import { useState } from 'react';
import { Check, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { PLANS, PlanTier, PLAN_ORDER } from '@/lib/plans';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';



interface PricingPlansProps {
  currentPlan?: PlanTier;
  loggedIn?: boolean;
}

type Provider = 'stripe' | 'senepay';




export   function PricingPlans({ currentPlan = 'FREE', loggedIn }: PricingPlansProps) {
  const [loading, setLoading] = useState<{ plan: PlanTier; provider: Provider } | null>(null);

  //const session = await getServerSession(authOptions);

  
 


  const handleSubscribe = async (plan: PlanTier, provider: Provider) => {
    setLoading({ plan, provider });
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, provider }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Could not start checkout');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert(error instanceof Error ? error.message : 'Could not start checkout');
      setLoading(null);
    }
  };

  const  ChooseProviderAndSubscribePopup = ({ tier, canPayStripe, canPaySenepay }: { tier: PlanTier; canPayStripe: boolean; canPaySenepay: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [canPayStripeState, setCanPayStripe] = useState(canPayStripe);
  const [canPaySenepayState, setCanPaySenepay] = useState(canPaySenepay);
  
  
  //Return un link to login page if the user is not logged in
  if (!loggedIn) {
    return (
      <a
        href="/login"
        className="bg-[#F68B1E] hover:bg-[#e07c18] text-white px-6 py-3 rounded-2xl"
      >
        Subscribe
      </a>
    );
  }

  return(
     <>
      
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#F68B1E] hover:bg-[#e07c18] text-white px-6 py-3 rounded-2xl"
      >
        Subscribe
      </button>
     {isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Choose Payment Provider</h2>
          <div className="flex flex-col space-y-4">
            {canPayStripeState && (
                  <button
                    onClick={() => handleSubscribe(tier, 'stripe')}
                    disabled={loading !== null}
                    className="w-full px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading?.plan === tier && loading.provider === 'stripe' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Pay by card
                  </button>
                )}
                {canPaySenepayState && (
                  <button
                    onClick={() => handleSubscribe(tier, 'senepay')}
                    disabled={loading !== null}
                    className="w-full px-4 py-2 rounded text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading?.plan === tier && loading.provider === 'senepay' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    Wave / Orange Money
                  </button>
                )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 px-4 py-2 rounded text-sm font-medium bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    </>
   

  );
  


 
}

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {PLAN_ORDER.map((tier) => {
        const plan = PLANS[tier];
        const isCurrent = tier === currentPlan;
        const canPayStripe = plan.stripePriceId !== null;
        const canPaySenepay = plan.priceXOF !== null;

        return (
          <Card 
            key={tier}
            className={`rounded-2xl shadow-sm hover:shadow-lg transition text-center border-0 ${
              isCurrent ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200'
            }`}
          >
            <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 ">{plan.name}</h3>
            <p className="text-3xl font-bold break-words">{plan.priceLabel}</p>

            <ul className="mb-6 text-gray-600">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrent && loggedIn ? (
              <button
                disabled
                className="mt-5 px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-500 cursor-default"
              >
                Current plan
              </button>
            ) : !canPayStripe && !canPaySenepay && loggedIn ? (
              <button
                disabled
                className="mt-5 px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-500 cursor-default"
              >
                Included free
              </button>
            ) : (
              <div className="mt-5 space-y-2">
                <ChooseProviderAndSubscribePopup
                  tier={tier}
                  canPayStripe={canPayStripe}
                  canPaySenepay={canPaySenepay}
                />
                {loading && loading.plan === tier && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing {loading.provider === 'stripe' ? 'Stripe' : 'SenePay'} checkout...
                  </div>
                )}
              </div>
            )}
            </CardContent>
          </Card >
        );
      })}
    </div>
  );
}
