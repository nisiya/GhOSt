///<reference path="../globals.ts" />

/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
     module TSOS {
        export class CpuScheduler {
            // public algorithm = "Round Robin";
            public quantum = 6;
            public currCycle = 0;
            public activePIDs = new Array<number>();
            // public turnaroundTime = 0;
            // public waitTime = 0;
            public totalCycles = 0;
            public runningProcess;
            
            public start(): void {
                // run first process normally
                this.currCycle = 0;
                this.runningProcess = _ReadyQueue.dequeue();
                this.runningProcess.pState = "Running";
                Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
                _RunningPID = this.runningProcess.pid;
                _RunningpBase = this.runningProcess.pBase;
            }

            public checkSchedule(): void {
                this.currCycle++;
                this.totalCycles++;
                this.runningProcess.turnaroundTime++;
                // if time's up
                if (this.currCycle > this.quantum){
                    this.totalCycles--;
                    // if there are processes waiting in Ready queue, context switch
                    if (!_ReadyQueue.isEmpty()){
                        _CPU.isExecuting = true;
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    } else {
                        // if none, check if current process is finishing
                        // if(_CPU.IR == "00"){
                        //     _CPU.init();
                        // }
                    }
                    // for running single process, scheduler just gives another round of executions
                    // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                    this.currCycle = 0;
                }
            }
        }
    }