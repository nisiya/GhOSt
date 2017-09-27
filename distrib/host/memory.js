///<reference path="../globals.ts" />
/* ------------
     MEMORY.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memory) {
            this.memory = memory;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i++; i < 256) {
                this.memory.push("00");
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
