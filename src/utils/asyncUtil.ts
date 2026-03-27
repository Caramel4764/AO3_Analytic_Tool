
/** Waits for ms time
 * 
 * @param ms - Milliseconds to wait
 */
function delay(ms:number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  })
}

let asyncUtil = {
  delay
}

export default asyncUtil;