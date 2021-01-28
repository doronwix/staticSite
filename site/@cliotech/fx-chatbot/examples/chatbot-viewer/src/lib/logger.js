/* eslint no-console: 0 */
const LOG_PREFIX = 'emily log'
class Logger {
    static log() {
        if (console && console.debug) {
            let args = Array.from(arguments)
            args.unshift(LOG_PREFIX + ': ')
            console.log.apply(console, args)
        }
    }
    static debug() {
        if (console && console.debug) {
            let args = Array.from(arguments)
            args.unshift(LOG_PREFIX + ': ')
            console.debug.apply(console, args)
        }
    }
    static error() {
        if (console && console.error) {
            let args = Array.from(arguments)
            args.unshift(LOG_PREFIX + ': ')
            console.error.apply(console, args)
        }
    }

}
export default Logger
