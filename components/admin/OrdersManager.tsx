// src/components/admin/OrdersManager.tsx
'use client';

import { useState } from 'react';
import { Package, Eye, Truck, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function OrdersManager({ orders: initialOrders, shopId }: any) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = orders.filter((order: any) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const t = useTranslations('admin.shop_orders.manager');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const response = await fetch(`/api/shops/${shopId}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      setOrders(orders.map((o: any) => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
    }
  };

  const labels: Record<string, string> = {
            all: t('all_orders'),
            pending: t('status_pending'),
            processing: t('status_processing'),
            shipped: t('status_shipped'),
            delivered: t('status_delivered'),
            cancelled: t('status_cancelled')
          };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {labels[status]} ({orders.filter((o: any) => status === 'all' || o.status === status).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('order_list.order_name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('order_list.order_customer')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('order_list.order_date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('order_list.order_items')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('order_list.order_total')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('order_list.order_status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('order_list.order_actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.customer.name}</div>
                  <div className="text-sm text-gray-500">{order.customer.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order._count.items} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  FCFA {order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                  >
                    <option value="pending">{labels.pending}</option>
                    <option value="processing">{labels.processing}</option>
                    <option value="shipped">{labels.shipped}</option>
                    <option value="delivered">{labels.delivered}</option>
                    <option value="cancelled">{labels.cancelled}</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          shopId={shopId}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, shopId }: any) {
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [loading, setLoading] =  useState(false);

  const saveTracking = async () => {
    setLoading(true);
    await fetch(`/api/shops/${shopId}/orders/${order.id}/tracking`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber }),
    });
    setLoading(false);
    window.location.reload();
  };
  const t = useTranslations('admin.shop_orders.manager.order_details');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('order_detail_title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div>
            <h3 className="font-semibold mb-2">{t('order_label')} #{order.orderNumber}</h3>
            <p className="text-sm text-gray-600">
              {t('order_date_label')} {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">{t('order_customer_label')}</h3>
            <p>{order.customer.name}</p>
            <p className="text-sm text-gray-600">{order.customer.email}</p>
            {order.customer.phone && (
              <p className="text-sm text-gray-600">{order.customer.phone}</p>
            )}
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-2">{t('shipping_address_label')}</h3>
            <p>{order.address.firstName} {order.address.lastName}</p>
            <p className="text-sm text-gray-600">{order.address.phone}</p>
            <p className="text-sm text-gray-600">{order.address.address1}</p>
            {order.address.address2 && (
              <p className="text-sm text-gray-600">{order.address.address2}</p>
            )}
            <p className="text-sm text-gray-600">
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
            <p className="text-sm text-gray-600">{order.address.country}</p>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-2">{t('order_items_label')}</h3>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variationName && (
                      <p className="text-sm text-gray-600">{item.variationName}</p>
                    )}
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">FCFA{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>FCFA {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>FCFA {order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax</span>
              <span>FCFA {order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>FCFA {order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Tracking Number */}
          <div>
            <h3 className="font-semibold mb-2">Tracking Number</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={saveTracking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading? t('save_tracking_button_loading') : t('save_tracking_button_label')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}