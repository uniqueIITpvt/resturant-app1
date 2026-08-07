const EventOffer = require('../models/eventOffer.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Get all event offers (admin)
exports.getAllEventOffers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: [
        { path: 'applicableProducts', select: 'name price' },
      ],
    };

    const eventOffers = await EventOffer.find()
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const totalEventOffers = await EventOffer.countDocuments();

    return res.status(200).json({
      success: true,
      count: eventOffers.length,
      total: totalEventOffers,
      totalPages: Math.ceil(totalEventOffers / options.limit),
      currentPage: options.page,
      data: eventOffers,
    });
  } catch (error) {
    console.error('Error getting event offers:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching event offers',
      error: error.message,
    });
  }
};

// Get active event offers (public)
exports.getActiveEventOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const eventOffers = await EventOffer.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    })
    .sort({ priority: -1, createdAt: -1 })
    .populate({ path: 'applicableProducts', select: 'name price image' });

    return res.status(200).json({
      success: true,
      count: eventOffers.length,
      data: eventOffers,
    });
  } catch (error) {
    console.error('Error getting active event offers:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching active event offers',
      error: error.message,
    });
  }
};

// Create event offer (admin)
exports.createEventOffer = async (req, res) => {
  try {
    const {
      name,
      description,
      banner,
      startDate,
      endDate,
      isActive,
      priority,
      offerType,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      applicableProducts,
      applicableCategories,
      couponCode,
      sendEmail,
      testEmail,
    } = req.body;

    // Validate end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    // Create new event offer
    const newEventOffer = new EventOffer({
      name,
      description,
      banner,
      startDate,
      endDate,
      isActive,
      priority,
      offerType,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      applicableProducts,
      applicableCategories,
      couponCode,
    });

    await newEventOffer.save();

    // If sendEmail is true, send email notifications
    if (sendEmail) {
      try {
        // Import email controller here to avoid circular dependency
        const emailController = require('./email.controller');
        
        // If test email is provided, just send a test email
        if (testEmail) {
          await emailController.testEventOfferEmail(testEmail, newEventOffer._id);
        } else {
          // Send to all users
          // We're calling this asynchronously without awaiting to not block the response
          emailController.broadcastEventOfferEmail({
            params: { eventOfferId: newEventOffer._id },
            body: {}
          }, {
            status: () => ({
              json: () => {} // Mock response object
            })
          }).catch(err => {
            console.error('Error sending event offer emails:', err);
          });
        }
      } catch (emailError) {
        console.error('Error setting up email notifications:', emailError);
        // We don't return an error here since the offer was created successfully
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Event offer created successfully',
      data: newEventOffer,
      emailStatus: sendEmail ? 'Email notifications queued for delivery' : 'No email notifications requested'
    });
  } catch (error) {
    console.error('Error creating event offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating event offer',
      error: error.message,
    });
  }
};

// Get event offer by ID
exports.getEventOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventOffer = await EventOffer.findById(id)
      .populate({ path: 'applicableProducts', select: 'name price image' });
    
    if (!eventOffer) {
      return res.status(404).json({
        success: false,
        message: 'Event offer not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      data: eventOffer,
    });
  } catch (error) {
    console.error('Error getting event offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching event offer',
      error: error.message,
    });
  }
};

// Update event offer
exports.updateEventOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate end date is after start date if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.endDate) <= new Date(updateData.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date',
        });
      }
    }
    
    const updatedEventOffer = await EventOffer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEventOffer) {
      return res.status(404).json({
        success: false,
        message: 'Event offer not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Event offer updated successfully',
      data: updatedEventOffer,
    });
  } catch (error) {
    console.error('Error updating event offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating event offer',
      error: error.message,
    });
  }
};

// Delete event offer
exports.deleteEventOffer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedEventOffer = await EventOffer.findByIdAndDelete(id);
    
    if (!deletedEventOffer) {
      return res.status(404).json({
        success: false,
        message: 'Event offer not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Event offer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting event offer',
      error: error.message,
    });
  }
};

// Track offer click
exports.trackEventOfferClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventOffer = await EventOffer.findByIdAndUpdate(
      id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    
    if (!eventOffer) {
      return res.status(404).json({
        success: false,
        message: 'Event offer not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking event offer click:', error);
    return res.status(500).json({
      success: false,
      message: 'Error tracking click',
      error: error.message,
    });
  }
};

// Track offer conversion (when a user makes a purchase using this offer)
exports.trackEventOfferConversion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventOffer = await EventOffer.findByIdAndUpdate(
      id,
      { $inc: { conversionCount: 1 } },
      { new: true }
    );
    
    if (!eventOffer) {
      return res.status(404).json({
        success: false,
        message: 'Event offer not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Conversion tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking event offer conversion:', error);
    return res.status(500).json({
      success: false,
      message: 'Error tracking conversion',
      error: error.message,
    });
  }
};

// Get event offers by type
exports.getEventOffersByType = async (req, res) => {
  try {
    const { type } = req.params;
    const currentDate = new Date();
    
    const eventOffers = await EventOffer.find({
      offerType: type,
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    })
    .sort({ priority: -1, createdAt: -1 })
    .populate({ path: 'applicableProducts', select: 'name price image' });
    
    return res.status(200).json({
      success: true,
      count: eventOffers.length,
      data: eventOffers,
    });
  } catch (error) {
    console.error(`Error getting ${req.params.type} event offers:`, error);
    return res.status(500).json({
      success: false,
      message: `Error fetching ${req.params.type} event offers`,
      error: error.message,
    });
  }
}; 