'use client';

import Image from 'next/image';
import {
  Camera,
  Edit,
  Loader2,
  Phone,
  Plus,
  MapPin,
  User,
  Mail,
  Check,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
}

interface Address {
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

interface PersonalInfoTabProps {
  profile: UserProfile;
  addresses: Address[];
  isLoading: boolean;
  isEditing: boolean;
  isUploadingImage: boolean;
  profileImagePreview: string | null;
  onEditToggle: () => void;
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTabChange: (tab: string) => void;
  onDeleteAddress: (addressId: string) => void;
  onEditAddress: (addressId: string) => void;
}

export default function PersonalInfoTab({
  profile,
  addresses,
  isLoading,
  isEditing,
  isUploadingImage,
  profileImagePreview,
  onEditToggle,
  onProfileChange,
  onImageChange,
  onSubmit,
  onTabChange,
  onDeleteAddress,
  onEditAddress,
}: PersonalInfoTabProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock function to simulate a success message after form submission
  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
    if (!isLoading) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <section className='w-full max-w-7xl mx-auto px-1 sm:px-0'>
      {/* Success Message */}
      {showSuccess && (
        <div className='fixed top-4 inset-x-0 sm:top-6 sm:right-6 sm:inset-x-auto z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg flex items-center justify-center sm:justify-start mx-4 sm:mx-0 transform transition-all duration-300 animate-slide-in-right'>
          <Check className='h-5 w-5 mr-2 text-green-500' />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Profile Section */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden mb-6'>
        <div className='p-4 sm:p-6 md:p-8 border-b border-gray-100'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
                Personal Information
              </h2>
              <p className='text-gray-500 mt-1'>
                Manage your personal details and preferences
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={onEditToggle}
                className='self-start sm:self-auto flex items-center px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors shadow-sm hover:shadow font-medium text-sm sm:text-base'
              >
                <Edit className='h-4 w-4 mr-1.5 sm:mr-2' />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className='p-4 sm:p-6 md:p-8'>
          {isLoading ? (
            <div className='animate-pulse'>
              <div className='flex flex-col items-center mb-8'>
                <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 mb-4'></div>
                <div className='h-4 w-40 bg-gray-200 rounded'></div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='space-y-2'>
                    <div className='h-4 w-24 bg-gray-200 rounded'></div>
                    <div className='h-10 sm:h-12 bg-gray-200 rounded-lg w-full'></div>
                  </div>
                ))}
              </div>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className='space-y-6 sm:space-y-8'>
              {/* Profile Image Section */}
              <div className='flex flex-col items-center'>
                <div className='relative group'>
                  <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-amber-100 shadow-md'>
                    {isUploadingImage ? (
                      <div className='w-full h-full flex items-center justify-center bg-gray-100'>
                        <Loader2 className='h-8 w-8 text-amber-500 animate-spin' />
                      </div>
                    ) : profileImagePreview ? (
                      <Image
                        src={profileImagePreview}
                        alt='Profile preview'
                        fill
                        className='object-cover'
                      />
                    ) : profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt={profile.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white'>
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor='profile-image'
                    className='absolute -bottom-2 -right-2 p-1.5 sm:p-2 bg-amber-500 rounded-full text-white shadow-md cursor-pointer hover:bg-amber-600 transition-colors'
                  >
                    <Camera className='h-4 w-4 sm:h-5 sm:w-5' />
                  </label>

                  <input
                    type='file'
                    id='profile-image'
                    className='hidden'
                    accept='image/*'
                    onChange={onImageChange}
                    disabled={isUploadingImage}
                  />
                </div>
                <p className='text-xs sm:text-sm text-gray-500 mt-3'>
                  Upload a new profile picture
                </p>
              </div>

              {/* Form Fields */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                <div className='space-y-1.5 sm:space-y-2'>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Full Name
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <User className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
                    </div>
                    <input
                      type='text'
                      id='name'
                      name='name'
                      value={profile.name}
                      onChange={onProfileChange}
                      className='w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-1.5 sm:space-y-2'>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Email Address
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Mail className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
                    </div>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={profile.email}
                      readOnly
                      className='w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed text-sm sm:text-base'
                    />
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    Email cannot be changed
                  </p>
                </div>

                <div className='md:col-span-2 space-y-1.5 sm:space-y-2'>
                  <label
                    htmlFor='phone'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Phone Number
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Phone className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
                    </div>
                    <input
                      type='tel'
                      id='phone'
                      name='phone'
                      value={profile.phone}
                      onChange={onProfileChange}
                      className='w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base'
                      placeholder='Add your phone number'
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                <button
                  type='button'
                  onClick={onEditToggle}
                  className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-colors shadow-sm hover:shadow flex items-center justify-center text-sm sm:text-base'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2' />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className='space-y-6 sm:space-y-8'>
              {/* Profile Display */}
              <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'>
                <div className='relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-amber-100 shadow-md flex-shrink-0'>
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={profile.name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white'>
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className='flex-1 text-center sm:text-left'>
                  <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-1'>
                    {profile.name}
                  </h3>
                  <p className='text-gray-500 mb-2 sm:mb-3 text-sm sm:text-base break-all'>
                    {profile.email}
                  </p>

                  <div className='flex items-center justify-center sm:justify-start text-gray-700 mb-3'>
                    {profile.phone ? (
                      <div className='flex items-center text-sm sm:text-base'>
                        <Phone className='h-4 w-4 text-gray-400 mr-2' />
                        {profile.phone}
                      </div>
                    ) : (
                      <div className='flex items-center text-gray-400 italic text-sm sm:text-base'>
                        <Phone className='h-4 w-4 mr-2' />
                        No phone number provided
                      </div>
                    )}
                  </div>

                  <div className='flex flex-wrap justify-center sm:justify-start gap-2'>
                    <span className='px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full'>
                      Customer
                    </span>
                    <span className='px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full'>
                      {addresses.length > 0
                        ? `${addresses.length} addresses`
                        : 'No saved addresses'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <button
                  onClick={onEditToggle}
                  className='flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-colors group'
                >
                  <div className='flex items-center'>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3'>
                      <User className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600' />
                    </div>
                    <div className='text-left'>
                      <h4 className='font-medium text-gray-900 text-sm sm:text-base'>
                        Edit Profile
                      </h4>
                      <p className='text-xs sm:text-sm text-gray-500'>
                        Update your personal information
                      </p>
                    </div>
                  </div>
                  <ChevronRight className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-amber-500 transition-colors' />
                </button>

                <button
                  onClick={() => onTabChange('addresses')}
                  className='flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-colors group'
                >
                  <div className='flex items-center'>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3'>
                      <MapPin className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600' />
                    </div>
                    <div className='text-left'>
                      <h4 className='font-medium text-gray-900 text-sm sm:text-base'>
                        Manage Addresses
                      </h4>
                      <p className='text-xs sm:text-sm text-gray-500'>
                        Add or edit your delivery addresses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-amber-500 transition-colors' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Addresses Section - Only show in view mode */}
      {!isEditing && (
        <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
          <div className='p-4 sm:p-6 md:p-8 border-b border-gray-100'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4'>
              <div>
                <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                  Saved Addresses
                </h2>
                <p className='text-gray-500 mt-1 text-sm sm:text-base'>
                  {addresses.length > 0
                    ? `You have ${addresses.length} saved ${
                        addresses.length === 1 ? 'address' : 'addresses'
                      }`
                    : 'Add addresses for faster checkout'}
                </p>
              </div>

              <button
                onClick={() => onTabChange('addresses')}
                className='self-start sm:self-auto flex items-center px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-amber-600 border border-amber-300 rounded-full hover:bg-amber-50 transition-colors font-medium text-sm sm:text-base'
              >
                <Plus className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
                Add Address
              </button>
            </div>
          </div>

          <div className='p-4 sm:p-6 md:p-8'>
            {isLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-pulse'>
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className='bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200'
                  >
                    <div className='h-4 w-32 bg-gray-200 rounded mb-4'></div>
                    <div className='space-y-2'>
                      <div className='h-3 w-full bg-gray-200 rounded'></div>
                      <div className='h-3 w-4/5 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`bg-white rounded-xl p-4 sm:p-5 border ${
                      address.isDefault
                        ? 'border-amber-300 ring-1 ring-amber-300'
                        : 'border-gray-200 hover:border-gray-300'
                    } transition-all duration-200 relative group`}
                  >
                    {address.isDefault && (
                      <div className='absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1'>
                        <Star className='h-3 w-3 fill-current' />
                      </div>
                    )}

                    <div className='flex items-center justify-between mb-2 sm:mb-3'>
                      <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                        <h4 className='font-medium text-gray-900 text-sm sm:text-base'>
                          {address.name}
                        </h4>
                        <span className='ml-1 px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full capitalize'>
                          {address.addressType}
                        </span>
                        {address.isDefault && (
                          <span className='ml-1 px-1.5 sm:px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full'>
                            Default
                          </span>
                        )}
                      </div>

                      <div className='flex space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
                        <button
                          onClick={() => onEditAddress(address._id)}
                          className='p-1 text-gray-500 hover:text-amber-600 transition-colors'
                          aria-label='Edit address'
                        >
                          <Edit className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        </button>
                        <button
                          onClick={() => onDeleteAddress(address._id)}
                          className='p-1 text-gray-500 hover:text-red-600 transition-colors'
                          aria-label='Delete address'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='h-3.5 w-3.5 sm:h-4 sm:w-4'
                          >
                            <path d='M3 6h18'></path>
                            <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
                            <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className='text-xs sm:text-sm text-gray-600'>
                      <p className='mb-1 flex items-start'>
                        <MapPin className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0' />
                        <span>
                          {address.street}, {address.city}, {address.state}{' '}
                          {address.postalCode}
                          {address.landmark && `, Near ${address.landmark}`}
                        </span>
                      </p>
                      <p className='flex items-center'>
                        <Phone className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0' />
                        {address.phoneNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-gray-50 rounded-xl p-6 sm:p-8 text-center border border-dashed border-gray-200'>
                <div className='w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                  <MapPin className='h-6 w-6 sm:h-8 sm:w-8 text-amber-500' />
                </div>
                <h3 className='text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2'>
                  No addresses saved
                </h3>
                <p className='text-gray-500 max-w-md mx-auto mb-4 sm:mb-6 text-xs sm:text-sm'>
                  Add delivery addresses to make checkout faster and easier.
                  We&apos;ll save them securely for your next orders.
                </p>
                <button
                  onClick={() => onTabChange('addresses')}
                  className='inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors shadow-sm font-medium text-xs sm:text-sm'
                >
                  <Plus className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
                  Add Your First Address
                </button>
              </div>
            )}

            {addresses.length > 0 && (
              <div className='mt-4 sm:mt-6 text-center'>
                <button
                  onClick={() => onTabChange('addresses')}
                  className='text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm inline-flex items-center'
                >
                  <span>Manage all addresses</span>
                  <ChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1' />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
