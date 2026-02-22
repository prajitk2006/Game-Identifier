import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MealPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';

const MealPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    if (id) {
      loadMealPlan();
    }
  }, [id]);

  const loadMealPlan = async () => {
    try {
      const response = await api.getMealPlan(id!);
      setMealPlan(response.data);
    } catch (error) {
      console.error('Error loading meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!deliveryDate) {
      alert('Please select a delivery date');
      return;
    }

    try {
      setOrdering(true);
      await api.createOrder({
        items: [{
          mealPlan: mealPlan!._id,
          quantity: 1,
          price: mealPlan!.price
        }],
        deliveryDate,
        deliveryAddress: deliveryAddress.street ? deliveryAddress : undefined
      });
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Meal plan not found.</p>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-primary-600 hover:text-primary-700"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">{mealPlan.name}</h1>
        <p className="text-gray-600 text-lg mb-6">{mealPlan.description}</p>
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-3xl font-bold text-primary-600">
              {mealPlan.price > 0 ? `$${mealPlan.price}` : 'Free'}
            </span>
          </div>
          {user && (
            <button
              onClick={handleOrder}
              disabled={ordering}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {ordering ? 'Placing Order...' : 'Order Now'}
            </button>
          )}
        </div>

        {user && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={deliveryAddress.zipCode}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Weekly Meal Schedule</h2>
        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const dayMeals = mealPlan.meals.find(m => m.day === day);
            if (!dayMeals) return null;

            return (
              <div key={day} className="border-b pb-6 last:border-b-0">
                <h3 className="text-xl font-semibold mb-4">{day}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Breakfast</h4>
                    <p className="text-gray-700 mb-1">{dayMeals.breakfast.name}</p>
                    <p className="text-sm text-gray-500">
                      {dayMeals.breakfast.calories} cal | P: {dayMeals.breakfast.protein}g | C: {dayMeals.breakfast.carbs}g | F: {dayMeals.breakfast.fats}g
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Lunch</h4>
                    <p className="text-gray-700 mb-1">{dayMeals.lunch.name}</p>
                    <p className="text-sm text-gray-500">
                      {dayMeals.lunch.calories} cal | P: {dayMeals.lunch.protein}g | C: {dayMeals.lunch.carbs}g | F: {dayMeals.lunch.fats}g
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Dinner</h4>
                    <p className="text-gray-700 mb-1">{dayMeals.dinner.name}</p>
                    <p className="text-sm text-gray-500">
                      {dayMeals.dinner.calories} cal | P: {dayMeals.dinner.protein}g | C: {dayMeals.dinner.carbs}g | F: {dayMeals.dinner.fats}g
                    </p>
                  </div>
                </div>
                {dayMeals.snacks && dayMeals.snacks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Snacks</h4>
                    <div className="flex flex-wrap gap-2">
                      {dayMeals.snacks.map((snack, index) => (
                        <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded text-sm">
                          {snack.name} ({snack.calories} cal)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetails;

