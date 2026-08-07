'use client';

import { Plus, Edit, MapPin } from 'lucide-react';
import { Address } from './types';

interface AddressForm {
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  isDefault: boolean;
  additionalDirections: string;
  landmark: string;
}

interface AddressesTabProps {
  addresses: Address[];
  isLoading: boolean;
  isFetchingAddresses: boolean;
  isAddingAddress: boolean;
  isSubmitting: boolean;
  editingAddressId: string | null;
  addressForm: AddressForm;
  onAddNewAddress: () => void;
  onEditAddress: (addressId: string) => void;
  onDeleteAddress: (addressId: string) => void;
  onCancelAddressForm: () => void;
  onAddressFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onAddressFormSubmit: (e: React.FormEvent) => void;
}

export default function AddressesTab({
  addresses,
  isLoading,
  isFetchingAddresses,
  isAddingAddress,
  isSubmitting,
  editingAddressId,
  addressForm,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onCancelAddressForm,
  onAddressFormChange,
  onAddressFormSubmit,
}: AddressesTabProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
      <div className='border-b border-gray-200 p-4 sm:p-6'>
        <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
          Saved Addresses
        </h2>
        <p className='mt-1 text-xs sm:text-sm text-gray-500'>
          Manage your delivery addresses
        </p>
      </div>

      <div className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0'>
          <h3 className='text-base sm:text-lg font-medium text-gray-900'>
            Your Addresses
          </h3>
          {!isAddingAddress && (
            <button
              onClick={onAddNewAddress}
              className='self-start sm:self-auto inline-flex items-center px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-xs sm:text-sm'
            >
              <Plus className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
              Add New Address
            </button>
          )}
        </div>

        {isAddingAddress && (
          <div className='bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6'>
            <h3 className='text-base sm:text-lg font-medium mb-3 sm:mb-4'>
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={onAddressFormSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div className='sm:col-span-2 md:col-span-1'>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Full Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={addressForm.name}
                    onChange={onAddressFormChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div className='sm:col-span-2 md:col-span-1'>
                  <label
                    htmlFor='phoneNumber'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    id='phoneNumber'
                    name='phoneNumber'
                    value={addressForm.phoneNumber}
                    onChange={onAddressFormChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div className='sm:col-span-2'>
                  <label
                    htmlFor='street'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Street Address
                  </label>
                  <input
                    type='text'
                    id='street'
                    name='street'
                    value={addressForm.street}
                    onChange={onAddressFormChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='city'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    City
                  </label>
                  <input
                    type='text'
                    id='city'
                    name='city'
                    value={addressForm.city}
                    onChange={onAddressFormChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='state'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    State
                  </label>
                  <input
                    type='text'
                    id='state'
                    name='state'
                    value={addressForm.state}
                    onChange={onAddressFormChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='postalCode'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Postal Code
                  </label>
                  <input
                    type='text'
                    id='postalCode'
                    name='postalCode'
                    value={addressForm.postalCode}
                    onChange={onAddressFormChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='country'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Country
                  </label>
                  <input
                    type='text'
                    id='country'
                    name='country'
                    value={addressForm.country}
                    onChange={onAddressFormChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='addressType'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Address Type
                  </label>
                  <select
                    id='addressType'
                    name='addressType'
                    value={addressForm.addressType}
                    onChange={onAddressFormChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  >
                    <option value='home'>Home</option>
                    <option value='work'>Work</option>
                    <option value='other'>Other</option>
                  </select>
                </div>

                <div className='sm:col-span-2'>
                  <label
                    htmlFor='additionalDirections'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Additional Directions (Optional)
                  </label>
                  <input
                    type='text'
                    id='additionalDirections'
                    name='additionalDirections'
                    value={addressForm.additionalDirections}
                    onChange={onAddressFormChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>

                <div className='sm:col-span-2'>
                  <label
                    htmlFor='landmark'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type='text'
                    id='landmark'
                    name='landmark'
                    value={addressForm.landmark}
                    onChange={onAddressFormChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  />
                </div>
              </div>

              <div className='flex items-center mt-4'>
                <input
                  type='checkbox'
                  id='isDefault'
                  name='isDefault'
                  checked={addressForm.isDefault}
                  onChange={onAddressFormChange}
                  className='h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='isDefault'
                  className='ml-2 block text-xs sm:text-sm text-gray-700'
                >
                  Set as default address
                </label>
              </div>

              <div className='mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-x-6'>
                <button
                  type='button'
                  onClick={onCancelAddressForm}
                  className='w-full sm:w-auto text-xs sm:text-sm font-semibold leading-6 text-gray-900 py-2 sm:py-0'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto rounded-md bg-amber-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isFetchingAddresses ? (
          <div className='space-y-3 sm:space-y-4'>
            {[...Array(2)].map((_, index) => (
              <div
                key={index}
                className='bg-gray-50 rounded-lg p-3 sm:p-4 animate-pulse'
              >
                <div className='h-4 w-28 bg-gray-200 mb-2 rounded'></div>
                <div className='h-3 w-48 bg-gray-200 mb-1 rounded'></div>
                <div className='h-3 w-32 bg-gray-200 rounded'></div>
              </div>
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className='space-y-3 sm:space-y-4'>
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-gray-50 rounded-lg p-3 sm:p-4 border ${
                  address.isDefault ? 'border-amber-300' : 'border-gray-200'
                }`}
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-2 sm:space-y-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h4 className='font-medium text-gray-900 text-sm sm:text-base'>
                      {address.name}
                    </h4>
                    {address.isDefault && (
                      <span className='text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full'>
                        Default
                      </span>
                    )}
                    <span className='text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full capitalize'>
                      {address.addressType}
                    </span>
                  </div>
                  <div className='flex items-center space-x-3 self-end sm:self-auto'>
                    <button
                      onClick={() => onEditAddress(address._id)}
                      className='text-gray-500 hover:text-amber-600 p-1'
                      aria-label='Edit address'
                    >
                      <Edit className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => onDeleteAddress(address._id)}
                      className='text-gray-500 hover:text-red-600 p-1'
                      aria-label='Delete address'
                      disabled={isLoading}
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
                        className='h-4 w-4'
                      >
                        <path d='M3 6h18'></path>
                        <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
                        <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className='text-xs sm:text-sm text-gray-600 break-words'>
                  {address.street}, {address.city}, {address.state}{' '}
                  {address.postalCode}
                </p>
                <p className='text-xs sm:text-sm text-gray-600 mt-1'>
                  {address.phoneNumber}
                </p>
                {(address.additionalDirections || address.landmark) && (
                  <div className='mt-2 text-xs sm:text-sm text-gray-500'>
                    {address.additionalDirections && (
                      <p>Directions: {address.additionalDirections}</p>
                    )}
                    {address.landmark && <p>Landmark: {address.landmark}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-6 sm:py-8 bg-gray-50 rounded-lg'>
            <MapPin className='mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4' />
            <h3 className='text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2'>
              No addresses saved
            </h3>
            <p className='text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4'>
              Add your first delivery address to get started.
            </p>
            <button
              onClick={onAddNewAddress}
              className='inline-flex items-center px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-xs sm:text-sm'
            >
              <Plus className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
              Add New Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
