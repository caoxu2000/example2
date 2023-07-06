
/**
 * Generic timer for Integration Test repo
 * @param {number} seconds amount of time to wait
 */
export async function waitForSeconds(seconds:number) {
    let timeout = seconds*1000
    await new Promise((resolve, reject) => { setTimeout(function () { resolve('test') }, timeout) })
}