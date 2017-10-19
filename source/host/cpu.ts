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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public IR: string = "00",
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.IR = "00";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            if(this.PC==0){
                // move pcb from ready queue to running
                var process = _ReadyQueue.dequeue();
                Control.updateProcessTable(this.PC, this.IR, this.Acc, this.Xreg, this.Yreg, this.Zflag);
            }
            
            // fetch instruction from memory
            var opCode = this.fetch(this.PC);
            this.IR = opCode;

            // process.pIR = opCode;        

            // decode then execute the op codes
            this.decodeExecute(opCode);   

            // update display table
            Control.updateCPUTable(this);
            if(this.isExecuting){
                Control.updateProcessTable(this.PC, this.IR, this.Acc, this.Xreg, this.Yreg, this.Zflag);
            }
        }

        public fetch(PC) {
            return _MemoryManager.readMemory(PC);
        }

        public decodeExecute(opCode) {
            if (opCode.length > 0) {
                // take action according to op code ..
                var data: number;
                var addr: string;
                var index: number;

                // decode then execute
                switch (opCode) {
                    
                    // load accumulator with value in next byte
                    case "A9":
                        data = parseInt(this.fetch(this.PC+1), 16);
                        this.Acc = data;
                        this.PC+=2;
                        break;

                    // load accumulator from memory
                    case "AD":
                        addr = this.fetch(this.PC+2) + this.fetch(this.PC+1);
                        index = parseInt(addr, 16);  
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data;
                        this.PC+=3;
                        break;

                    // store accumulator in memory
                    case "8D":
                        data = this.Acc;
                        addr = this.fetch(this.PC+2) + this.fetch(this.PC+1);                        
                        _MemoryManager.updateMemory(addr, data);
                        this.PC+=3;
                        break;

                    // add with carry
                    /* add content of an address to content of accumulator
                        and keeps resut in the accumulator*/
                    case "6D":
                        addr = this.fetch(this.PC+2) + this.fetch(this.PC+1);                    
                        index = parseInt(addr, 16);  
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data + this.Acc;
                        this.PC+=3;
                        break;

                    // load the x register with a constant
                    case "A2":
                        data = parseInt(this.fetch(this.PC+1), 16);
                        this.Xreg = data;
                        this.PC+=2;
                        break;

                    // load the x register from memory
                    case "AE":
                        addr = this.fetch(this.PC+2) + this.fetch(this.PC+1);                
                        index = parseInt(addr, 16);  
                        data = parseInt(this.fetch(index), 16);
                        this.Xreg = data;
                        this.PC+=3;
                        break;

                    // load the y register with a constant
                    case "A0":
                        data = parseInt(this.fetch(this.PC+1), 16);
                        this.Yreg = data;
                        this.PC+=2;
                        break;

                    // load the y register from memory
                    case "AC":
                        addr = this.fetch(this.PC+2) + this.fetch(this.PC+1);                    
                        index = parseInt(addr, 16);  
                        data = parseInt(this.fetch(index), 16);
                        this.Yreg = data;
                        this.PC+=3;
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
                        Control.updateCPUTable(this);
                        break;

                    // compare a byte in memory to the X reg
                    // if equal, set z flag 
                    case "EC":
                        addr = this.fetch(this.PC+2) + this.fetch(this.PC+1);                    
                        index = parseInt(addr, 16);  
                        data = parseInt(this.fetch(index), 16);
                        if (data == this.Xreg){
                            this.Zflag = 1;
                        } else{
                            this.Zflag = 0;
                        }
                        this.PC+=3;
                        break;

                    // branch n bytes if z flag = 0
                    case "D0":
                        if(this.Zflag == 0){
                            var branch = parseInt(this.fetch(this.PC+1),16) + this.PC;
                            if (branch < 256){
                                this.PC = branch + 2;
                            } else{
                                branch = branch%256;
                                this.PC = branch + 2;
                            }
                        } else{
                            this.PC+=2;  
                        }                      
                        break;

                    // increment the value of a byte
                    case "EE":
                        addr = this.fetch(this.PC+2) + this.fetch(this.PC+1);                    
                        index = parseInt(addr, 16);  
                        data = parseInt(this.fetch(index), 16);
                        data++;
                        _MemoryManager.updateMemory(addr, data);
                        this.PC+=3;
                        break;

                    // system call
                    /* #$01 in x reg = print integer stored in Y reg
                        #$02 in x reg = print 00-terminated string stored at
                                        address in y reg */
                    case "FF":
                        var str: string = "";
                        if (this.Xreg == 1){
                            str = this.Yreg.toString();
                        } else if (this.Xreg == 2){
                            addr = this.Yreg.toString(16);
                            index = parseInt(addr, 16);
                            data = parseInt(this.fetch(index), 16);
                            var chr: string = String.fromCharCode(data);                    
                            while (data != 0){
                                str = str + chr;
                                index++;
                                data = parseInt(this.fetch(index), 16);     
                                chr = String.fromCharCode(data);                              
                            }  
                        }
                        _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_PRINT_IRQ, str));                        
                        this.PC++;
                        break;

                    default:
                        _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_ERROR_IRQ, opCode));
                        _Kernel.krnExitProcess();
                        this.init();
                        Control.updateCPUTable(this);
                        break;
                }
            }
        }

    }
}
