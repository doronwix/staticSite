define(
    'managers/CollectionNavigateManager',
    [
        'require'
    ],
    function CollectionNavigateManager() {
        var collection;
        var currentIndex = 0;
        var nextIndex = 1;
        var prevIndex = 0;
        var totalItems = 0;
        var _context;

        var init = function (activeCollection, selectedIndex, context) {
            _context = context;
            collection = activeCollection;
            totalItems = activeCollection.length;
            setSelectedIndex(selectedIndex);
        };

        var setSelectedIndex = function (selectedIndex) {
            currentIndex = selectedIndex || 0;
            _context.isFirst(currentIndex == 0);
            _context.isLast(currentIndex == totalItems - 1);
        };

        var getNewSelectedItem = function (direction, onChangeSelection) {
            setIndexs();

            switch (direction) {
                case eNavigateDirection.Next:
                    setSelectedIndex(nextIndex);
                    onChangeSelection(collection[nextIndex]);
                    break;
                case eNavigateDirection.Prev:
                    setSelectedIndex(prevIndex);
                    onChangeSelection(collection[prevIndex]);
                    break;
            }

            window.scrollTo(0, 1);
        };

        var setIndexs = function () {
            nextIndex = currentIndex + 1 <= totalItems - 1 ? currentIndex + 1 : totalItems - 1;
            prevIndex = currentIndex - 1 > 0 ? currentIndex - 1 : 0;
        };

        var getCollection = function () {
            return collection;
        };

        return {
            Init: init,
            getCollection: getCollection,
            GetNewSelectedItem: getNewSelectedItem
        };
    }
)