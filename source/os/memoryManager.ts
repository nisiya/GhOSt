///<reference path="../globals.ts" />

/* ------------
     memoryAccessor.ts

     Requires global.ts.
     ------------ */
    module TSOS {
        export class MemoryManager {
            // checks if memory partition is loaded
            public memoryS1: boolean = false;
            public memoryS2: boolean = false;
            public memoryS3: boolean = false;

            public loadMemory(inputOpCodes){               
                var baseReg: number;
                // check if memory is full and return the base of free partition
                if (this.memoryS1){
                    if(this.memoryS2){
                        if(this.memoryS3){
                            // memory is full
                            baseReg = 999;
                        } else{
                            this.memoryS3 = true;
                            baseReg = 512;
                        }
                    } else{
                        this.memoryS2 = true; 
                        baseReg = 256;
                    }
                } else{
                    this.memoryS1 = true;
                    baseReg = 0;
                }
                if(baseReg!=999){
                     // load user program into memory
                    for (var i = 0; i <inputOpCodes.length; i++){
                        _Memory.memory[baseReg+i] = inputOpCodes[i];
                    }
                    Control.updateMemoryTable(baseReg);   
                }
                // if yes, return and load user program into disk
                return baseReg; 
            }
            
            public clearPartition(baseReg) : void{
                // free up memory when process completes
                for (var i = baseReg; i <= baseReg+255; i++){
                    _Memory.memory[i] = "00";
                } 
                if(baseReg==0){
                    this.memoryS1 = false;
                } else if(baseReg==256){
                    this.memoryS2 = false;
                } else {
                    this.memoryS3 = false;
                }
                Control.updateMemoryTable(baseReg);
            }

            public clearMemory(): void{
                // clear all memory partitions
                this.clearPartition(0);
                this.memoryS1 = false;

                this.clearPartition(256);
                this.memoryS2 = false;

                this.clearPartition(512);
                this.memoryS3 = false;
            }
        }
    }