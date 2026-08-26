// src/components/admin/CustomersManager.tsx
'use client';

import { useState } from 'react';
import { User, Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';

export function CustomersManager({ customers: initialCustomers, shopId }: any) {
  const [customers] = useState(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold">{customers.length}</p>
            </div>
            <User className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold">
                {customers.reduce((sum: number, c: any) => sum + c._count.orders, 0)}
              </p>
            </div>
            <ShoppingBag className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold">
                FCFA {customers.reduce((sum: number, c: any) => 
                  sum + c.orders.reduce((s: number, o: any) => s + o.total, 0), 0
                ).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer: any) => {
              const totalSpent = customer.orders.reduce((sum: number, o: any) => sum + o.total, 0);
              
              return (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer._count.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    FCFA {totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No customers found
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          shopId={shopId}
        />
      )}
    </div>
  );
}

function CustomerDetailModal({ customer, onClose, shopId }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

 

  const fetchCustomerData = async () => {
    const ordersRes = await fetch(`/api/customer/orders?customerId=${customer.id}`);
    if (ordersRes.ok) {
      setOrders(await ordersRes.json());
    }

    const addressesRes = await fetch(`/api/customer/addresses?customerId=${customer.id}`);
    if (addressesRes.ok) {
      setAddresses(await addressesRes.json());
    }
  };

   useState(() => {
    fetchCustomerData();
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Customer Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">Contact Information</h3>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-gray-600">{customer.email}</p>
            {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
            <p className="text-sm text-gray-500 mt-2">
              Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Order History */}
          <div>
            <h3 className="font-semibold mb-2">Order History ({orders.length})</h3>
            {orders.length > 0 ? (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">FCFA {order.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No orders yet</p>
            )}
          </div>

          {/* Saved Addresses */}
          <div>
            <h3 className="font-semibold mb-2">Saved Addresses ({addresses.length})</h3>
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((address: any) => (
                  <div key={address.id} className="text-sm border p-3 rounded">
                    <p className="font-medium">
                      {address.firstName} {address.lastName}
                      {address.isDefault && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600">{address.address1}</p>
                    <p className="text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No saved addresses</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}