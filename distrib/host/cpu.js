///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.updateCPUTable = function () {
            var cpuTable = document.getElementById("taCPU");
            cpuTable.rows[1].cells.namedItem("cPC").innerHTML = this.PC.toString();
            cpuTable.rows[1].cells.namedItem("cIR").innerHTML = this.PC.toString();
            cpuTable.rows[1].cells.namedItem("cACC").innerHTML = this.Acc.toString();
            cpuTable.rows[1].cells.namedItem("cX").innerHTML = this.Xreg.toString();
            cpuTable.rows[1].cells.namedItem("cY").innerHTML = this.Yreg.toString();
            cpuTable.rows[1].cells.namedItem("cZ").innerHTML = this.Zflag.toString();
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (_ReadyQueue.isEmpty()) {
                this.isExecuting = false;
            }
            else {
                // move pcb from ready queue to running
                var process = _ReadyQueue.dequeue();
                var pBase = process.pBase;
                var pLimit = process.pLimit;
                console.log(pLimit + "p");
                // retreive op codes from memory
                var opCodes = _MemoryManager.readMemory(pBase, pLimit);
                console.log(opCodes);
                // decode the op codes
                this.decodeOp(opCodes, pLimit);
                console.log(this.Acc);
            }
        };
        Cpu.prototype.decodeOp = function (opCodes, pLimit) {
            if (opCodes.length > 0) {
                // take action according to op code ..
                var data;
                while (this.PC < pLimit) {
                    switch (opCodes[this.PC]) {
                        // load accumulator with value in next byte
                        case "A9":
                            this.PC++;
                            data = parseInt(opCodes[this.PC], 16);
                            this.Acc = data;
                            this.PC++;
                            break;
                        default:
                            _StdOut.putText("Error. Op code " + opCodes[this.PC] + " does not exist.");
                            break;
                    }
                    this.updateCPUTable();
                }
                console.log("finish process");
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
