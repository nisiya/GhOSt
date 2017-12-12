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
    export class PCB {

        public pid: number;
        public pCounter: number = 0;
        // public pIR: string = "00";
        public pAcc: number = 0;
        public pXreg: number = 0;
        public pYreg: number = 0;
        public pZflag: number = 0; 
        public pPriority: number = 0;
        public pState: string;
        public pLocation: string = "Memory";
        public pBase: number;
        public pLimit: number;
        public tsb: string;
        public turnaroundTime: number = 0;
        public waitTime: number = 0;

        constructor(pBase, pid, pState, pPriority, tsb) {
            this.pid = pid;
            this.pBase = pBase;
            this.pLimit = 255;
            this.pState = pState;
            this.pPriority = pPriority;
            this.tsb = tsb;
        }
    }
}