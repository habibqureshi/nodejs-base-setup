// const redis = require('redis');
const Redis = require('ioredis');
const { logger } = require('../utils/logger');

const masterConfig = {
  username: process.env.REDIS_MASTER_USER,
  password: process.env.REDIS_MASTER_PASSWORD,
  host: process.env.REDIS_MASTER_HOST,
  port: process.env.REDIS_MASTER_PORT,
};

const slaveConfig = {
  username: process.env.REDIS_SLAVE_USER,
  password: process.env.REDIS_SLAVE_PASSWORD,
  host: process.env.REDIS_SLAVE_HOST,
  port: process.env.REDIS_SLAVE_PORT,
};

const redisMaster = new Redis(masterConfig);
redisMaster.on('connect', () => {
  logger.info('redis master connection check', redisMaster.status);
});

redisMaster.on('error', (err) => {
  // logger.info('error while connecting to redis master ', err.message);
});

const redisSlave = new Redis(slaveConfig);
redisSlave.on('connect', () => {
  logger.info('redis slave connection check', redisSlave.status);
});
redisSlave.on('error', (err) => {
  // logger.info('error while connecting to redis slave ', err.message);
});

const deleteKey = async (key) => {
  return redisMaster && (await redisMaster.del(key));
};

const checkKey = async (key) => {
  return (
    (redisSlave && (await redisSlave.exists(key))) ||
    (redisMaster && (await redisMaster.exists(key))) ||
    false
  );
};

const setKey = async (key) => {
  return redisMaster && (await redisMaster.set(key, '', 'EX', 60));
};

const setData = async (key, data) => {
  return redisMaster && (await redisMaster.set(key, data));
};

const getKey = async (key) => {
  return (
    (redisSlave && (await redisSlave.get(key))) ||
    (redisMaster && (await redisMaster.get(key)))
  );
};

const clearCache = async () => {
  return (
    redisMaster &&
    (await redisMaster.flushdb((err, result) => {
      if (err) {
        logger.error('error while flushing db ', err.message);
      } else {
        logger.info('db flushed');
      }
    }))
  );
};

module.exports = {
  setKey,
  checkKey,
  deleteKey,
  getKey,
  setData,
  clearCache,
};
