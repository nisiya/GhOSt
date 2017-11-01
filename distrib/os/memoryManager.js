///<reference path="../globals.ts" />
/* ------------
     memoryAccessor.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            // checks if memory partition is loaded
            this.memoryS1 = false;
            this.memoryS2 = false;
            this.memoryS3 = false;
        }
        MemoryManager.prototype.loadMemory = function (inputOpCodes) {
            var baseReg;
            // check if memory is full and return the base of free partition
            if (this.memoryS1) {
                if (this.memoryS2) {
                    if (this.memoryS3) {
                        // memory is full
                        baseReg = 999;
                    }
                    else {
                        this.memoryS3 = true;
                        baseReg = 512;
                    }
                }
                else {
                    this.memoryS2 = true;
                    baseReg = 256;
                }
            }
            else {
                this.memoryS1 = true;
                baseReg = 0;
            }
            console.log(baseReg);
            // load user program into memory
            if (baseReg != 999) {
                for (var i = 0; i < inputOpCodes.length; i++) {
                    _Memory.memory[baseReg + i] = inputOpCodes[i];
                    // _MemoryAccessor.writeMemory(baseReg+i, inputOpCodes[i]);
                }
                TSOS.Control.updateMemoryTable(baseReg);
            }
            console.log(_Memory.memory);
            return baseReg;
        };
        MemoryManager.prototype.clearPartition = function (baseReg) {
            // free up memory when process completes
            for (var i = baseReg; i <= baseReg + 255; i++) {
                _Memory.memory[i] = "00";
            }
            if (baseReg == 0) {
                this.memoryS1 = false;
            }
            else if (baseReg == 256) {
                this.memoryS2 = false;
            }
            else {
                this.memoryS3 = false;
            }
            TSOS.Control.updateMemoryTable(baseReg);
        };
        MemoryManager.prototype.clearMemory = function () {
            // clear all memory partitions
            this.clearPartition(0);
            this.memoryS1 = false;
            this.clearPartition(256);
            this.memoryS2 = false;
            this.clearPartition(512);
            this.memoryS3 = false;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
