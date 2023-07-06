import request from 'supertest'
import { expect } from 'chai'
import { get } from '@utilities/request'
import { procedureServiceURL, procedureServiceCases } from "./objects";
import { actionAndWaitForResponses, messageTypes } from "@root/utilities/action-and-wait-utilities";
import { publishMessage } from "@root/utilities/messaging";


/**
 * Get the oid of the suregeon and the procedure id
 * @param {string} procedureCard Name of the procedure anatomy type
 * @param {string} surgeonName Name fo the surgeon that will be selected
 * @param {string} procedureName Name of the procedure to select
 * @returns 
 */
export async function getProcedureInformation ( procedureCard:string, surgeonName:string, procedureName:string, authCookie:string, authToken:string ) {
    let oid = ""
    let procedureOid = ""

    await getProcedures( authCookie, authToken )
        .then((res) => {
            let cases = res.body.cases
            for(let ii = 0; ii < cases.length; ii++)
            {
                if(cases[ii].name === procedureCard)
                {
                    oid = cases[ii].standardProfile.id
                    for(let jj = 0; jj < cases[ii].standardProfile.procedures.length; jj++)
                    {
                        if(cases[ii].standardProfile.procedures[jj].name === procedureName)
                        {
                            procedureOid = cases[ii].standardProfile.procedures[jj].id
                        }
                        
                    }
                }
            }
        })

    return [oid, procedureOid]
}

/**
 * Get list of procedures from get procedures endpoint
 * @returns {request.Test} the http request Test object
 */
export function getProcedures ( authCookie:string, authToken:string ): request.Test {
    return get( procedureServiceURL, procedureServiceCases, authCookie, authToken )
}