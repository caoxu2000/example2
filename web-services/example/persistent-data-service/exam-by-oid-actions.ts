import { DynamicEndPoints, serviceDataUrl} from '@root/web-services/example/persistent-data-service/exam-by-oid-objects'
import request from 'supertest'
import { examsDicomData } from './exams-objects'

/**
 * Exam Requests - stores all Exam oid specific requests
 * A class can be initiated in a method and used for request actions
 * Example:
 * 
 * newExam = new ExamRequests(<:examoid>)
 * 
 * Request call:
 * newExam.deleteExam()
 */
export class ExamRequests {

    examOid:string    // Declare property names
    examsEndPoint: string
    examNameEndPoint: string
    volumeDataEndPoint: string
    presetEndPoint: string
    warningsEndPoint: string
    thumbnailEndPoint: string
    generalExamDataEndPoint: string
    moreExamDataEndPoint: string

    constructor(examOid: string) {
        
        // Update all End Points to contain the current exam's oid
        this.examOid = examOid
        this.examsEndPoint = _generateEndPoint(DynamicEndPoints.examsByOid, examOid)
        this.examNameEndPoint =  _generateEndPoint(DynamicEndPoints.examNameByOid, examOid)
        this.volumeDataEndPoint =  _generateEndPoint(DynamicEndPoints.volumeDataByOid, examOid)
        this.presetEndPoint =  _generateEndPoint(DynamicEndPoints.presetByOid, examOid)
        this.warningsEndPoint =  _generateEndPoint(DynamicEndPoints.warningsByOid, examOid)
        this.thumbnailEndPoint =  _generateEndPoint(DynamicEndPoints.thumbnailByOid, examOid)
        this.generalExamDataEndPoint =  _generateEndPoint(DynamicEndPoints.generalExamDataByOid, examOid)
        this.moreExamDataEndPoint =  _generateEndPoint(DynamicEndPoints.generalExamDataByOid, examOid)
        

    }

    /**
     * Retrieve more information for a specific exam by oid
     * @returns {request.Test} Request response of the endpoint
     */
     getMoreExamData(): request.Test {
        return request(serviceDataUrl).get(this.moreExamDataEndPoint)
    }


    /**
     * Retrieve general information for a specific exam by oid
     * @returns {request.Test} Request response of the endpoint
     */
    getGeneralExamData(): request.Test {
        return request(serviceDataUrl).get(this.generalExamDataEndPoint)
    }


    /**
     * Retrieve information for a specific exam by oid
     * @returns {request.Test} Request response of the endpoint
     */
    getExamInfo(): request.Test {
        return request(serviceDataUrl).get(this.examsEndPoint)
    }


    /**
     * Delete an exam
     * @returns {request.Test} Request response of the endpoint
     */
    deleteExam(): request.Test {
        return request(serviceDataUrl).delete(this.examsEndPoint)
    }


    /**
     * Update and edit an exam
     * @returns {request.Test} Request response of the endpoint
     */
    editExamName(): request.Test {
        return request(serviceDataUrl).put(this.examNameEndPoint)
    }

    /**
     * Update an exam via JSON patch
     * TODO: This endpoint is not active yet
     * @returns {request.Test} Request response of the endpoint
     */
    patchExamViaJson(): request.Test {
        return request(serviceDataUrl).patch(this.examNameEndPoint)
    }


    /**
     * Pushes volume information to a given exam
     * @returns {request.Test} Request response of the endpoint
     */
    createVolumeData(): request.Test {
        return request(serviceDataUrl).post(this.volumeDataEndPoint)
    }

    /**
     * Retrieves the volume data for a given exam
    * @returns {request.Test} Request response of the endpoint
     */
    moveVolumeData(): request.Test {
        return request(serviceDataUrl).get(this.volumeDataEndPoint)
    }


    /**
     * Retrieves the presets for a given exam
     * @returns {request.Test} Request response of the endpoint 
     */
    getExamPresets(): request.Test {
        return request(serviceDataUrl).get(this.presetEndPoint)

    }


    /**
     * Retrieves the warnings for a given exam
     * @returns {request.Test} Request response of the endpoint 
     */
    getExamWarnings(): request.Test {
        return request(serviceDataUrl).get(this.warningsEndPoint)
    }


    /**
     * Retrieves the thumbnail for a given exam
     * @returns {request.Test} Request response of the endpoint 
     */
    getExamThumbnail(): request.Test {
        return request(serviceDataUrl).get(this.thumbnailEndPoint)
    }
}


/**
 * Helper method to dynamically generate each EndPoint to request
 * @param {String} examOid Exam volume oid
 * @param {String} endPoint EndPoint address
 * @returns {String} Completed EndPoint for the current exam 
 */
function _generateEndPoint(endPoint:string, examOid: string): string {

    // Replace the examOid placeholder in the  string with the current exam oid 
    return endPoint.replace(":examOid", examOid)    
}
