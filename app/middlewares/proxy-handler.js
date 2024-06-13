const Util = require('../utils/Util');
const { default: axios } = require('axios');
const { RESPONSE_MESSAGES } = require('../utils/Constant');
const Headers = require('../enums/headers');
const MimeType = require('../enums/mime-type');
const { logger } = require('../utils/logger');

module.exports = async (req, res, backend, cb) => {
  let serviceRes;
  let err;
  try {
    const reqHeaders = { reqId: req.reqId };
    if (req.user?.currentUser) {
      reqHeaders.user = req.user.currentUser;
    }
    const user = JSON.stringify(reqHeaders);

    req.headers = {
      ...req.headers,
      'X-Auth-User': Buffer.from(user, 'utf-8').toString('base64'),
    };

    logger.info('calling', req.method + ' ' + backend + req.originalUrl);

    serviceRes = await axios({
      method: req.method,
      url: backend + req.originalUrl,
      data: req.body,
      headers: req.headers,
      responseType: 'arraybuffer',
    });
  } catch (error) {
    err = error;
    err.code && logger.error('error', error.code);
    serviceRes = error.response;
  }

  if (serviceRes && serviceRes.headers[Headers.CONTENT_TYPE]) {
    // logger.info(serviceRes.headers);
    switch (serviceRes.headers[Headers.CONTENT_TYPE].split(' ')[0]) {
      case MimeType.EXCEL:
      case MimeType.STREAM:
        logger.info('file response');
        res.setHeader(
          Headers.CONTENT_TYPE,
          serviceRes.headers[Headers.CONTENT_TYPE]
        );
        res.setHeader(
          Headers.CONTENT_DISPOSITION,
          serviceRes.headers[Headers.CONTENT_DISPOSITION]
        );
        res.write(serviceRes.data);
        res.end();
        break;
      default:
        logger.info('default response');
        let response;
        try {
          response = JSON.parse(serviceRes.data.toString());
        } catch (error) {
          response = serviceRes.data.toString();
        }
        logger.info('backend response', JSON.stringify(response));
        cb && (await cb(response));
        res.status(serviceRes.status).send(response);
    }
  } else {
    (err.code === 'ECONNREFUSED' &&
      Util.getNoServiceRequest(RESPONSE_MESSAGES.SERVICE_UNAVAILABLE, res)) ||
      Util.getISERequest(
        err.response?.data.message ||
          err.message ||
          RESPONSE_MESSAGES.SERVER_ERROR,
        res
      );
  }
};
