const { Client } = require('./../models');
const { logger } = require('../utils/logger');
const { getConnection } = require('../middlewares/tenant-manager');

async function getClientByUser(userId) {
  logger.info('finding client by user id:', userId);
  try {
    const client = await getConnection().Client.findOne({
      where: { user_id: userId },
      raw: true,
    });
    return client;
  } catch (error) {
    throw new Error('Failed to get client', error);
  }
}

async function getClientById(id) {
  logger.info('finding client by id: ', id);
  try {
    const client = await getConnection().Client.findOne({
      where: { id: id },
      raw: true,
    });
    return client;
  } catch (error) {
    throw new Error('Failed to get client', error);
  }
}

module.exports = {
  getClientByUser,
  getClientById,
};
