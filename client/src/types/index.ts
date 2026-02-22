export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'gym-member' | 'regular-customer';
  membershipPlan?: string;
  membershipExpiry?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  mealPlanIncluded: boolean;
  discount: number;
  isActive: boolean;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DayMeals {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
}

export interface MealPlan {
  _id: string;
  name: string;
  description: string;
  meals: DayMeals[];
  targetAudience: 'gym-member' | 'regular-customer' | 'all';
  price: number;
  isActive: boolean;
}

export interface OrderItem {
  mealPlan: MealPlan;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

