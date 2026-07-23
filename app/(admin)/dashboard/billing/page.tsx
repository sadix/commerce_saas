import { BillingSettings } from '@/components/billing/BillingSettings';
import { PricingPlans } from '@/components/billing/PricingPlans';
import {prisma} from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';



export default async function BillingPage() {
    const auth_session = await getServerSession(authOptions);
    const user = auth_session?.user;
    if (!user) {    
        return (
            <div className="min-h-screen bg-gray-50">
                <p>Unauthorized</p>
            </div>
        );
    }
    const  currentPlan = await prisma.subscription.findUnique({ where: { userId: user.id } });
    return (
       

        <div className="min-h-screen bg-gray-50">
              <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                  <h1 className="text-2xl font-bold">Billing</h1>
                </div>
              </nav>

              <div className="max-w-4xl mx-auto px-4 py-8">
                    <PricingPlans currentPlan={currentPlan?.plan} />
              </div>
        
              <div className="max-w-4xl mx-auto px-4 py-8">
                    <BillingSettings />
            </div>
        
              
              
            </div>
    );
}