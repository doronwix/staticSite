const fs = require('fs');

module.exports = {
    readIconsPath(path) {
        return fs.readdirSync(path).map(icon => {
            return path + '/' + icon;
        });
    },
    readIconsName(path) {
        return fs.readdirSync(path).map(icon => {
            return icon.split('.')[0];
        });
    },
    appendToFile(filePath, data) {
        fs.appendFileSync(filePath, data);
    },
    writeToFile(filePath, data) {
        fs.writeFileSync(filePath, data);
    },
    readFile(filePath) {
        return fs.readFileSync(filePath);
    }
}