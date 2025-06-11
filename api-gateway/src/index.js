require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const proxy = require('express-http-proxy')

const logger = require('./utils/logger')
const errorHandler = require("./middleware/error-handler");
const validateToken = require('./middleware/auth-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

// rate limiting
const ratelimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
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

app.use(ratelimit);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    next();
});

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api" )
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error('Proxy error: ', err.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

//setting up proxy for user-service
app.use('/v1/auth', proxy( process.env.USER_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info('Response received from User Service: ' + proxyRes.statusCode)
        return proxyResData;
    }
}));

//setting up proxy for post-service
app.use('/v1/post', validateToken, proxy( process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json'
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;

        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info('Response received from Post Service: ' + proxyRes.statusCode)
        return proxyResData;
    }
}));

//setting up proxy for media-service
app.use('/v1/media', validateToken, proxy( process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;

        if( !srcReq.headers['content-type'].startsWith('multipart/form-data') ) {
            proxyReqOpts.headers['Content-type'] = 'application/json';

        }
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info('Response received from Media Service: ' + proxyRes.statusCode)
        return proxyResData;
    }
}));

//setting up proxy for search-service
app.use('/v1/media', validateToken, proxy( process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;

        if( !srcReq.headers['content-type'].startsWith('multipart/form-data') ) {
            proxyReqOpts.headers['Content-type'] = 'application/json';

        }
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info('Response received from Media Service: ' + proxyRes.statusCode)
        return proxyResData;
    }
}));

app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`Api-Gateway listening on ${PORT}`);
    logger.info('User Service running on PORT: ', process.env.USER_SERVICE_URL);
    logger.info('Post Service running on PORT: ', process.env.POST_SERVICE_URL);
    logger.info('Media Service running on PORT: ', process.env.MEDIA_SERVICE_URL);
    logger.info('Search Service running on PORT: ', process.env.SEARCH_SERVICE_URL);
    logger.info('Redis Url: ', process.env.REDIS_URL);
});
