import request from 'supertest'
import { get, post, put, remove } from '@utilities/request'
import { actionAndWaitForResponses, messageTypes } from "@root/utilities/action-and-wait-utilities";
import { publishMessage } from "@root/utilities/messaging";
import { imagesURL, getPatientsEndPoint, getExamsEndPoint, selectPatientEndPoint, selectExamEndPoint, deleteExamEndPoint, getImageEndPoint, requestStudyEndPoint, requestSeriesEndPoint, searchDicomMediaEndPoint, searchMediaSeriesEndPoint, requestSeriesMediaEndPoint, deletePatientEndPoint, importDicomEndPoint} from './objects'
import { localAndLdapCookiesTest } from '@root/__tests__/auth_service/share-tests/local-ldap-common';

/**
 * Gets list of patients from the Images Task Service
 * @returns list of patients on the Stealth System
 */
export function getPatient ( authCookie:string, authToken:string ): request.Test {
    return get( imagesURL, getPatientsEndPoint, authCookie, authToken )
}

/**
 * Selecting the patient by rabbit messages for a patinet on the Stealth
 * @param {string} patientOid the oid of the selected patient
 */
export async function selectPatient ( patientOid:string ) {
    const response = await actionAndWaitForResponses({
        action: publishMessage,
        parameters: { 
            routingKey: "patientdata.selectpatient", 
            messageContent: { 
                                "oid": patientOid
                            }
            },
        responses: [{type: messageTypes.RABBIT, routingKey: 'patientdata.patientselected', messageLocation: 'stealth'}]
    })
}

/**
 * Delete patient REST endpoint
 * @returns {request.Test} the http request Test object 
 */
export function deletePatient ( authCookie:string, authToken:string ): request.Test {
    return remove( imagesURL, deletePatientEndPoint, authCookie, authToken )
}

/**
 * Gets a list of exams from the Images Task Service
 * @returns {request.Test} the http request Test object
 */
export function getExams ( authCookie:string, authToken:string ): request.Test {
    return get( imagesURL, getExamsEndPoint, authCookie, authToken )
}

/**
 * Selects exam on the stealth
 * @param {string} examOid the oid of the exam to be selected
 */
export async function selectExams ( examOid:string )/*: request.Test*/ {
    //return put({ serviceUrl: imagesURL, endPointUrl: selectExamEndPoint})
    const response = await actionAndWaitForResponses({
        action: publishMessage,
        parameters: { 
            routingKey: "patientdata.selectexam", 
            messageContent: { 
                                "oid": examOid
                            } 
            },
        responses: [{type: messageTypes.RABBIT, routingKey: 'patientdata.examselected', messageContent: {"oid": examOid}, messageLocation: 'stealth', timeout:15000}]
    })
}

/**
 * Delete selected exams using the delete exams REST Endpoint
 * @returns {request.Test} the http request Test object
 */
export function deleteExams ( authCookie:string, authToken:string ): request.Test {
    return remove( imagesURL, deleteExamEndPoint, authCookie, authToken )
}

/**
 * Request study from pacs system
 * @returns {request.Test} the http request Test object
 */
export function requestStudy ( authCookie:string, authToken:string ): request.Test {
    return post( imagesURL, requestStudyEndPoint, authCookie, authToken )
}

/**
 * Request series from pacs system
 * @returns {request.Test} the http request Test object
 */
export function requestSeries ( authCookie:string, authToken:string ): request.Test {
    return post( imagesURL, requestSeriesEndPoint, authCookie, authToken )
}

/**
 * request media series
 * @returns {request.Test} the http request Test object
 */
export function requestMediaSeries ( authCookie:string, authToken:string ): request.Test {
    return post( imagesURL, requestSeriesMediaEndPoint, authCookie, authToken )
}

/**
 * import media series onto stealth
 * @returns {request.Test} the http request Test object
 */
export function importMediaSeries ( authCookie:string, authToken:string ): request.Test {
    return post( imagesURL, searchMediaSeriesEndPoint, authCookie, authToken )
}

/**
 * Search for dicom media on the stealth
 * @returns {request.Test} the http request Test object
 */
export function searchDicomMedia ( authCookie:string, authToken:string ): request.Test {
    return get( imagesURL, searchDicomMediaEndPoint, authCookie, authToken )
}

/**
 * search the stealth media for patients on the stealth
 * @returns {request.Test} the http request Test object
 */
export function searchMediaMedia ( authCookie:string, authToken:string ): request.Test {
    return post( imagesURL, deleteExamEndPoint, authCookie, authToken )
}

/**
 * get the thumbnail image for patient exam
 * @returns {request.Test} the http request Test object
 */
export function getImage ( authCookie:string, authToken:string ): request.Test {
    return get( imagesURL, getImageEndPoint, authCookie, authToken )
}