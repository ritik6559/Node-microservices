const amqp = require('amqplib');
const logger = require('./logger')
const {error} = require("winston");

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
    } catch (e) {
        logger.error('Media service error connecting to RabbitMq', e);
    }
}

const publishEvent = async (routingKey, message) => {
    try{

        if( !channel ){
            await connectRabbitMQ();
        }

        await channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)) );
    } catch (e) {
        logger.error('Media service error publishing event to RabbitMq', e);
        throw e;
    }
}

const consumeEvent = async (routingKey, callback) => {
    if( !channel ){
        await connectRabbitMQ();
    }

    const q = await channel.assertQueue('', {exclusive: true});
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    await channel.consume(q.queue, (msg) => {
        if( msg !== null ) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });

    logger.info('Media service started consuming events from RabbitMQ');
}

module.exports = {
    connectRabbitMQ,
    publishEvent,
    consumeEvent,
};
