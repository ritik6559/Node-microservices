require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');

const postRoutes = require('./routes/post.route');
const errorHandler = require('./middleware/error-handler');
const logger = require('./utils/logger');
const initdatabase = require('./database/db')
const {connectRabbitMQ} = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3002;
const redisClient = new Redis(process.env.REDIS_URL);

initdatabase().then(() => {
    console.log("connected to mongoose");
}).catch(err => {
    logger.error('Error connecting to mongodb: ' + err.stack);
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Received body ${req.body}`);
    next();
});

app.use('/api/posts', (req, res, next) => {
    res.redisClient = redisClient;
    next();
}, postRoutes);

app.use(errorHandler);

async function startSession(){
    try{
        await connectRabbitMQ();
        app.listen(PORT, () => {
            logger.info('Listening on port ' + PORT);
        })

    } catch (err) {
        logger.error('Error starting session: ' + err.stack);
        process.exit(1);
    }
}

startSession()
