import config from '@root/jest.config'

/*
* All endpoints, websocket information, rabbit messages, and typescript interface and types are listed below for service
*/

export const imagesURL:string = config.testURL!
export const getPatientsEndPoint = '/imagestask/v1/patient/list'
export const getExamsEndPoint = '/imagestask/v1/exam/list'
export const selectPatientEndPoint = '/imagestask/v1/patient/select'
export const selectExamEndPoint = '/imagestask/v1/exam/select'
export const deleteExamEndPoint = '/imagestask/v1/procedure/remove'
export const getImageEndPoint = '/imagestask/v1/available/image/{1}'

export const requestStudyEndPoint = '/imagestask/v1/requestStudy'
export const requestSeriesEndPoint = '/imagestask/v1/requestSeries'
export const searchDicomMediaEndPoint = '/imagestask/v1/searchDicomMedia'
export const searchMediaSeriesEndPoint = '/imagestask/v1/searchMediaStudies'
export const requestSeriesMediaEndPoint = '/imagestask/v1/requestSeriesMedia'

export const deletePatientEndPoint = '/imagestask/v1/patients/delete'
export const importDicomEndPoint = '/imagestask/v1/media/dicom/import'