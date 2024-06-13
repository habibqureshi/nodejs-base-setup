const Headers = require('../enums/headers');
const MimeType = require('../enums/mime-type');
const { logger } = require('../utils/logger');
const proxyHandler = require('./proxy-handler');
const { multerService } = require('../services/multer');
const { urls } = require('../utils/url-redirect');
const context = require('../utils/async-context');

const findMappedEndPoint = (req) => {
  let platform = req.originalUrl.split('/')[1];
  let endPoint = req.originalUrl.replace('/' + platform, '').split('?')[0];

  let obj = urls[platform][endPoint]
    ? urls[platform][endPoint][req.method]
      ? urls[platform][endPoint][req.method]
      : urls[platform][endPoint]
    : urls[platform]['/**'];

  let url =
    (obj.originalUrl ? obj.originalUrl : endPoint) +
    updateOriginalUrlWithQuery(req);

  logger.info('url: ', obj);

  req.originalUrl = url ? url : req.originalUrl;
  req.method = obj.method ? obj.method : req.method;
  return {
    backend: obj.backend,
  };
};

const updateOriginalUrlWithQuery = (req) => {
  let mergedEncodedQuery = '';
  let keys = Object.keys(req.query);
  if (keys.length > 0) {
    mergedEncodedQuery += '?';
    keys.map((e, ind, arr) => {
      mergedEncodedQuery += `${e}=${encodeURIComponent(req.query[e])}`;
      ind + 1 != arr.length && (mergedEncodedQuery += '&');
    });
  }
  return mergedEncodedQuery;
};

const requestForwarder = async (req, res, next, cb) => {
  try {
    logger.info('queryParams: ', JSON.stringify(req.query));
    logger.info('headers', JSON.stringify(req.headers));

    const { backend } = findMappedEndPoint(req);
    logger.info('backend: ', backend);
    if (
      !req.isMulterServiceExecuted &&
      req.headers[Headers.CONTENT_TYPE]?.includes(MimeType.FORM_DATA)
    ) {
      logger.info('MULTER');
      await multerService(req, res, next);
      req.body.fileBucket = req.body;
      req.isMulterServiceExecuted = true;
      req.headers = {
        [Headers.USER_AGENT]: req.headers[Headers.USER_AGENT],
        [Headers.CONTENT_TYPE]: req.headers[Headers.CONTENT_TYPE],
        [Headers.X_TENANT_ID]: context.get('db'),
      };
      await proxyHandler(req, res, backend, cb);
    } else {
      logger.info('Forwarding Request');
      req.headers = {
        [Headers.USER_AGENT]: req.headers[Headers.USER_AGENT],
        [Headers.CONTENT_TYPE]: req.headers[Headers.CONTENT_TYPE],
        [Headers.X_TENANT_ID]: context.get('db'),
      };
      await proxyHandler(req, res, backend, cb);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { requestForwarder };
