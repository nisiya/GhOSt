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
            public activePIDs = new Array<number>();
            public totalCycles = 0;
            public runningProcess;
            
            public start(): void {
                // run first process normally
                this.currCycle = 0;
                this.totalCycles = 0;
                this.runningProcess = _ReadyQueue.dequeue();
                this.runningProcess.pState = "Running";
                Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
            }

            public checkSchedule(): void {
                this.currCycle++;
                this.runningProcess.turnaroundTime++;
                this.totalCycles++;
                // if time's up
                if (this.currCycle >= this.quantum){
                    console.log("total = " + this.totalCycles);
                    // if there are processes waiting in Ready queue, context switch
                    if (!_ReadyQueue.isEmpty()){
                        _CPU.isExecuting = true;
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    }
                    // for running single process, scheduler just gives another round of executions
                    // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                    this.currCycle = 0;
                }
            }
        }
    }