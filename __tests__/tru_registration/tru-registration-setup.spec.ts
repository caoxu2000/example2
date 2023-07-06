import { selectProcedure } from '@root/web-services/select-procedure'
import { workflowService } from '@root/web-services/workflow'
import { imagesTaskService } from '@webServices/images'
import { truRegistrationService } from '@webServices/tru'
import * as demoLeeTrace from '@testData/registration/trace-data-points/demo-lee-tracer.json'
import { getPatientsOid, getPatientExamsOid} from '@webServices/persistent-data-service/actions'
import {authCredentials, Credentials } from '@utilities/set-auth-credentials'
import { waitForSeconds } from '@root/utilities/wait-timer'

describe('test preconditions', () => {
    let procedureOid: string
    let surgeonOid: string
    let patientOid: string
    let examOid: string
    let authToken: string
    let traceData: any
    
    let credentials:Credentials

    traceData = demoLeeTrace.demo_lee_tracer
    
    

    beforeAll(async () => {
        
        credentials = await authCredentials( 'stealth', 'stealth' )
        
        patientOid = await getPatientsOid("Demo Lee", credentials.authCookie, credentials.authToken )
        examOid = await getPatientExamsOid("CT",patientOid, credentials.authCookie, credentials.authToken)

        let procedureInfo = await selectProcedure.actions.getProcedureInformation( "Cranial", "Biopsy", "Standard Profile", credentials.authCookie, credentials.authToken )
        surgeonOid = procedureInfo[0]
        procedureOid = procedureInfo[1]

        await workflowService.actions.selectProcedure( surgeonOid, procedureOid, workflowService.enum.ProcedureTypes.BIOPSY, credentials.authCookie, credentials.authToken )
        
        await imagesTaskService.actions.selectPatient( patientOid )

        await imagesTaskService.actions.selectExams( examOid )
        
        await workflowService.actions.selectTask( workflowService.enum.MenuTaskNames.REGISTRATION, credentials.authCookie, credentials.authToken )
    })
    
    it('trace registration example', async () => {
        /**
        Verify that the Trace Registration completes succesfully
        Steps:
            - Enter the TRU Registration Task
            - Set the Registration collection mode to be "trace"
            - Replay the Trace data for the given patient
        Expected Response:
            - The websocket response from "registration.success" equals true
         */
        await truRegistrationService.actions.enterTask(patientOid, examOid, credentials.authCookie, credentials.authToken)
            .expect(200)
        
        // Wait for Tru service to load
        await truRegistrationService.actions.waitForTaskToLoad()

        await truRegistrationService.actions.selectSubtask( "trace", credentials.authCookie, credentials.authToken )
            .expect(200)
        
        await truRegistrationService.actions.createTraceRegistration( traceData )
        
        let response = await truRegistrationService.actions.truTaskEvents()
        console.log(response)
        //response.contains(registration.success).equals(true)

        await truRegistrationService.actions.undoTrace( credentials.authCookie, credentials.authToken )
            .expect(200)
    })

})
