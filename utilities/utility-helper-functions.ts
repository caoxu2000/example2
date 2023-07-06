/**
* (HELPER METHOD) Compares two objects/strings/arrays to verify if item a is contained in item b
* @param {any} a the item to check if it is a subset of
* @param {any} b the item to check if contains the original item
* @returns {boolean} True - if item a is contained in item b
*/
export function isContainedIn (a:any, b:any): boolean {
  if (typeof a !== typeof b) { return false }
  if (b == null) {
    if (a === b) { return true } else { return false }
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    // eslint-disable-next-line no-var
    for (var i = 0, j = 0, la = a.length, lb = b.length; i < la && j < lb; j++) {
      if (isContainedIn(a[i], b[j])) { i++ }
    }
    return i === la
  } else if (Object(a) === a) {
    for (const p in a) {
      if (!(p in b && isContainedIn(a[p], b[p]))) { return false }
    }
    return true
  } else { return a === b }
}
