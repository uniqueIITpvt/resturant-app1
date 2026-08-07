# Restaurant Business API

A RESTful API for managing restaurant business operations, built with Node.js and Express.

## Features

- User authentication and authorization
- **Dual OTP verification** (Email & SMS via Twilio)
- Product management
- Order management
- Category management
- Coupon system
- Email notifications
- Event offers & promotions
- File uploads
- User address management
- Phone number verification

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- Bcrypt for password hashing
- Multer & Cloudinary for file uploads
- Nodemailer for email sending
- **Twilio for SMS OTP verification**

## API Documentation

The API is fully documented using Swagger/OpenAPI. Once the server is running, you can access the interactive documentation at:

```
http://localhost:5000/api-docs
```

### Swagger Documentation Structure

We use a modular approach for Swagger documentation, with separate YAML files for each feature:

```
backend/docs/swagger/
├── swagger.yaml            # Main configuration
├── schemas.yaml            # Shared schemas
├── auth.routes.yaml        # Authentication endpoints
├── category.routes.yaml    # Category management
├── coupon.routes.yaml      # Coupon management
├── email.routes.yaml       # Email sending operations
├── eventOffer.routes.yaml  # Event offers management
├── order.routes.yaml       # Order management
├── product.routes.yaml     # Product management
├── upload.routes.yaml      # File upload operations
└── user.routes.yaml        # User management
```

For detailed documentation on how the Swagger setup works, see [Swagger Documentation Guide](./docs/swagger/README.md).

For setting up Twilio SMS OTP authentication, see [Twilio Setup Guide](./docs/TWILIO_SETUP.md).

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/restaurant-business.git
   cd restaurant-business
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password

   # Twilio Configuration (for SMS OTP)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Routes

The API provides the following main route groups:

- `/api/auth` - Authentication routes (register, login, etc.)
- `/api/products` - Product management
- `/api/categories` - Category management
- `/api/orders` - Order management
- `/api/users` - User management
- `/api/coupons` - Coupon management
- `/api/event-offers` - Event and offer management
- `/api/email` - Email sending operations
- `/api/upload` - File upload operations

## Development

Start the development server with hot reload:

```
npm run dev
```

## Production

For production deployment:

```
npm start
```

## License

[MIT License](LICENSE)

## Contact

For any questions, please contact [your-email@example.com](mailto:your-email@example.com).
