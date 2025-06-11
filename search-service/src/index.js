require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");

const logger = require('./utils/logger');
const errorHandler = require('./middleware/error-handler');
const initdatabase = require('./database/db')
const {connectRabbitMQ, consumeEvent} = require("./utils/rabbitmq");
const searchRoutes = require("./routes/search.route");
const {handlePostCreated, handlePostDeleted} = require("./event-handlers/search-event-handlers");

const app = express();
const PORT = process.env.PORT || 3004;
const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

initdatabase().then(() => {
    console.log("connected to mongoose");
}).catch(err => {
    logger.error('Error connecting to mongodb: ' + err.stack);
});

app.use('/api/search', searchRoutes);

app.use(errorHandler)

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

async function startSession(){
    try{
        await connectRabbitMQ();

        await consumeEvent('post.created', handlePostCreated)
        await consumeEvent('post.deleted', handlePostDeleted)

        app.listen(PORT, () => {
            logger.info('Listening on port ' + PORT);
        })
    } catch (err) {
        logger.error('Error starting session: ' + err.stack);
        process.exit(1);
    }
}

startSession()
