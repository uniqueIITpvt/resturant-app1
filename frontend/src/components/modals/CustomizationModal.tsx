'use client';

import React from 'react';
import { X, Check } from 'lucide-react';

// Define TypeScript interfaces
interface AddonOption {
  name: string;
  price: number;
  selected?: boolean;
}

interface AddonGroup {
  title: string;
  required: boolean;
  options: AddonOption[];
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: {
    public_id?: string;
    url: string;
  };
  addonGroups?: AddonGroup[];
  isPopular?: boolean;
  isVegetarian?: boolean;
}

// Customization Modal Component Props
interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
  selectedAddons: AddonGroup[];
  setSelectedAddons: React.Dispatch<React.SetStateAction<AddonGroup[]>>;
  totalPrice: number;
  onAddToCart: () => void;
  validateSelections: () => boolean;
}

// Checkbox and Radio Option Components
const RadioOption = ({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
      selected ? 'border-amber-500 bg-white' : 'border-gray-300 bg-white'
    }`}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    {selected && <div className='w-2 h-2 rounded-full bg-amber-500'></div>}
  </div>
);

const CheckboxOption = ({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`w-4 h-4 rounded border ${
      selected
        ? 'bg-amber-500 border-amber-500 flex items-center justify-center'
        : 'border-gray-300 bg-white'
    }`}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    {selected && <Check size={12} className='text-white' />}
  </div>
);

export default function CustomizationModal({
  isOpen,
  onClose,
  item,
  selectedAddons,
  setSelectedAddons,
  totalPrice,
  onAddToCart,
  validateSelections,
}: CustomizationModalProps) {
  if (!isOpen) return null;

  // Toggle selection for a single option in radio-style groups (required add-ons)
  const toggleRadioOption = (groupIndex: number, optionIndex: number) => {
    setSelectedAddons((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues

      // Deselect all options in this group first
      updated[groupIndex].options.forEach(
        (option: AddonOption, idx: number) => {
          updated[groupIndex].options[idx].selected = false;
        }
      );

      // Then select the clicked option
      updated[groupIndex].options[optionIndex].selected = true;

      return updated;
    });
  };

  // Toggle selection for a single option in checkbox-style groups (optional add-ons)
  const toggleCheckboxOption = (groupIndex: number, optionIndex: number) => {
    setSelectedAddons((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues
      updated[groupIndex].options[optionIndex].selected =
        !updated[groupIndex].options[optionIndex].selected;
      return updated;
    });
  };

  // Handler for option selection
  const handleOptionClick = (
    groupIndex: number,
    optionIndex: number,
    isRequired: boolean
  ) => {
    if (isRequired) {
      toggleRadioOption(groupIndex, optionIndex);
    } else {
      toggleCheckboxOption(groupIndex, optionIndex);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div
        className='bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-4 border-b sticky top-0 bg-white z-10'>
          <div className='flex justify-between items-center'>
            <h3 className='font-bold text-lg text-gray-900'>{item.name}</h3>
            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className='p-4'>
          <h4 className='font-medium text-gray-900 mb-4'>
            Customize Your Order
          </h4>

          {selectedAddons.map((group, groupIndex) => (
            <div key={groupIndex} className='mb-6'>
              <div className='flex justify-between items-center mb-2'>
                <h5 className='text-sm font-medium text-gray-800'>
                  {group.title}
                </h5>
                {group.required && (
                  <span className='text-xs text-red-600 font-medium'>
                    Required
                  </span>
                )}
              </div>
              <div className='space-y-2 border rounded-lg overflow-hidden'>
                {group.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className='flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0'
                    onClick={() =>
                      handleOptionClick(groupIndex, optionIndex, group.required)
                    }
                  >
                    <div className='flex items-center'>
                      <div className='mr-3 w-5 h-5 flex items-center justify-center'>
                        {group.required ? (
                          <RadioOption
                            selected={option.selected || false}
                            onClick={() =>
                              handleOptionClick(groupIndex, optionIndex, true)
                            }
                          />
                        ) : (
                          <CheckboxOption
                            selected={option.selected || false}
                            onClick={() =>
                              handleOptionClick(groupIndex, optionIndex, false)
                            }
                          />
                        )}
                      </div>
                      <span className='text-sm text-gray-700'>
                        {option.name}
                      </span>
                    </div>
                    <span className='text-sm font-medium'>
                      +${option.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total price and add to cart */}
        <div className='p-4 border-t sticky bottom-0 bg-white'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <span className='text-sm text-gray-600'>Total:</span>
              <span className='ml-2 font-bold text-amber-600 text-lg'>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onAddToCart}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                validateSelections()
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!validateSelections()}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
