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
            // check if memory is full and return the base of free partition
            if (_Memory.memoryP1) {
                // memory is full
                baseReg = 999;
                // for iPj3
                // if(_Memory.memoryP2){
                //     if(_Memory.memoryP3){
                //         _StdOut.putText("Memory is full. Please wait to load");
                //     } else{
                //         _Memory.memoryP3 = true;
                //         baseReg = 512;
                //     }
                // } else{
                //     _Memory.memoryP2 = true; 
                //     baseReg = 256;
                // }
            }
            else {
                _Memory.memoryP1 = true;
                baseReg = 0;
            }
            for (var i = baseReg; i < inputOpCodes.length; i++) {
                _Memory.memory[i] = inputOpCodes[i];
            }
            _Memory.updateTable(baseReg);
            return baseReg;
        };
        MemoryManager.prototype.readMemory = function (index) {
            var opCode = _Memory.memory[index];
            return opCode;
        };
        MemoryManager.prototype.updateMemory = function (addr, data) {
            var index = parseInt(addr, 16);
            _Memory.memory[index] = data.toString(16);
            // 0 for now bc only one parition
            _Memory.updateTable(0);
        };
        MemoryManager.prototype.clearPartition = function (baseReg) {
            for (var i = baseReg; i <= baseReg + 255; i++) {
                _Memory.memory[i] = "00";
            }
            if (baseReg == 0) {
                _Memory.memoryP1 = false;
            }
            // add other partitions later
            _Memory.updateTable(baseReg);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
