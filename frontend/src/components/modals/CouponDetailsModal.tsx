'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Tag,
  Percent,
  DollarSign,
  Users,
  RefreshCw,
} from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  userLimit: number;
}

interface CouponDetailsModalProps {
  coupon: Coupon | null;
  onClose: () => void;
}

export default function CouponDetailsModal({
  coupon,
  onClose,
}: CouponDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (coupon) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [coupon]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!coupon) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-transform duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Coupon Details
          </h2>
          <button
            onClick={handleClose}
            className='text-gray-500 hover:text-gray-700 focus:outline-none'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          {/* Coupon Code */}
          <div className='flex items-center'>
            <Tag className='text-amber-500 mr-3' size={20} />
            <div>
              <div className='text-sm text-gray-500'>Coupon Code</div>
              <div className='font-semibold text-lg'>{coupon.code}</div>
            </div>
          </div>

          {/* Discount */}
          <div className='flex items-center'>
            {coupon.discountType === 'percentage' ? (
              <Percent className='text-amber-500 mr-3' size={20} />
            ) : (
              <DollarSign className='text-amber-500 mr-3' size={20} />
            )}
            <div>
              <div className='text-sm text-gray-500'>Discount</div>
              <div className='font-semibold'>
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}% off`
                  : `$${coupon.discountValue} off`}
                {coupon.maxDiscountAmount &&
                  coupon.discountType === 'percentage' && (
                    <span className='text-sm text-gray-500 ml-1'>
                      (max: ${coupon.maxDiscountAmount})
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Minimum Order Value */}
          <div className='flex items-center'>
            <DollarSign className='text-amber-500 mr-3' size={20} />
            <div>
              <div className='text-sm text-gray-500'>Minimum Order Value</div>
              <div className='font-semibold'>${coupon.minOrderValue}</div>
            </div>
          </div>

          {/* Validity Period */}
          <div className='flex items-center'>
            <Calendar className='text-amber-500 mr-3' size={20} />
            <div>
              <div className='text-sm text-gray-500'>Valid Period</div>
              <div className='font-semibold'>
                {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className='flex items-center'>
            <RefreshCw className='text-amber-500 mr-3' size={20} />
            <div>
              <div className='text-sm text-gray-500'>Usage</div>
              <div className='font-semibold'>
                {coupon.usedCount} used
                {coupon.usageLimit !== null && ` (Limit: ${coupon.usageLimit})`}
              </div>
            </div>
          </div>

          {/* User Limit */}
          <div className='flex items-center'>
            <Users className='text-amber-500 mr-3' size={20} />
            <div>
              <div className='text-sm text-gray-500'>Uses Per User</div>
              <div className='font-semibold'>{coupon.userLimit}</div>
            </div>
          </div>

          {/* Status */}
          <div className='flex items-center'>
            <div className='w-5 h-5 rounded-full mr-3 flex items-center justify-center'>
              <div
                className={`w-3 h-3 rounded-full ${
                  coupon.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></div>
            </div>
            <div>
              <div className='text-sm text-gray-500'>Status</div>
              <div className='font-semibold'>
                {coupon.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className='mt-4'>
            <div className='text-sm text-gray-500 mb-1'>Description</div>
            <div className='p-3 bg-gray-50 rounded-md text-gray-700'>
              {coupon.description}
            </div>
          </div>
        </div>

        <div className='border-t p-4 flex justify-end'>
          <button
            onClick={handleClose}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
