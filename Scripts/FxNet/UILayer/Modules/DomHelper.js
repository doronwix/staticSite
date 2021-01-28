define(
    'fxnet/uilayer/Modules/DomHelper',
    [
        'handlers/general'
    ],
    function DomHelper(general) {
        function nodeMatchAttrs(node, attrsConfig) {
            var matchAttrs = Object.keys(attrsConfig);

            for (var i = 0; i < matchAttrs.length; i++) {
                var nodeAttrValue = node[matchAttrs[i]];

                if (nodeAttrValue && attrsConfig[matchAttrs[i]].contains(nodeAttrValue)) {
                    return true;
                }
            }

            return false;
        }

        function nodeExists(node, config) {
            if (!general.isNullOrUndefined(config.idList) && config.idList.contains(node.id)) {
                return true;
            }

            if (!general.isNullOrUndefined(config.tagList) && Object.keys(config.tagList).contains(node.tagName)) {
                var attrsMatch = config.tagList[node.tagName];

                if (general.isNullOrUndefined(attrsMatch) || nodeMatchAttrs(node, attrsMatch)) {
                    return true;
                }
            }

            return false;
        }

        return {
            NodeExists: nodeExists
        };
    }
);
