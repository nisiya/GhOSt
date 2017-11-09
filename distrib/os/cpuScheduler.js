///<reference path="../globals.ts" />
/* ------------
     cpuScheduler.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var CpuScheduler = /** @class */ (function () {
        function CpuScheduler() {
            // public algorithm = "Round Robin";
            this.quantum = 6;
            this.currCycle = 0;
            this.activePIDs = new Array();
            // public turnaroundTime = 0;
            // public waitTime = 0;
            this.totalCycles = 0;
        }
        CpuScheduler.prototype.start = function () {
            // run first process normally
            this.currCycle = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            this.runningProcess.pState = "Running";
            TSOS.Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
            _RunningPID = this.runningProcess.pid;
            _RunningpBase = this.runningProcess.pBase;
        };
        CpuScheduler.prototype.checkSchedule = function () {
            this.currCycle++;
            this.totalCycles++;
            this.runningProcess.turnaroundTime++;
            // if time's up
            if (this.currCycle > this.quantum) {
                this.totalCycles--;
                // if there are processes waiting in Ready queue, context switch
                if (!_ReadyQueue.isEmpty()) {
                    _CPU.isExecuting = true;
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                }
                else {
                    // if none, check if current process is finishing
                    // if(_CPU.IR == "00"){
                    //     _CPU.init();
                    // }
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
