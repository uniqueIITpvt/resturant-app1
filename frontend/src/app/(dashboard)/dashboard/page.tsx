'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Layers,
  Calendar,
  ArrowUp,
  ArrowDown,
  Package,
  ChevronDown,
} from 'lucide-react';
import {
  getDashboardStats,
  getRevenueData,
  getRecentActivity,
  getMonthlySalesData,
  getTotalCustomers,
  type DashboardStats,
  type RevenueData,
  type ActivityItem,
  type TimeframeOption,
  type MonthlySalesData,
} from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';
import AdvancedRevenueChart from '@/components/dashboard/AdvancedRevenueChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import MonthlySalesChart from '@/components/dashboard/MonthlySalesChart';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0,
    orderGrowth: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    productGrowth: 0,
  });

  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('6months');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, revenue, activity, salesData, customers] =
          await Promise.all([
            getDashboardStats(),
            getRevenueData(timeframe),
            getRecentActivity(),
            getMonthlySalesData(),
            getTotalCustomers(),
          ]);

        setStats(statsData);
        setRevenueData(revenue);
        setRecentActivity(activity.slice(0, 4));
        setMonthlySales(salesData);
        setTotalCustomers(customers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2'>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0'>
            {user?.role === 'superadmin'
              ? 'Super Admin Dashboard'
              : 'Admin Dashboard'}
          </h1>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600'></div>
          </div>
        ) : (
          <div className='space-y-4 sm:space-y-6'>
            {/* Stats Grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
              {/* Total Orders */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5 transition-all hover:shadow-md'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <h3 className='text-xs sm:text-sm font-medium text-gray-500'>
                    Total Orders
                  </h3>
                  <div className='p-1.5 sm:p-2 bg-blue-50 rounded-lg'>
                    <ShoppingBag className='h-4 w-4 sm:h-5 sm:w-5 text-blue-500' />
                  </div>
                </div>
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                      {stats.totalOrders}
                    </p>
                    <div className='flex items-center mt-1'>
                      <div
                        className={`flex items-center ${
                          stats.orderGrowth >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        } text-xs font-medium`}
                      >
                        {stats.orderGrowth >= 0 ? (
                          <ArrowUp className='h-3 w-3 mr-1' />
                        ) : (
                          <ArrowDown className='h-3 w-3 mr-1' />
                        )}
                        <span>{Math.abs(stats.orderGrowth)}%</span>
                      </div>
                      <span className='text-xs text-gray-500 ml-1 hidden xs:inline'>
                        from last month
                      </span>
                    </div>
                  </div>
                  <Link href='/dashboard/orders' className='hidden sm:block'>
                    <button className='text-xs text-blue-600 hover:text-blue-700 font-medium'>
                      View
                    </button>
                  </Link>
                </div>
              </div>

              {/* Total Customers */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5 transition-all hover:shadow-md'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <h3 className='text-xs sm:text-sm font-medium text-gray-500'>
                    Total Customers
                  </h3>
                  <div className='p-1.5 sm:p-2 bg-purple-50 rounded-lg'>
                    <Users className='h-4 w-4 sm:h-5 sm:w-5 text-purple-500' />
                  </div>
                </div>
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                      {totalCustomers}
                    </p>
                    <div className='flex items-center mt-1'>
                      <div
                        className={`flex items-center ${
                          stats.userGrowth >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        } text-xs font-medium`}
                      >
                        {stats.userGrowth >= 0 ? (
                          <ArrowUp className='h-3 w-3 mr-1' />
                        ) : (
                          <ArrowDown className='h-3 w-3 mr-1' />
                        )}
                        <span>{Math.abs(stats.userGrowth)}%</span>
                      </div>
                      <span className='text-xs text-gray-500 ml-1 hidden xs:inline'>
                        from last month
                      </span>
                    </div>
                  </div>
                  <Link href='/dashboard/customers' className='hidden sm:block'>
                    <button className='text-xs text-purple-600 hover:text-purple-700 font-medium'>
                      View
                    </button>
                  </Link>
                </div>
              </div>

              {/* Total Revenue */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5 transition-all hover:shadow-md'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <h3 className='text-xs sm:text-sm font-medium text-gray-500'>
                    Total Revenue
                  </h3>
                  <div className='p-1.5 sm:p-2 bg-green-50 rounded-lg'>
                    <DollarSign className='h-4 w-4 sm:h-5 sm:w-5 text-green-500' />
                  </div>
                </div>
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <div className='flex items-center mt-1'>
                      <div
                        className={`flex items-center ${
                          stats.revenueGrowth >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        } text-xs font-medium`}
                      >
                        {stats.revenueGrowth >= 0 ? (
                          <ArrowUp className='h-3 w-3 mr-1' />
                        ) : (
                          <ArrowDown className='h-3 w-3 mr-1' />
                        )}
                        <span>{Math.abs(stats.revenueGrowth)}%</span>
                      </div>
                      <span className='text-xs text-gray-500 ml-1 hidden xs:inline'>
                        from last month
                      </span>
                    </div>
                  </div>
                  <Link href='/dashboard/orders' className='hidden sm:block'>
                    <button className='text-xs text-green-600 hover:text-green-700 font-medium'>
                      View
                    </button>
                  </Link>
                </div>
              </div>

              {/* Total Products */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5 transition-all hover:shadow-md'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <h3 className='text-xs sm:text-sm font-medium text-gray-500'>
                    Total Products
                  </h3>
                  <div className='p-1.5 sm:p-2 bg-amber-50 rounded-lg'>
                    <Package className='h-4 w-4 sm:h-5 sm:w-5 text-amber-500' />
                  </div>
                </div>
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                      {stats.totalProducts}
                    </p>
                    <div className='flex items-center mt-1'>
                      <div
                        className={`flex items-center ${
                          stats.productGrowth >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        } text-xs font-medium`}
                      >
                        {stats.productGrowth >= 0 ? (
                          <ArrowUp className='h-3 w-3 mr-1' />
                        ) : (
                          <ArrowDown className='h-3 w-3 mr-1' />
                        )}
                        <span>{Math.abs(stats.productGrowth)}%</span>
                      </div>
                      <span className='text-xs text-gray-500 ml-1 hidden xs:inline'>
                        from last month
                      </span>
                    </div>
                  </div>
                  <Link href='/dashboard/products' className='hidden sm:block'>
                    <button className='text-xs text-amber-600 hover:text-amber-700 font-medium'>
                      View
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
              {/* Monthly Sales Chart */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 lg:col-span-2'>
                <div className='h-72 sm:h-80'>
                  <MonthlySalesChart data={monthlySales} />
                </div>
              </div>

              {/* Recent Activity */}
              <RecentActivity initialData={recentActivity} maxItems={4} />
            </div>

            {/* Revenue Trend Chart */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5'>
              <div className='flex flex-col xs:flex-row xs:items-center xs:justify-between mb-4'>
                <h3 className='text-base font-semibold text-gray-900 mb-2 xs:mb-0'>
                  Revenue Trend
                </h3>

                {/* Timeframe Dropdown */}
                <div className='relative z-10'>
                  <button
                    onClick={() =>
                      setShowTimeframeDropdown(!showTimeframeDropdown)
                    }
                    className='flex items-center justify-between w-full xs:w-36 sm:w-40 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg'
                  >
                    <span>
                      {timeframe === 'month'
                        ? 'Last Month'
                        : timeframe === '6months'
                        ? 'Last 6 Months'
                        : timeframe === '1year'
                        ? 'Last Year'
                        : 'All Time'}
                    </span>
                    <ChevronDown className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 ml-1' />
                  </button>

                  {showTimeframeDropdown && (
                    <div className='absolute left-0 mt-1 w-36 sm:w-40 bg-white border border-gray-200 rounded-lg shadow-lg'>
                      <ul className='py-1'>
                        <li
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-50 ${
                            timeframe === 'month'
                              ? 'bg-amber-50 text-amber-600'
                              : ''
                          }`}
                          onClick={() => {
                            setTimeframe('month');
                            setShowTimeframeDropdown(false);
                          }}
                        >
                          Last Month
                        </li>
                        <li
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-50 ${
                            timeframe === '6months'
                              ? 'bg-amber-50 text-amber-600'
                              : ''
                          }`}
                          onClick={() => {
                            setTimeframe('6months');
                            setShowTimeframeDropdown(false);
                          }}
                        >
                          Last 6 Months
                        </li>
                        <li
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-50 ${
                            timeframe === '1year'
                              ? 'bg-amber-50 text-amber-600'
                              : ''
                          }`}
                          onClick={() => {
                            setTimeframe('1year');
                            setShowTimeframeDropdown(false);
                          }}
                        >
                          Last Year
                        </li>
                        <li
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-50 ${
                            timeframe === 'all'
                              ? 'bg-amber-50 text-amber-600'
                              : ''
                          }`}
                          onClick={() => {
                            setTimeframe('all');
                            setShowTimeframeDropdown(false);
                          }}
                        >
                          All Time
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className='h-72 sm:h-80'>
                <AdvancedRevenueChart data={revenueData} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200'>
                <h3 className='text-sm sm:text-base font-semibold text-gray-900'>
                  {user?.role === 'superadmin'
                    ? 'Admin Actions'
                    : 'Quick Actions'}
                </h3>
              </div>

              <div className='p-3 sm:p-5'>
                <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
                  {user?.role === 'superadmin' && (
                    <Link href='/dashboard/users' className='block'>
                      <div className='h-full border border-gray-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md hover:border-amber-200 group'>
                        <div className='h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-purple-200'>
                          <Users className='h-4 w-4 sm:h-5 sm:w-5 text-purple-600' />
                        </div>
                        <h4 className='text-xs sm:text-sm font-medium text-gray-900 mb-1 group-hover:text-amber-600'>
                          Manage Users
                        </h4>
                        <p className='text-xs text-gray-500 hidden xs:block'>
                          Manage roles and permissions
                        </p>
                      </div>
                    </Link>
                  )}

                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Link href='/dashboard/products' className='block'>
                      <div className='h-full border border-gray-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md hover:border-amber-200 group'>
                        <div className='h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-200'>
                          <Layers className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
                        </div>
                        <h4 className='text-xs sm:text-sm font-medium text-gray-900 mb-1 group-hover:text-amber-600'>
                          Manage Products
                        </h4>
                        <p className='text-xs text-gray-500 hidden xs:block'>
                          Edit your menu items
                        </p>
                      </div>
                    </Link>
                  )}

                  <Link href='/dashboard/orders' className='block'>
                    <div className='h-full border border-gray-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md hover:border-amber-200 group'>
                      <div className='h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-green-200'>
                        <ShoppingBag className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
                      </div>
                      <h4 className='text-xs sm:text-sm font-medium text-gray-900 mb-1 group-hover:text-amber-600'>
                        View Orders
                      </h4>
                      <p className='text-xs text-gray-500 hidden xs:block'>
                        Manage customer orders
                      </p>
                    </div>
                  </Link>

                  <Link href='/dashboard/settings' className='block'>
                    <div className='h-full border border-gray-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md hover:border-amber-200 group'>
                      <div className='h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-amber-100 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-amber-200'>
                        <Calendar className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600' />
                      </div>
                      <h4 className='text-xs sm:text-sm font-medium text-gray-900 mb-1 group-hover:text-amber-600'>
                        Settings
                      </h4>
                      <p className='text-xs text-gray-500 hidden xs:block'>
                        Update account settings
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
