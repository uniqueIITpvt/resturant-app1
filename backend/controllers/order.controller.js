const Order = require('../models/order.model');
const User = require('../models/user.model');
const Coupon = require('../models/coupon.model');

class OrderController {
  // Get all orders for a user
  async getUserOrders(req, res) {
    try {
      const orders = await Order.find({ user: req.user.id }, null, {
        minimize: false,
      }).sort({
        createdAt: -1,
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get all orders (admin only)
  async getAllOrders(req, res) {
    try {
      const orders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new order
  async createOrder(req, res) {
    try {
      const orderNumber = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Get user default address if not provided in request
      let deliveryAddress = req.body.deliveryAddress;

      if (!deliveryAddress || Object.keys(deliveryAddress).length === 0) {
        const user = await User.findById(req.user.id);
        if (user && user.addresses && user.addresses.length > 0) {
          // Find default address or use the first one
          const defaultAddress =
            user.addresses.find((addr) => addr.isDefault) || user.addresses[0];

          deliveryAddress = {
            addressType: defaultAddress.addressType,
            name: defaultAddress.name,
            phoneNumber: defaultAddress.phoneNumber,
            street: defaultAddress.street,
            city: defaultAddress.city,
            state: defaultAddress.state,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
            additionalDirections: defaultAddress.additionalDirections,
            landmark: defaultAddress.landmark,
          };
        }
      }

      // Process items with addons and recalculate subtotal if needed
      let subtotal = 0;
      const processedItems = req.body.items.map((item) => {
        // Calculate item base price
        let itemTotal = item.price * item.quantity;

        // Process selected addons if any
        if (item.selectedAddons && item.selectedAddons.length > 0) {
          // Calculate additional cost from addons
          item.selectedAddons.forEach((addonGroup) => {
            if (addonGroup.options && addonGroup.options.length > 0) {
              addonGroup.options.forEach((option) => {
                // Add addon price to the item total
                itemTotal += option.price * item.quantity;
              });
            }
          });
        }

        // Add to order subtotal
        subtotal += itemTotal;

        return item;
      });

      // If subtotal doesn't match what was sent, update it
      if (subtotal !== req.body.subtotal) {
        req.body.subtotal = subtotal;

        // Recalculate tax and total if needed
        const taxRate = 0.0875; // Example tax rate (8.75%)
        req.body.tax = parseFloat((subtotal * taxRate).toFixed(2));

        // Calculate total with delivery fee
        const deliveryFee = req.body.deliveryFee || 0;
        let discountAmount = 0;

        // Apply coupon discount if available
        if (req.body.coupon && req.body.coupon.code) {
          const coupon = await Coupon.findOne({ code: req.body.coupon.code });
          if (coupon) {
            if (coupon.discountType === 'percentage') {
              discountAmount = parseFloat(
                (subtotal * (coupon.discountValue / 100)).toFixed(2)
              );
            } else {
              discountAmount = coupon.discountValue;
            }
            req.body.coupon.discount = discountAmount;
          }
        }

        req.body.total = parseFloat(
          (subtotal + req.body.tax + deliveryFee - discountAmount).toFixed(2)
        );
      }

      // Extract order data with proper structure
      const orderData = {
        ...req.body,
        user: req.user.id,
        orderNumber,
        deliveryAddress,
        items: processedItems,
      };

      // Handle coupon information if provided
      if (req.body.coupon && req.body.coupon.code) {
        // Verify if the coupon exists and is valid
        const coupon = await Coupon.findOne({ code: req.body.coupon.code });

        if (coupon) {
          // Update the coupon usage count
          coupon.usedCount += 1;
          await coupon.save();

          // Add proper coupon information to the order
          orderData.coupon = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: req.body.coupon.discount || 0,
          };
        }
      }

      const newOrder = new Order(orderData);
      const savedOrder = await newOrder.save();
      res.status(201).json(savedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Prevent changing status if the order was cancelled by a user
      if (order.status === 'cancelled' && order.cancelledBy === 'user') {
        return res.status(400).json({
          message:
            'This order was cancelled by the user and cannot be modified',
        });
      }

      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get order by ID
  async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id, null, {
        minimize: false,
      }).populate('user', 'name email');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user is authorized to view this order
      if (
        req.user.role !== 'admin' &&
        req.user.role !== 'superadmin' &&
        order.user._id.toString() !== req.user.id
      ) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user is authorized to cancel this order
      if (
        order.user.toString() !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'superadmin'
      ) {
        return res
          .status(403)
          .json({ message: 'Not authorized to cancel this order' });
      }

      // Check if order can be cancelled (only pending or processing orders can be cancelled)
      if (order.status !== 'pending' && order.status !== 'processing') {
        return res.status(400).json({
          message: `Order cannot be cancelled as it is already ${order.status}`,
        });
      }

      // Update the order status to cancelled
      order.status = 'cancelled';

      // Track who cancelled the order
      order.cancelledBy = req.user.role === 'user' ? 'user' : 'admin';
      order.cancelledAt = new Date();

      const updatedOrder = await order.save();

      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrderController();
