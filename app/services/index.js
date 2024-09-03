const AuthService = require('./auth');
const UsersService = require('./users');
const RedisService = require('./redis');
const ApiService = require('./api');
const LastMileService = require('./last-mile');
const FulfilmentService = require('./fulfilment');
const ProductService = require('./product');
const UserService = require('./users');
const ClientStoreService = require('./client-store');
const DomainService = require('./domain');
const TenantService = require('./tenant');
const IntraTenantService = require('./intra-tenant');
module.exports = {
  AuthService,
  UsersService,
  RedisService,
  ApiService,
  LastMileService,
  FulfilmentService,
  ProductService,
  UserService,
  ClientStoreService,
  DomainService,
  TenantService,
  IntraTenantService,
};
