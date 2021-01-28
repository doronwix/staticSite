const utils = require('../utils/utils');
const xlsx = require('node-xlsx');

module.exports = function(grunt) {

    grunt.registerTask('build-icons-css', function () {
        //this is the file where are the rules for the instruments
        const fontsLessPath = '../Skins/Shared/less/instruments.less';
        //this is the file that contains all the information about instrument style: bg color, color, font-size
        const instrumentsDataPath = 'instrumentsUtils/instrumentsData.json';
        const instrumentsData = JSON.parse(grunt.file.read(instrumentsDataPath));
        const instrumentsPath = grunt.option('instrumentsPath');
        const svgPath = grunt.option('svgPath');

        function build() {
            //gets the new instrumentsData.json from the icomoon generated styles
            const newInstrumentsJson = parseGeneratedStyles();

            if(newInstrumentsJson) {
                utils.writeToFile(instrumentsDataPath, newInstrumentsJson);

                //this is where the new instruments.less file is created/updated using instrumentsData.json
                const resetIconRule = buildResetIconCssRule();
                const cssRules = buildInstrumentsLess();
                const css = resetIconRule + '\n\n' + cssRules;

                utils.writeToFile(fontsLessPath, css);
            }
        }

        function getColors() {
            const instrumetsFilePath = instrumentsPath.indexOf('.xlsx') === -1 ? instrumentsPath + '.xlsx' : instrumentsPath;
            const parsedDoc = xlsx.parse(instrumetsFilePath); // parses a file
            const colors = [];

            if(parsedDoc) {
                rows = parsedDoc[0].data;
                for(let i = 1; i < rows.length; i++) {

                    if(rows[i] && rows[i].length) {
                        let currentRow = rows[i];
                        let instrumentId = currentRow[1];

                        if(!instrumentId || isNaN(instrumentId)) continue;
                        
                        colors.push({
                            instrumentId: instrumentId,
                            color: currentRow[2],
                            bgColor: currentRow[3]
                        });
                    }
                } 
            }

            return colors;
        }

        function parseGeneratedStyles() {
            const generatedStylePath = 'icomoon-dist/style.css';
            const lines = grunt.file.read(generatedStylePath);
            const ruleRegex = /(\.icon\-[0-9]+:before\s{\n\s{2}content:\s"\\[a-zA-z0-9]+";\n})/g
            const instrumentRegex = /(\.icon\-[0-9]+)/g;
            const contentRegex = /content:\s"\\[a-zA-z0-9]+/g;
            const matches = lines.match(ruleRegex);
            const iconsName = utils.readIconsName(svgPath);
            const colors = getColors();

            matches.forEach((match) => {
                const instrumentMatch = match.match(instrumentRegex);
                const instrumentId = getInstrumentId(instrumentMatch[0]);

                if(iconsName.indexOf(instrumentId) !== -1) {
                    const contentMatch = match.match(contentRegex);
                    const content = getContent(contentMatch[0]);
                    const colorObj = getColorObj(colors, instrumentId);
                    const instrument = getInstrument(instrumentsData, instrumentId);

                    if (instrument) {
                        instrument.content = content;
                        instrument.bgColor = colorObj.bgColor;
                        instrument.color = colorObj.color;
                    } else {
                        instrumentsData.push({
                            resetIcon: true,
                            instrumentId: instrumentId,
                            content: content,
                            bgColor: colorObj.bgColor,
                            color: colorObj.color
                        });
                    }
                }
            });

            return JSON.stringify(instrumentsData, null,'\t');
        }

        function getInstrument(instrumentsData, instrumentId) {
            const found = instrumentsData.find((instr) => {
                return parseInt(instr.instrumentId) === parseInt(instrumentId);
            });

            return found;
        }

        function getColorObj(colors, instrumentId) {
            const defaultObj = {
                bgColor: '#ffffff',
                color: '#ffffff'
            };

            const colorObj = colors.find((color) => {
                return parseInt(color.instrumentId) === parseInt(instrumentId);
            });

            if(colorObj) {
                defaultObj.bgColor = colorObj.bgColor;
                defaultObj.color = colorObj.color;
            }

            return defaultObj;
        }

        function getInstrumentId(instrumentMatch) {
            if(!instrumentMatch) return '';

            const pos = instrumentMatch.indexOf('-');

            return instrumentMatch.substring(pos + 1, instrumentMatch.length);
        }

        function getContent(contentMatch) {
            if(!contentMatch) return '';

            const pos = contentMatch.lastIndexOf('\\');

            return contentMatch.substring(pos + 1, contentMatch.length);
        }

        function buildInstrumentsLess() {
            const cssRules = [];

            instrumentsData.forEach((instr) => {
                if(instr.content) {
                    cssRules.push(buildCssRule(instr));
                }
            });

            return cssRules.join('\n');
        }

        function buildResetIconCssRule() {
            const instrumentNames = [];
            const length = instrumentsData.length;

            for(let i = 0; i < length - 1; i++) {
                if(instrumentsData[i].resetIcon === true) { 
                    instrumentNames.push(`.instr-${instrumentsData[i].instrumentId}, ${(i % 8 === 0 ? '\n' : '')}`);
                }
            }

            if(instrumentsData[length - 1].resetIcon === true) { 
                instrumentNames.push(`.instr-${instrumentsData[length - 1].instrumentId} {\n`);
            }

            let resetIconStyle = utils.readFile('instrumentsUtils/resetIcon.less');
            
            if(resetIconStyle) {
                resetIconStyle += '\n}';
            }

            return instrumentNames.join('').concat(resetIconStyle);
        }

        function buildCssRule(instr) {
            const rule = [
                '.instr-', 
                instr.instrumentId, 
                '{ i.base.currency{ background-color: ', 
                instr.bgColor,
                ';',
                instr.color ? ' color: ' + instr.color + ';': '',
                instr.fontSize ? ' font-size: ' + instr.fontSize + ';': '',
                ' &:before{ content: "\\',
                instr.content,
                '";',
                instr.contentFontSize ? ' font-size: ' + instr.contentFontSize + ';' : '',
                '}}}'
            ];

            return rule.join('');
        }

        build();
    });
}