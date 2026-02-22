import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MembershipPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';

const MembershipPlans: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [currentMembership, setCurrentMembership] = useState<MembershipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
    loadCurrentMembership();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.getMembershipPlans();
      setPlans(response.data);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMembership = async () => {
    try {
      const response = await api.getCurrentMembership();
      setCurrentMembership(response.data.membership);
    } catch (error) {
      console.error('Error loading membership:', error);
    }
  };

  const handlePurchase = async (planId: string) => {
    try {
      setPurchasing(planId);
      await api.purchaseMembership(planId);
      await loadCurrentMembership();
      alert('Membership purchased successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user?.userType !== 'gym-member') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Membership plans are only available for gym members.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Membership Plans</h1>

      {currentMembership && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          You have an active membership: <strong>{currentMembership.name}</strong>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-lg shadow-lg p-6 border-2 hover:border-primary-500 transition"
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary-600">${plan.price}</span>
              <span className="text-gray-500"> / {plan.duration} days</span>
            </div>
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePurchase(plan._id)}
              disabled={purchasing === plan._id || currentMembership?._id === plan._id}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing === plan._id
                ? 'Processing...'
                : currentMembership?._id === plan._id
                ? 'Current Plan'
                : 'Purchase Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPlans;

