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
                if (_Memory.memoryP1){
                    // memory is full
                    baseReg = 999;
                        // for iPj3
                    // if(_Memory.memoryP2){
                    //     if(_Memory.memoryP3){
                    //         _StdOut.putText("Memory is full. Please wait to load");
                    //     } else{
                    //         _Memory.memoryP3 = true;
                    //         baseReg = 512;
                    //     }
                    // } else{
                    //     _Memory.memoryP2 = true; 
                    //     baseReg = 256;
                    // }
                } else{
                    _Memory.memoryP1 = true;
                    baseReg = 0;
                }
                for (var i = baseReg; i <inputOpCodes.length; i++){
                    _Memory.memory[i] = inputOpCodes[i];
                }
                Control.updateMemoryTable(baseReg);
                return baseReg;
            }
            
            public readMemory(index){
                var opCode: string = _Memory.memory[index];
                return opCode;
            }

            public updateMemory(addr, data) : void{
                var index: number = parseInt(addr, 16);  
                _Memory.memory[index] = data.toString(16);
                // 0 for now bc only one parition
                Control.updateMemoryTable(0);
            }

            public clearPartition(baseReg) : void{
                for (var i = baseReg; i <= baseReg+255; i++){
                    _Memory.memory[i] = "00";
                } 
                if(baseReg==0){
                    _Memory.memoryP1 = false;
                }
                // add other partitions later
                Control.updateMemoryTable(baseReg);
            }
        }
    }