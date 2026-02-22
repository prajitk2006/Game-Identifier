import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../services/api';
import { API_CONFIG } from '../config/api';
import { MealPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';

const MealPlans: React.FC = () => {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      const response = user
        ? await api.getMealPlans()
        : await axios.get(`${API_CONFIG.API_URL}/meal-plans/public`);
      setMealPlans(response.data);
    } catch (error) {
      console.error('Error loading meal plans:', error);
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
      <h1 className="text-3xl font-bold mb-8">Meal Plans</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold text-primary-600">
                {plan.price > 0 ? `$${plan.price}` : 'Free'}
              </span>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                {plan.meals.length} days of meals included
              </p>
            </div>
            <Link
              to={`/meal-plans/${plan._id}`}
              className="block w-full bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {mealPlans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No meal plans available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default MealPlans;
