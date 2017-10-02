///<reference path="../globals.ts" />
/* ------------
     memoryAccessor.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.loadMemory = function (inputOpCodes) {
            var baseReg;
            if (_Memory.memoryP1) {
                if (_Memory.memoryP2) {
                    if (_Memory.memoryP3) {
                        _StdOut.putText("Memory is full. Please wait to load");
                    }
                    else {
                        _Memory.memoryP3 = true;
                        baseReg = 512;
                    }
                }
                else {
                    _Memory.memoryP2 = true;
                    baseReg = 256;
                }
            }
            else {
                _Memory.memoryP1 = true;
                baseReg = 0;
            }
            for (var i = baseReg; i < inputOpCodes.length; i++) {
                _Memory.memory[i] = inputOpCodes[i];
                console.log("i = " + i);
            }
            console.log(_Memory.memory);
            _Memory.updateTable(baseReg);
            return baseReg;
        };
        MemoryManager.prototype.readMemory = function (pBase, pLimit) {
            var opCode = [];
            for (var i = pBase; i <= pLimit; i++) {
                opCode.push(_Memory.memory[i]);
            }
            return opCode;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
