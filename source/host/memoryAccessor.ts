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
                    // load table on user interface
                    Control.loadMemoryTable();
                }

                public writeMemory(addr, data){
                    // checks running process base reg and translate incoming address
                    var baseReg = _CpuScheduler.runningProcess.pBase;
                    var limitReg = baseReg + 255;
                    var index: number = parseInt(addr, 16) + baseReg;  
                    // check if out of bound access
                    if(index > limitReg){
                        _KernelInterruptQueue.enqueue(new Interrupt(MEMACCESS_ERROR_IRQ, _CpuScheduler.runningProcess.pid));
                    } else {
                        _Memory.memory[index] = data.toString(16).toUpperCase();
                        Control.updateMemoryTable(baseReg);
                    }
                }

                public readMemory(addr){
                    // checks running process base reg and translate incoming address
                    var baseReg = _CpuScheduler.runningProcess.pBase;
                    var limitReg = baseReg + 255;
                    var index: number = baseReg + addr;
                    // check if out of bound access
                    if (index > limitReg){
                        _KernelInterruptQueue.enqueue(new Interrupt(MEMACCESS_ERROR_IRQ, _CpuScheduler.runningProcess.pid));
                    } else{
                        var value = _Memory.memory[index];
                        return value;
                    }
                }

                public readPartition(baseReg, limitReg):string[]{
                    var value: string[] = _Memory.memory.slice(baseReg,(baseReg+limitReg+1));
                    // var value = new Array<string>();
                    // var opCodes:string;
                    // for (var i=0; i<limitReg; i++){
                    //     opCodes = _Memory.memory[baseReg+i];
                    //     value.push(opCodes);
                    //     if(opCodes=="00" && _Memory.memory[baseReg+i+1]=="00"){
                    //         break;
                    //     }
                    // }
                    return value;
                }

                public writePartition(baseReg,index,data){
                    _Memory.memory[index] = data.toString(16).toUpperCase();
                    Control.updateMemoryTable(baseReg);
                }

            }
        }
        