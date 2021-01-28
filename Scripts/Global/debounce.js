// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;

    return function debounceHandler() {
        var context = this,
            args = General.argsToArray(arguments);

        function laterHandler() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }

        var callNow = immediate && !timeout;
        clearTimeout(timeout);

        timeout = setTimeout(laterHandler, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

define("global/debounce", function(){ return debounce });