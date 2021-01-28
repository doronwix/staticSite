/* global $, debounce */
function swipe(target, maxDistance, callback) {
    maxDistance = maxDistance || 95; // swipe movement of 95 pixels triggers the swipe

    var maxTime = 1000, // allow movement if < 1000 ms (1 sec)
        startX = 0,
        startTime = 0,
        touch = 'ontouchend' in document,
        startEvent = ((touch) ? 'touchstart' : 'mousedown') + '.swipe',
        moveEvent = ((touch) ? 'touchmove' : 'mousemove') + '.swipe',
        endEvent = ((touch) ? 'touchend' : 'mouseup') + '.swipe';

    $(target).addClass('__swipe_parent');

    $(target).on(startEvent, function startEventHandler(e) {
        var delegateTarget = $(e.target).closest('.__swipe_parent').get(0);
        if (e.currentTarget === delegateTarget) {
            e.stopPropagation();
        }

        startTime = e.timeStamp;
        startX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.pageX;

    }).on(endEvent, function endEventHandler(e) {
        var delegateTarget = $(e.target).closest('.__swipe_parent').get(0);
        if (e.currentTarget === delegateTarget) {
            e.stopPropagation();
        }

        startTime = 0;
        startX = 0;

    }).on(moveEvent, debounce(function moveEventHandler(e) {
        var delegateTarget = $(e.target).closest('.__swipe_parent').get(0);
        if (e.currentTarget === delegateTarget) {
            e.stopPropagation();
        }

        var currentX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.pageX,
            currentDistance = (startX === 0) ? 0 : Math.abs(currentX - startX),
            // allow if movement < 1 sec
            currentTime = e.timeStamp;

        if (startTime !== 0 && currentTime - startTime < maxTime && currentDistance > maxDistance) {
            if (currentX < startX || currentX > startX) {
                callback(currentX, startX, this);
            }

            startTime = 0;
            startX = 0;
        }
    }, 5));
}

function swipeDestroy(target) {
    $(target).off('.swipe');
}