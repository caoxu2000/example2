import request from 'supertest'
import { truServiceURL, restartRegistrationEndpoint, selectSubtaskEndpoint, enterTaskEndoint, createLandmarkEndpoint, undoTouchEndpoint, selectLandmarkEndpoint, assignLandmarkEndpoint, clearLandmarkEndpoint, deleteLandmarkEndpoint, undoTraceEndpoint, truTaskInfoSocket } from './objects'
import { post, put, remove } from '@utilities/request'
import { publishMessage } from "@root/utilities/messaging";
import { actionAndWaitForResponses } from '@root/utilities/action-and-wait-utilities'
import { messageTypes } from '@root/utilities/action-and-wait-utilities'

/**
 * Restart the registration process from the start
 * @returns {request.Test} the http request Test object
 */
export function restart( authCookie:string, authToken:string ): request.Test {
    return put( truServiceURL, restartRegistrationEndpoint, authCookie, authToken )
}

/**
 * Select the TRU Registration substask
 * @param {string} subtask The subtask option for TRU either (trace|touch) 
 * @returns {request.Test} the http request Test object
 */
export function selectSubtask( subtask:string, authCookie:string, authToken:string ): request.Test {
    return put( truServiceURL, selectSubtaskEndpoint, authCookie, authToken )
        .send({
            "subtask": subtask
        })
}

/**
 * Enter the Registraiton Task with a specified patient and exam
 * @param {string} patientOid oid for the patient to perform a registration on
 * @param {string} volumeOid oid for the oid of the exam to create a registration on
 * @returns {request.Test} the http request Test object
 */
export function enterTask( patientOid:string, volumeOid:string, authCookie:string, authToken:string ): request.Test {
    return post( truServiceURL, enterTaskEndoint, authCookie, authToken )
        .send({
            "patientOID": patientOid,
            "volumeOID": volumeOid
        })
}

/**
 * Method to be used after Entering the TRU Registration Task
 */
export async function waitForTaskToLoad() {
    const response = await actionAndWaitForResponses({
        action: publishMessage,
        parameters: {
            routingKey: "",
            messageContent: {}
        },
        responses: [{type: messageTypes.RABBIT, routingKey: 'trutask.history.list', messageLocation: 'stealth'}]
    }) 
}

/**
 * Return the TRU Registration Task information from the websocket
 * @returns tru registration information
 */
export async function truTaskEvents() {
    const response = await actionAndWaitForResponses({
        action: publishMessage,
        parameters: { 
            routingKey: "trutask.traceinfo",
            messageContent: {}
            },
        responses: [{type: messageTypes.WEBSOCKET, routingKey: 'truTaskWebSocket', messageLocation: truTaskInfoSocket}]
    })
    
    return response.websocket.truTaskWebSocket
}

/**
 * Create a touch registration landmark
 * @param {string} coordinates x,y,z coordinates for a position on the patient 
 * @returns {request.Test} the http request Test object
 */
export function createLandmark( coordinates:any, authCookie:string, authToken:string ): request.Test {
    let point = [(coordinates[0]),
                 (coordinates[1]),
                 (coordinates[2])]
    return post( truServiceURL, createLandmarkEndpoint, authCookie, authToken )
        .send({
            "crosshair": point
        })
}

/**
 * Undo touch registration landmark
 * @param {string} index touch registration landmark index 
 * @returns {request.Test} the http request Test object
 */
export function undoTouch( index:string, authCookie:string, authToken:string ): request.Test {
    return put( truServiceURL, undoTouchEndpoint, authCookie, authToken )
    .send({
        "index": index
    })
}

/**
 * Select touch registration landmark
 * @param {string} index touch registration landmark index
 * @returns {request.Test} the http request Test object
 */
export function selectLandmark( index:number, authCookie:string, authToken:string ): request.Test {
    return put( truServiceURL, selectLandmarkEndpoint, authCookie, authToken )
    .send({
        "index": index
    })
}

/**
 * Assign touch registration landmark
 * @param {stirng} index touch registration landmark index 
 * @returns {request.Test} the http request Test object
 */
export function assignLandmark( index:string, authCookie:string, authToken:string ): request.Test {
    return put( truServiceURL, assignLandmarkEndpoint, authToken, authCookie )
    .send({
        "index": index
    })
}

/**
 * Clear touch registration landmark
 * @param {string} index touch registration landmark index 
 * @returns {request.Test} the http request Test object
 */
export function clearLandmark( index:string, authCookie:string, authToken:string ): request.Test {
    return put( truServiceURL, clearLandmarkEndpoint, authCookie, authToken )
    .send({
        "index": index
    })
}

/**
 * Delete touch registration landmark
 * @param {string} index touch registration landmark index
 * @returns {request.Test} the http request Test object
 */
export function deleteLandmark( index:string, authCookie:string, authToken:string ): request.Test {
    return remove( truServiceURL, deleteLandmarkEndpoint, authCookie, authToken )
    .send({
        "index": index
    })
}

/**
 * Undo current trace data in the application
 * @returns {request.Test} the http request Test object
 */
export function undoTrace( authCookie:string, authToken:string ): request.Test {
    return put( truServiceURL, undoTraceEndpoint, authCookie, authToken)
}

/**
 * Create a trace registration from pre recorded data navigation data
 * @param {any} traceData pre recorded trace registration data to play back to the stealth station 
 */
export async function createTraceRegistration( traceData:any ) {
    
    try {
        await actionAndWaitForResponses({
            action: publishMessage,
            parameters: { 
                routingKey: "truloc.trace.start", 
                messageContent: {}
                },
            responses: [{type: messageTypes.RABBIT, routingKey: 'trutask.tracing', messageLocation: 'stealth', timeout: 5000}]
        })
        
        //points = traceData
        for (const curPoint in traceData){
            await _createTracePoints({coordinates:traceData[curPoint]})
        }
    }
    finally {
        await _stopTracePointsCollection()
    }
}

/**
 * Send a coordinate over rabbit messages
 * @param {any} coordinates single coordinate point for trace registration
 */
export async function _createTracePoints( coordinates:any ) {
    let point = [Number(coordinates["coordinates"]["x"]),
                 Number(coordinates["coordinates"]["y"]),
                 Number(coordinates["coordinates"]["z"])]

    let payload = {
        "offset": 0,
        "point": point
    }
    
    await actionAndWaitForResponses({
        action: publishMessage,
        parameters: { 
            routingKey: "truloc.tracepnt", 
            messageContent: payload
            },
        responses: []
    })
}

/**
 * Send the rabbit message to stop actively tracing 
 */
export async function _stopTracePointsCollection() {
    
    await actionAndWaitForResponses({
        action: publishMessage,
        parameters: { 
            routingKey: "truloc.trace.stop", 
            messageContent: {}
            },
        responses: []
    })
}