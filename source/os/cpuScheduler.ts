///<reference path="../globals.ts" />

/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
     module TSOS {
        export class CpuScheduler {
            public algorithm = "Round Robin";
            public quantum = 6;
            public currCycle = 0;

            // public start(): void {
            //     this.currCycle = 0;
                
            // }

            public checkSchedule(): void {
                // if (_ReadyQueue.getSize() > 0 && !_CPU.isExecuting){
                //     _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                //     _CPU.isExecuting = true;
                // } 
                if (this.currCycle == 0 && _CPU.PC == 0){
                    var process = _ReadyQueue.dequeue();
                    process.pState = "Running";
                    _RunningPID = process.pid;
                    _RunningpBase = process.pBase;
                    Control.updateProcessTable(_RunningPID, process.pState);
                }
                this.currCycle++;
                if (this.currCycle > this.quantum){
                    if (!_ReadyQueue.isEmpty()){
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                    }
                    this.currCycle = 0;
                }
            }
        }
    }