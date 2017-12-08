///<reference path="../globals.ts" />

/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
     module TSOS {
        export class CpuScheduler {
            public schedule = "Round Robin";
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
                _CPU.isExecuting = true;
                Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
            }

            // check if time is up and if context switch is needed
            public checkSchedule(): void {
                if (this.activePIDs.length == 0){
                    _CPU.init();
                } else {
                    this.currCycle++;
                    this.runningProcess.turnaroundTime++;
                    this.totalCycles++;
                    // if time's up
                    if (this.currCycle >= this.quantum){
                        // if there are processes waiting in Ready queue, context switch
                        if (!_ReadyQueue.isEmpty()){
                            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                        }
                        // for running single process, scheduler just gives another round of executions
                        // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                    }
                }
            }

            public setSchedule(schedule): void{
                switch (schedule){
                    case "rr":
                        this.schedule = "Round Robin";
                        this.quantum = 6;
                        break;
                    case "fcfs":
                        this.schedule = "First-come, First-serve"
                        this.quantum = 30;
                        break;
                    case "priority":
                        this.schedule = "Non-preemptive Priority";
                        this.quantum = 30;
                    default:
                        this.quantum = 6;
                        break;
                }

            }
        }
    }