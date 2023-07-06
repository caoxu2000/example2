import { subscribeToRoutingKey, waitForSubscribedMessage, subscriptionInfo } from './messaging'
import { createSocketConnection, listenForSocketMessage } from './ws-client'

// Action and Wait Utility Enums, Interfaces and Types
export enum messageTypes {
  WEBSOCKET = 'websocket',
  RABBIT = 'rabbitmq'
}

// Define the responses that will be received via Rabbit/Websockets
export interface messageInfo { type: messageTypes, routingKey: string, messageLocation: string, messageContent?: any, timeout?: number }
interface messageSubscription extends messageInfo { subscription: subscriptionInfo | WebSocket }

/*
messageInfo example:
    [{
      type: messageTypes.RABBIT,
      routingKey: 'locui.trackingview',
      messageContent: 'expected message content'
      messageLocation: 'stealth'
    {
      type: messageTypes.WEBSOCKET,
      routingKey: 'LocUI socket response',
      messageContent: 'expected message content',
      messageLocation: 'https://www.websocketaddress.com'
    }],
*/

// Type defines output from the action and wait for responses functionalities
export type actionAndWaitResponse = Record<messageTypes, { [key: string]: any }> & { actionResponse: any }

/**
*  Method to perform an action and wait for messages to be published on RabbitMQ and Websockets
* @param {Function} action Action to Perform
* @param {any} parameters Parameters to execute function
* @param {Array<messageInfo>} responses Array of consumed expected responses
* @returns {Promise<actionAndWaitResponse>} Message contents from the expected messages
          Example:
                  {
                    rabbitmq: {
                      ['locui.trackingview']: 'received message content',
                      ['loc.correlated.makers']: 'received message content'
                    },
                    websocket: {z
                      ['locui websocket']: 'received message content'
                  }
**/
export async function actionAndWaitForResponses({ action, parameters, responses }:
  { action: Function, parameters: any, responses: Array<messageInfo> }): Promise<actionAndWaitResponse> {
  // Create a subscription to RabbitMQ / open connection to Websocket for each expected response
  const subscriptionsToWaitFor = await _subscribeToAllChannels({ responses })

  // Wait for all messages to be received once action is performed
  const [receivedMessages, actionResponse] = await Promise.all([
    _waitForAllMessages({ subscriptions: subscriptionsToWaitFor }),
    action.bind(null, parameters)()
  ])

  const allResponses = {
    ...receivedMessages,
    actionResponse
  }

  return <actionAndWaitResponse>allResponses
}

/**
* Helper method to create a subscription on each RabbitMQ exchange/ websocket address for each of the  expected response
* @param {Array<messageInfo>} responses array of the expected responses to be received after action is performed
* @returns {Promise<Array<messageSubscription>} Promise of an array containing each connection/subscription to RabbitMQ/websocket
*/
async function _subscribeToAllChannels({ responses }: { responses: Array<messageInfo> }): Promise<Array<messageSubscription>> {
  const receivedMessageResponses = await Promise.all(
    // For each response, append a new connection to listen for each response
    responses.map(async response => {
      let subscription: WebSocket | subscriptionInfo
      switch (response.type) {
        case messageTypes.WEBSOCKET: {
          subscription = await createSocketConnection({ webSocketAddress: response.messageLocation })
          break
        } case messageTypes.RABBIT: {
          subscription = await subscribeToRoutingKey({ routingKey: response.routingKey, exchange: response.messageLocation })
          break
        }
      }
      return {
        ...response,
        subscription
      }
    })
  )

  return receivedMessageResponses
}

/**
* Helper Method listen for all messages to be published on the RabbitMQ exchange/websocket
* @param {messageSubscriptions} subscriptions the subscribed/opened communication channels for responses
* @returns {actionAndWaitResponse} the message content of each message from the expeceted responses
*/
async function _waitForAllMessages({ subscriptions }: { subscriptions: Array<messageSubscription> }): Promise<actionAndWaitResponse> {
  // Wait for all responses to be received, store them for return
  const receivedMessage: actionAndWaitResponse = { [messageTypes.RABBIT]: {}, [messageTypes.WEBSOCKET]: {}, actionResponse: null }

  await Promise.all(
    subscriptions.map(async (subscription) => {
      switch (subscription.type) {
        case messageTypes.RABBIT:
          // Cast index as type 'subscriptionInfo' for Rabbit messages
          receivedMessage[messageTypes.RABBIT][subscription.routingKey] = await waitForSubscribedMessage({
            subscribedRoutingKey: <subscriptionInfo>subscription.subscription,
            messageContent: subscription.messageContent,
            timeout: subscription.timeout
          })

          break
        case messageTypes.WEBSOCKET:
          // Cast index as type 'Websocket' for Websocket messages
          receivedMessage[messageTypes.WEBSOCKET][subscription.routingKey] = await listenForSocketMessage({
            wsClient: <WebSocket>subscription.subscription,
            content: subscription.messageContent,
            timeout: subscription.timeout
          })
          break
      }
    })
  )
  return receivedMessage
}
