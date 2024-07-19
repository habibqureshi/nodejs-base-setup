const Response = require('./Response');
const Constant = require('./Constant');
const { StatusCodes } = require('http-status-codes');
const { logger } = require('./logger');
('use strict');
class Util {
  static getOkRequest(data, msg, res) {
    const response = new Response();
    response.setData(data);
    response.setMessage(msg);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.OK);
    return res.status(StatusCodes.OK).send(response);
  }

  static getDataOkRequest(data, res) {
    const response = new Response();
    response.setData(data);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.OK);
    return res.status(StatusCodes.OK).send(response);
  }

  static getSimpleOkRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.OK);
    return res.status(StatusCodes.OK).send(response);
  }

  static getBadRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).send(response);
  }

  static getNotContentRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.NO_CONTENT);
    return res.status(StatusCodes.NO_CONTENT).send(response);
  }

  static getUnauthorizedRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.UNAUTHORIZED);
    return res.status(StatusCodes.UNAUTHORIZED).send(response);
  }

  static getPaymentNecessaryRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.PAYMENT_REQUIRED);
    return res.status(StatusCodes.PAYMENT_REQUIRED).send(response);
  }

  static getForbiddenRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.FORBIDDEN);
    return res.status(StatusCodes.FORBIDDEN).send(response);
  }

  static getISERequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(response);
  }

  static getNoServiceRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.SERVICE_UNAVAILABLE);
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).send(response);
  }

  static getNotFoundRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.NOT_FOUND);
    return res.status(StatusCodes.NOT_FOUND).send(response);
  }

  static convertObjectArrayToIntArray(objArray) {
    const idsArray = [];
    objArray.map((obj) => idsArray.push(obj.id));
    return idsArray;
  }

  static makePermissionsArrayForAuthentication(rolesArray) {
    const permissionsArray = [];
    rolesArray.map((role) => {
      role.Permissions.map((permission) => {
        permissionsArray.push(permission.name);
      });
    });
    return permissionsArray;
  }

  static makeWarehousesArray(warehouses) {
    const warehouseArray = [];
    if (warehouses && warehouses.length > 0) {
      warehouses.forEach((warehouse) => {
        warehouseArray.push({
          id: warehouse.id,
          name: warehouse.name,
        });
      });
    }
    return warehouseArray;
  }

  static makePermissionsArrayForAuthorizationFilter(rolesArray) {
    const permissionsArray = [];
    rolesArray.map((role) => {
      role.Permissions.map((permission) => {
        permissionsArray.push(permission.endpoint);
      });
    });
    return permissionsArray;
  }

  static getUnique(array) {
    return Array.from(new Set(array.map(JSON.stringify))).map(JSON.parse);
  }

  static createRequestId(token, method, url, body) {
    let id =
      (token || '') +
      ':' +
      method +
      ':' +
      (url[url.length - 1] === '/' ? url.slice(0, -1) : url) +
      ((typeof body === 'object' && JSON.stringify(body)) || '');

    return Buffer.from(id).toString('base64');
  }

  static createRandomToken(length = 20) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }

  static createSiteVerificationToken() {
    return `${Constant.TECHSHIP_SITE_VERIFICATION}=${this.createRandomToken(
      20
    )}_${this.createRandomToken(16)}`;
  }
}

module.exports = Util;
