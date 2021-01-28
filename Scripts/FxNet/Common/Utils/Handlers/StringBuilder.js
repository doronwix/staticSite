function StringBuilder() {
    this._length = 0;
    this._buffer = [];
}

StringBuilder.prototype.append = function(text) {
    this._buffer[this._length] = text;
    this._length += 1;
};

StringBuilder.prototype.toString = function() {
    return this._buffer.join("");
};

StringBuilder.prototype.isEmpty = function() {
    return this._length === 0;
};