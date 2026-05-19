// src/app/store/[subdomain]/checkout/page.tsx
'use client';

import { useCart } from '@/contexts/CartContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Truck, MapPin } from 'lucide-react';
import { rootDomain,protocol  } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  //console.log('showAddressForm:', showAddressForm);

  //console.log('CheckoutPage render - isAuthenticated:', isAuthenticated, 'items:', items);
  const params = useParams();
  const{ subdomain } =  params;

  useEffect(() => {
    /* if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    } 

    if (items.length === 0) {
      router.push('/');
      return;
    }*/

    fetchAddresses();
  }, [isAuthenticated, items]);

  const fetchAddresses = async () => {
    const response = await fetch(`/api/customer/addresses?customerId=${customer?.id}`);
    if (response.ok) {
      const data = await response.json();
      setAddresses(data);
      const defaultAddr = data.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    // Return button to login or home page
    return (<div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Your cart is empty or you are not logged in.</h2>
      <div className="space-x-4">
        <button
          onClick={() => router.push(`/account/login?redirect=/checkout`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
        <button
          onClick={() => router.push(`/`)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Home
        </button>
      </div>
    </div>);
  }

  return (  
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>

              {addresses.length === 0 && !showAddressForm? (
                <div>
                  <p className="text-gray-600 mb-4">No saved addresses</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Address
                  </button>
               
                </div>
              ) : showAddressForm ? (
                <div>
                <AddressForm
                  customerId={customer!.id}
                  onSave={() => {
                    setShowAddressForm(false);
                    fetchAddresses();
                  }}
                  onCancel={() => setShowAddressForm(false)}
                />
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer ${
                        selectedAddress === address.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mr-3"
                      />
                      <div className="inline-block">
                        <p className="font-semibold">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{address.address1}</p>
                        {address.address2 && (
                          <p className="text-sm text-gray-600">{address.address2}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        {address.phone && (
                          <p className="text-sm text-gray-600">{address.phone}</p>
                        )}
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add New Address
                  </button>
          
                  
                
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  customerId={customer!.id}
                  addressId={selectedAddress}
                  total={total}
                  items={items}
                  onSuccess={() => {
                    clearCart();
                    router.push(`/account?tab=orders`);
                  }}
                />
              </Elements>

              {/* Alternative Wave Mobile Payment */}
              {/* {selectedAddress && wavemobilePaymentForm(customer!.id, selectedAddress, total, items)} */} 
              <WavemobilePaymentForm customerId={customer!.id} addressId={selectedAddress} total={total} subdomain={subdomain} items={items} />


            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
  );
}

function PaymentForm({ customerId, addressId, total, items, onSuccess }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !addressId) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          addressId,
          items,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, orderId } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        // Confirm order
        await fetch('/api/checkout/confirm-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paymentIntentId: paymentIntent.id }),
        });

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="border rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || !addressId}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

function AddressForm({ customerId, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/customer/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, ...formData }),
    });

    if (response.ok) {
      onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
          className="px-4 py-2 border rounded-lg"
        />
      </div>
      <input
        type="text"
        placeholder="Address Line 1"
        value={formData.address1}
        onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
        required
        className="w-full px-4 py-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="Address Line 2 (Optional)"
        value={formData.address2}
        onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
      />
      <div className="grid grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          required
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="State"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="ZIP"
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          required
          className="px-4 py-2 border rounded-lg"
        />
      </div>
      <input
        type="tel"
        placeholder="Phone (Optional)"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
      />
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function WavemobilePaymentForm({ customerId, addressId, total, items, subdomain, onSuccess }: any) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const api_key = "wave_sn_prod_1hqS5Q0fxhRyBmZtANbZxb2zK1LVm5UA";
    const domain = `${protocol}${subdomain}.${rootDomain}`;

    const checkout_params = {
      amount: total,
      currency: "XOF",
      error_url: `${protocol}://${subdomain}.${rootDomain}/checkout/error`,
      success_url: `${protocol}://${subdomain}.${rootDomain}/checkout/success`,
    };

    const response = await fetch('/api/checkout/create-wave-payment-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkout_params),
    });
    if (response.ok){
      // You can now use the response to redirect the user to the Wave app
      const response_data = await response.json();
      const wave_launch_url = response_data.wave_launch_url;
      window.location.href = wave_launch_url;
    }else{
      console.error("Failed to create Wave checkout session");
    }
  }
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Or Pay with Wave Mobile</h3>
      <form onSubmit={handleSubmit}>
        <div className='flex items-center justify-center'>
          
          <img
          src={`${protocol}://${rootDomain}/images/wave.png`}
          alt="Wave Logo"
          width={50}
          height={50}
        />

        </div>
        
        <div className='mt-2 mb-4'>
          <label >Complete Name</label>
          <input type="text" name="customer_name" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div className='mt-2 mb-4'>
          <label >Phone number</label>
          <input type="text" name="customer_phone" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <button
        type="submit"
        disabled={ loading }
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>

      </form>

    </div>
  );
} 


function WavemobilePaymentFormWOApi({ customerId, addressId, total, items, subdomain, onSuccess }: any) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const api_key = "wave_sn_prod_1hqS5Q0fxhRyBmZtANbZxb2zK1LVm5UA";
    const domain = `${protocol}${subdomain}.${rootDomain}`;

    const checkout_params = {
      amount: total,
      currency: "XOF",
      error_url: `${protocol}://${subdomain}.${rootDomain}/checkout/error`,
      success_url: `${protocol}://${subdomain}.${rootDomain}/checkout/success`,
    };

    const payment_utl = "https://pay.wave.com/m/M_sn_36kJZkh0MiqA/c/sn/?amount=" + total;

    // You can now use the response to redirect the user to the Wave app
    window.location.href = payment_utl;
  }
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Or Pay with Wave Mobile</h3>
      <form onSubmit={handleSubmit}>
        <div className='flex items-center justify-center'>
          
          <img
          src={`${protocol}://${rootDomain}/images/wave.png`}
          alt="Wave Logo"
          width={50}
          height={50}
        />

        </div>
        
        <div className='mt-2 mb-4'>
          <label >Complete Name</label>
          <input type="text" name="customer_name" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div className='mt-2 mb-4'>
          <label >Phone number</label>
          <input type="text" name="customer_phone" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <button
        type="submit"
        disabled={ loading }
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>

      </form>

    </div>
  );
} 
                   