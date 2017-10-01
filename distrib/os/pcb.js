/* ------------
   pcb.ts
   Process Control Block
   need:
   *process ID
   process state
   privileges
   program counter: pointer to address of next instruction
   location
   CPU registers, ACC, X, Y
   CPU scheduling information
   I/O status info


   ------------ */
var TSOS;
(function (TSOS) {
    var Process = /** @class */ (function () {
        function Process(pid, pBase) {
            this.pCounter = 0;
            this.pAcc = 0;
            this.pXreg = 0;
            this.pYreg = 0;
            this.pZflag = 0;
            this.pPriority = 0;
            this.pState = "Not running";
            this.pLocation = "Memory";
            this.pLimit = this.pBase + 255;
        }
        Process.prototype.getPid = function () {
            return this.pid;
        };
        return Process;
    }());
    TSOS.Process = Process;
})(TSOS || (TSOS = {}));
