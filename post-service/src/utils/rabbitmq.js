const amqp = require('amqplib');
const logger = require('./logger');
require('dotenv').config();

let connection = null;
let channel = null;

const EXCHANGE_NAME='social_events';

const connectRabbitMQ = async () => {
    try{
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', {durable: false});
        logger.info('Connected to RabbitMQ')
        return channel;
    } catch (error) {
        logger.error('Error connecting to rabbitmq ', error );
        console.log(error);
    }
}

const publishEvent = async (routingKey, message) => {
    if( !channel ){
        await connectRabbitMQ();
    }

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));

    logger.info('Published event to RabbitMQ', message);

}

module.exports = {
    connectRabbitMQ,
    publishEvent
};
