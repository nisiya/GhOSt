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

   module TSOS {
    export class Process {
        constructor(public id, ) {
        }
        public init(): void{

        }
    }
}