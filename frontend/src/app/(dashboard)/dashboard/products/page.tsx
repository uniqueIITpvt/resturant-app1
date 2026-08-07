'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  ShoppingBag,
  X,
  PlusCircle,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Image as ImageIcon,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useToast from '@/hooks/useToast';
import { useConfirmationDialog } from '@/providers/ConfirmationProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';

// Define API URL
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

interface CategoryData {
  _id: string;
  name: string;
  description?: string;
  displayOrder: number;
  image?: {
    public_id?: string;
    url?: string;
  };
  createdAt: string;
}

interface ProductData {
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
  createdAt: string;
  newImage?: File | null;
}

export default function ProductsPage() {
  const { token } = useAuth();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
  const { confirmDelete } = useConfirmationDialog();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(
    null
  );
  const [previewProduct, setPreviewProduct] = useState<ProductData | null>(
    null
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [apiCategories, setApiCategories] = useState<CategoryData[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null as File | null,
    addonGroups: [] as AddonGroup[],
  });
  // Pagination state
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Add state for category management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null
  );
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
  });
  const [isCategorySaving, setIsCategorySaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setApiCategories(data || []);

      // Also update the categories string array for backward compatibility
      const categoryNames = data.map((cat: CategoryData) => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Don't show error notification for categories, just log it
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data || []);

      // Extract unique categories if we don't have any from the API
      if (apiCategories.length === 0) {
        const uniqueCategories = Array.from(
          new Set(data.map((product: ProductData) => product.category))
        ) as string[];
        setCategories(uniqueCategories);
      }

      showInfo('Products loaded successfully');
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch products. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, showInfo, showError, apiCategories.length]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const refreshProducts = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchCategories(), fetchProducts()]);
    setIsRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null,
      addonGroups: [],
    });
    setEditingProduct(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate inputs
      if (
        !formData.name ||
        !formData.description ||
        !formData.price ||
        !formData.category
      ) {
        setError('Please fill all required fields');
        showError('Please fill all required fields');
        return;
      }

      // Convert price to number
      const numericPrice = parseFloat(formData.price);

      // Create product data
      const productData: {
        name: string;
        description: string;
        price: number;
        category: string;
        addonGroups?: AddonGroup[];
        image?: {
          public_id: string;
          url: string;
        };
      } = {
        name: formData.name,
        description: formData.description,
        price: numericPrice,
        category: formData.category,
      };

      // Add addon groups if they exist
      if (formData.addonGroups && formData.addonGroups.length > 0) {
        // Validate add-on groups
        for (const group of formData.addonGroups) {
          if (!group.title.trim()) {
            setError('All add-on groups must have a title');
            showError('All add-on groups must have a title');
            return;
          }

          if (!group.options || group.options.length === 0) {
            setError(
              `Add-on group "${group.title}" must have at least one option`
            );
            showError(
              `Add-on group "${group.title}" must have at least one option`
            );
            return;
          }

          for (const option of group.options) {
            if (!option.name.trim()) {
              setError(
                `All options in group "${group.title}" must have a name`
              );
              showError(
                `All options in group "${group.title}" must have a name`
              );
              return;
            }

            if (option.price < 0) {
              setError(
                `All options in group "${group.title}" must have a valid price`
              );
              showError(
                `All options in group "${group.title}" must have a valid price`
              );
              return;
            }
          }
        }

        productData.addonGroups = formData.addonGroups;
      }

      // First, upload the image if one is provided
      if (formData.image) {
        // Show loading indication
        showInfo('Uploading image to Cloudinary...');

        let imageUploaded = false;

        try {
          // Create a FormData object specifically for the image upload
          const imageFormData = new FormData();
          imageFormData.append('image', formData.image);

          // Add metadata about the image for better tracking
          imageFormData.append('originalName', formData.image.name);
          imageFormData.append('productName', formData.name);
          imageFormData.append('uploadedByRole', 'admin');

          console.log('Uploading image:', formData.image.name);

          // Call the upload endpoint
          const uploadResponse = await fetch(`${API_URL}/api/upload/image`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: 'Unknown error occurred during upload' };
            }

            // Display more specific error messages based on error code
            const errorMessage = errorData.message || 'Image upload failed';
            console.error('Image upload failed:', errorMessage);

            if (errorData.error === 'FILE_TOO_LARGE') {
              showError('Image is too large. Maximum size is 5MB.');
            } else if (errorData.error === 'MISSING_FILE') {
              showError('No image file was provided. Please select an image.');
            } else {
              showError(`Image upload failed: ${errorMessage}`);
            }

            throw new Error('Image upload failed. Continuing without image.');
          }

          // Parse the response to get image URL and public_id
          const imageData = await uploadResponse.json();
          console.log('Cloudinary response:', imageData);

          if (imageData && imageData.url && imageData.public_id) {
            // Add the image data to our product object
            productData.image = {
              public_id: imageData.public_id,
              url: imageData.url,
            };
            imageUploaded = true;

            // Show optimization benefits if we have byte information
            if (imageData.bytes && formData.image.size > imageData.bytes) {
              const savedKb = Math.round(
                (formData.image.size - imageData.bytes) / 1024
              );
              const savedPercentage = Math.round(
                (1 - imageData.bytes / formData.image.size) * 100
              );
              showSuccess(
                `Image optimized! Saved ${savedKb}KB (${savedPercentage}% reduction)`
              );
            } else {
              showSuccess('Image uploaded successfully');
            }
          } else {
            throw new Error('Invalid response from image upload');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          showError('Image upload failed. Creating product without image.');
          // Continue with product creation without image
        }

        if (!imageUploaded) {
          showInfo('Proceeding to create product without image...');
        }
      }

      // Create the product (with or without image)
      console.log('Sending product data to API:', productData);

      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Product creation failed:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: 'Failed to create product' };
        }

        throw new Error(errorData.message || 'Failed to create product');
      }

      // Get the created product data
      const createdProduct = await response.json();
      console.log('Product created successfully:', createdProduct);

      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);

      // Refresh product list
      fetchProducts();
      showSuccess('Product created successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create product';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Product creation error:', error);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setError('');

    try {
      // Validate add-on groups if they exist
      if (editingProduct.addonGroups && editingProduct.addonGroups.length > 0) {
        for (const group of editingProduct.addonGroups) {
          if (!group.title.trim()) {
            setError('All add-on groups must have a title');
            showError('All add-on groups must have a title');
            return;
          }

          if (!group.options || group.options.length === 0) {
            setError(
              `Add-on group "${group.title}" must have at least one option`
            );
            showError(
              `Add-on group "${group.title}" must have at least one option`
            );
            return;
          }

          for (const option of group.options) {
            if (!option.name.trim()) {
              setError(
                `All options in group "${group.title}" must have a name`
              );
              showError(
                `All options in group "${group.title}" must have a name`
              );
              return;
            }

            if (option.price < 0) {
              setError(
                `All options in group "${group.title}" must have a valid price`
              );
              showError(
                `All options in group "${group.title}" must have a valid price`
              );
              return;
            }
          }
        }
      }

      let updatedImageData = editingProduct.image || null;

      // First upload new image if one is provided
      if (editingProduct.newImage) {
        showInfo('Uploading new image...');

        try {
          // Create a FormData object for the image upload
          const imageFormData = new FormData();
          imageFormData.append('image', editingProduct.newImage);

          // Add metadata
          imageFormData.append('originalName', editingProduct.newImage.name);
          imageFormData.append('productName', editingProduct.name);
          imageFormData.append('uploadedByRole', 'admin');

          // Call the upload endpoint
          const uploadResponse = await fetch(`${API_URL}/api/upload/image`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload new image');
          }

          // Parse the response
          const imageData = await uploadResponse.json();

          if (imageData && imageData.url && imageData.public_id) {
            // Update the image data
            updatedImageData = {
              public_id: imageData.public_id,
              url: imageData.url,
            };
            showSuccess('Image updated successfully');
          }
        } catch (error) {
          console.error('Error uploading new image:', error);
          showError('Failed to upload new image. Keeping existing image.');
        }
      }

      // Prepare update data with potentially new image
      const updateData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        image: updatedImageData,
      };

      const response = await fetch(
        `${API_URL}/api/products/${editingProduct._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update product');
      }

      resetForm();
      setShowCreateModal(false);
      fetchProducts();
      showSuccess('Product updated successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update product';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    const confirmed = await confirmDelete(productName);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
      showSuccess('Product deleted successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete product';
      showError(errorMessage);
    }
  };

  const editProduct = (product: ProductData) => {
    // Add a typescript type assertion to handle the newImage property
    setEditingProduct({
      ...product,
      newImage: null as File | null,
    });
    setShowCreateModal(true);
  };

  const previewProductDetails = (product: ProductData) => {
    setPreviewProduct(product);
    setShowPreviewModal(true);
  };

  const filteredProducts = products.filter((product) => {
    // Filter by search query
    const matchesQuery =
      (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase() || '').includes(
        searchQuery.toLowerCase()
      );

    // Filter by category
    const matchesCategory =
      categoryFilter === 'all' || (product.category ?? '') === categoryFilter;

    return matchesQuery && matchesCategory;
  });

  // Get current products for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  // Add functions for category management
  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      displayOrder: 0,
    });
  };

  const handleEditCategory = (category: CategoryData) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder,
    });
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    // Confirm deletion with the user
    const confirmed = await confirmDelete(categoryName);
    if (!confirmed) return;

    try {
      if (!token) {
        throw new Error('You must be logged in to delete a category');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      // Refresh the categories list
      await fetchCategories();
      showSuccess('Category deleted successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete category';
      showError(errorMessage);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryFormData.name.trim()) {
      showError('Category name is required');
      return;
    }

    setIsCategorySaving(true);

    try {
      let url = `${API_URL}/api/categories`;
      let method = 'POST';

      if (editingCategory) {
        url = `${url}/${editingCategory._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      // Fetch updated categories
      await fetchCategories();

      resetCategoryForm();
      showSuccess(
        `Category ${editingCategory ? 'updated' : 'created'} successfully`
      );

      // Close the modal if we're not staying to add more
      if (editingCategory) {
        setShowCategoryModal(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save category';
      showError(errorMessage);
    } finally {
      setIsCategorySaving(false);
    }
  };

  return (
    <ProtectedRoute requiresAuth adminOnly>
      <div className='px-2 py-3 sm:px-4 sm:py-5 md:px-6 lg:px-8 max-w-7xl mx-auto'>
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-5 gap-2 sm:gap-3'>
          <h1 className='text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center'>
            <ShoppingBag className='mr-2 flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6' />{' '}
            Products Management
          </h1>

          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className='bg-amber-600 hover:bg-amber-700 text-white px-3 sm:px-4 py-2 rounded-md flex items-center text-sm w-full sm:w-auto justify-center sm:justify-start transition-colors'
          >
            <PlusCircle size={16} className='mr-1.5 flex-shrink-0' /> Add
            Product
          </button>
        </div>

        {error && (
          <div className='mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs sm:text-sm'>
            {error}
          </div>
        )}

        <div className='mb-3 sm:mb-5 flex flex-col md:flex-row gap-2 sm:gap-3'>
          <div className='flex-1 relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search size={16} className='text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search products...'
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='w-full md:w-auto md:min-w-[12rem]'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Filter size={16} className='text-gray-400' />
              </div>
              <select
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm appearance-none'
                value={categoryFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'manage') {
                    setShowCategoryModal(true);
                  } else {
                    setCategoryFilter(value);
                  }
                }}
              >
                <option value='all'>All Categories</option>

                {/* API Categories */}
                {apiCategories.length > 0
                  ? apiCategories
                      .sort(
                        (a, b) =>
                          a.displayOrder - b.displayOrder ||
                          a.name.localeCompare(b.name)
                      )
                      .map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                  : // Legacy categories if API categories not available
                    categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}

                <option value='manage'>🛠️ Manage categories...</option>
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                <svg
                  className='fill-current h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={refreshProducts}
            className='w-full md:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center justify-center text-sm transition-colors'
            disabled={isRefreshing}
          >
            <RefreshCw
              size={16}
              className={`mr-1.5 flex-shrink-0 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500'></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className='bg-white rounded-lg shadow p-5 text-center'>
            <p className='text-gray-500 text-sm sm:text-base'>
              No products found
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View - Only visible on smaller screens */}
            <div className='lg:hidden space-y-3 mb-4'>
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  className='bg-white rounded-lg shadow p-3 sm:p-4'
                >
                  <div className='flex gap-3'>
                    {/* Product Image */}
                    <div className='flex-shrink-0'>
                      {product.image && product.image.url ? (
                        <img
                          src={product.image.url}
                          alt={product.name}
                          className='h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md'
                        />
                      ) : (
                        <div className='h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-md flex items-center justify-center'>
                          <ImageIcon size={18} className='text-gray-400' />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium text-gray-900 truncate'>
                        {product.name}
                      </h3>
                      <p className='mt-1 text-xs text-gray-500 line-clamp-2'>
                        {product.description}
                      </p>

                      <div className='mt-2 flex flex-wrap gap-2'>
                        <span className='px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
                          {product.category}
                        </span>
                        <span className='px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full'>
                          $
                          {typeof product.price === 'number'
                            ? product.price.toFixed(2)
                            : '0.00'}
                        </span>
                        {product.addonGroups &&
                          product.addonGroups.length > 0 && (
                            <span className='px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                              {product.addonGroups.length} add-on
                              {product.addonGroups.length > 1 ? 's' : ''}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='mt-3 pt-2 border-t flex justify-end gap-2'>
                    <button
                      onClick={() => previewProductDetails(product)}
                      className='p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors'
                      title='Preview'
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => editProduct(product)}
                      className='p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors'
                      title='Edit'
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteProduct(product._id, product.name)
                      }
                      className='p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors'
                      title='Delete'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View - Hide on smaller screens */}
            <div className='hidden lg:block overflow-x-auto bg-white rounded-lg shadow'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Image
                    </th>
                    <th className='px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Price
                    </th>
                    <th className='hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Created
                    </th>
                    <th className='px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {currentProducts.map((product) => (
                    <tr key={product._id} className='hover:bg-gray-50'>
                      <td className='px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap'>
                        {product.image && product.image.url ? (
                          <img
                            src={product.image.url}
                            alt={product.name}
                            className='h-9 w-9 sm:h-12 sm:w-12 object-cover rounded-md'
                          />
                        ) : (
                          <div className='h-9 w-9 sm:h-12 sm:w-12 bg-gray-200 rounded-md flex items-center justify-center'>
                            <ImageIcon size={18} className='text-gray-400' />
                          </div>
                        )}
                      </td>
                      <td className='px-3 sm:px-4 py-3 sm:py-4'>
                        <div className='text-sm font-medium text-gray-900 line-clamp-1'>
                          {product.name}
                        </div>
                        <div className='text-xs sm:text-sm text-gray-500 line-clamp-1 max-w-[100px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-xs'>
                          {product.description}
                        </div>
                        {product.addonGroups &&
                          product.addonGroups.length > 0 && (
                            <div className='mt-1'>
                              <span className='px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs'>
                                {product.addonGroups.length} add-on group
                                {product.addonGroups.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                      </td>
                      <td className='hidden sm:table-cell px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap'>
                        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                          {product.category}
                        </span>
                      </td>
                      <td className='px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500'>
                        $
                        {typeof product.price === 'number'
                          ? product.price.toFixed(2)
                          : '0.00'}
                      </td>
                      <td className='hidden md:table-cell px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className='px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex items-center justify-end space-x-1 sm:space-x-3'>
                          <button
                            onClick={() => previewProductDetails(product)}
                            className='p-1 sm:p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors'
                            title='Preview'
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => editProduct(product)}
                            className='p-1 sm:p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors'
                            title='Edit'
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(product._id, product.name)
                            }
                            className='p-1 sm:p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors'
                            title='Delete'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <div className='flex flex-wrap items-center justify-between bg-white px-3 sm:px-4 py-3 mt-3 sm:mt-4 rounded-lg shadow gap-2'>
              <div className='flex flex-1 justify-between sm:hidden w-full'>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Previous
                </button>
                <span className='text-sm text-gray-700'>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Next
                </button>
              </div>

              <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between flex-wrap gap-3'>
                <div>
                  <p className='text-sm text-gray-700'>
                    Showing{' '}
                    <span className='font-medium'>{indexOfFirstItem + 1}</span>{' '}
                    to{' '}
                    <span className='font-medium'>
                      {Math.min(indexOfLastItem, filteredProducts.length)}
                    </span>{' '}
                    of{' '}
                    <span className='font-medium'>
                      {filteredProducts.length}
                    </span>{' '}
                    products
                  </p>
                </div>
                <div>
                  <div className='isolate inline-flex -space-x-px rounded-md shadow-sm'>
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                        currentPage === 1
                          ? 'bg-gray-100 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <span className='sr-only'>Previous</span>
                      <ChevronLeft className='h-5 w-5' />
                    </button>

                    {/* Page numbers - responsive approach */}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;

                      // On small screens, show fewer pages
                      const screenBreakpoint =
                        typeof window !== 'undefined'
                          ? window.innerWidth < 640
                            ? 1
                            : 2
                          : 2;

                      // Only show first, last, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - screenBreakpoint &&
                          pageNumber <= currentPage + screenBreakpoint)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-3 sm:px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNumber
                                ? 'bg-amber-50 text-amber-600 z-10 border border-amber-300'
                                : 'bg-white text-gray-900 hover:bg-gray-50'
                            } transition-colors`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }

                      // Show ellipsis if there's a gap
                      if (
                        (pageNumber === 2 && currentPage > 3) ||
                        (pageNumber === totalPages - 1 &&
                          currentPage < totalPages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className='relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 bg-white'
                          >
                            ...
                          </span>
                        );
                      }

                      return null;
                    })}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                        currentPage === totalPages
                          ? 'bg-gray-100 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <span className='sr-only'>Next</span>
                      <ChevronRight className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items per page selector */}
              <div className='mt-2 sm:mt-0 w-full sm:w-auto'>
                <div className='flex items-center justify-between sm:justify-start'>
                  <label className='text-sm text-gray-700 mr-2 whitespace-nowrap'>
                    Items per page:
                  </label>
                  <div className='rounded border border-gray-300 text-sm px-3 py-1'>
                    {itemsPerPage}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Create/Edit Product Modal */}
        {showCreateModal && (
          <div className='fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto'>
            <div className='bg-white rounded-xl shadow-xl p-3 sm:p-5 w-full max-w-3xl mx-auto h-[90vh] sm:h-[85vh] flex flex-col transition-all duration-300 animate-fadeIn'>
              <div className='flex justify-between items-center mb-3 sm:mb-5 border-b pb-3 flex-shrink-0'>
                <h2 className='text-lg sm:text-xl font-bold text-gray-800 flex items-center'>
                  {editingProduct ? (
                    <>
                      <Edit className='h-5 w-5 mr-2 text-amber-600 flex-shrink-0' />
                      Edit Product
                    </>
                  ) : (
                    <>
                      <PlusCircle className='h-5 w-5 mr-2 text-amber-600 flex-shrink-0' />
                      Add New Product
                    </>
                  )}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors'
                  aria-label='Close modal'
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={
                  editingProduct ? handleUpdateProduct : handleCreateProduct
                }
                className='space-y-4 overflow-y-auto flex-grow pr-1'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Product Name */}
                  <div className='md:col-span-2'>
                    <label
                      htmlFor='name'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Product Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      id='name'
                      name='name'
                      value={
                        editingProduct ? editingProduct.name : formData.name
                      }
                      onChange={(e) => {
                        if (editingProduct) {
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          });
                        }
                      }}
                      required
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='Enter product name'
                    />
                  </div>

                  {/* Description */}
                  <div className='md:col-span-2'>
                    <label
                      htmlFor='description'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Description <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      id='description'
                      name='description'
                      value={
                        editingProduct
                          ? editingProduct.description
                          : formData.description
                      }
                      onChange={(e) => {
                        if (editingProduct) {
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          });
                        }
                      }}
                      required
                      rows={3}
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='Enter product description'
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label
                      htmlFor='price'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Price <span className='text-red-500'>*</span>
                    </label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <span className='text-gray-500 sm:text-sm'>$</span>
                      </div>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        id='price'
                        name='price'
                        value={
                          editingProduct ? editingProduct.price : formData.price
                        }
                        onChange={(e) => {
                          if (editingProduct) {
                            setEditingProduct({
                              ...editingProduct,
                              price: parseFloat(e.target.value),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              price: e.target.value,
                            });
                          }
                        }}
                        required
                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm pl-7 p-2.5 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                        placeholder='0.00'
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor='category'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Category <span className='text-red-500'>*</span>
                    </label>
                    <select
                      id='category'
                      name='category'
                      value={
                        editingProduct
                          ? editingProduct.category
                          : formData.category
                      }
                      onChange={(e) => {
                        const { name, value } = e.target;

                        // Handle special category options
                        if (name === 'category' && value === 'manage') {
                          // Don't update the form data, just open the category management modal
                          setShowCategoryModal(true);
                          return;
                        }

                        if (editingProduct) {
                          setEditingProduct({
                            ...editingProduct,
                            category: value,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            category: value,
                          });
                        }
                      }}
                      required
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    >
                      <option value=''>Select a category</option>
                      {apiCategories.length > 0
                        ? apiCategories
                            .sort(
                              (a, b) =>
                                a.displayOrder - b.displayOrder ||
                                a.name.localeCompare(b.name)
                            )
                            .map((category) => (
                              <option key={category._id} value={category.name}>
                                {category.name}
                              </option>
                            ))
                        : categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                      <option value='manage'>🛠️ Manage categories...</option>
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Product Image{' '}
                      {editingProduct
                        ? '(leave empty to keep current image)'
                        : ''}
                    </label>
                    <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                      <div className='space-y-1 text-center'>
                        <svg
                          className='mx-auto h-12 w-12 text-gray-400'
                          stroke='currentColor'
                          fill='none'
                          viewBox='0 0 48 48'
                          aria-hidden='true'
                        >
                          <path
                            d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                            strokeWidth={2}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                        <div className='flex justify-center text-sm text-gray-600'>
                          <label
                            htmlFor='product-image'
                            className='relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500'
                          >
                            <span>Upload a file</span>
                            <input
                              id='product-image'
                              name='image'
                              type='file'
                              accept='image/*'
                              className='sr-only'
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];

                                  // Check file type
                                  const validTypes = [
                                    'image/jpeg',
                                    'image/png',
                                    'image/webp',
                                    'image/gif',
                                  ];
                                  if (!validTypes.includes(file.type)) {
                                    showError(
                                      'Invalid file type. Please upload JPEG, PNG, WEBP or GIF images only.'
                                    );
                                    return;
                                  }

                                  // Check file size (5MB max)
                                  const maxSize = 5 * 1024 * 1024; // 5MB
                                  if (file.size > maxSize) {
                                    showError(
                                      'Image is too large. Maximum size is 5MB.'
                                    );
                                    return;
                                  }

                                  // Set file to form data
                                  if (editingProduct) {
                                    // Just store the file - we'll handle upload on submit
                                    setEditingProduct({
                                      ...editingProduct,
                                      newImage: file,
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      image: file,
                                    });
                                  }

                                  showSuccess(`Image "${file.name}" selected.`);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className='text-xs text-gray-500'>
                          PNG, JPG, WEBP or GIF up to 5MB
                        </p>

                        {/* Preview current image */}
                        {editingProduct &&
                          editingProduct.image &&
                          editingProduct.image.url && (
                            <div className='mt-3'>
                              <p className='text-xs text-gray-500 mb-1'>
                                Current image:
                              </p>
                              <img
                                src={editingProduct.image.url}
                                alt={editingProduct.name}
                                className='h-20 w-auto mx-auto object-cover rounded'
                              />
                            </div>
                          )}

                        {/* Preview new image */}
                        {editingProduct && editingProduct.newImage && (
                          <div className='mt-3'>
                            <p className='text-xs text-gray-500 mb-1'>
                              New image selected:
                            </p>
                            <p className='text-xs font-medium text-amber-600'>
                              {editingProduct.newImage.name}
                            </p>
                          </div>
                        )}

                        {/* Preview new image for new product */}
                        {!editingProduct && formData.image && (
                          <div className='mt-3'>
                            <p className='text-xs text-gray-500 mb-1'>
                              Image selected:
                            </p>
                            <p className='text-xs font-medium text-amber-600'>
                              {formData.image.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add-on Groups section */}
                <div className='border-t pt-4 mt-4'>
                  <h3 className='text-lg font-medium text-gray-800 mb-3'>
                    Add-on Groups
                  </h3>

                  {/* Add-on groups list will go here */}
                  <div className='space-y-4'>
                    {/* Add button for add-on groups */}
                    <div className='flex justify-end'>
                      <button
                        type='button'
                        className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                        onClick={() => {
                          // Implementation for adding addon groups would go here
                        }}
                      >
                        <PlusCircle className='w-4 h-4 mr-1.5' />
                        Add Add-on Group
                      </button>
                    </div>
                  </div>
                </div>

                <div className='border-t pt-4 mt-4 flex justify-end gap-2'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className='px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm flex items-center'
                  >
                    {editingProduct ? (
                      <>
                        <Edit className='h-4 w-4 mr-1.5' />
                        Update Product
                      </>
                    ) : (
                      <>
                        <PlusCircle className='h-4 w-4 mr-1.5' />
                        Create Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Product Modal */}
        {showPreviewModal && previewProduct && (
          <div className='fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-all duration-300 p-2 sm:p-4 overflow-y-auto'>
            <div className='bg-white rounded-lg shadow-xl p-3 sm:p-5 w-full max-w-2xl h-[90vh] sm:h-[85vh] flex flex-col m-auto animate-fadeIn'>
              <div className='flex justify-between items-center mb-3 flex-shrink-0'>
                <h2 className='text-lg sm:text-xl font-bold text-gray-800'>
                  Product Details
                </h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow pr-1'>
                {/* Product Image */}
                <div className='flex flex-col items-center justify-start'>
                  <div className='w-full bg-white rounded-lg shadow-sm overflow-hidden'>
                    {previewProduct.image && previewProduct.image.url ? (
                      <div className='w-full aspect-square overflow-hidden bg-gray-50'>
                        <img
                          src={previewProduct.image.url}
                          alt={previewProduct.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    ) : (
                      <div className='w-full aspect-square bg-gray-50 flex items-center justify-center'>
                        <ImageIcon size={48} className='text-gray-300' />
                      </div>
                    )}
                    <div className='p-4 text-center'>
                      <span className='inline-block px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium'>
                        $
                        {typeof previewProduct.price === 'number'
                          ? previewProduct.price.toFixed(2)
                          : '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className='mt-3 w-full text-center'>
                    <p className='text-xs text-gray-500'>
                      Added on{' '}
                      {new Date(previewProduct.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className='flex flex-col h-full'>
                  <div className='bg-white rounded-lg shadow-sm p-4 mb-4'>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>
                      {previewProduct.name}
                    </h3>
                    <div className='mb-3'>
                      <span className='px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium'>
                        {previewProduct.category || 'Uncategorized'}
                      </span>
                    </div>
                    <div className='mt-3 text-gray-600'>
                      <h4 className='text-sm font-medium text-gray-700 mb-1'>
                        Description
                      </h4>
                      <p className='text-sm'>{previewProduct.description}</p>
                    </div>
                  </div>

                  {/* Addon Groups */}
                  {previewProduct.addonGroups &&
                    previewProduct.addonGroups.length > 0 && (
                      <div className='bg-white rounded-lg shadow-sm p-4 h-full overflow-y-auto'>
                        <h4 className='font-medium text-gray-800 mb-3 pb-2 border-b'>
                          Add-on Options
                        </h4>
                        <div className='space-y-4'>
                          {previewProduct.addonGroups.map(
                            (group, groupIndex) => (
                              <div
                                key={`group-${groupIndex}`}
                                className='bg-gray-50 p-3 rounded-lg border border-gray-100'
                              >
                                <div className='flex items-center justify-between mb-2'>
                                  <h5 className='text-gray-900 font-medium'>
                                    {group.title}
                                  </h5>
                                  <span className='text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full'>
                                    {group.required ? 'Required' : 'Optional'}
                                  </span>
                                </div>

                                <div className='space-y-1.5'>
                                  {group.options.map((option, optionIndex) => (
                                    <div
                                      key={`option-${groupIndex}-${optionIndex}`}
                                      className='flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors'
                                    >
                                      <span className='text-sm text-gray-700'>
                                        {option.name}
                                      </span>
                                      <span className='text-sm text-amber-600 font-medium'>
                                        +${option.price.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Empty state if no addons */}
                  {(!previewProduct.addonGroups ||
                    previewProduct.addonGroups.length === 0) && (
                    <div className='bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center h-full'>
                      <div className='text-gray-400 mb-2'>
                        <PlusCircle size={24} className='mx-auto' />
                      </div>
                      <p className='text-sm text-gray-500'>
                        No add-on options available for this product
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex flex-col sm:flex-row justify-end mt-3 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0 pt-2 border-t'>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    editProduct(previewProduct);
                  }}
                  className='px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center justify-center sm:justify-start text-sm transition-colors'
                >
                  <Edit size={16} className='mr-1.5 flex-shrink-0' /> Edit
                  Product
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className='px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className='fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto'>
            <div className='bg-white rounded-xl shadow-xl p-3 sm:p-5 w-full max-w-2xl mx-auto h-[90vh] sm:h-[85vh] flex flex-col transition-all duration-300 animate-fadeIn'>
              <div className='flex justify-between items-center mb-3 sm:mb-5 border-b pb-3 flex-shrink-0'>
                <h2 className='text-lg sm:text-xl font-bold text-gray-800 flex items-center'>
                  {editingCategory ? (
                    <>
                      <Edit className='h-5 w-5 mr-2 text-amber-600 flex-shrink-0' />
                      Edit Category
                    </>
                  ) : (
                    <>
                      <PlusCircle className='h-5 w-5 mr-2 text-amber-600 flex-shrink-0' />
                      Manage Categories
                    </>
                  )}
                </h2>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    resetCategoryForm();
                  }}
                  className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors'
                  aria-label='Close modal'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='flex-grow overflow-y-auto p-1'>
                {/* Category List */}
                {apiCategories.length > 0 && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-medium text-gray-800 mb-3'>
                      Categories
                    </h3>
                    <div className='space-y-2'>
                      {apiCategories
                        .sort(
                          (a, b) =>
                            a.displayOrder - b.displayOrder ||
                            a.name.localeCompare(b.name)
                        )
                        .map((category) => (
                          <div
                            key={category._id}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                          >
                            <div className='flex-grow'>
                              <h4 className='font-medium text-gray-800'>
                                {category.name}
                              </h4>
                              {category.description && (
                                <p className='text-sm text-gray-600 mt-1'>
                                  {category.description}
                                </p>
                              )}
                            </div>
                            <div className='flex items-center'>
                              <button
                                className='p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors mr-1'
                                onClick={() => handleEditCategory(category)}
                                title='Edit'
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className='p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors'
                                onClick={() =>
                                  handleDeleteCategory(
                                    category._id,
                                    category.name
                                  )
                                }
                                title='Delete'
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Category Form */}
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='text-lg font-medium text-gray-800 mb-3'>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <form onSubmit={handleCategorySubmit} className='space-y-4'>
                    <div>
                      <label
                        htmlFor='category-name'
                        className='block text-gray-700 text-sm font-medium mb-1.5'
                      >
                        Category Name <span className='text-red-500'>*</span>
                      </label>
                      <input
                        id='category-name'
                        type='text'
                        value={categoryFormData.name}
                        onChange={(e) =>
                          setCategoryFormData({
                            ...categoryFormData,
                            name: e.target.value,
                          })
                        }
                        className='w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all'
                        placeholder='Enter category name'
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='category-description'
                        className='block text-gray-700 text-sm font-medium mb-1.5'
                      >
                        Description{' '}
                        <span className='text-gray-400'>(optional)</span>
                      </label>
                      <textarea
                        id='category-description'
                        value={categoryFormData.description}
                        onChange={(e) =>
                          setCategoryFormData({
                            ...categoryFormData,
                            description: e.target.value,
                          })
                        }
                        className='w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all'
                        placeholder='Enter category description'
                        rows={3}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='category-order'
                        className='block text-gray-700 text-sm font-medium mb-1.5'
                      >
                        Display Order{' '}
                        <span className='text-gray-400'>
                          (lower numbers appear first)
                        </span>
                      </label>
                      <input
                        id='category-order'
                        type='number'
                        min='0'
                        value={categoryFormData.displayOrder}
                        onChange={(e) =>
                          setCategoryFormData({
                            ...categoryFormData,
                            displayOrder: parseInt(e.target.value) || 0,
                          })
                        }
                        className='w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all'
                      />
                    </div>

                    <div className='flex justify-end gap-2 pt-2'>
                      {editingCategory && (
                        <button
                          type='button'
                          onClick={resetCategoryForm}
                          className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium'
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button
                        type='submit'
                        disabled={isCategorySaving}
                        className='px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center'
                      >
                        {isCategorySaving ? (
                          <>
                            <div className='h-4 w-4 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2'></div>
                            Saving...
                          </>
                        ) : editingCategory ? (
                          <>
                            <Edit className='h-4 w-4 mr-1.5 flex-shrink-0' />
                            Update Category
                          </>
                        ) : (
                          <>
                            <PlusCircle className='h-4 w-4 mr-1.5 flex-shrink-0' />
                            Add Category
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
