///<reference path="../globals.ts" />

/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
     module TSOS {
        export class CpuScheduler {
            public algorithm = "Round Robin";
            public quantum = 6;
            public currCycle = 0; // track run time
            public activePIDs = new Array<number>(); // for listing
            public totalCycles = 0; // track total throughput
            public runningProcess; // track running process
            
            public start(): void {
                // run first process normally
                this.currCycle = 0;
                this.totalCycles = 0;
                this.runningProcess = _ReadyQueue.dequeue();
                this.runningProcess.pState = "Running";
                Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
            }

            // check if time is up and if context switch is needed
            public checkSchedule(): void {
                this.currCycle++;
                this.runningProcess.turnaroundTime++;
                this.totalCycles++;
                // if time's up
                if (this.currCycle >= this.quantum){
                    // if there are processes waiting in Ready queue, context switch
                    console.log(_ReadyQueue);
                    if (!_ReadyQueue.isEmpty()){
                        if (!_CPU.isExecuting){
                            _CPU.isExecuting = true;
                        }
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    }
                    // for running single process, scheduler just gives another round of executions
                    // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                    this.currCycle = 0;
                }
            }
        }
    }