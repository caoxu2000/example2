import config from '@root/jest.config'

/*
* All the end points information is listed below for service
*/

export const workflowServiceURL = config.testURL!

// Procedure End Points
export const selectProcedureEndPoint = '/workflow/v1/procedure/select'
export const exitProcedureEndPoint = '/workflow/v1/procedure/exit'

// Workflow End Points
export const selectTaskEndPoint = '/workflow/v1/task/select'
export const selectNextTaskEndPoint = '/workflow/v1/next/task/select'
export const selectBackTaskEndPoint = '/workflow/v1/back/task/select'
export const workflowEndPoint = '/workflow/v1/workflow'
export const taskEndPoint = '/workflow/v1/task'
