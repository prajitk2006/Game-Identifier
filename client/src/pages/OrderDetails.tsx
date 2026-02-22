import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { useSocket } from '../contexts/SocketContext';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  useEffect(() => {
    if (socket && order) {
      socket.on('order-updated', (data: { orderId: string; status: string }) => {
        if (data.orderId === order._id) {
          setOrder(prev => prev ? { ...prev, status: data.status as any } : null);
        }
      });

      return () => {
        socket.off('order-updated');
      };
    }
  }, [socket, order]);

  const loadOrder = async () => {
    try {
      const response = await api.getOrder(id!);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
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

  const getStatusSteps = () => {
    const steps = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];
    const currentIndex = steps.indexOf(order!.status);
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-primary-600 hover:text-primary-700"
      >
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order._id.slice(-6)}</h1>
            <p className="text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status.replace('-', ' ').toUpperCase()}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <div className="flex items-center justify-between">
            {getStatusSteps().map((item, index) => (
              <div key={item.step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.completed
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {item.completed ? '✓' : index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center capitalize">
                    {item.step.replace('-', ' ')}
                  </p>
                </div>
                {index < getStatusSteps().length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      item.completed ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.mealPlan.name}</h3>
                    <p className="text-gray-600 text-sm">{item.mealPlan.description}</p>
                    <p className="text-gray-500 text-sm mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-lg">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Information */}
        {order.deliveryAddress && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                {order.deliveryAddress.street}
              </p>
              <p className="text-gray-700">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
              </p>
              <p className="text-gray-600 mt-2">
                <span className="font-semibold">Delivery Date:</span>{' '}
                {new Date(order.deliveryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Payment Status: <span className="font-semibold">{order.paymentStatus}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

