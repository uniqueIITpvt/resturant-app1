'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
// import { useCart, SelectedAddon } from '../context/CartContext';
import toast from 'react-hot-toast';
import { SelectedAddon, useCart } from '@/context/CartContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AddonOption {
  name: string;
  price: number;
}

interface AddonGroup {
  title: string;
  required: boolean;
  options: AddonOption[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: {
    public_id?: string;
    url?: string;
  };
  addonGroups?: AddonGroup[];
}

interface ProductAddonsModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProductAddonsModal = ({
  productId,
  isOpen,
  onClose,
}: ProductAddonsModalProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const { addToCart } = useCart();

  // Fetch product details
  useEffect(() => {
    if (!productId || !isOpen) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/products/${productId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }

        const data = await response.json();
        setProduct(data);

        // Initialize selected addons array based on required groups
        if (data.addonGroups && data.addonGroups.length > 0) {
          const initialSelectedAddons = data.addonGroups
            .filter((group: AddonGroup) => group.required)
            .map((group: AddonGroup) => ({
              title: group.title,
              options:
                group.options.length > 0
                  ? [
                      {
                        name: group.options[0].name,
                        price: group.options[0].price,
                      },
                    ]
                  : [],
            }));

          setSelectedAddons(initialSelectedAddons);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Unable to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isOpen]);

  // Handle quantity changes
  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  // Handle addon selection
  const handleAddonSelection = (
    groupTitle: string,
    option: AddonOption,
    isChecked: boolean
  ) => {
    setSelectedAddons((prev) => {
      // Find if the group is already in the selected addons
      const groupIndex = prev.findIndex((group) => group.title === groupTitle);

      // If group doesn't exist yet, create it
      if (groupIndex === -1 && isChecked) {
        return [
          ...prev,
          {
            title: groupTitle,
            options: [{ name: option.name, price: option.price }],
          },
        ];
      }

      // If group exists, update its options
      const updatedAddons = [...prev];

      if (isChecked) {
        // Add option to group
        if (groupIndex !== -1) {
          // Check if option already exists to avoid duplicates
          const optionExists = updatedAddons[groupIndex].options.some(
            (opt) => opt.name === option.name
          );
          if (!optionExists) {
            updatedAddons[groupIndex].options.push({
              name: option.name,
              price: option.price,
            });
          }
        }
      } else {
        // Remove option from group
        if (groupIndex !== -1) {
          updatedAddons[groupIndex].options = updatedAddons[
            groupIndex
          ].options.filter((opt) => opt.name !== option.name);

          // If no options left in group, remove the group
          if (updatedAddons[groupIndex].options.length === 0) {
            updatedAddons.splice(groupIndex, 1);
          }
        }
      }

      return updatedAddons;
    });
  };

  // Check if option is selected
  const isOptionSelected = (groupTitle: string, optionName: string) => {
    const group = selectedAddons.find((addon) => addon.title === groupTitle);
    if (!group) return false;
    return group.options.some((option) => option.name === optionName);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!product) return 0;

    let total = product.price;

    // Add price of selected addons
    selectedAddons.forEach((addonGroup) => {
      addonGroup.options.forEach((option) => {
        total += option.price;
      });
    });

    return total * quantity;
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!product) return;

    // Check if all required addon groups have selections
    const requiredGroups =
      product.addonGroups?.filter((group) => group.required) || [];
    const selectedGroupTitles = selectedAddons.map((addon) => addon.title);

    const missingRequiredGroups = requiredGroups.filter(
      (group) => !selectedGroupTitles.includes(group.title)
    );

    if (missingRequiredGroups.length > 0) {
      toast.error(
        `Please select options for: ${missingRequiredGroups
          .map((g) => g.title)
          .join(', ')}`
      );
      return;
    }

    // Add to cart
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image?.url,
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined,
    });

    // Show success toast
    const addonNames = selectedAddons
      .flatMap((group) => group.options.map((option) => option.name))
      .join(', ');

    toast.success(
      `${product.name}${addonNames ? ` with ${addonNames}` : ''} added to cart`
    );

    onClose();
  };

  // If modal is closed, don't render anything
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[9998] overflow-hidden backdrop-blur-sm bg-black/40 transition-opacity'
      onClick={onClose}
    >
      <div className='flex items-end justify-center min-h-screen text-center sm:block sm:p-0'>
        {/* This element is to trick the browser into centering the modal contents on desktop */}
        <span
          className='hidden md:inline-block md:h-screen md:align-middle'
          aria-hidden='true'
        >
          &#8203;
        </span>

        {/* Mobile: Bottom sheet that slides up and takes 70% of the screen */}
        <div
          className='w-full h-[70vh] md:h-auto flex text-base text-left transform transition md:inline-block md:max-w-lg md:px-4 md:my-8 md:align-middle lg:max-w-xl relative'
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className='w-full h-full relative flex flex-col bg-white rounded-t-2xl md:rounded-xl shadow-xl overflow-hidden md:max-h-[85vh]'
            style={{
              transform: 'translateY(0)',
              animation: 'modalSlideIn 0.3s ease-out',
            }}
          >
            {/* Drag handle for bottom sheet */}
            <div className='md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-1'></div>

            {/* Close button */}
            <button
              onClick={onClose}
              className='absolute top-3 right-3 z-10 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors'
            >
              <X size={20} className='text-gray-600' />
            </button>

            {/* Loading state */}
            {isLoading ? (
              <div className='p-6 flex justify-center items-center h-64'>
                <div className='w-12 h-12 border-t-2 border-b-2 border-amber-500 rounded-full animate-spin'></div>
              </div>
            ) : error ? (
              <div className='p-6 text-center'>
                <p className='text-red-500'>{error}</p>
                <button
                  onClick={onClose}
                  className='mt-4 px-4 py-2 bg-gray-200 rounded-md'
                >
                  Close
                </button>
              </div>
            ) : product ? (
              <>
                {/* Product image header - smaller height on mobile bottom sheet */}
                <div className='relative h-36 md:h-56 w-full bg-gray-200'>
                  {product.image && product.image.url ? (
                    <Image
                      src={product.image.url}
                      alt={product.name}
                      fill
                      sizes='(max-width: 768px) 100vw, 600px'
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <ShoppingBag size={40} className='text-gray-400' />
                    </div>
                  )}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
                  <div className='absolute bottom-0 left-0 right-0 p-4 md:p-5'>
                    <h3 className='text-xl md:text-2xl font-bold text-white'>
                      {product.name}
                    </h3>
                    <p className='text-sm md:text-base text-gray-200 line-clamp-2 mt-1'>
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Main content area with fixed bottom section */}
                <div className='flex flex-col h-full overflow-hidden'>
                  {/* Scrollable content area */}
                  <div className='flex-1 overflow-y-auto p-4 md:p-6 pb-0'>
                    {/* Base price */}
                    <div className='mb-4 pb-4 border-b border-gray-200'>
                      <div className='flex justify-between'>
                        <span className='font-medium'>Base price</span>
                        <span className='font-semibold'>
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Addon groups - scrollable area */}
                    <div
                      className='space-y-4 pb-4'
                      style={{ maxHeight: 'calc(100% - 200px)' }}
                    >
                      {product.addonGroups && product.addonGroups.length > 0 ? (
                        <div className='mb-4 space-y-4'>
                          {product.addonGroups.map((group, groupIndex) => (
                            <div
                              key={`group-${groupIndex}`}
                              className='pb-4 border-b border-gray-100'
                            >
                              <div className='flex justify-between mb-2'>
                                <h4 className='font-medium'>
                                  {group.title}
                                  {group.required && (
                                    <span className='text-red-500 ml-1'>*</span>
                                  )}
                                </h4>
                                {group.required ? (
                                  <span className='text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full'>
                                    Required
                                  </span>
                                ) : (
                                  <span className='text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full'>
                                    Optional
                                  </span>
                                )}
                              </div>

                              <div className='space-y-1'>
                                {group.options.map((option, optionIndex) => (
                                  <div
                                    key={`option-${groupIndex}-${optionIndex}`}
                                    className='flex items-center py-2.5 px-3 rounded-md hover:bg-gray-50 transition-colors'
                                  >
                                    <input
                                      type='checkbox'
                                      id={`option-${groupIndex}-${optionIndex}`}
                                      checked={isOptionSelected(
                                        group.title,
                                        option.name
                                      )}
                                      onChange={(e) =>
                                        handleAddonSelection(
                                          group.title,
                                          option,
                                          e.target.checked
                                        )
                                      }
                                      className='h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500'
                                    />
                                    <label
                                      htmlFor={`option-${groupIndex}-${optionIndex}`}
                                      className='ml-2 flex-1 text-sm md:text-base text-gray-700 cursor-pointer'
                                    >
                                      {option.name}
                                    </label>
                                    <span className='text-amber-600 font-medium text-sm md:text-base'>
                                      +${option.price.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='py-8 text-center text-gray-500'>
                          <p>No addons available for this product</p>
                        </div>
                      )}
                    </div>

                    {/* Add padding for fixed footer */}
                    <div className='h-32 md:h-40'></div>
                  </div>

                  {/* Fixed bottom section with quantity and total */}
                  <div className='absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 shadow-md'>
                    {/* Quantity selector */}
                    <div className='flex justify-between items-center mb-3'>
                      <span className='font-medium'>Quantity</span>
                      <div className='flex items-center'>
                        <button
                          onClick={decreaseQuantity}
                          className='p-2 border border-gray-300 rounded-l-md hover:bg-gray-100 transition-colors'
                        >
                          <Minus size={16} className='text-gray-600' />
                        </button>
                        <div className='px-4 py-2 border-t border-b border-gray-300 min-w-[48px] text-center'>
                          {quantity}
                        </div>
                        <button
                          onClick={increaseQuantity}
                          className='p-2 border border-gray-300 rounded-r-md hover:bg-gray-100 transition-colors'
                        >
                          <Plus size={16} className='text-gray-600' />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className='flex justify-between items-center py-3 border-t border-gray-200'>
                      <span className='font-semibold text-base md:text-lg'>
                        Total
                      </span>
                      <span className='text-xl md:text-2xl font-bold text-amber-600'>
                        ${calculateTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    {/* Add to cart button */}
                    <button
                      onClick={handleAddToCart}
                      className='w-full bg-amber-500 hover:bg-amber-600 text-white rounded-md py-3.5 px-4 font-semibold text-base md:text-lg transition-colors flex items-center justify-center'
                    >
                      <ShoppingBag size={20} className='mr-2' />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Add style for modal animation */}
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) {
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </div>
  );
};

export default ProductAddonsModal;
