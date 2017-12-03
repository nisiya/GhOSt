/* ------------
   pcb.ts
   
   Process Control Block
   need:
   process ID
   process state
   priority
   program counter: pointer to address of next instruction
   location
   CPU registers: ACC, X, Y, Z flag
   base and limit registers

   ------------ */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(pBase, pid, pState, pPriority) {
            this.pCounter = 0;
            // public pIR: string = "00";
            this.pAcc = 0;
            this.pXreg = 0;
            this.pYreg = 0;
            this.pZflag = 0;
            this.pPriority = 0;
            this.pLocation = "Memory";
            this.turnaroundTime = 0;
            this.waitTime = 0;
            this.pid = pid;
            this.pBase = pBase;
            this.pLimit = 255;
            this.pState = pState;
            this.pPriority = pPriority;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
