import { ConfirmChannel, connect, Connection, Replies } from 'amqplib'
import config from '@root/jest.config'
import { isContainedIn } from './utility-helper-functions'

export const defaultExchange = 'stealth'
const defaultTimeout = 5000

const defaultBrokerConfig = {
  hostname: config.testURL!.split('http://')[1],
  port: 5672,
  username: defaultExchange,
  password: ';subrosa;'
}

// Type definitions for functions
export interface subscriptionInfo { connection: Connection, channel: ConfirmChannel, queue: Replies.AssertQueue, exchange: string, routingKey: string }

/**
*  Method to publish message with routing key on a given RabbitMQ topic based exchange
* @param {string} routingKey message routing key
* @param {any} messageContent the payload of the rabbit message
* @param {string} exchange Rabbit exchange to publish message on
* @throws {Error} If RabbitMQ publish was unsuccessfull
**/
export async function publishMessage({ routingKey, messageContent, exchange = defaultExchange }: { routingKey: string, messageContent: any, exchange?: string }): Promise<void> {
  // Connect to the Rabbit MQ server, create channel, and assert exchange on channel
  const connection = await _connectToRabbitServer()

  // Note: All Stealth app exchanges are of the type: 'topic'
  const channel = await connection.createConfirmChannel()
  await channel.assertExchange(exchange, 'topic', { durable: false })

  // Promise to verify message successfully publishes before continuing
  await new Promise((resolve) => {
    // Creation of buffer depends on variable type
    let buffer: Buffer
    if (typeof messageContent === 'object') {
      buffer = Buffer.from(JSON.stringify(messageContent))
    } else {
      buffer = Buffer.from(messageContent)
    }
    channel.publish(exchange, routingKey, buffer, {}, async () => {
      // Publish has been confirmed once callback is entered
      resolve(true)
    })
  })
    .catch((error) => {
      throw new Error(`An error occurred while attempting to publish ${routingKey}, as follows: ${error}`)
    })
    // Always ensure channel and connection are closed before exiting
    .finally(async () => {
      await channel.close()
      await connection.close()
    })
}

/**
* Method to create subscription for routing key
* @param {string} routingKey message routing key name
* @param {any} exchange RabbitMQ exchange to subscribe on, defaults to stealth
* @returns {Promise<subscriptionInfo>} Newly generated subscription information
**/
export async function subscribeToRoutingKey({ routingKey, exchange = defaultExchange }: { routingKey: string, exchange?: string }): Promise<subscriptionInfo> {
  // Connect to the Rabbit MQ server and create exchange
  const rabbitConnection = await _connectToRabbitServer()
  const channel = await rabbitConnection.createConfirmChannel()

  // Note: All Stealth app exchanges are of the type: 'topic'
  await channel.assertExchange(exchange, 'topic', { durable: false })

  // Create and bind routing key to queue
  // Note: Because the queue is exclusive and not durable, assigning a name is not required
  const messageQueue = await channel.assertQueue('', { exclusive: true, durable: false })
  await channel.bindQueue(messageQueue.queue, exchange, routingKey)

  // Return the required subscription information to be consumed at a later time
  return { connection: rabbitConnection, channel, queue: messageQueue, exchange, routingKey }
}

/**
* Method to wait for a routing key / routing key with message content to be consumed on Rabbit subscription
* @param {subscriptionInfo} subscribedRoutingKey routing key subscription information
* @param {any} messageContent (Optional) Wait for specific message content
* @param {number} timeout Timeout in ms
* @returns {Promise<any>} Received message contents
* @throws {Error} If timeout occurred while waiting for message to be received
**/
export async function waitForSubscribedMessage({ subscribedRoutingKey, messageContent = undefined, timeout = defaultTimeout }:
  { subscribedRoutingKey: subscriptionInfo, messageContent?: any, timeout?: number }): Promise<any> {
  // Wait for topic/content to be consumed
  return new Promise((resolve, reject) => {
    // Create function timeout
    const receiveTimeout = setTimeout(() => {
      subscribedRoutingKey.connection.close()
      // If timeout occurs, throw error
      reject(new Error(`Timeout waiting on message routing key: ${subscribedRoutingKey.routingKey} to be received`))
    }, timeout)

    // This is invoked when a new message has been sent to be consumed
    subscribedRoutingKey.channel.consume(subscribedRoutingKey.queue.queue, async function (receivedMessage): Promise<void> {
      // Parse the received content from message
      const messageAsString = receivedMessage!.content.toString()

      // Determine if object is JSON, if so convert to object
      let receivedContent: any
      try {
        receivedContent = JSON.parse(messageAsString)
      } catch {
        receivedContent = messageAsString
      }

      // If any message content was provided, verify the specific content was received before resolving
      if (messageContent !== undefined) {
        if (isContainedIn(receivedContent, messageContent)) {
          _resolveReceivedMessage(receivedContent)
        }
        // Otherwise just resolve the message content
      } else {
        _resolveReceivedMessage(receivedContent)
      }
      // Auto-acknowledge all consumed messaging
    }, { noAck: true })

    // When correct message/content is consumed, ensure to clear any remaining timeouts and close the connection.
    async function _resolveReceivedMessage(receivedBody: any) {
      clearTimeout(receiveTimeout)
      await subscribedRoutingKey.channel.close()
      await subscribedRoutingKey.connection.close()
      resolve(receivedBody)
    }
  })
}

/**
* Helper Method to connect to Rabbit broker
* Note: Credentials default to stealth exchange on Test URL
* @param {string} hostname URL of the rabbit server
* @param {number} port port of the rabbit server
* @param {string} username Username credential for rabbit server
* @param {string} password Password credential for rabbit server
* @returns {Promise<Connection>} Connection to RabbitMQ server
**/
async function _connectToRabbitServer({ hostname, port, username, password }:
  { hostname: string, port: number, username: string, password: string } = defaultBrokerConfig): Promise<Connection> {
  // Connect to the Rabbit MQ server and create exchange
  return await connect({
    hostname,
    port,
    username,
    password
  })
}

// Functions to only be used in Unit tests
export const forUnitTestingOnly = { _connectToRabbitServer, defaultExchange, defaultBrokerCredentials: defaultBrokerConfig, defaultTimeout }
