"use strict";
exports.__esModule = true;
var Lexer_1 = require("./Lexer");
var Spec1 = [
    [
        [["M_KEY", "M_OP", "NUMBER"], "M_CRITERIA"],
        [["S_KEY", "S_OP", "STRING"], "S_CRITERIA"]
    ], [
        [["M_CRITERIA"], "CRITERIA"],
        [["S_CRITERIA"], "CRITERIA"]
    ]
];
var Parser = /** @class */ (function () {
    function Parser(query) {
        this._tokens = [];
        var lexer = new Lexer_1.Lexer();
        lexer.init(query);
        var lookahead = lexer.getNextToken();
        this._token = lookahead;
        this._cursor = 0;
        while (lexer.hasMoreTokens()) {
            if (lookahead.type == "WHITESPACE" || lookahead.value == "and") {
                lookahead = lexer.getNextToken();
                continue;
            }
            this._tokens.push(lookahead);
            lookahead = lexer.getNextToken();
        }
    }
    Parser.prototype.isTokenizerEnd = function () {
        return this._token.type === "DOT" || this._cursor >= this._tokens.length - 1;
    };
    Parser.prototype.nextToken = function () {
        ++this._cursor;
        this._token = this._tokens[this._cursor];
    };
    Parser.prototype.parse = function (depth) {
        var buffer = [];
        var start;
        var deleteCount = 0;
        var newType = null;
        var deep = depth;
        var level = Spec1[deep];
        console.log(this._tokens);
        console.log(level);
        this._cursor = 0;
        this._token = this._tokens[0];
        while (!this.isTokenizerEnd()) {
            for (var _i = 0, level_1 = level; _i < level_1.length; _i++) {
                var _a = level_1[_i], types = _a[0], genericType = _a[1];
                for (var j = 0; j < types.length; j++) {
                    if (types[j] !== this._token.type) {
                        buffer = [];
                        newType = null;
                        break;
                    }
                    if (typeof start == 'undefined') {
                        start = this._cursor;
                        newType = genericType;
                    }
                    buffer.push(this._token);
                    this.nextToken();
                }
                if (buffer.length > 0) {
                    console.log("Start " + start + " Len " + buffer.length);
                    this._tokens.splice(start, buffer.length, {
                        type: newType,
                        value: buffer
                    });
                    //console.log(this._tokens)
                    this._cursor = 0;
                    this._token = this._tokens[0];
                    newType = null;
                    buffer = [];
                    start = undefined;
                }
            }
            this.nextToken();
        }
        //    console.log(this._tokens)
        return this._tokens;
    };
    return Parser;
}());
var q1 = 'In courses dataset courses, find entries whose Average is greater than 97 and Department is \"adhe\"; show Department and Average; sort in ascending order by Average.';
var parser = new Parser(q1);
for (var i = 0; i < 2; i++) {
    console.log(i);
    console.log(parser.parse(i));
}
