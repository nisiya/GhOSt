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
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
            // checks if memory partition is loaded
            this.memoryS1 = false;
            this.memoryS2 = false;
            this.memoryS3 = false;
        }
        MemoryAccessor.prototype.init = function () {
            // all partitions are available
            this.memoryS1 = false;
            this.memoryS2 = false;
            this.memoryS3 = false;
            // load table on user interface
            // Control.loadMemoryTable();
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
