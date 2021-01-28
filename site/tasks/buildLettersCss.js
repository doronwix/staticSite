const utils = require('../utils/utils');
const xlsx = require('node-xlsx');

module.exports = function(grunt) {

    grunt.registerTask('build-letters-css', function () {
        const instrumentsPath = grunt.option('instrumentsPath');
        const lettersDataPath = 'instrumentsUtils/lettersData.json';
        const lettersData = JSON.parse(grunt.file.read(lettersDataPath));

        function build() {
            //this is the file where are the rules for the instruments
            const lettersLessPath = '../Skins/Shared/less/letters.less';
            const letters = getLetterData();

            if(letters.length) {
                addLettersToJson(letters);
                utils.writeToFile(lettersDataPath, JSON.stringify(lettersData, null,'\t'));
                
                const css = buildCss(letters);

                utils.appendToFile(lettersLessPath, '\n' + css);
            }
        }

        function buildCss(letters) {
            const cssRules = [];

            letters.forEach((letter) => {
                cssRules.push(buildCssRule(letter));
            });

            return cssRules.join('\n');
        }

        function addLettersToJson(letters) {
            letters.forEach((letter) => {
                lettersData.push({
                    instrumentId: letter.instrumentId,
                    bgColor: letter.bgColor
                });
            });
        }

        function letterExists(instrumentId) {
            const found = lettersData.find((letter) => {
                return parseInt(letter.instrumentId) === parseInt(instrumentId);
            });

            return !!found;
        }

        function buildCssRule(letter) {
            return `.instr-${letter.instrumentId} i .default { background-color: ${letter.bgColor}; }`;
        }

        function getLetterData() {
            const instrumetsFilePath = instrumentsPath.indexOf('.xlsx') === -1 ? instrumentsPath + '.xlsx' : instrumentsPath;
            const parsedDoc = xlsx.parse(instrumetsFilePath); // parses a file
            const letters = [];

            if(parsedDoc) {
                rows = parsedDoc[0].data;
                for(let i = 1; i < rows.length; i++) {

                    if(rows[i] && rows[i].length) {
                        let currentRow = rows[i];
                        let instrumentId = currentRow[1];

                        if(!instrumentId || isNaN(instrumentId)) continue;
                        
                        if(currentRow[4] && !letterExists(instrumentId)) {
                            letters.push({
                                instrumentId: instrumentId,
                                bgColor: currentRow[3]
                            });
                        }
                    }
                } 
            }

            return letters;
        }

        build();
    });
}