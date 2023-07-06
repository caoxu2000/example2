import config from '@root/jest.config'

/*
* All the enpoints information is listed below
*/

export const truServiceURL = config.testURL!
// General Endpoints
export const restartRegistrationEndpoint = '/trutask/v1/restart'
export const selectSubtaskEndpoint = '/trutask/v1/subtask/select'
// Initialization Endpoints
export const enterTaskEndoint = '/trutask/v1/entertask'
// Touch Endpoints
export const createLandmarkEndpoint = '/trutask/v1/landmark/create'
export const undoTouchEndpoint = '/trutask/v1/undo/touch'
export const selectLandmarkEndpoint = '/trutask/v1/landmark/select'
export const assignLandmarkEndpoint = '/trutask/v1/landmark/assign'
export const clearLandmarkEndpoint = '/trutask/v1/landmark/clear'
export const deleteLandmarkEndpoint = '/trutask/v1/landmark/delete'
// Trace Endpoints
export const undoTraceEndpoint = '/trutask/v1/undo/trace'


// Websocket for TRU Events Information
// Socket Data Endpoints
export const truTaskEventsEndpoint = '/trutask/v1/trutask-events/'

export const truTaskInfoSocket = 'ws://localhost:8100/trutask/v1/trutask-events'
export const truTaskSocketName = 'truTask WebSocket'