///<reference path="../globals.ts" />
/* ------------
     MEMORYACCESSOR.ts

     Memory Accessor
        - Read and write to memory
        - Translate physical address to logical and vice versa
        
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    // please ignore for project 2
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.init = function () {
            // load table on user interface
            TSOS.Control.loadMemoryTable();
        };
        MemoryAccessor.prototype.writeMemory = function (addr, data) {
            // checks running process base reg and translate incoming address
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index = parseInt(addr, 16) + baseReg;
            // check if out of bound access
            if (index > limitReg) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMACCESS_ERROR_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else {
                _Memory.memory[index] = data.toString(16).toUpperCase();
                TSOS.Control.updateMemoryTable(baseReg);
            }
        };
        MemoryAccessor.prototype.readMemory = function (addr) {
            // checks running process base reg and translate incoming address
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index = baseReg + addr;
            // check if out of bound access
            if (index > limitReg) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMACCESS_ERROR_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else {
                var value = _Memory.memory[index];
                return value;
            }
        };
        MemoryAccessor.prototype.readPartition = function (baseReg, limitReg) {
            var value = _Memory.memory.slice(baseReg, (baseReg + limitReg + 1));
            return value;
        };
        MemoryAccessor.prototype.writePartition = function (baseReg, index, data) {
            _Memory.memory[index] = data.toString(16).toUpperCase();
            TSOS.Control.updateMemoryTable(baseReg);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
