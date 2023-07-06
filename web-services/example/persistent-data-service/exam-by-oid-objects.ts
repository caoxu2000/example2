export { serviceDataUrl } from "@root/web-services/index"

// Define Exams Dynamic End Points
const examsByOid: string = '/exams/:examOid'
const examNameByOid: string = '/exams/:examOid/name'
const volumeDataByOid: string = '/exams/:examOid/volumeData'
const presetByOid: string = '/exams/:examOid/preset'
const warningsByOid: string = '/exams/:examOid/preset'
const thumbnailByOid: string = '/exams/:examOid/thumbnail'
const generalExamDataByOid: string = '/exams/:examOid/general'
const moreExamDataByOid: string = '/exams/:examOid/more'

// Export End Points as single object
export const DynamicEndPoints = { examsByOid, examNameByOid, volumeDataByOid, presetByOid, warningsByOid, thumbnailByOid, generalExamDataByOid, moreExamDataByOid }