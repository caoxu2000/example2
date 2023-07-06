/**
File: ws-client.ts
Author: Medtronic
Description:  This file contains functions used to interact with server websockets

**/
import { isContainedIn } from './utility-helper-functions'
const WebSocketClient = require('websocket').w3cwebsocket

const defaultTimeout = 5000

/**
*  Method to wait create new websocket connection
* @param {string} webSocketAddress the url of the websocket
* @returns {Promise<WebSocket>} the socket connection
**/
export async function createSocketConnection({ webSocketAddress }: { webSocketAddress: string }): Promise<WebSocket> {
  // Create new websocket client
  const wsClient: WebSocket = new WebSocketClient(webSocketAddress)

  await _verifyWebSocketStatus({ wsClient, status: WebSocketClient.OPEN })

  return wsClient
}

/**
*  Method to listen on a websocket connection for a message to be published
* @param {WebSocket} wsClient websocket connection
* @param {any} content (Optional) Body containing key/value pairs to wait for
* @param {number} timeout (Optional) Timeout in ms to wait on message
* @returns {Promise<any>} content of the received message
* @throws {Error} If a websocket error occured
* @throws {Error} If expected message was not received on websocket
**/
export async function listenForSocketMessage({ wsClient, content = null, timeout = defaultTimeout }:
  { wsClient: WebSocket, content?: any, timeout?: number }): Promise<any> {
  const receivedMessage = await new Promise<any>((resolve, reject) => {
    // Create timeout for waiting on websocket message to be received
    const webSocketTimeout = setTimeout(() => {
      wsClient.close()
      reject(new Error('Error: Timeout waiting for message to be sent on socket'))
    }, timeout)

    // If a connection was not successful, clean up and throw an error
    wsClient.onerror = () => {
      wsClient.close()
      reject(new Error('Websocket Error Occured while listening for message to be published'))
    }

    // Executes on incoming message received
    wsClient.onmessage = async (incomingMessage) => {
      const messageAsString = incomingMessage!.data.toString()

      // Determine if object is JSON, if so convert to object
      let receivedContent: any
      try {
        receivedContent = JSON.parse(messageAsString)
      } catch {
        receivedContent = messageAsString
      }
      // If a payload containing required key/value pairs was supplied, check if we received the correct information
      if (content != null) {
        // Compare expected key/value pairs to received content, if it matches expected incoming message, clean up and return data
        if (isContainedIn(content, receivedContent)) {
          _resolveSocketWait(receivedContent)
        }

        // If no expected body supplied, clean up and return message data
      } else {
        _resolveSocketWait(receivedContent)
      }
    }

    function _resolveSocketWait(dataToWrite: any) {
      wsClient.close()
      clearTimeout(webSocketTimeout)
      resolve(dataToWrite)
    }
  })
  return receivedMessage
}

/**
* Internal Helper Method to wait for a connection status of the websocket
* @param {WebSocket} wsClient: the websocket connection
* @param {WebSocket.readyState} status the websocket status to wait for
* @throws {Error} If the desired websocket status could not be achieved
**/
async function _verifyWebSocketStatus({ wsClient, status }: { wsClient: WebSocket, status: WebSocket['readyState'] }): Promise<void> {
  await new Promise((resolve, reject) => {
    // Set interval time and max number of attempts to connect to websocket
    const maxNumberOfAttempts = 10
    const intervalTime = 200 // ms

    let currentAttempt = 0
    const interval = setInterval(() => {
      if (currentAttempt >= maxNumberOfAttempts) {
        clearInterval(interval)
        wsClient.close()
        reject(new Error(`Could not achieve websocket connection status. Maximum number of attempts exceeded while waiting on status: ${status}`))
      } else if (wsClient.readyState === status) {
        clearInterval(interval)
        resolve('Websocket successfully started')
      }
      currentAttempt++
    }, intervalTime)
  })
}

export const forUnitTestingOnly = { defaultTimeout, _verifyWebSocketStatus }
