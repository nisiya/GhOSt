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

   module TSOS {
    export class Process {

        public pid: number;
        public pCounter: number = 0;
        public pAcc: number = 0;
        public pXreg: number = 0;
        public pYreg: number = 0;
        public pZflag: number = 0; 
        public pPriority: number = 0;
        public pState: string = "Not running";
        public pLocation: string = "Memory";
        public pBase: number;
        public pLimit: number;

        constructor(pid, pBase, pLimit) {
            this.pid = pid;
            this.pBase = pBase;
            this.pLimit = pLimit;
        }

        public getPid() {
            return this.pid;
        }
        
    }
}