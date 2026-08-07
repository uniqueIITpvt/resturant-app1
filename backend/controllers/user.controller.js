const User = require('../models/user.model');
const mongoose = require('mongoose');

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        userType: user.userType,
        addresses: user.addresses || [],
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};

// Get all addresses for current user
exports.getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      count: user.addresses ? user.addresses.length : 0,
      data: user.addresses || [],
    });
  } catch (error) {
    console.error('Error getting user addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user addresses',
      error: error.message,
    });
  }
};

// Add a new address for current user
exports.addUserAddress = async (req, res) => {
  try {
    const {
      addressType,
      name,
      phoneNumber,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
      additionalDirections,
      landmark,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }

    // Create new address object
    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      addressType: addressType || 'home',
      name: name || user.name,
      phoneNumber,
      street,
      city,
      state,
      postalCode,
      country: country || 'USA',
      isDefault: isDefault || user.addresses.length === 0,
      additionalDirections,
      landmark,
    };

    // If this is set as default, update other addresses
    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Add the new address
    user.addresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      success: true,
      data: newAddress,
      message: 'Address added successfully',
    });
  } catch (error) {
    console.error('Error adding user address:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding user address',
      error: error.message,
    });
  }
};

// Update an address for current user
exports.updateUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const {
      addressType,
      name,
      phoneNumber,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
      additionalDirections,
      landmark,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the address to update
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Update address fields
    if (addressType) user.addresses[addressIndex].addressType = addressType;
    if (name) user.addresses[addressIndex].name = name;
    if (phoneNumber) user.addresses[addressIndex].phoneNumber = phoneNumber;
    if (street) user.addresses[addressIndex].street = street;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (postalCode) user.addresses[addressIndex].postalCode = postalCode;
    if (country) user.addresses[addressIndex].country = country;
    if (additionalDirections !== undefined)
      user.addresses[addressIndex].additionalDirections = additionalDirections;
    if (landmark !== undefined)
      user.addresses[addressIndex].landmark = landmark;

    // Handle default address
    if (isDefault) {
      user.addresses.forEach((addr, idx) => {
        addr.isDefault = idx === addressIndex;
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: user.addresses[addressIndex],
      message: 'Address updated successfully',
    });
  } catch (error) {
    console.error('Error updating user address:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user address',
      error: error.message,
    });
  }
};

// Set address as default
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Set this address as default and others as non-default
    user.addresses.forEach((addr, idx) => {
      addr.isDefault = idx === addressIndex;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      data: user.addresses[addressIndex],
      message: 'Address set as default successfully',
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    return res.status(500).json({
      success: false,
      message: 'Error setting default address',
      error: error.message,
    });
  }
};

// Delete an address
exports.deleteUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the address to delete
    const address = user.addresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = address.isDefault;

    // Filter out the address to delete
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    // If the deleted address was the default one, set a new default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting address',
      error: error.message,
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        userType: user.userType,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message,
    });
  }
};
