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
            // if (_ReadyQueue.getSize() > 0 && !_CPU.isExecuting){
            //     _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
            //     _CPU.isExecuting = true;
            // } 
            if (this.currCycle == 0 && _CPU.PC == 0) {
                var process = _ReadyQueue.dequeue();
                process.pState = "Running";
                _RunningPID = process.pid;
                _RunningpBase = process.pBase;
                TSOS.Control.updateProcessTable(_RunningPID, process.pState);
            }
            this.currCycle++;
            if (this.currCycle > this.quantum) {
                if (!_ReadyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, null));
                }
                this.currCycle = 0;
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
