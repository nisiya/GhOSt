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
        function PCB(pBase, pid) {
            this.pCounter = 0;
            this.pAcc = 0;
            this.pXreg = 0;
            this.pYreg = 0;
            this.pZflag = 0;
            this.pPriority = 0;
            this.pState = "New";
            this.pLocation = "Memory";
            this.pid = pid;
            this.pBase = pBase;
            this.pLimit = pBase + 255;
            this.pState = "Resident";
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
