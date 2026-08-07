'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  UserPlus,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { getRecentActivity, ActivityItem } from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';

export default function ActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentActivity();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'failed':
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'new':
        return <CheckCircle className='h-4 w-4 text-blue-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-amber-500' />;
    }
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className='h-3.5 w-3.5 text-blue-500' />;
      case 'user':
        return <UserPlus className='h-3.5 w-3.5 text-purple-500' />;
      case 'payment':
        return <CreditCard className='h-3.5 w-3.5 text-red-500' />;
      default:
        return <Package className='h-3.5 w-3.5 text-amber-500' />;
    }
  };

  const getStatusClass = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-green-50';
      case 'failed':
      case 'error':
        return 'bg-red-50';
      case 'new':
        return 'bg-blue-50';
      default:
        return 'bg-amber-50';
    }
  };

  const getTypeClass = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return '#EFF6FF';
      case 'user':
        return '#F5F3FF';
      case 'payment':
        return '#FEF2F2';
      default:
        return '#FEF3C7';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='container mx-auto px-4 py-6 space-y-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <Link href='/dashboard' className='mr-3'>
              <button className='p-2 rounded-full hover:bg-gray-100'>
                <ArrowLeft className='h-5 w-5 text-gray-500' />
              </button>
            </Link>
            <h1 className='text-2xl font-bold text-gray-900'>
              Activity History
            </h1>
          </div>
          <button
            onClick={fetchActivities}
            className='p-2 text-gray-600 hover:text-amber-600 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow flex items-center'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600'></div>
          </div>
        ) : activities.length === 0 ? (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center'>
            <p className='text-gray-500 mb-4'>No activity found</p>
            <Link href='/dashboard'>
              <button className='px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors'>
                Back to Dashboard
              </button>
            </Link>
          </div>
        ) : (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Recent Activity
              </h2>
              <p className='text-sm text-gray-500'>
                All recent actions across your restaurant
              </p>
            </div>
            <div className='divide-y divide-gray-100'>
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-start p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='mt-1 mr-4'>
                    <div
                      className='p-2 bg-opacity-80 rounded-full'
                      style={{ backgroundColor: getTypeClass(activity.type) }}
                    >
                      {getTypeIcon(activity.type)}
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      {activity.message}
                    </p>
                    <div className='flex items-center mt-1'>
                      <Clock className='h-3 w-3 text-gray-400 mr-1' />
                      <span className='text-xs text-gray-500'>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <div
                      className={`p-1 rounded-full ${getStatusClass(
                        activity.status
                      )}`}
                    >
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
