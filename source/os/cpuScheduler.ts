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
                if(this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize()>1){
                    this.sortPriority();
                }
                this.currCycle = 0;
                this.totalCycles = 0;
                this.runningProcess = _ReadyQueue.dequeue();
                // if first running process is in disk (only occurs with priority)
                    // choose next process not on disk in Ready Queue to swap with
                // note: method only for this case. other case, swap with last ran process
                if (this.runningProcess.pBase == 999){
                    var victim = _ReadyQueue.dequeue();
                    while(victim.pBase == 999){
                        _ReadyQueue.enqueue(victim);
                        victim = _ReadyQueue.dequeue;
                    }
                    var tsb = _LazySwapper.swapProcess(this.runningProcess.tsb, victim.pBase, victim.pLimit);
                    if (tsb){
                        this.runningProcess.pBase = victim.pBase;
                        this.runningProcess.pLimit = victim.pLimit;
                        victim.tsb = tsb;
                        victim.pBase = 999;
                        _ReadyQueue.enqueue(victim);
                    } else{
                    // disk ran out of space
                    // exit current process and stop CPU execution
                    var error = "Disk and memory are full."
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_ERROR_IRQ, error));
                    _Kernel.krnExitProcess(_CpuScheduler.runningProcess);
                    // reset CPU
                    _CPU.init();
                    }
                }
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
                    // put highest (lowest number) priorty first
                    var firstProcess = _ReadyQueue.dequeue();
                    var secondProcess;
                    var comparison = 0;
                    while(comparison<_ReadyQueue.getSize()){
                        secondProcess = _ReadyQueue.dequeue();
                        if(secondProcess.pPriority < firstProcess.pPriority){
                            _ReadyQueue.enqueue(firstProcess);
                            firstProcess = secondProcess;
                        } else{
                            _ReadyQueue.enqueue(secondProcess);
                        }
                        comparison++;
                    }
                    // reorder so highest priority is first
                    _ReadyQueue.enqueue(firstProcess);
                    for(var i=0; i<_ReadyQueue.getSize()-1; i++){
                        _ReadyQueue.enqueue(_ReadyQueue.dequeue());
                    }
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