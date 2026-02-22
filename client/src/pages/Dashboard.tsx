import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../services/api';
import { MembershipPlan, MealPlan, Order } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [membership, setMembership] = useState<MembershipPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('order-created', (order: Order) => {
        setRecentOrders(prev => [order, ...prev]);
      });

      socket.on('order-updated', (data: { orderId: string; status: string }) => {
        setRecentOrders(prev =>
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [membershipRes, mealPlanRes, ordersRes] = await Promise.all([
        api.getCurrentMembership().catch(() => ({ data: { membership: null } })),
        api.getAssignedMealPlan().catch(() => ({ data: null })),
        api.getMyOrders().catch(() => ({ data: [] }))
      ]);

      setMembership(membershipRes.data.membership);
      setMealPlan(mealPlanRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.name}!</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Membership Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Membership Status</h2>
          {membership ? (
            <div>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">{membership.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                {membership.description}
              </p>
              {user?.userType === 'gym-member' && (
                <Link
                  to="/memberships"
                  className="mt-4 inline-block text-primary-600 hover:text-primary-700"
                >
                  View Plans →
                </Link>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">No active membership</p>
              {user?.userType === 'gym-member' && (
                <Link
                  to="/memberships"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Browse Plans
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Meal Plan Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Meal Plan</h2>
          {mealPlan ? (
            <div>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">{mealPlan.name}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {mealPlan.description}
              </p>
              <Link
                to="/meal-plans"
                className="text-primary-600 hover:text-primary-700"
              >
                View Details →
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">No meal plan assigned</p>
              <Link
                to="/meal-plans"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Browse Meal Plans
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link
            to="/orders"
            className="text-primary-600 hover:text-primary-700"
          >
            View All →
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No orders yet. <Link to="/meal-plans" className="text-primary-600">Start ordering!</Link></p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

