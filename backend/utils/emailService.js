const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send email to a single user
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.html - Email HTML content
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Unique Café'}" <${
      process.env.EMAIL_FROM || process.env.EMAIL_USER
    }>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send bulk emails to multiple users
 * @param {Array} users - Array of user objects with email addresses
 * @param {Object} emailData - Email content
 * @returns {Promise} - Array of send results
 */
const sendBulkEmails = async (users, emailData) => {
  // Filter out users without email addresses
  const validUsers = users.filter(
    (user) => user.email && user.email.trim() !== ''
  );

  // Create an array of promises for each email to be sent
  const emailPromises = validUsers.map((user) => {
    return sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html
        .replace('{{userName}}', user.name || 'Valued Customer')
        .replace(/{{(\w+)}}/g, (match, key) => {
          return user[key] || match;
        }),
    });
  });

  // Return all promises
  return Promise.allSettled(emailPromises);
};

/**
 * Generate HTML for event offer emails
 * @param {Object} eventOffer - Event or offer data
 * @returns {String} - HTML email content
 */
const generateEventOfferEmailHTML = (eventOffer) => {
  // Format dates for display
  const startDate = new Date(eventOffer.startDate).toLocaleDateString();
  const endDate = eventOffer.endDate
    ? new Date(eventOffer.endDate).toLocaleDateString()
    : 'Until supplies last';

  // Calculate discount text
  let discountText = '';
  if (eventOffer.discountType === 'percentage') {
    discountText = `${eventOffer.discountValue}% off`;
  } else if (eventOffer.discountType === 'fixed') {
    discountText = `$${eventOffer.discountValue} off`;
  }

  // Min order text
  const minOrderText =
    eventOffer.minOrderValue > 0
      ? `for orders over $${eventOffer.minOrderValue}`
      : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${eventOffer.name}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
        }
        .header {
          background: linear-gradient(to right, #b45309, #d97706, #f59e0b);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          border: 1px solid #eee;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .offer-details {
          background-color: #fff8e1;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(to right, #b45309, #d97706);
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #888;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 15px 0;
        }
        .dates {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .discount {
          font-size: 24px;
          font-weight: bold;
          color: #b45309;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Unique Café</h1>
          <p>Special Offer Just For You!</p>
        </div>
        <div class="content">
          <p>Hello {{userName}},</p>
          
          <p>We're excited to share with you our latest offer:</p>
          
          <h2>${eventOffer.name}</h2>
          
          ${
            eventOffer.banner && eventOffer.banner.url
              ? `<img src="${eventOffer.banner.url}" alt="${eventOffer.name}">`
              : ''
          }
          
          <div class="offer-details">
            <p>${eventOffer.description}</p>
            
            ${
              discountText
                ? `<div class="discount">${discountText} ${minOrderText}</div>`
                : ''
            }
            
            <div class="dates">
              <strong>Valid:</strong> ${startDate} - ${endDate}
            </div>
            
            ${
              eventOffer.couponCode
                ? `<p><strong>Use code:</strong> <span style="background:#f0f0f0;padding:3px 8px;border-radius:4px;font-family:monospace">${eventOffer.couponCode}</span> at checkout</p>`
                : ''
            }
          </div>
          
          <center>
            <a href="${
              process.env.FRONTEND_URL || 'https://uniquecafe.techuniqueiit.in'
            }/menu?offer=${eventOffer._id}" class="cta-button">
              Order Now
            </a>
          </center>
          
          <p>We can't wait to serve you!</p>
          <p>The Unique Café Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Unique Café. All rights reserved.</p>
          <p>
            <a href="${
              process.env.FRONTEND_URL || 'https://uniquecafe.techuniqueiit.in'
            }/unsubscribe?email={{email}}">Unsubscribe</a> | 
            <a href="${
              process.env.FRONTEND_URL || 'https://uniquecafe.techuniqueiit.in'
            }/contact">Contact Us</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate welcome email HTML
 * @param {Object} user - User data
 * @returns {String} - HTML email content
 */
const generateWelcomeEmailHTML = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Unique Café</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
        }
        .header {
          background: linear-gradient(to right, #b45309, #d97706, #f59e0b);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          border: 1px solid #eee;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .welcome-offer {
          background-color: #fff8e1;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(to right, #b45309, #d97706);
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Unique Café</h1>
          <p>Welcome to Our Culinary Family!</p>
        </div>
        <div class="content">
          <p>Hello ${user.name || 'there'},</p>
          
          <p>Thank you for joining the Unique Café family! We're delighted to have you as part of our community.</p>
          
          <div class="welcome-offer">
            <h3>Your Welcome Gift: 10% OFF</h3>
            <p>Enjoy 10% off on your first order with us!</p>
            <p><strong>Use code:</strong> <span style="background:#f0f0f0;padding:3px 8px;border-radius:4px;font-family:monospace">WELCOME10</span> at checkout</p>
            <p><em>Valid for 30 days from today.</em></p>
          </div>
          
          <p>At Unique Café, we pride ourselves on serving authentic, delicious cuisine made with the freshest ingredients and prepared with love.</p>
          
          <center>
            <a href="${
              process.env.FRONTEND_URL || 'https://uniquecafe.techuniqueiit.in'
            }/menu" class="cta-button">
              Browse Our Menu
            </a>
          </center>
          
          <p>If you have any questions or special requests, please don't hesitate to contact us!</p>
          <p>Warm regards,</p>
          <p>The Unique Café Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Unique Café. All rights reserved.</p>
          <p>
            <a href="${
              process.env.FRONTEND_URL || 'https://uniquecafe.techuniqueiit.in'
            }/unsubscribe?email=${user.email}">Unsubscribe</a> | 
            <a href="${
              process.env.FRONTEND_URL || 'https://uniquecafe.techuniqueiit.in'
            }/contact">Contact Us</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  generateEventOfferEmailHTML,
  generateWelcomeEmailHTML,
};
