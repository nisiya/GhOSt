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
            this.currCycle = 0;
            this.activePIDs = new Array();
            this.totalCycles = 0;
        }
        CpuScheduler.prototype.start = function () {
            // run first process normally
            this.currCycle = 0;
            this.totalCycles = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            this.runningProcess.pState = "Running";
            TSOS.Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
        };
        CpuScheduler.prototype.checkSchedule = function () {
            this.currCycle++;
            this.runningProcess.turnaroundTime++;
            this.totalCycles++;
            // if time's up
            if (this.currCycle >= this.quantum) {
                console.log("total = " + this.totalCycles);
                // if there are processes waiting in Ready queue, context switch
                if (!_ReadyQueue.isEmpty()) {
                    _CPU.isExecuting = true;
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                }
                // for running single process, scheduler just gives another round of executions
                // for mulitple processes, scheduler number of cycle resets to give next process a round of execution 
                this.currCycle = 0;
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
