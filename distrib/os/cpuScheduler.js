///<reference path="../globals.ts" />
/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var CpuScheduler = /** @class */ (function () {
        function CpuScheduler() {
            this.algorithm = "Round Robin";
            this.quantum = 6;
            this.currCycle = 0; // track run time
            this.activePIDs = new Array(); // for listing
            this.totalCycles = 0; // track total throughput
        }
        CpuScheduler.prototype.start = function () {
            // run first process normally
            this.currCycle = 0;
            this.totalCycles = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            this.runningProcess.pState = "Running";
            TSOS.Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
        };
        // check if time is up and if context switch is needed
        CpuScheduler.prototype.checkSchedule = function () {
            console.log("hit");
            this.currCycle++;
            this.runningProcess.turnaroundTime++;
            this.totalCycles++;
            // if time's up
            if (this.currCycle >= this.quantum) {
                // if there are processes waiting in Ready queue, context switch
                console.log(_ReadyQueue);
                if (!_ReadyQueue.isEmpty()) {
                    console.log("hello");
                    // if (!_CPU.isExecuting){
                    //     console.log("hi");
                    //     _CPU.isExecuting = true;
                    // }
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    console.log("umm");
                }
                // for running single process, scheduler just gives another round of executions
                // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                // this.currCycle = 0;
                console.log("currrrr " + this.currCycle);
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
