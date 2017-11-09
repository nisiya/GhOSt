///<reference path="../globals.ts" />

/* ------------
     MEMORYACCESSOR.ts

     Memory Accessor
        - Read and write to memory
        - Translate physical address to logical and vice versa
        
     Requires global.ts.
     ------------ */

     module TSOS {
            // please ignore for project 2
            export class MemoryAccessor {

                public init(): void {
                    // all partitions are available

                    // load table on user interface
                    // Control.loadMemoryTable();
                }

                public writeMemory(addr, data){
                    var baseReg = _RunningpBase;
                    var limitReg = baseReg + 255;
                    var index: number = parseInt(addr, 16) + baseReg;  
                    if(index > limitReg){

                    } else {
                        _Memory.memory[index] = data.toString(16);
                        // 0 for now bc only one parition
                        Control.updateMemoryTable(0);
                    }
                }

                public readMemory(addr){
                    var baseReg = _RunningpBase;
                    var value = _Memory.memory[baseReg+addr];
                    return value;

                }

            }
        }
        