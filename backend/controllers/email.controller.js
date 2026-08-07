const User = require('../models/user.model');
const EventOffer = require('../models/eventOffer.model');
const { 
  sendEmail, 
  sendBulkEmails, 
  generateEventOfferEmailHTML,
  generateWelcomeEmailHTML
} = require('../utils/emailService');

/**
 * Send event/offer email to a single user
 * @route POST /api/email/send-event-offer/:userId/:eventOfferId
 */
const sendEventOfferEmail = async (req, res) => {
  try {
    const { userId, eventOfferId } = req.params;

    // Get user and event offer details
    const user = await User.findById(userId);
    const eventOffer = await EventOffer.findById(eventOfferId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!eventOffer) {
      return res.status(404).json({ message: 'Event/offer not found' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'User does not have an email address' });
    }

    // Generate HTML
    const html = generateEventOfferEmailHTML(eventOffer)
      .replace('{{userName}}', user.name || 'Valued Customer')
      .replace('{{email}}', user.email);

    // Send email
    await sendEmail({
      to: user.email,
      subject: `Special Offer: ${eventOffer.name}`,
      html,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending event offer email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

/**
 * Send event/offer email to all users
 * @route POST /api/email/broadcast-event-offer/:eventOfferId
 */
const broadcastEventOfferEmail = async (req, res) => {
  try {
    const { eventOfferId } = req.params;
    const { testEmail, userIds } = req.body;

    // Get event offer details
    const eventOffer = await EventOffer.findById(eventOfferId);

    if (!eventOffer) {
      return res.status(404).json({ message: 'Event/offer not found' });
    }

    // If testEmail is provided, send a test email
    if (testEmail) {
      const html = generateEventOfferEmailHTML(eventOffer)
        .replace('{{userName}}', 'Test User')
        .replace('{{email}}', testEmail);

      await sendEmail({
        to: testEmail,
        subject: `Special Offer: ${eventOffer.name}`,
        html,
      });

      return res.status(200).json({ message: 'Test email sent successfully' });
    }

    // Get users based on whether userIds are provided or not
    let users;
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      // For selected users
      console.log('Broadcasting to selected users:', userIds);
      users = await User.find({ 
        _id: { $in: userIds },
        email: { $exists: true, $ne: '' }
      });
    } else {
      // For all users
      console.log('Broadcasting to all users');
      users = await User.find({ 
        email: { $exists: true, $ne: '' },
        role: 'user' // Only send to customers
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found with valid email addresses' });
    }

    // Prepare email data
    const emailData = {
      subject: `Special Offer: ${eventOffer.name}`,
      html: generateEventOfferEmailHTML(eventOffer),
    };

    // Send emails in bulk
    const results = await sendBulkEmails(users, emailData);

    // Count successful and failed sends
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.status(200).json({ 
      message: 'Broadcast completed', 
      stats: {
        total: users.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Error broadcasting event offer email:', error);
    res.status(500).json({ message: 'Error broadcasting email', error: error.message });
  }
};

/**
 * Send welcome email to a user
 * @route POST /api/email/welcome/:userId
 */
const sendWelcomeEmail = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'User does not have an email address' });
    }

    // Generate HTML
    const html = generateWelcomeEmailHTML(user);

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Unique Café!',
      html,
    });

    res.status(200).json({ message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

/**
 * Send custom email to a user
 * @route POST /api/email/custom/:userId
 */
const sendCustomEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, message, html } = req.body;

    if (!subject || (!message && !html)) {
      return res.status(400).json({ message: 'Subject and message/HTML are required' });
    }

    // Get user details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'User does not have an email address' });
    }

    // Send email with either custom HTML or plain message
    await sendEmail({
      to: user.email,
      subject,
      html: html || `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Message from Unique Café</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p>Thank you for being our valued customer!</p>
          <p>- The Unique Café Team</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Custom email sent successfully' });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

/**
 * Send custom email to multiple users
 * @route POST /api/email/bulk-custom
 */
const sendBulkCustomEmail = async (req, res) => {
  try {
    const { userIds, subject, message, html, testEmail } = req.body;

    if (!subject || (!message && !html)) {
      return res.status(400).json({ message: 'Subject and message/HTML are required' });
    }

    // If testEmail is provided, send a test email
    if (testEmail) {
      await sendEmail({
        to: testEmail,
        subject,
        html: html || `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Message from Unique Café</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p>Thank you for being our valued customer!</p>
            <p>- The Unique Café Team</p>
          </div>
        `,
      });

      return res.status(200).json({ message: 'Test email sent successfully' });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    // Get users
    const users = await User.find({ _id: { $in: userIds }, email: { $exists: true, $ne: '' } });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found with valid email addresses' });
    }

    // Prepare email data
    const emailData = {
      subject,
      html: html || `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Message from Unique Café</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p>Thank you for being our valued customer!</p>
          <p>- The Unique Café Team</p>
        </div>
      `,
    };

    // Send emails in bulk
    const results = await sendBulkEmails(users, emailData);

    // Count successful and failed sends
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.status(200).json({ 
      message: 'Bulk emails sent', 
      stats: {
        total: users.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Error sending bulk custom emails:', error);
    res.status(500).json({ message: 'Error sending emails', error: error.message });
  }
};

/**
 * Send test email for a specific event/offer
 * @param {String} testEmail - Email address to send the test to
 * @param {String} eventOfferId - ID of the event offer
 * @returns {Promise}
 */
const testEventOfferEmail = async (testEmail, eventOfferId) => {
  try {
    // Get event offer details
    const eventOffer = await EventOffer.findById(eventOfferId);

    if (!eventOffer) {
      throw new Error('Event/offer not found');
    }

    const html = generateEventOfferEmailHTML(eventOffer)
      .replace('{{userName}}', 'Test User')
      .replace('{{email}}', testEmail);

    // Send email
    await sendEmail({
      to: testEmail,
      subject: `Special Offer: ${eventOffer.name}`,
      html,
    });

    return { success: true, message: 'Test email sent successfully' };
  } catch (error) {
    console.error('Error sending test event offer email:', error);
    throw error;
  }
};

module.exports = {
  sendEventOfferEmail,
  broadcastEventOfferEmail,
  sendWelcomeEmail,
  sendCustomEmail,
  sendBulkCustomEmail,
  testEventOfferEmail
}; 