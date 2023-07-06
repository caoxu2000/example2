import request from 'supertest'
import { put, get } from '@utilities/request'
import { exitProcedureEndPoint, workflowServiceURL, selectProcedureEndPoint, selectTaskEndPoint, workflowEndPoint, taskEndPoint, selectBackTaskEndPoint, selectNextTaskEndPoint } from './objects'
import { ProcedureTypes, MenuTaskNames } from './enum'

/**
* Selects a procedure for a given surgeon by http put request to select procedure endpoint.
* @param {string} oid unique procedure oid
* @param {string} procedureType application procedure type
* @returns {request.Test} the http request Test object
*/
export function selectProcedure ( surgeonOid:string, procedureOid:string, procedureType: ProcedureTypes, authCookie:string, authToken:string ): request.Test {
  return put( workflowServiceURL, selectProcedureEndPoint, authCookie, authToken ) 
    .send({
        oid: surgeonOid,
        procedureId: procedureOid,
        procedureType: procedureType
      })
}

/**
* Select a task from the TaskMenu by http get request to the select task endpoint.
* @param {string} menuTaskName The name of the task to proceed to
* @returns {request.Test} the http request Test object
*/
export function selectTask ( menuTaskName: MenuTaskNames, authCookie:string, authToken:string ): request.Test {
  return put( workflowServiceURL, selectTaskEndPoint, authCookie, authToken )
    .send({ "menuTaskName": menuTaskName })
}

/**
* Select the next task from the smart prompty by http put request to the select task endpoint.
* @returns {request.Test} the http request Test object
*/
export function selectNextTask ( authCookie:string, authToken:string ): request.Test {
  return put( workflowServiceURL, selectNextTaskEndPoint, authCookie, authToken )
}

/**
* Select the back task from the smart prompty by http put request to the select task endpoint.
* @returns {request.Test} the http request Test object
*/
export function selectBackTask ( authCookie:string, authToken:string ): request.Test {
  return put( workflowServiceURL, selectBackTaskEndPoint, authCookie, authToken )
}

/**
* Exit a procedure by http put request to exit procedure endpoint.
* @returns {request.Test} the http request Test object
*/
export function exitProcedure ( authCookie:string, authToken:string ): request.Test {
  return put( workflowServiceURL, exitProcedureEndPoint, authCookie, authToken )
}

/**
* Get the current required and optional workflow by http get request to workflow endpoint.
* @returns {request.Test} the http request Test object
*/
export function getWorkflow ( authCookie:string, authToken:string ): request.Test {
  return get( workflowServiceURL, workflowEndPoint, authCookie, authToken )
}

/**
* Get the current, next and back tasks with disable state by http get request to the task endpoint.
* @returns {request.Test} the http request Test object
*/
export function getTask ( authCookie:string, authToken:string ): request.Test {
  return get( workflowServiceURL, taskEndPoint, authCookie, authToken )
}
