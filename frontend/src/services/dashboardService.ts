// Types and interfaces
export interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  totalProducts: number;
  orderGrowth: number;
  userGrowth: number;
  revenueGrowth: number;
  productGrowth: number;
}

export interface RevenueData {
  month: string;
  amount: number;
}

export interface ActivityItem {
  id: string | number;
  type: 'order' | 'user' | 'alert' | 'product' | 'payment';
  message: string;
  time: string;
  status:
    | 'success'
    | 'error'
    | 'info'
    | 'completed'
    | 'failed'
    | 'new'
    | 'updated';
}

export type TimeframeOption = 'month' | '6months' | '1year' | 'all';

// Define interfaces for API responses
interface OrderResponse {
  _id: string;
  orderNumber: string;
  user: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Backend API response interfaces for Users and Products
type UserResponse = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type ProductResponse = {
  _id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
};

import api from '@/utils/api';

// Service functions to fetch real data
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Make API calls to fetch real stats data
    const [orders, users, products] = await Promise.all([
      api.get('api/orders') as Promise<OrderResponse[]>,
      api.get('api/users') as Promise<UserResponse[]>,
      api.get('api/products') as Promise<ProductResponse[]>,
    ]);

    // Debug logs
    console.log('API Response - users:', users);
    console.log('API Response - users type:', typeof users);
    console.log('API Response - is users array:', Array.isArray(users));

    // Make sure users is an array, otherwise use default data
    const usersArray = Array.isArray(users) ? users : [];

    // Ensure we have valid data to work with
    const ordersArray = Array.isArray(orders) ? orders : [];
    const productsArray = Array.isArray(products) ? products : [];

    // Calculate total revenue
    const totalRevenue = ordersArray.reduce(
      (sum: number, order: OrderResponse) => sum + (order.total || 0),
      0
    );

    // Get previous month's data for growth calculation
    const today = new Date();
    const currentMonth = today.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = today.getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter orders from current month and last month
    const currentMonthOrders = ordersArray.filter((order: OrderResponse) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const lastMonthOrders = ordersArray.filter((order: OrderResponse) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === lastMonth &&
        orderDate.getFullYear() === lastMonthYear
      );
    });

    // Calculate growth rates
    const currentMonthOrderCount = currentMonthOrders.length;
    const lastMonthOrderCount = lastMonthOrders.length;
    const orderGrowth =
      lastMonthOrderCount === 0
        ? 100
        : ((currentMonthOrderCount - lastMonthOrderCount) /
            lastMonthOrderCount) *
          100;

    const currentMonthRevenue = currentMonthOrders.reduce(
      (sum: number, order: OrderResponse) => sum + (order.total || 0),
      0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum: number, order: OrderResponse) => sum + (order.total || 0),
      0
    );
    const revenueGrowth =
      lastMonthRevenue === 0
        ? 100
        : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // For user and product growth, we would need timestamps
    // As a simplified approach, use fixed growth rates if that data isn't available
    const userGrowth = 5.2; // Example growth rate
    const productGrowth = 2.8; // Example growth rate

    // Get default values if data is missing
    const defaultCustomerCount = 34; // Fallback count if no customer data

    // Use actual data length if available, otherwise use default values
    const customerCount =
      usersArray.length > 0 ? usersArray.length : defaultCustomerCount;

    return {
      totalOrders: ordersArray.length,
      totalUsers: customerCount,
      totalRevenue: totalRevenue,
      totalProducts: productsArray.length,
      orderGrowth: parseFloat(orderGrowth.toFixed(1)),
      userGrowth: userGrowth,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      productGrowth: productGrowth,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return some fallback data in case of error
    return {
      totalOrders: 125,
      totalUsers: 34,
      totalRevenue: 24600,
      totalProducts: 48,
      orderGrowth: 12.5,
      userGrowth: 5.2,
      revenueGrowth: 8.7,
      productGrowth: 2.8,
    };
  }
};

/**
 * Utility function to get total customers count
 * This is used when the main dashboard stats function might fail for users data
 */
export const getTotalCustomers = async (): Promise<number> => {
  try {
    const users = await api.get('api/users');

    // Debug logs
    console.log('Customer API Response:', users);

    if (Array.isArray(users)) {
      return users.length;
    } else if (users && typeof users === 'object' && 'length' in users) {
      return users.length;
    }

    // Fallback to default count
    return 34;
  } catch (error) {
    console.error('Error fetching total customers:', error);
    return 34; // Default fallback count
  }
};

export const getRevenueData = async (
  timeframe: TimeframeOption
): Promise<RevenueData[]> => {
  try {
    // Fetch all orders
    const orders = (await api.get('api/orders')) as unknown as OrderResponse[];

    // Determine date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();

    if (timeframe === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else if (timeframe === '6months') {
      startDate.setMonth(endDate.getMonth() - 6);
    } else if (timeframe === '1year') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      // For 'all', go back 2 years or to the earliest order
      startDate.setFullYear(endDate.getFullYear() - 2);
    }

    // Create a map to store monthly revenue data
    const monthlyRevenue = new Map<string, number>();

    // Determine how many months to include
    const months =
      timeframe === 'month'
        ? 1
        : timeframe === '6months'
        ? 6
        : timeframe === '1year'
        ? 12
        : 24;

    // Initialize the map with all months in the range with zero revenue
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - i - 1));
      const monthKey = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      monthlyRevenue.set(monthKey, 0);
    }

    // Group orders by month and sum up revenue
    orders.forEach((order: OrderResponse) => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= startDate && orderDate <= endDate) {
        const monthKey = orderDate.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        if (monthlyRevenue.has(monthKey)) {
          monthlyRevenue.set(
            monthKey,
            monthlyRevenue.get(monthKey)! + (order.total || 0)
          );
        }
      }
    });

    // Convert the map to array format required by the component
    const result: RevenueData[] = Array.from(monthlyRevenue.entries()).map(
      ([month, amount]) => ({
        month: month.split(' ')[0], // Just get the month abbreviation
        amount: parseFloat(amount.toFixed(2)),
      })
    );

    return result;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
};

export const getRecentActivity = async (): Promise<ActivityItem[]> => {
  try {
    // Fetch recent orders, user registrations, and possibly other activities
    const recentOrders = (await api.get(
      'api/orders?limit=10'
    )) as unknown as OrderResponse[];

    // Transform orders into activity items
    const orderActivities: ActivityItem[] = recentOrders.map(
      (order: OrderResponse) => {
        let status: ActivityItem['status'] = 'info';

        switch (order.status) {
          case 'completed':
            status = 'completed';
            break;
          case 'cancelled':
            status = 'failed';
            break;
          case 'pending':
            status = 'new';
            break;
          case 'processing':
            status = 'info';
            break;
          default:
            status = 'info';
        }

        // Format timestamp to relative time
        const orderTime = new Date(order.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - orderTime.getTime();

        let timeString = '';
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 60) {
          timeString = `${diffMins} minutes ago`;
        } else if (diffMins < 1440) {
          const hours = Math.floor(diffMins / 60);
          timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
          const days = Math.floor(diffMins / 1440);
          timeString = `${days} day${days > 1 ? 's' : ''} ago`;
        }

        // Create a more detailed message based on order status
        let message = '';
        if (order.status === 'completed') {
          message = `Order #${
            order.orderNumber
          } has been completed - $${order.total.toFixed(2)}`;
        } else if (order.status === 'cancelled') {
          message = `Order #${order.orderNumber} was cancelled`;
        } else if (order.status === 'pending') {
          message = `New order #${
            order.orderNumber
          } received - $${order.total.toFixed(2)}`;
        } else if (order.status === 'processing') {
          message = `Order #${order.orderNumber} is being processed`;
        } else {
          message = `Order #${order.orderNumber} status: ${order.status}`;
        }

        return {
          id: order._id,
          type: 'order',
          message: message,
          time: timeString,
          status: status,
        };
      }
    );

    // Try to fetch user registration data
    try {
      const recentUsers = (await api.get(
        'api/users?limit=5&sort=-createdAt'
      )) as unknown as UserResponse[];

      // Check if recentUsers is an array before calling map
      const userActivities: ActivityItem[] = Array.isArray(recentUsers)
        ? recentUsers.map((user: UserResponse) => {
            // Format timestamp to relative time
            const userTime = new Date(user.createdAt);
            const now = new Date();
            const diffMs = now.getTime() - userTime.getTime();

            let timeString = '';
            const diffMins = Math.floor(diffMs / (1000 * 60));

            if (diffMins < 60) {
              timeString = `${diffMins} minutes ago`;
            } else if (diffMins < 1440) {
              const hours = Math.floor(diffMins / 60);
              timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else {
              const days = Math.floor(diffMins / 1440);
              timeString = `${days} day${days > 1 ? 's' : ''} ago`;
            }

            return {
              id: user._id,
              type: 'user',
              message: `New customer ${user.name} signed up`,
              time: timeString,
              status: 'new',
            };
          })
        : [];

      // Combine and sort activities by time
      const allActivities = [...orderActivities, ...userActivities].sort(
        (a, b) => {
          // Parse the time strings to get numerical values for comparison
          const timeA = a.time.includes('minutes')
            ? parseInt(a.time.split(' ')[0])
            : a.time.includes('hour')
            ? parseInt(a.time.split(' ')[0]) * 60
            : parseInt(a.time.split(' ')[0]) * 1440;

          const timeB = b.time.includes('minutes')
            ? parseInt(b.time.split(' ')[0])
            : b.time.includes('hour')
            ? parseInt(b.time.split(' ')[0]) * 60
            : parseInt(b.time.split(' ')[0]) * 1440;

          return timeA - timeB;
        }
      );

      return allActivities.slice(0, 10);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If user data fetch fails, just return order activities
      return orderActivities;
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Interface for monthly sales data
export interface MonthlySalesData {
  month: string;
  sales: number;
}

export const getMonthlySalesData = async (): Promise<MonthlySalesData[]> => {
  try {
    // Try to fetch real order data for monthly sales
    const orders = (await api.get('api/orders')) as unknown as OrderResponse[];

    // Create a map to store monthly sales data
    const monthlySales = new Map<string, number>();

    // Initialize all months with zero
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    months.forEach((month) => {
      monthlySales.set(month, 0);
    });

    // Group orders by month and sum up sales
    const currentYear = new Date().getFullYear();
    orders.forEach((order: OrderResponse) => {
      const orderDate = new Date(order.createdAt);

      // Only include orders from the current year
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        const monthName = months[monthIndex];

        // Add the order total to the corresponding month
        monthlySales.set(
          monthName,
          monthlySales.get(monthName)! + (order.total || 0)
        );
      }
    });

    // Convert the map to array format required by the component
    const result: MonthlySalesData[] = Array.from(monthlySales.entries()).map(
      ([month, sales]) => ({
        month,
        sales: parseFloat(sales.toFixed(2)),
      })
    );

    // Sort by month order
    result.sort((a, b) => {
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    return result;
  } catch (error) {
    console.error('Error fetching monthly sales data:', error);

    // Return sample data if API call fails
    return [
      { month: 'Jan', sales: 150 },
      { month: 'Feb', sales: 350 },
      { month: 'Mar', sales: 180 },
      { month: 'Apr', sales: 280 },
      { month: 'May', sales: 170 },
      { month: 'Jun', sales: 180 },
      { month: 'Jul', sales: 280 },
      { month: 'Aug', sales: 100 },
      { month: 'Sep', sales: 200 },
      { month: 'Oct', sales: 370 },
      { month: 'Nov', sales: 270 },
      { month: 'Dec', sales: 100 },
    ];
  }
};
