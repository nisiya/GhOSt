/* ------------
   pcb.ts
   Process Control Block
   need:
   *process ID
   process state
   privileges
   pointer to parent process
   program counter: pointer to address of next instruction
   location
   CPU registers, ACC, X, Y
   CPU scheduling information
   I/O status info


   ------------ */
var TSOS;
(function (TSOS) {
    var Process = /** @class */ (function () {
        function Process(id) {
            this.id = id;
        }
        Process.prototype.init = function () {
        };
        return Process;
    }());
    TSOS.Process = Process;
})(TSOS || (TSOS = {}));
