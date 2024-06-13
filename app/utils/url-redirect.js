const managementBackEnd = process.env.MANAGEMENT_BACKEND;
const lastMileBackend = process.env.LATS_MILE_BACKEND;
const fulfilmentBackend = process.env.FULFILLMENT_BACKEND;

let urls = {
  api: {
    '/create/order': {
      originalUrl: '/order',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/fulfilment/order': {
      originalUrl: '/fulfilment/order',
      backend: fulfilmentBackend,
      method: 'POST',
    },
    '/create/reverse/order': {
      originalUrl: '/order',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/product': {
      POST: {
        originalUrl: '/product',
        backend: fulfilmentBackend,
        method: 'POST',
      },
      GET: {
        originalUrl: '/product',
        backend: fulfilmentBackend,
        method: 'GET',
      },
    },
    '/product/update': {
      originalUrl: '/product',
      backend: fulfilmentBackend,
      method: 'PUT',
    },
    '/get/status': {
      originalUrl: '/get/status',
      backend: lastMileBackend,
      method: 'GET',
    },
    '/get/sub/status': {
      originalUrl: '/get/sub/status',
      backend: lastMileBackend,
      method: 'GET',
    },
    '/contact/us': {
      originalUrl: '/management/contact/us',
      backend: managementBackEnd,
      method: 'POST',
    },
    '/request/quote': {
      originalUrl: '/management/request/quote',
      backend: managementBackEnd,
      method: 'POST',
    },
    '/careers': {
      originalUrl: '/management/careers',
      backend: managementBackEnd,
      method: 'POST',
    },
    '/transit/fetch': {
      originalUrl: '/management/transit/fetch',
      backend: managementBackEnd,
      method: 'POST',
    },
    '/order/cancel': {
      originalUrl: '/order/cancel',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/get/all/city/list': {
      originalUrl: '/management/get/all/city/list',
      backend: managementBackEnd,
      method: 'GET',
    },
    '/get/awb': {
      originalUrl: '/order/get/awb',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/order/track': {
      originalUrl: '/order/track',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/order/track/': {
      originalUrl: '/order/track',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/order/schedule/pre/check': {
      originalUrl: '/order/schedule/pre/check',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/order/schedule/pre/check/': {
      originalUrl: '/order/schedule/pre/check',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/order/schedule/': {
      originalUrl: '/order/schedule/customer',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/create/fulfilment/order/for/magento/LM': {
      originalUrl: '/order',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/create/fulfilment/order/for/magento/FUL': {
      originalUrl: '/fulfilment/order',
      backend: fulfilmentBackend,
      method: 'POST',
    },
    '/create/order/for/zid/LM': {
      originalUrl: '/order',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/create/order/for/zid': {
      originalUrl: '/fulfilment/order',
      backend: fulfilmentBackend,
      method: 'POST',
    },
    '/create/order/for/salla/LM': {
      originalUrl: '/order',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/create/order/for/salla': {
      originalUrl: '/fulfilment/order',
      backend: fulfilmentBackend,
      method: 'POST',
    },
    '/create/shopify/order': {
      originalUrl: '/order',
      backend: lastMileBackend,
      method: 'POST',
    },
    '/shopify/fulfilment/order': {
      originalUrl: '/fulfilment/order',
      backend: fulfilmentBackend,
      method: 'POST',
    },
    '/create/store': {
      originalUrl: '/management/create/shopify/store',
      backend: managementBackEnd,
      method: 'POST',
    },
    'create/shopify/store': {
      originalUrl: '/management/create/shopify/store',
      backend: managementBackEnd,
      method: 'POST',
    },
    '/get/store': {
      originalUrl: '/management/get/store',
      backend: managementBackEnd,
    },
    'delete/store': {
      originalUrl: '/management/delete/store',
      backend: managementBackEnd,
    },
    '/get/payment/method': {
      originalUrl: '/management/get/payment/method',
      backend: managementBackEnd,
    },
    '/order/check/statuses': {
      originalUrl: '/order/check/statuses',
      backend: lastMileBackend,
    },
    '/get/all/countries': {
      originalUrl: '/management/get/all/countries',
      backend: managementBackEnd,
    },
    '/get/all/cities': {
      originalUrl: '/management/get/all/cities',
      backend: managementBackEnd,
    },
    '/user/signup': {
      originalUrl: '/user/signup',
      backend: managementBackEnd,
    },
    '/c2c/send/otp': {
      originalUrl: '/c2c/send/otp',
      backend: managementBackEnd,
    },
    '/c2c/verify/otp': {
      originalUrl: '/c2c/verify/otp',
      backend: managementBackEnd,
    },
    '/c2c/signup': {
      originalUrl: '/c2c/signup',
      backend: managementBackEnd,
    },
    '/platform/oauth/zid': {
      originalUrl: '/platform/oauth/zid',
      backend: managementBackEnd,
    },
    '/platform/zid/auto/dispatching': {
      originalUrl: '/platform/zid/auto/dispatching',
      backend: managementBackEnd,
    },
    '/platform/oauth/salla': {
      originalUrl: '/platform/oauth/salla',
      backend: managementBackEnd,
    },
    '/platform/salla/token': {
      originalUrl: '/platform/salla/token',
      backend: managementBackEnd,
    },
  },
  LM: {
    '/**': {
      backend: lastMileBackend,
    },
  },
  FUL: {
    '/**': {
      backend: fulfilmentBackend,
    },
  },
  MAN: {
    '/**': {
      backend: managementBackEnd,
    },
  },
};

module.exports = {
  urls,
};
