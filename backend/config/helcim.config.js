const config = {
  API: {
    BASE_URL: process.env.HELCIM_API_URL || 'https://api.helcim.com/v2',
    ENDPOINTS: {
      INITIALIZE: '/helcim-pay/initialize',
      PURCHASE: '/payment/purchase',
      VERIFY: '/helcim-pay/verify',
    },
  },
  PAYMENT: {
    CURRENCIES: {
      USD: 'USD',
      CAD: 'CAD',
    },
    TYPES: {
      PURCHASE: 'purchase',
      PREAUTH: 'preauth',
    },
    METHODS: {
      CC_ACH: 'cc-ach',
    },
  },
  SESSION: {
    EXPIRY_TIME: 30 * 60 * 1000, // 30 minutes in milliseconds
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
  },
  TEST: {
    TEST_MODE: true,
  },
};

module.exports = config;
