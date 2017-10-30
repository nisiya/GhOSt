///<reference path="../globals.ts" />
/* ------------
     MEMORYACCESSOR.ts

     Memory Accessor
        - Read and write to memory
        - Translate physical address to logical and vice versa
        
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    // please ignore for project 2
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.init = function () {
            // all partitions are available
            // load table on user interface
            // Control.loadMemoryTable();
        };
        MemoryAccessor.prototype.writeMemory = function (addr, data) {
            var index = parseInt(addr, 16);
            _Memory.memory[index] = data.toString(16);
            // 0 for now bc only one parition
            TSOS.Control.updateMemoryTable(0);
        };
        MemoryAccessor.prototype.readMemory = function (addr) {
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
