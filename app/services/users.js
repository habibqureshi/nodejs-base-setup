const { Roles, Permission, User } = require('../models');
const bcrypt = require('bcrypt');
const { logger } = require('../utils/logger');

const fetchUserForLogin = async (username, password) => {
  try {
    // Fetch user and their roles with permissions
    const user = await User.findOne({
      include: [
        {
          model: Roles,
          attributes: ['id'],
          include: [
            {
              model: Permission,
              attributes: ['name'],
            },
          ],
        },
      ],
      where: { username },
      nest: true, // Ensures nested objects
    });

    // If no user found, return null
    if (!user) {
      logger.warn(`User not found for username: ${username}`);
      return null;
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Invalid password for username: ${username}`);
      return null;
    }

    // User authentication successful
    logger.info(`User successfully authenticated: ${username}`);
    return user;
  } catch (error) {
    // Log the error and rethrow
    logger.error('Error fetching user for login:', error);
    throw error;
  }
};


const fetchUserWithUsername = async (username) => {
  logger.info(typeof User);
  return await User.findOne({
    include: [
      {
        model: Roles,
        attributes: ['id', 'name'],
        include: [
          {
            model: Permission,
            attributes: ['name', 'endpoint'],
          },
        ],
      },
    ],

    where: {
      username,
    },
    // raw: true,
    nest: true,
  });
};

module.exports = {
  fetchUserForLogin,
  fetchUserWithUsername,
};
