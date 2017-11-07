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
        }
        // public start(): void {
        //     this.currCycle = 0;
        // }
        CpuScheduler.prototype.checkSchedule = function () {
            // run very first process normally
            if (this.currCycle == 0 && _CPU.PC == 0) {
                var process = _ReadyQueue.dequeue();
                process.pState = "Running";
                _RunningPID = process.pid;
                _RunningpBase = process.pBase;
                TSOS.Control.updateProcessTable(_RunningPID, process.pState);
            }
            this.currCycle++;
            // if time's up
            if (this.currCycle > this.quantum) {
                // if there are processes waiting in Ready queue, context switch
                if (!_ReadyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, null));
                }
                else {
                    // if none, check if current process is finishing
                    if (_CPU.IR == "00") {
                        _CPU.init();
                    }
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
