import config from '@root/jest.config'

/*
* All the enpoints information is listed below
*/
export const persistentDataUrl = config.testURL!
export const patientsEndpoint = '/persistentwapi/v1/patients'
export const pateintExamsEnpoint = '/persistentwapi/v1/patients/<patientOid>/exams'