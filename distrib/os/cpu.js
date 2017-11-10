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
        function Cpu(PC, IR, //program instruction
            Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = "00"; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.IR = "00";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // if(this.PC==0){
            // move pcb from ready queue to running
            // var process = _ReadyQueue.dequeue();
            // process.pState = "Running";
            // _RunningPID = process.pid;
            // _RunningpBase = process.pBase;
            // Control.updateProcessTable(_RunningPID, process.pState);
            // }
            // fetch instruction from memory
            var opCode = this.fetch(this.PC);
            this.IR = opCode;
            // decode then execute the op codes
            this.decodeExecute(this.IR);
            // // update display tables
            // if(this.isExecuting){
            //     Control.updateProcessTable(_RunningPID, "Running");
            // }
        };
        Cpu.prototype.fetch = function (PC) {
            return _MemoryAccessor.readMemory(PC);
        };
        Cpu.prototype.decodeExecute = function (opCode) {
            if (opCode.length > 0) {
                // take action according to op code ..
                var data;
                var addr;
                var index;
                // decode then execute
                switch (opCode) {
                    // load accumulator with value in next byte
                    case "A9":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Acc = data;
                        this.PC += 2;
                        break;
                    // load accumulator from memory
                    case "AD":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data;
                        this.PC += 3;
                        break;
                    // store accumulator in memory
                    case "8D":
                        data = this.Acc;
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        _MemoryAccessor.writeMemory(addr, data);
                        this.PC += 3;
                        break;
                    // add with carry
                    /* add content of an address to content of accumulator
                        and keeps resut in the accumulator*/
                    case "6D":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data + this.Acc;
                        this.PC += 3;
                        break;
                    // load the x register with a constant
                    case "A2":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Xreg = data;
                        this.PC += 2;
                        break;
                    // load the x register from memory
                    case "AE":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Xreg = data;
                        this.PC += 3;
                        break;
                    // load the y register with a constant
                    case "A0":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Yreg = data;
                        this.PC += 2;
                        break;
                    // load the y register from memory
                    case "AC":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Yreg = data;
                        this.PC += 3;
                        break;
                    // no operation
                    case "EA":
                        this.PC++;
                        break;
                    // break
                    case "00":
                        // stop
                        _Kernel.krnExitProcess();
                        // reset CPU
                        this.init();
                        // disable next button
                        TSOS.Control.hostBtnNext_onOff();
                        break;
                    // compare a byte in memory to the X reg
                    // if equal, set z flag 
                    case "EC":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        if (data == this.Xreg) {
                            this.Zflag = 1;
                        }
                        else {
                            this.Zflag = 0;
                        }
                        this.PC += 3;
                        break;
                    // branch n bytes if z flag = 0
                    case "D0":
                        if (this.Zflag == 0) {
                            var branch = parseInt(this.fetch(this.PC + 1), 16) + this.PC;
                            if (branch < 256) {
                                this.PC = branch + 2;
                            }
                            else {
                                branch = branch % 256;
                                this.PC = branch + 2;
                            }
                        }
                        else {
                            this.PC += 2;
                        }
                        break;
                    // increment the value of a byte
                    case "EE":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        data++;
                        _MemoryAccessor.writeMemory(addr, data);
                        this.PC += 3;
                        break;
                    // system call
                    /* #$01 in x reg = print integer stored in Y reg
                        #$02 in x reg = print 00-terminated string stored at
                                        address in y reg */
                    case "FF":
                        var text = "";
                        if (this.Xreg == 1) {
                            text = this.Yreg.toString();
                        }
                        else if (this.Xreg == 2) {
                            addr = this.Yreg.toString(16);
                            index = parseInt(addr, 16);
                            data = parseInt(this.fetch(index), 16);
                            var chr = String.fromCharCode(data);
                            while (data != 0) {
                                text = text + chr;
                                index++;
                                data = parseInt(this.fetch(index), 16);
                                chr = String.fromCharCode(data);
                            }
                        }
                        // call Kernel to print to canvas
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_PRINT_IRQ, text));
                        this.PC++;
                        break;
                    default:
                        // call Kernel to print error message if op code does not exist
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_ERROR_IRQ, opCode));
                        _Kernel.krnExitProcess();
                        // reset CPU
                        this.init();
                        break;
                }
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
