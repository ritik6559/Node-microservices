const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');

const initDatabase = require('./database/db')
const mediaRoutes = require('./routes/media.route')
const errorHandler = require('./middlewares/error-handler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3003;

initDatabase().then(() => {
    console.log('Database Connected');
});

app.use(cors())
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

app.use("/api/media", mediaRoutes);
app.use(errorHandler);

app.listen(PORT, () => {

});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
