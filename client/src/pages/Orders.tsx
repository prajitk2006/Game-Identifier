import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { useSocket } from '../contexts/SocketContext';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('order-created', (order: Order) => {
        setOrders(prev => [order, ...prev]);
      });

      socket.on('order-updated', (data: { orderId: string; status: string }) => {
        setOrders(prev =>
          prev.map(order =>
            order._id === data.orderId ? { ...order, status: data.status as any } : order
          )
        );
      });

      return () => {
        socket.off('order-created');
        socket.off('order-updated');
      };
    }
  }, [socket]);

  const loadOrders = async () => {
    try {
      const response = await api.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.cancelOrder(orderId);
      await loadOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'out-for-delivery':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link
            to="/meal-plans"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition inline-block"
          >
            Browse Meal Plans
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      {item.quantity}x {item.mealPlan.name} - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {order.deliveryAddress && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">Delivery Address:</h4>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Delivery Date:</span>{' '}
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <Link
                  to={`/orders/${order._id}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Details →
                </Link>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

