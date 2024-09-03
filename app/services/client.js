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

<<<<<<< HEAD
async function updateClient(id, data) {
=======
async function update(id, data) {
>>>>>>> 584d2141941c144e8cd3b735477f945aa5c78e9e
  logger.info('updating client');
  try {
    return await getConnection().Client.update(data, { where: { id } });
  } catch (error) {
    logger.error('Failed to update client', error);
    throw new Error(`Failed to update client: ${error.message}`);
  }
}

module.exports = {
  getClientByUser,
  getClientById,
<<<<<<< HEAD
  updateClient,
=======
  update,
>>>>>>> 584d2141941c144e8cd3b735477f945aa5c78e9e
};
