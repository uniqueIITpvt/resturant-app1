const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {
  sendSMSOTP,
  formatPhoneNumber,
  isValidPhoneNumber,
} = require('../utils/twilioService');

// Initialize Nodemailer transporter
let transporter;
try {
  // Check if email credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn(
      '⚠️  Email credentials not provided. EMAIL_USER and EMAIL_PASSWORD environment variables are required for email functionality.'
    );
    transporter = null;
  } else {
    // Gmail configuration
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify the transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
        transporter = null;
      } else {
        console.log('✅ Email transporter is ready to send emails');
      }
    });

    // For Outlook/Hotmail
    // transporter = nodemailer.createTransport({
    //   service: 'outlook',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD
    //   }
    // });

    // For custom SMTP server
    // transporter = nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST, // e.g., 'smtp.yourprovider.com'
    //   port: process.env.EMAIL_PORT, // e.g., 587
    //   secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD
    //   }
    // });
  }
} catch (error) {
  console.error('❌ Nodemailer initialization failed:', error);
  transporter = null;
}

// Utility function to send OTP via email
const sendOTP = async (email, otp, context = 'registration') => {
  console.log(
    `📧 sendOTP called for email: ${email}, OTP: ${
      otp ? '******' : 'none'
    }, context: ${context}`
  );

  if (!transporter) {
    console.error(
      'Email transporter not initialized. Check EMAIL_USER and EMAIL_PASSWORD environment variables.'
    );
    throw new Error(
      'Email service is not configured. Please contact support or try SMS verification if available.'
    );
  }

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Customize content based on context
    const isLogin = context === 'login';
    const title = isLogin
      ? 'Account Verification Required'
      : 'Account Verification';
    const greeting = isLogin
      ? 'We noticed you tried to sign in to your Restaurant App account.'
      : 'Thank you for registering with Restaurant App.';
    const instruction = isLogin
      ? 'To complete your sign-in, please verify your account using the following code:'
      : 'To complete your account verification, please use the following code:';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${title} - Restaurant App`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FF6B35, #f44336); text-align: center; padding: 30px 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">RESTAURANT APP</h1>
            <p style="color: #ffffff; opacity: 0.9; font-size: 16px; margin-top: 5px;">${title}</p>
          </div>
          
          <!-- Main Content -->
          <div style="background-color: #ffffff; padding: 30px 40px; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea;">
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">Hello,</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">${greeting}</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">${instruction}</p>
            
            <div style="text-align: center; margin: 35px 0; padding: 20px;">
              <div style="background: linear-gradient(135deg, #FF6B35, #f44336); display: inline-block; color: white; padding: 15px 40px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                ${otp}
              </div>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">This code will expire in <strong>10 minutes</strong>.</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #FF6B35; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #666; font-size: 14px; margin: 0;">For security reasons, please do not share this code with anyone. Our team will never ask for your verification code.</p>
            </div>
            
            ${
              isLogin
                ? `
            <div style="background-color: #e8f4fd; border-left: 4px solid #2196F3; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #1976D2; font-size: 14px; margin: 0; font-weight: 500;">🔐 This verification is required because your account was not previously verified. Once verified, you won't need to do this again for future logins.</p>
            </div>
            `
                : ''
            }
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #eaeaea; border-top: none;">
            <p style="color: #777; font-size: 14px; margin: 0;">© ${new Date().getFullYear()} Restaurant App. All rights reserved.</p>
            <div style="margin-top: 15px;">
              <p style="color: #999; font-size: 13px; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    if (error.code === 'EAUTH') {
      throw new Error(
        'Email authentication failed. Please check email configuration.'
      );
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Email service unavailable. Please try again later.');
    } else {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }
};

// Utility function to send custom emails
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email format');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Utility function to send OTP via chosen method (email or SMS)
const sendOTPByMethod = async (
  user,
  otp,
  method = 'email',
  context = 'registration'
) => {
  console.log(
    `📤 sendOTPByMethod called with method: ${method}, user: ${
      user.email
    }, phone: ${
      user.phoneNumber ? '***-***-' + user.phoneNumber.slice(-4) : 'none'
    }, context: ${context}`
  );

  try {
    if (method === 'phone') {
      console.log('📱 Sending SMS OTP...');

      // Check if Twilio is configured before attempting SMS
      if (
        !process.env.TWILIO_ACCOUNT_SID ||
        !process.env.TWILIO_AUTH_TOKEN ||
        !process.env.TWILIO_PHONE_NUMBER
      ) {
        throw new Error(
          'SMS verification is currently unavailable. Please use email verification instead.'
        );
      }

      if (!user.phoneNumber) {
        throw new Error('Phone number not provided');
      }

      const formattedPhone = formatPhoneNumber(user.phoneNumber);
      if (!isValidPhoneNumber(formattedPhone)) {
        throw new Error('Invalid phone number format');
      }

      await sendSMSOTP(formattedPhone, otp);
      console.log(`✅ SMS OTP sent successfully to ${formattedPhone}`);
      return { success: true, method: 'phone', destination: formattedPhone };
    } else {
      // Default to email
      console.log('📧 Sending Email OTP...');
      if (!user.email) {
        throw new Error('Email address not provided');
      }

      await sendOTP(user.email, otp, context);
      console.log(`✅ Email OTP sent successfully to ${user.email}`);
      return { success: true, method: 'email', destination: user.email };
    }
  } catch (error) {
    console.error(`❌ Failed to send OTP via ${method}:`, error);
    throw error;
  }
};

// Utility function to send OTP via both email and phone (when available)
const sendOTPViaBothMethods = async (user, otp, context = 'registration') => {
  console.log(
    `📤📱 sendOTPViaBothMethods called for user: ${user.email}, phone: ${
      user.phoneNumber ? '***-***-' + user.phoneNumber.slice(-4) : 'none'
    }, context: ${context}`
  );

  const results = [];
  const errors = [];

  // Always try to send via email first
  try {
    if (user.email) {
      await sendOTP(user.email, otp, context);
      console.log(`✅ Email OTP sent successfully to ${user.email}`);
      results.push({ method: 'email', destination: user.email, success: true });
    }
  } catch (error) {
    console.error('❌ Failed to send email OTP:', error);
    errors.push({ method: 'email', error: error.message });
  }

  // Try to send via SMS if phone number is available and Twilio is configured
  if (
    user.phoneNumber &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    try {
      const formattedPhone = formatPhoneNumber(user.phoneNumber);
      if (isValidPhoneNumber(formattedPhone)) {
        await sendSMSOTP(formattedPhone, otp);
        console.log(`✅ SMS OTP sent successfully to ${formattedPhone}`);
        results.push({
          method: 'phone',
          destination: formattedPhone,
          success: true,
        });
      }
    } catch (error) {
      console.error('❌ Failed to send SMS OTP:', error);
      errors.push({ method: 'phone', error: error.message });
    }
  }

  // Return results
  if (results.length === 0) {
    throw new Error(
      'Failed to send OTP via any method. Please contact support.'
    );
  }

  return {
    success: true,
    results,
    errors: errors.length > 0 ? errors : undefined,
    methods: results.map((r) => r.method),
    message:
      results.length > 1
        ? `OTP sent via ${results.map((r) => r.method).join(' and ')}`
        : `OTP sent via ${results[0].method}`,
  };
};

class AuthController {
  // Public register for regular users
  async publicRegister(req, res) {
    try {
      console.log('Registration request received:', {
        email: req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber
          ? '***-***-' + req.body.phoneNumber.slice(-4)
          : 'not provided',
        otpMethod: req.body.otpMethod || 'email',
      });

      const {
        name,
        email,
        password,
        phoneNumber,
        otpMethod = 'email',
      } = req.body;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Invalid email format',
        });
      }

      // Validate phone number if provided and OTP method is phone
      if (otpMethod === 'phone') {
        if (!phoneNumber) {
          return res.status(400).json({
            message: 'Phone number is required for phone verification',
          });
        }

        // Check if Twilio is configured for SMS
        if (
          !process.env.TWILIO_ACCOUNT_SID ||
          !process.env.TWILIO_AUTH_TOKEN ||
          !process.env.TWILIO_PHONE_NUMBER
        ) {
          return res.status(400).json({
            message:
              'SMS verification is currently unavailable. Please use email verification instead.',
          });
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!isValidPhoneNumber(formattedPhone)) {
          return res.status(400).json({
            message:
              'Invalid phone number format. Please use a valid phone number.',
          });
        }
      }

      // Check if user already exists
      console.log('Checking if user exists with email:', email);
      try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          console.log('User already exists with email:', email);
          return res.status(400).json({
            message: 'User with this email already exists',
          });
        }
      } catch (dbError) {
        console.error('Database error when checking existing user:', dbError);
        return res.status(500).json({
          message: 'Database error when checking existing user',
          error: dbError.message,
        });
      }

      console.log('Creating new user with email:', email);
      // Create new user with default 'user' role
      const user = new User({
        name,
        email,
        password,
        phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : undefined,
        role: 'user', // Default role for public registration
      });

      // Generate OTP with the specified method
      const otp = user.generateOTP(otpMethod);
      console.log('Generated OTP for user:', {
        email,
        method: otpMethod,
        otp: '******',
      });

      // Save user
      try {
        await user.save();
        console.log('User saved successfully:', { id: user._id, email });
      } catch (saveError) {
        console.error('Error saving user:', saveError);
        return res.status(500).json({
          message: 'Error saving user to database',
          error: saveError.message,
        });
      }

      // Send OTP via the chosen method
      try {
        const otpResult = await sendOTPByMethod(user, otp, otpMethod);
        console.log('OTP sent successfully:', otpResult);
      } catch (otpError) {
        console.error('Failed to send OTP:', otpError);
        // Delete the user if OTP sending fails
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          message: `Failed to send OTP via ${otpMethod}. ${otpError.message}`,
        });
      }

      // Note: Welcome email will be sent after successful verification
      // This ensures users only receive the OTP during registration

      // Return success response
      const verificationMessage =
        otpMethod === 'phone'
          ? 'Registration successful. Please verify your account with the OTP sent to your phone.'
          : 'Registration successful. Please verify your account with the OTP sent to your email.';

      return res.status(201).json({
        message: verificationMessage,
        userId: user._id,
        otpMethod: otpMethod,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      return res.status(500).json({
        message: 'Registration failed',
        error: error.message,
      });
    }
  }

  // Admin register (only for admin/superadmin accounts, requires superadmin privileges)
  async adminRegister(req, res) {
    try {
      const { name, email, password, role, isVerified } = req.body;

      // Only superadmin can create admin/superadmin accounts
      if (
        req.user.role !== 'superadmin' &&
        (role === 'admin' || role === 'superadmin')
      ) {
        return res.status(403).json({
          message: 'Only superadmins can create admin or superadmin accounts',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Invalid email format',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists',
        });
      }

      // Validate role
      const validRoles = ['user', 'admin', 'superadmin'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({
          message: 'Invalid role. Role must be user, admin, or superadmin',
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role: role || 'user', // Default to user if not specified
        isVerified: isVerified === true, // Set isVerified based on the request
      });

      // If the user is not pre-verified, generate OTP
      if (!user.isVerified) {
        // Generate OTP
        const otp = user.generateOTP();

        // Save user
        await user.save();

        // Send OTP
        try {
          await sendOTP(email, otp);
        } catch (error) {
          // If OTP sending fails, delete the user and return error
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({ message: error.message });
        }

        return res.status(201).json({
          message: 'User registered successfully. Please verify your email.',
          userId: user._id,
        });
      } else {
        // For pre-verified users, don't generate OTP
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(201).json({
          message: 'User registered and verified successfully.',
          userId: user._id,
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Verify OTP
  async verifyOTP(req, res) {
    try {
      const { userId, otp } = req.body;

      console.log('Verifying OTP:', { userId, otp: otp ? '******' : 'empty' });

      // Validate input
      if (!userId || !otp) {
        return res.status(400).json({
          message: 'User ID and OTP are required',
        });
      }

      // Make sure to include otp and otpExpires fields when fetching the user
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found with ID:', userId);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User found, verifying OTP...', {
        hasOtp: !!user.otp,
        otpExpiry: user.otpExpires
          ? new Date(user.otpExpires).toISOString()
          : 'none',
        isExpired: user.otpExpires
          ? new Date(user.otpExpires) < new Date()
          : true,
        currentTime: new Date().toISOString(),
      });

      // Check if OTP exists
      if (!user.otp || !user.otpExpires) {
        console.log('No OTP found for user');
        return res.status(400).json({
          message: 'No OTP found. Please request a new OTP.',
        });
      }

      // Check if OTP is expired
      if (new Date(user.otpExpires) < new Date()) {
        console.log('OTP expired');
        return res.status(400).json({
          message: 'OTP has expired. Please request a new OTP.',
        });
      }

      // Check if OTP matches
      if (user.otp !== otp) {
        console.log('OTP verification failed', {
          providedOtp: otp,
          actualOtp: user.otp ? '******' : 'none',
          match: user.otp === otp,
        });
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      console.log('OTP verified successfully');

      // Mark user as verified and update verification status based on method
      user.isVerified = true;

      // Mark the specific verification method as verified
      if (user.otpMethod === 'phone') {
        user.phoneVerified = true;
      } else {
        user.emailVerified = true;
      }

      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpMethod = undefined; // Clear the method after successful verification
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send welcome email after successful verification
      try {
        const emailController = require('./email.controller');

        // Send welcome email (don't await to prevent blocking the response)
        emailController
          .sendWelcomeEmail(
            {
              params: { userId: user._id },
            },
            {
              status: () => ({
                json: () => {}, // Mock response object
              }),
            }
          )
          .catch((err) => {
            console.error('Error sending welcome email:', err);
            // We don't fail the verification if welcome email fails
          });
      } catch (emailError) {
        console.error('Error setting up welcome email:', emailError);
        // We don't fail the verification if welcome email fails
      }

      const verificationMessage =
        user.phoneVerified && user.emailVerified
          ? 'Account verified successfully'
          : user.phoneVerified
          ? 'Phone number verified successfully'
          : 'Email verified successfully';

      res.json({
        message: verificationMessage,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        },
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, phoneNumber, password } = req.body;

      // Validate that either email or phone number is provided
      if (!email && !phoneNumber) {
        return res.status(400).json({
          message: 'Either email or phone number is required',
        });
      }

      if (email && phoneNumber) {
        return res.status(400).json({
          message: 'Please provide either email or phone number, not both',
        });
      }

      let user;
      let loginMethod;

      // Find user by email or phone number
      if (email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            message: 'Invalid email format',
          });
        }

        user = await User.findOne({ email }).select('+password');
        loginMethod = 'email';
      } else {
        // Validate and format phone number
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!isValidPhoneNumber(formattedPhone)) {
          return res.status(400).json({
            message: 'Invalid phone number format',
          });
        }

        user = await User.findOne({ phoneNumber: formattedPhone }).select(
          '+password'
        );
        loginMethod = 'phone';
      }

      if (!user) {
        const identifier = email || phoneNumber;
        return res.status(404).json({
          message: `User not found with ${loginMethod}: ${identifier}`,
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        console.log('User is not verified, sending OTP for verification...');

        // Generate new OTP (use the login method for storage)
        const otp = user.generateOTP(loginMethod);
        await user.save();

        // Send OTP via the method used for login
        try {
          const otpResult = await sendOTPByMethod(
            user,
            otp,
            loginMethod,
            'login'
          );
          console.log('OTP sent for unverified user login:', otpResult);

          // Create a message based on the login method
          const methodText =
            loginMethod === 'phone' ? 'phone number' : 'email address';
          const verificationMessage = `Account not verified. We have sent a verification code to your ${methodText}.`;

          return res.status(403).json({
            message: verificationMessage,
            userId: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            requiresVerification: true,
            sentMethods: [loginMethod],
            otpMethod: loginMethod,
            availableMethods: {
              email: !!user.email,
              phone: !!(
                user.phoneNumber &&
                process.env.TWILIO_ACCOUNT_SID &&
                process.env.TWILIO_AUTH_TOKEN &&
                process.env.TWILIO_PHONE_NUMBER
              ),
            },
          });
        } catch (error) {
          console.error(`Failed to send OTP via ${loginMethod}:`, error);

          // Provide more specific error messages based on the method
          let errorMessage = `Failed to send verification code to your ${
            loginMethod === 'phone' ? 'phone number' : 'email address'
          }. `;

          if (loginMethod === 'email') {
            if (error.message.includes('Email service is not configured')) {
              errorMessage +=
                'Email service is currently unavailable. Please contact support.';
            } else if (error.message.includes('authentication failed')) {
              errorMessage +=
                'Email service configuration error. Please contact support.';
            } else if (error.message.includes('service unavailable')) {
              errorMessage +=
                'Email service is temporarily unavailable. Please try again later.';
            } else {
              errorMessage +=
                'Please try again or contact support if the problem persists.';
            }
          } else {
            if (
              error.message.includes(
                'SMS verification is currently unavailable'
              )
            ) {
              errorMessage +=
                'SMS service is currently unavailable. Please try logging in with your email address instead.';
            } else {
              errorMessage +=
                'Please try again or contact support if the problem persists.';
            }
          }

          return res.status(400).json({
            message: errorMessage,
            details: error.message,
            userId: user._id, // Still provide userId so user can try resending
            email: user.email,
            phoneNumber: user.phoneNumber,
            requiresVerification: true,
            loginMethod: loginMethod,
            availableMethods: {
              email: !!user.email,
              phone: !!(
                user.phoneNumber &&
                process.env.TWILIO_ACCOUNT_SID &&
                process.env.TWILIO_AUTH_TOKEN &&
                process.env.TWILIO_PHONE_NUMBER
              ),
            },
          });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Resend OTP
  async resendOTP(req, res) {
    try {
      const { userId, otpMethod } = req.body;
      console.log(
        'Resending OTP request for user:',
        userId,
        'method:',
        otpMethod
      );

      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found for resend OTP:', userId);
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate new OTP (use email as default method for storage)
      const otp = user.generateOTP('email');
      console.log('New OTP generated for user:', {
        userId,
        otp: '******',
      });

      try {
        await user.save();
        console.log('User saved with new OTP');
      } catch (saveError) {
        console.error('Error saving user with new OTP:', saveError);
        return res
          .status(500)
          .json({ message: 'Error saving OTP information' });
      }

      // Determine how to send based on otpMethod parameter
      if (otpMethod === 'both' || !otpMethod) {
        // Send via both methods when possible
        try {
          const otpResult = await sendOTPViaBothMethods(user, otp, 'login');
          console.log('OTP sent via both methods:', otpResult);

          let successMessage = 'OTP resent successfully';
          if (
            otpResult.methods.includes('email') &&
            otpResult.methods.includes('phone')
          ) {
            successMessage += ' to both your email and phone number';
          } else if (otpResult.methods.includes('phone')) {
            successMessage += ' to your phone number';
          } else {
            successMessage += ' to your email address';
          }

          // Add information about any failed methods
          if (otpResult.errors && otpResult.errors.length > 0) {
            const failedMethods = otpResult.errors
              .map((e) => e.method)
              .join(', ');
            successMessage += `. Note: Could not send via ${failedMethods}`;
          }

          return res.json({
            message: successMessage,
            sentMethods: otpResult.methods,
            availableMethods: {
              email: !!user.email,
              phone: !!(
                user.phoneNumber &&
                process.env.TWILIO_ACCOUNT_SID &&
                process.env.TWILIO_AUTH_TOKEN &&
                process.env.TWILIO_PHONE_NUMBER
              ),
            },
          });
        } catch (error) {
          console.error('Failed to send OTP via any method:', error);
          return res.status(400).json({
            message: `Failed to resend OTP. ${error.message}`,
          });
        }
      } else {
        // Send via specific method
        const method = otpMethod;

        // Validate that user has the required contact info for the chosen method
        if (method === 'phone') {
          // Check if Twilio is configured for SMS
          if (
            !process.env.TWILIO_ACCOUNT_SID ||
            !process.env.TWILIO_AUTH_TOKEN ||
            !process.env.TWILIO_PHONE_NUMBER
          ) {
            return res.status(400).json({
              message:
                'SMS verification is currently unavailable. Please use email verification instead.',
            });
          }

          if (!user.phoneNumber) {
            return res.status(400).json({
              message:
                'Phone number not available. Please use email verification or update your phone number.',
            });
          }
        }

        if (method === 'email' && !user.email) {
          return res.status(400).json({
            message: 'Email address not available.',
          });
        }

        // Send OTP via the chosen method
        try {
          const otpResult = await sendOTPByMethod(user, otp, method);
          console.log('OTP sent successfully:', otpResult);

          const successMessage =
            method === 'phone'
              ? 'OTP resent successfully to your phone'
              : 'OTP resent successfully to your email';

          return res.json({
            message: successMessage,
            sentMethods: [method],
            availableMethods: {
              email: !!user.email,
              phone: !!(
                user.phoneNumber &&
                process.env.TWILIO_ACCOUNT_SID &&
                process.env.TWILIO_AUTH_TOKEN &&
                process.env.TWILIO_PHONE_NUMBER
              ),
            },
          });
        } catch (error) {
          console.error('Failed to send OTP:', error);
          return res.status(400).json({
            message: `Failed to send OTP via ${method}. ${error.message}`,
          });
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Send OTP to phone number (for existing users who want to switch to phone verification)
  async sendPhoneOTP(req, res) {
    try {
      const { email, phoneNumber } = req.body;

      if (!email || !phoneNumber) {
        return res.status(400).json({
          message: 'Email and phone number are required',
        });
      }

      // Check if Twilio is configured for SMS
      if (
        !process.env.TWILIO_ACCOUNT_SID ||
        !process.env.TWILIO_AUTH_TOKEN ||
        !process.env.TWILIO_PHONE_NUMBER
      ) {
        return res.status(400).json({
          message:
            'SMS verification is currently unavailable. Please use email verification instead.',
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Format and validate phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!isValidPhoneNumber(formattedPhone)) {
        return res.status(400).json({
          message:
            'Invalid phone number format. Please use a valid phone number.',
        });
      }

      // Update user's phone number if different
      if (user.phoneNumber !== formattedPhone) {
        user.phoneNumber = formattedPhone;
        user.phoneVerified = false; // Reset phone verification status
      }

      // Generate OTP for phone verification
      const otp = user.generateOTP('phone');
      await user.save();

      // Send OTP via SMS
      try {
        await sendSMSOTP(formattedPhone, otp);
        console.log('Phone OTP sent successfully to:', formattedPhone);
      } catch (error) {
        console.error('Failed to send phone OTP:', error);
        return res.status(400).json({
          message: `Failed to send OTP to phone number. ${error.message}`,
        });
      }

      res.json({
        message: 'OTP sent successfully to your phone number',
        userId: user._id,
        otpMethod: 'phone',
      });
    } catch (error) {
      console.error('Send phone OTP error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Switch OTP method for a user
  async switchOTPMethod(req, res) {
    try {
      const { userId, newMethod, phoneNumber } = req.body;

      if (!userId || !newMethod) {
        return res.status(400).json({
          message: 'User ID and new method are required',
        });
      }

      if (!['email', 'phone'].includes(newMethod)) {
        return res.status(400).json({
          message: 'Invalid OTP method. Must be either "email" or "phone"',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If switching to phone, validate and update phone number
      if (newMethod === 'phone') {
        // Check if Twilio is configured for SMS
        if (
          !process.env.TWILIO_ACCOUNT_SID ||
          !process.env.TWILIO_AUTH_TOKEN ||
          !process.env.TWILIO_PHONE_NUMBER
        ) {
          return res.status(400).json({
            message:
              'SMS verification is currently unavailable. Please use email verification instead.',
          });
        }

        if (!phoneNumber && !user.phoneNumber) {
          return res.status(400).json({
            message: 'Phone number is required for phone verification',
          });
        }

        if (phoneNumber) {
          const formattedPhone = formatPhoneNumber(phoneNumber);
          if (!isValidPhoneNumber(formattedPhone)) {
            return res.status(400).json({
              message:
                'Invalid phone number format. Please use a valid phone number.',
            });
          }
          user.phoneNumber = formattedPhone;
          user.phoneVerified = false; // Reset verification status when changing number
        }
      }

      // Generate new OTP with the new method
      const otp = user.generateOTP(newMethod);
      await user.save();

      // Send OTP via the new method
      try {
        const otpResult = await sendOTPByMethod(user, otp, newMethod);
        console.log('OTP sent via new method:', otpResult);
      } catch (error) {
        console.error('Failed to send OTP via new method:', error);
        return res.status(400).json({
          message: `Failed to send OTP via ${newMethod}. ${error.message}`,
        });
      }

      const successMessage =
        newMethod === 'phone'
          ? 'Switched to phone verification. OTP sent to your phone.'
          : 'Switched to email verification. OTP sent to your email.';

      res.json({
        message: successMessage,
        userId: user._id,
        otpMethod: newMethod,
      });
    } catch (error) {
      console.error('Switch OTP method error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Forgot Password - Send reset link
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Invalid email format',
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token (using crypto)
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash the token before saving to database
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set token expiry (1 hour)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      await user.save();

      // Create reset URL
      const frontendUrl =
        process.env.FRONTEND_URL || 'https://resturant-app1frontend.vercel.app';
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

      // Send email with reset link
      const emailContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FF6B35, #f44336); text-align: center; padding: 30px 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">RESTAURANT APP</h1>
            <p style="color: #ffffff; opacity: 0.9; font-size: 16px; margin-top: 5px;">Password Reset Request</p>
          </div>
          
          <!-- Main Content -->
          <div style="background-color: #ffffff; padding: 30px 40px; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea;">
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">Hello,</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">We received a request to reset your password for your Restaurant App account. To complete the process, please click the button below:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" target="_blank" style="background: linear-gradient(to right, #FF6B35, #f44336); color: white; padding: 12px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s;">Reset Your Password</a>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #FF6B35; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #666; font-size: 14px; margin: 0;">For security reasons, this link can only be used once. If you need to reset your password again, please request a new link.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #eaeaea; border-top: none;">
            <p style="color: #777; font-size: 14px; margin: 0;">© ${new Date().getFullYear()} Restaurant App. All rights reserved.</p>
            <div style="margin-top: 15px;">
              <p style="color: #999; font-size: 13px; margin: 0;">If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: 'Password Reset Request',
          html: emailContent,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(500).json({
          message: 'Error sending password reset email',
        });
      }

      res.status(200).json({
        message: 'Password reset link sent to your email',
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Verify reset token validity
  async verifyResetToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }

      // Hash the token from the URL to compare with the one in the database
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid reset token and token not expired
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }, // token not expired
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      res.status(200).json({ message: 'Token is valid' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Reset Password with token
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: 'Token and password are required' });
      }

      // Validate password length
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 6 characters long' });
      }

      // Hash the token from the URL to compare with the one in the database
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid reset token and token not expired
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }, // token not expired
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Update password
      user.password = password;

      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Check if email or phone number is available
  async checkAvailability(req, res) {
    try {
      const { email, phoneNumber } = req.body;

      if (!email && !phoneNumber) {
        return res.status(400).json({
          message: 'Either email or phone number is required',
        });
      }

      const checks = {};
      const conflicts = [];

      // Check email availability
      if (email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            message: 'Invalid email format',
          });
        }

        const existingEmailUser = await User.findOne({ email });
        checks.email = {
          available: !existingEmailUser,
          value: email,
        };

        if (existingEmailUser) {
          conflicts.push({
            field: 'email',
            value: email,
            message: 'An account with this email address already exists',
          });
        }
      }

      // Check phone number availability
      if (phoneNumber) {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!isValidPhoneNumber(formattedPhone)) {
          return res.status(400).json({
            message: 'Invalid phone number format',
          });
        }

        const existingPhoneUser = await User.findOne({
          phoneNumber: formattedPhone,
        });
        checks.phoneNumber = {
          available: !existingPhoneUser,
          value: formattedPhone,
        };

        if (existingPhoneUser) {
          conflicts.push({
            field: 'phoneNumber',
            value: formattedPhone,
            message: 'An account with this phone number already exists',
          });
        }
      }

      // Return results
      if (conflicts.length > 0) {
        return res.status(409).json({
          message: 'Some fields are already in use',
          available: false,
          checks,
          conflicts,
        });
      }

      res.status(200).json({
        message: 'All fields are available',
        available: true,
        checks,
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
