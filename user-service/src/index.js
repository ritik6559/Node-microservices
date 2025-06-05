const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const Redis = require('ioredis')
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')

const logger = require('./utils/logger')
const authRoutes = require('./routes/user.route')
const initDatabase = require('./database/db')
const errorHandler = require("./middlewares/error-handler");

require('dotenv').config()

initDatabase().then(() => {
    console.log('Database Connected')
});

const app = express();

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors())
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    next();
});

const redisClient = new Redis(process.env.REDIS_URL);

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
}) // 10 requests in 1 second

app.use((req, res, next) => {
    rateLimiter.consume(req.ip).then(() => {
        next();
    }).catch((err) => {
        logger.warn(`Rate limit exceeded for: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests'
        });
    });
});

const endpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Endpoint rate limit exceeded for ip: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests'
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    }),
});

app.use("/api/auth/register", endpointsLimiter)

app.use('/api/auth', authRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`User service running on PORT: ${PORT}`);
    console.log(`Server started on port ${PORT}`);
});

// unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error('unhandled rejection at ', promise, " reason: ", reason);
});







