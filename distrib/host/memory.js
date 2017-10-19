///<reference path="../globals.ts" />
/* ------------
     MEMORY.ts

     Memory
        - array of 768 bytes
        - 3 partitions
        
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            // checks if memory partition is loaded
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
        Memory.prototype.init = function () {
            // creates the memory at boot
            this.memory = new Array();
            for (var i = 0; i < 768; i++) {
                this.memory.push("00");
            }
            // all partitions are available
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
            // load table on user interface
            TSOS.Control.loadMemoryTable();
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
