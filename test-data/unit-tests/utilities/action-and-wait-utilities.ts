import { defaultExchange } from '@root/utilities/messaging'
import { messageTypes } from '@root/utilities/action-and-wait-utilities'

export const websocketAddress = 'ws://localhost:8082'

const socketRoutingKey = 'websocket_message'
const socketMessage = { webSocketKey1: 'this is test key 1', webSocketKey2: 'this is test key two' }
const socketResponse = {
  type: messageTypes.WEBSOCKET,
  routingKey: socketRoutingKey,
  messageLocation: websocketAddress,
  messageContent: socketMessage
}

const rabbitRoutingKey = 'test.test_utilities_test'
const rabbitMessage = { rabbitKey1: 'this is test key 1', rabbitKey2: 'this is test key two' }
const rabbitResponse = {
  type: messageTypes.RABBIT,
  routingKey: rabbitRoutingKey,
  messageContent: rabbitMessage,
  messageLocation: defaultExchange
}

const additionalSocketRoutingKey = 'websocket_message_two'
const additionalSocketMessage = { webSocketKey3: 'this is test key 3', webSocketKey4: 'this is test key 4' }
const additionalSocketResponse = {
  type: messageTypes.WEBSOCKET,
  routingKey: additionalSocketRoutingKey,
  messageLocation: websocketAddress,
  messageContent: additionalSocketMessage
}

const additionalRabbitRoutingKey = 'test.test_utilities_test_other_key'
const additionalRabbitMessage = { rabbitKey3: 'this is test key 3', rabbitKey4: 'this is test key 4' }
const additionalRabbitResponse = {
  type: messageTypes.RABBIT,
  routingKey: additionalRabbitRoutingKey,
  messageContent: additionalRabbitMessage,
  messageLocation: defaultExchange
}

export const actionResponse = 'This is the function output'

// Data for Test: 'can successfully receive single rabbit and websocket messages'
export const singleMessageData = {
  itemsToListenFor: [rabbitResponse, socketResponse],
  expectedResponse: {
    rabbitmq: {
      [rabbitRoutingKey]: rabbitMessage
    },
    websocket: { [socketRoutingKey]: socketMessage },
    actionResponse
  }
}

// Data for Test: 'can successfully receive multiple rabbit and websocket messages'
export const multipleMessagesData = {
  itemsToListenFor: [rabbitResponse, socketResponse, additionalRabbitResponse, additionalSocketResponse],
  expectedResponse: {
    rabbitmq: {
      [rabbitRoutingKey]: rabbitMessage,
      [additionalRabbitRoutingKey]: additionalRabbitMessage
    },
    websocket: {
      [socketRoutingKey]: socketMessage,
      [additionalSocketRoutingKey]: additionalSocketMessage
    },
    actionResponse
  }
}
