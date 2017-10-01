///<reference path="../globals.ts" />
/* ------------
     memoryAccessor.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.loadMemory = function (userInput) {
            var loadText = userInput.split(" ");
            console.log(loadText);
            for (var i = 0; i < loadText.length; i++) {
                _Memory.memoryBox[i] = loadText[i];
                console.log("i = " + i);
            }
            console.log(_Memory.memoryBox);
            _Memory.createTable(_Memory.memoryBox);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
