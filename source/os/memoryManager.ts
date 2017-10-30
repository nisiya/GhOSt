///<reference path="../globals.ts" />

/* ------------
     memoryAccessor.ts

     Requires global.ts.
     ------------ */
    module TSOS {
        export class MemoryManager {

            public loadMemory(inputOpCodes){               
                var baseReg: number;
                // check if memory is full and return the base of free partition
                if (_Memory.memoryS1){
                    if(_Memory.memoryS2){
                        if(_Memory.memoryS3){
                            // memory is full
                            baseReg == 999;
                        } else{
                            _Memory.memoryS3 = true;
                            baseReg = 512;
                        }
                    } else{
                        _Memory.memoryS2 = true; 
                        baseReg = 256;
                    }
                } else{
                    _Memory.memoryS1 = true;
                    baseReg = 0;
                }
                
                // load user program into memory
                for (var i = baseReg; i <inputOpCodes.length; i++){
                    _Memory.memory[i] = inputOpCodes[i];
                }
                Control.updateMemoryTable(baseReg);
                return baseReg;
            }
            
            public readMemory(index){
                // retrieve from Memory
                var opCode: string = _Memory.memory[index];
                return opCode;
            }
            
            public clearPartition(baseReg) : void{
                // free up memory when process completes
                for (var i = baseReg; i <= baseReg+255; i++){
                    _Memory.memory[i] = "00";
                } 
                if(baseReg==0){
                    _Memory.memoryS1 = false;
                } // add other partitions later
                Control.updateMemoryTable(baseReg);
            }
        }
    }