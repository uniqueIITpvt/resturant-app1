import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { getRecentActivity, ActivityItem } from '@/services/dashboardService';
import Link from 'next/link';

interface RecentActivityProps {
  initialData?: ActivityItem[];
  maxItems?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  initialData = [],
  maxItems = 3,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(initialData.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchActivities = async () => {
    try {
      setIsRefreshing(true);
      const data = await getRecentActivity();
      setActivities(data.slice(0, maxItems));
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (initialData.length === 0) {
      fetchActivities();
    } else {
      setActivities(initialData.slice(0, maxItems));
    }
  }, [initialData, maxItems]);

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
      case 'success':
        return (
          <CheckCircle className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500' />
        );
      case 'failed':
      case 'error':
        return <XCircle className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500' />;
      case 'new':
        return (
          <CheckCircle className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500' />
        );
      default:
        return (
          <AlertCircle className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500' />
        );
    }
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return (
          <ShoppingCart className='h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500' />
        );
      case 'user':
        return (
          <UserPlus className='h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-500' />
        );
      case 'payment':
        return (
          <CreditCard className='h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500' />
        );
      default:
        return <Package className='h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500' />;
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5'>
      <div className='flex justify-between items-center mb-2 sm:mb-3'>
        <h3 className='text-sm sm:text-base font-semibold text-gray-900'>
          Recent Activity
        </h3>
        <button
          onClick={fetchActivities}
          disabled={isRefreshing}
          className='p-1.5 text-gray-500 hover:text-amber-600 rounded-full hover:bg-amber-50 transition-colors'
          title='Refresh activities'
        >
          <RefreshCw
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      {isLoading ? (
        <div className='py-4 sm:py-6 flex justify-center'>
          <div className='animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-amber-600'></div>
        </div>
      ) : activities.length === 0 ? (
        <div className='py-4 sm:py-6 text-center text-gray-500'>
          <p className='text-xs sm:text-sm'>No recent activity found</p>
        </div>
      ) : (
        <div className='space-y-1.5 sm:space-y-2 mt-1 sm:mt-2'>
          {activities.map((activity) => (
            <div
              key={activity.id}
              className='flex items-start p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-gray-50'
            >
              <div className='mt-0.5 sm:mt-1 mr-2 sm:mr-3'>
                <div
                  className='p-1 sm:p-1.5 bg-opacity-80 rounded-full'
                  style={{
                    backgroundColor:
                      activity.type === 'order'
                        ? '#EFF6FF'
                        : activity.type === 'user'
                        ? '#F5F3FF'
                        : activity.type === 'payment'
                        ? '#FEF2F2'
                        : '#FEF3C7',
                  }}
                >
                  {getTypeIcon(activity.type)}
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs sm:text-sm text-gray-800 font-medium line-clamp-1'>
                  {activity.message}
                </p>
                <div className='flex items-center mt-0.5 sm:mt-1'>
                  <Clock className='h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 mr-1' />
                  <span className='text-[10px] sm:text-xs text-gray-500'>
                    {activity.time}
                  </span>
                </div>
              </div>
              <div
                className={`p-0.5 sm:p-1 rounded-full ${
                  activity.status === 'completed' ||
                  activity.status === 'success'
                    ? 'bg-green-50'
                    : activity.status === 'failed' ||
                      activity.status === 'error'
                    ? 'bg-red-50'
                    : activity.status === 'new'
                    ? 'bg-blue-50'
                    : 'bg-amber-50'
                }`}
              >
                {getStatusIcon(activity.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href='/dashboard/activity'>
        <button className='w-full mt-2 sm:mt-3 py-1.5 sm:py-2 text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium text-center border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors'>
          View All Activity
        </button>
      </Link>
    </div>
  );
};

export default RecentActivity;
