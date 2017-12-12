///<reference path="../globals.ts" />

/* ------------
     lazySwapper.ts

     Requires global.ts.
     ------------ */
     module TSOS {
        export class LazySwapper {

            public swapProcess(tsb, baseReg, limitReg): string{
                var newLocs = new Array<string>();
                var saveUserPrg = new Array<string>();
                var loadUserPrg = new Array<string>();
                var opCode: string;
                // save last ran process to disk
                for(var i=0; i<limitReg; i++){
                    opCode = _MemoryAccessor.retreiveMemory(baseReg+i);
                    saveUserPrg.push(opCode);
                }
                var newTSB:string = _krnFileSystemDriver.writeProcess(saveUserPrg);
                // if successfully written to disk
                if (newTSB){
                    // clear memory partition
                    _MemoryManager.clearPartition(baseReg);
                    // bring needed process from disk to memory
                    loadUserPrg = _krnFileSystemDriver.retrieveProcess(tsb);
                    for(var j=0; j<loadUserPrg.length; j++){
                        _MemoryAccessor.appendMemory(baseReg, baseReg+j, loadUserPrg[j]);
                    }
                    return newTSB;
                } else{
                    // if disk ran out of space
                    return null;
                }
            }
        }
    }