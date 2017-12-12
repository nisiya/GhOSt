///<reference path="../globals.ts" />
/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var CpuScheduler = /** @class */ (function () {
        function CpuScheduler() {
            this.schedule = "Round Robin";
            this.quantum = 6;
            this.currCycle = 0; // track run time
            this.activePIDs = new Array(); // for listing
            this.totalCycles = 0; // track total throughput
        }
        CpuScheduler.prototype.start = function () {
            // run first process normally
            this.currCycle = 0;
            this.totalCycles = 0;
            if (this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize() > 1) {
                this.sortPriority();
            }
            this.runningProcess = _ReadyQueue.dequeue();
            this.runningProcess.pState = "Running";
            _CPU.isExecuting = true;
            TSOS.Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
        };
        // check if time is up and if context switch is needed
        CpuScheduler.prototype.checkSchedule = function () {
            if (this.activePIDs.length == 0) {
                _CPU.init();
            }
            else {
                this.currCycle++;
                this.runningProcess.turnaroundTime++;
                this.totalCycles++;
                // if time's up
                if (this.currCycle >= this.quantum) {
                    // if there are processes waiting in Ready queue, context switch
                    if (!_ReadyQueue.isEmpty()) {
                        if (this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize() > 1) {
                            this.sortPriority();
                        }
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    }
                    // for running single process, scheduler just gives another round of executions
                    // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                }
            }
        };
        CpuScheduler.prototype.sortPriority = function () {
            // put highest priorty first
            var firstProcess = _ReadyQueue.dequeue();
            // console.log(firstProcess.pPriority);
            var secondProcess;
            var comparison = 1;
            while (comparison < _ReadyQueue.getSize()) {
                secondProcess = _ReadyQueue.dequeue();
                if (secondProcess.pPriority < firstProcess.pPriority) {
                    _ReadyQueue.enqueue(secondProcess);
                    firstProcess = secondProcess;
                }
                else {
                    _ReadyQueue.enqueue(secondProcess);
                }
                comparison++;
            }
            // console.log(firstProcess.pPriority);
            _ReadyQueue.enqueue(firstProcess);
            for (var i = 0; i < _ReadyQueue.getSize() - 1; i++) {
                _ReadyQueue.enqueue(_ReadyQueue.dequeue());
            }
            console.log(_ReadyQueue.getSize());
        };
        CpuScheduler.prototype.setSchedule = function (args) {
            var returnMsg;
            var newSchedule = args.toString();
            switch (newSchedule) {
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
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
