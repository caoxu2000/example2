import request from 'supertest'
import { get } from '@utilities/request';
import { persistentDataUrl, patientsEndpoint, pateintExamsEnpoint } from "./objects";

export function getPatientsEndPoint( authCookie:string, authToken:string ): request.Test {
    return get( persistentDataUrl, patientsEndpoint, authCookie, authToken )
}

export function getPatientExamsEndpoint( patientOid:string, authCookie:string, authToken:string ): request.Test {
    let patientExams = patientsEndpoint + '/' + patientOid + '/exams'
    return get( persistentDataUrl, patientExams, authCookie, authToken )
}

export async function getPatientsOid( patientName:string, authCookie:string, authToken:string  ) {
    let patientOid = ""
    await getPatientsEndPoint( authCookie, authToken )
        .then((res) => {
            let patients = res.body
            for(let ii = 0; ii < patients.length; ii++)
            {
                if(patients[ii].name == patientName)
                {
                    patientOid = patients[ii].oid
                }
            }
        })
    return patientOid
}

export async function getPatientExamsOid( examModality:string, patientOid:string, authCookie:string, authToken:string ) {
    let examOid = ""
    await getPatientExamsEndpoint(patientOid, authCookie, authToken )
        .then((res) => {
            let exams = res.body
            for(let ii = 0; ii < exams.length; ii++)
            {
                if(exams[ii].modality == examModality)
                {
                    examOid = exams[ii].oid
                }
            }
        })
    return examOid
}