export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedAddons?: {
    groupTitle: string;
    options: {
      name: string;
      price: number;
    }[];
  }[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  deliveryAddress: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isLink?: boolean;
  href?: string;
  onClick?: () => void;
}

export interface Address {
  _id: string;
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
  additionalDirections?: string;
  landmark?: string;
}

export interface EligibleOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
}

export interface ReviewFormData {
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
  images: File[];
}
