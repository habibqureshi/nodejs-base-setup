const Headers = require('../enums/headers');
const MimeType = require('../enums/mime-type');
const proxyHandler = require('../middlewares/proxy-handler');
const { logger } = require('../utils/logger');

async function multerService(req, res, next) {
  const Multer = require('multer');
  const FormData = require('form-data');

  const upload = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 1024 * 1024 * 5, // no larger than 5mb, you can change as needed.
    },
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'user', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'warehouseId', maxCount: 1 },
    { name: 'warehouse', maxCount: 1 },
    { name: 'replenishmentId', maxCount: 1 },
    { name: 'from', maxCount: 1 },
    { name: 'to', maxCount: 1 },
  ]);

  return new Promise((resolve, reject) => {
    upload(req, res, async (err) => {
      if (err instanceof Multer.MulterError) {
        logger.info('MultiError occured when uploading', err);
        return reject(err);
      } else if (err) {
        logger.info('error', err);
        return reject(err);
      }
      logger.info('User -> ', req.body.user);
      logger.info('warehouse ID -> ', req.body.warehouseId);
      logger.info('warehouse -> ', req.body.warehouse);
      logger.info('replenishment ID -> ', req.body.replenishmentId);
      logger.info('From -> ', req.body.from);
      logger.info('To -> ', req.body.to);
      const formData = new FormData();
      req.files?.file?.map((e) => {
        formData.append(e.fieldname, e.buffer, {
          filename: e.originalname,
          contentType: e.mimetype,
        });
      });

      req.files?.image?.map((e) => {
        formData.append(e.fieldname, e.buffer, {
          filename: e.originalname,
          contentType: e.mimetype,
        });
      });

      req.body && req.body.user && formData.append('user', req.body.user);
      req.body &&
        req.body.warehouseId &&
        formData.append('warehouseId', req.body.warehouseId);
      req.body &&
        req.body.warehouse &&
        formData.append('warehouse', req.body.warehouse);
      req.body &&
        req.body.replenishmentId &&
        formData.append('replenishmentId', req.body.replenishmentId);

      req.body && req.body.from && formData.append('from', req.body.from);

      req.body && req.body.to && formData.append('to', req.body.to);

      req.headers = {
        [Headers.USER_AGENT]: req.headers[Headers.USER_AGENT],
        [Headers.HOST]: req.headers[Headers.HOST],
        ...formData.getHeaders(),
      };

      req.body = formData;

      logger.info('returnig form data');
      resolve(formData);
    });
  });
}

module.exports = {
  multerService,
};
