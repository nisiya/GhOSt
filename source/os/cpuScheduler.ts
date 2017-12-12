///<reference path="../globals.ts" />

/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
     module TSOS {
        export class CpuScheduler {
            public schedule = "Non-preemptive Priority";
            public quantum = 1000;
            public currCycle = 0; // track run time
            public activePIDs = new Array<number>(); // for listing
            public totalCycles = 0; // track total throughput
            public runningProcess; // track running process
            
            public start(): void {
                // run first process normally
                if(this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize()>1){
                    this.sortPriority();
                }
                this.currCycle = 0;
                this.totalCycles = 0;
                this.runningProcess = _ReadyQueue.dequeue();
                this.runningProcess.pState = "Running";
                _CPU.isExecuting = true;
                Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
            }

            // check if time is up and if context switch is needed
            public checkSchedule(): void {
                if(this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize()>1){
                    this.sortPriority();
                }
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
                            // console.log(_ReadyQueue.getSize());
                            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                        }
                        // for running single process, scheduler just gives another round of executions
                        // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                    }
                }
            }

            public sortPriority(){
                    // put highest priorty first
                    var firstProcess = _ReadyQueue.dequeue();
                    console.log(firstProcess.pid + " out");
                    var secondProcess;
                    var comparison = 0;
                    while(comparison<_ReadyQueue.getSize()){
                        secondProcess = _ReadyQueue.dequeue();
                        console.log(secondProcess.pid + " out");
                        if(secondProcess.pPriority < firstProcess.pPriority){
                            console.log(firstProcess.pid + " in");
                            _ReadyQueue.enqueue(firstProcess);
                            firstProcess = secondProcess;
                        } else{
                            console.log(secondProcess.pid + " in");
                            _ReadyQueue.enqueue(secondProcess);
                        }
                        comparison++;
                    }
                    console.log(firstProcess.pPriority);
                    _ReadyQueue.enqueue(firstProcess);
                    for(var i=0; i<_ReadyQueue.getSize()-1; i++){
                        _ReadyQueue.enqueue(_ReadyQueue.dequeue());
                    }
                    // console.log(_ReadyQueue.getSize());
            }

            public setSchedule(args): string{
                var returnMsg:string;
                var newSchedule:string = args.toString();
                switch(newSchedule){
                    case "rr":
                        this.schedule = "Round Robin";
                        this.quantum = 6;
                        returnMsg = "CPU scheduling algorithm set to: " + this.schedule;
                        break;
                    case "fcfs":
                        this.schedule = "First-come, First-serve";
                        this.quantum = 1000;
                        returnMsg = "CPU scheduling algorithm set to: " + this.schedule;
                        break;
                    case "priority":
                        this.schedule = "Non-preemptive Priority";
                        this.quantum = 1000;
                        returnMsg = "CPU scheduling algorithm set to: " + this.schedule;
                        break;
                    default:
                        this.quantum = 6;
                        returnMsg = "CPU scheduling algorithm DNE";
                }
                return returnMsg;
            }
        }
    }