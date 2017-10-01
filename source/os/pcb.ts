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
        public pLimit: number = this.pBase + 255;

        constructor(pid, pBase) {
        }

        public getPid() {
            return this.pid;
        }
        
    }
}