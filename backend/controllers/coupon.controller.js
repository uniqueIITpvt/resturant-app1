const Coupon = require('../models/coupon.model');

class CouponController {
  // Get all coupons
  async getAllCoupons(req, res) {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new coupon
  async createCoupon(req, res) {
    try {
      const newCoupon = new Coupon(req.body);
      const savedCoupon = await newCoupon.save();
      res.status(201).json(savedCoupon);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get coupon by ID
  async getCouponById(req, res) {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get coupon by code
  async getCouponByCode(req, res) {
    try {
      const { code } = req.params;
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(404).json({ message: 'Valid coupon not found' });
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }

      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update coupon
  async updateCoupon(req, res) {
    try {
      const updatedCoupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!updatedCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.json(updatedCoupon);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete coupon
  async deleteCoupon(req, res) {
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);

      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Validate coupon for order
  async validateCoupon(req, res) {
    try {
      const { code, orderValue, productIds, categoryIds } = req.body;

      if (!code) {
        return res.status(400).json({ message: 'Coupon code is required' });
      }

      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(404).json({ message: 'Valid coupon not found' });
      }

      // Check usage limit
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }

      // Check minimum order value
      if (orderValue && coupon.minOrderValue > orderValue) {
        return res.status(400).json({
          message: `Minimum order value of ${coupon.minOrderValue} required for this coupon`,
        });
      }

      // Check applicable products
      if (
        coupon.applicableProducts &&
        coupon.applicableProducts.length > 0 &&
        productIds
      ) {
        const validProducts = productIds.some((id) =>
          coupon.applicableProducts
            .map((p) => p.toString())
            .includes(id.toString())
        );

        if (!validProducts) {
          return res
            .status(400)
            .json({ message: 'Coupon not applicable for these products' });
        }
      }

      // Check excluded products
      if (
        coupon.excludedProducts &&
        coupon.excludedProducts.length > 0 &&
        productIds
      ) {
        const hasExcludedProduct = productIds.some((id) =>
          coupon.excludedProducts
            .map((p) => p.toString())
            .includes(id.toString())
        );

        if (hasExcludedProduct) {
          return res.status(400).json({
            message: 'Coupon not applicable for some products in your cart',
          });
        }
      }

      // Check applicable categories
      if (
        coupon.applicableCategories &&
        coupon.applicableCategories.length > 0 &&
        categoryIds
      ) {
        const validCategory = categoryIds.some((id) =>
          coupon.applicableCategories
            .map((c) => c.toString())
            .includes(id.toString())
        );

        if (!validCategory) {
          return res
            .status(400)
            .json({ message: 'Coupon not applicable for these categories' });
        }
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (orderValue * coupon.discountValue) / 100;

        // Apply max discount cap if set
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.discountValue;
      }

      res.json({
        valid: true,
        coupon,
        discount,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Increment coupon usage count
  async incrementCouponUsage(req, res) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      coupon.usedCount += 1;
      await coupon.save();

      res.json({ message: 'Coupon usage count incremented', coupon });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CouponController();
