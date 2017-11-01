///<reference path="../globals.ts" />
///<reference path="queue.ts" />
///<reference path="pcb.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts
              pcb.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = /** @class */ (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _ResidentQueue = new TSOS.Queue(); // Where loaded process reside
            _ReadyQueue = new TSOS.Queue(); // Where process are ready to run sit
            _RunningQueue = new TSOS.Queue(); // Where running process sit
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            //
            // ... more?
            // Launch memory manager
            _MemoryManager = new TSOS.MemoryManager();
            // Launch CPU scheduler
            _CpuScheduler = new TSOS.CpuScheduler();
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            _CPU.isExecuting = false;
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) {
                if (!_singleMode) {
                    _CPU.cycle();
                }
                else {
                    // enable next button in single step mode
                    TSOS.Control.hostBtnNext_onOff();
                }
            }
            else {
                this.krnTrace("Idle");
            }
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case PROCESS_ERROR_IRQ:
                    this.userPrgError(params);
                    break;
                case PROCESS_PRINT_IRQ:
                    this.processPrint(params);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        Kernel.prototype.krnCreateProcess = function (pBase) {
            // Creates process when it is loaded into memory
            // base register value retrieved from loading process into memory
            // pid incremented upon creation
            _PID++;
            var pid = _PID;
            var process = new TSOS.PCB(pBase, pid);
            // put process on ready queue
            _ResidentQueue.enqueue(process);
            // update process table
            TSOS.Control.addProcessTable(process);
            return pid;
        };
        Kernel.prototype.krnExecuteProcess = function (pid) {
            // only one process in ready queue for now
            var process = _ResidentQueue.dequeue();
            var switched = false;
            while (process.pid != pid) {
                _ResidentQueue.enqueue(process);
                process = _ResidentQueue.dequeue();
                switched = !switched;
            }
            if (switched) {
                _ResidentQueue.enqueue(_ResidentQueue.dequeue());
            }
            process.pState = "Ready";
            console.log(_ResidentQueue.q);
            _ReadyQueue.enqueue(process);
            // start CPU
            _CPU.isExecuting = true;
        };
        Kernel.prototype.krnExitProcess = function () {
            // exit process upon completion
            // clear partion starting from base 0
            _MemoryManager.clearPartition(0);
            TSOS.Control.removeProcessTable();
            _RunningQueue.dequeue();
        };
        Kernel.prototype.userPrgError = function (opCode) {
            // When user program entry is not a valid op ocde
            _StdOut.putText("Error. Op code " + opCode + " does not exist.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        Kernel.prototype.processPrint = function (text) {
            // When user program makes system call to print to canvas
            _StdOut.putText(text);
        };
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _StdOut.putText("BSOD. You know what it means. Buy Some Organic Donuts. Well you can, I prefer matcha ones.");
            this.krnShutdown();
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
