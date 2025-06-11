const mongoose = require('mongoose');

const logger = require('../utils/logger');
require('dotenv').config();

const initDatabase = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI, )
        logger.info('Connected to DB')
    } catch (error) {
        logger.error('Error connecting to mongodb ', error );
        console.log(error);
    }
}

module.exports = initDatabase;
