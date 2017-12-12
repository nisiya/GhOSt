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

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _ResidentQueue = new Queue();         // Where loaded process reside
            _ReadyQueue = new Queue();            // Where process are ready to run sit

            // Initialize the console.
            _Console = new Console();          // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the File System Device Driver
            this.krnTrace("Loading the file system device driver");
            _krnFileSystemDriver = new DeviceDriverFileSystem();
            _krnFileSystemDriver.driverEntry();
            this.krnTrace(_krnFileSystemDriver.status);
            //
            // ... more?
            // Launch memory manager
            _MemoryManager = new MemoryManager();

            // Launch CPU scheduler
            _CpuScheduler = new CpuScheduler();
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch Lazy Swapper
            _LazySwapper = new LazySwapper();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
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
        }


        public krnOnCPUClockPulse() {
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
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                if(!_singleMode){
                    _CPU.cycle();
                    // update display tables
                    Control.updateCPUTable();
                    // only update process if it is still running
                    if (_CPU.IR!=="00"){
                        Control.updateProcessTable(_CpuScheduler.runningProcess.pid, _CpuScheduler.runningProcess.pState, "Memory");
                    }
                    // check scheduler to see which process to run next and if quantum expired
                    _CpuScheduler.checkSchedule();                        
                } else {
                    // enable next button in single step mode
                    Control.hostBtnNext_onOff();
                }
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case PROCESS_ERROR_IRQ:  // print error message of user program
                    this.userPrgError(params);
                    break;
                case PROCESS_PRINT_IRQ:  // print result of user program
                    this.processPrint(params);
                    break;
                case CONTEXT_SWITCH_IRQ: // called by scheduler to save current process and load next
                    this.contextSwitch(params);
                    break;
                case KILL_PROCESS_IRQ:
                    this.killProcess(params); // kill active process
                    break;
                case MEMACCESS_ERROR_IRQ:
                    this.memoryAccessError(params); // print error of invalid memory access
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.

        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole

        public krnCreateProcess(pBase, priority, tsb) {
            // Creates process when it is loaded into memory or disk
            // base register value retrieved from loading process into memory
                // or tsb if in disk
            // pid incremented upon creation
            _PID++;
            var pid = _PID;            
            var process = new PCB(pBase, pid, "Resident", priority, tsb);
            if(tsb!=null){
                console.log("true");
                process.pLocation = "Disk";
            }
            // put process on resident queue
            _ResidentQueue.enqueue(process);
            // update process table
            Control.addProcessTable(process);
            return pid;
        }

        public krnWriteProcess(inputOpCodes): string{
            // Write process to disk when memory is full
            var tsb:string = _krnFileSystemDriver.saveProcess(inputOpCodes);
            return tsb;
        }

        public krnExecuteProcess(pid){
            var process;
            var switched:boolean = false;
            var pidExists:boolean = false;

            // extract correct process
            for (var i=0; i<_ResidentQueue.getSize(); i++){
                process = _ResidentQueue.dequeue();
                if (process.pid == pid){
                    pidExists = true;
                    break;
                }
                _ResidentQueue.enqueue(process);
                // order of process in ready queue was switched
                switched = !switched;
            }
            
            // if process exists, run it
            if (pidExists){
                if (switched){
                    _ResidentQueue.enqueue(_ResidentQueue.dequeue());
                }
                process.pState = "Ready";
                _CpuScheduler.activePIDs.push(process.pid);                
                _ReadyQueue.enqueue(process);
                // start CPU and scheduler
                Control.updateProcessTable(process.pid, process.pState, process.pLocation);                
                _CpuScheduler.start();    
            } else {
                _StdOut.putText("No process with id: " + pid); 
                _StdOut.advanceLine();
            }
        }

        public krnExecuteAllProcess(){
            // bring all process to Ready queue
            var process;
            while (!_ResidentQueue.isEmpty()){
                process = _ResidentQueue.dequeue();
                _CpuScheduler.activePIDs.push(process.pid);
                process.pState = "Ready";
                _ReadyQueue.enqueue(process);
                Control.updateProcessTable(process.pid, process.pState, process.pLocation);                
            }
            // start CPU and scheduler
            _CpuScheduler.start();
        }

        public krnExitProcess(process){
            // exit process upon completion
            // clear partion starting from base
            process.waitTime = _CpuScheduler.totalCycles - process.turnaroundTime; 
            process.turnaroundTime = process.turnaroundTime + process.waitTime;
            _StdOut.advanceLine();
            _StdOut.putText("Process id: " + process.pid + " ended.");
            _StdOut.advanceLine();
            _StdOut.putText("Turnaround time: " + process.turnaroundTime + " cycles. Wait time: " + process.waitTime + " cycles.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _MemoryManager.clearPartition(process.pBase);
            Control.removeProcessTable(process.pid);
            var index = _CpuScheduler.activePIDs.indexOf(process.pid);
            _CpuScheduler.activePIDs.splice(index, 1);
            // move onto next iteration
            console.log("exited: " + process.pid);
            if ( _CpuScheduler.activePIDs.length == 0){
                _CpuScheduler.checkSchedule();
            } else {
                _CpuScheduler.currCycle = _CpuScheduler.quantum;
            }
        }

        public killProcess(pid){
            // kill process
            var process;
            var index = _CpuScheduler.activePIDs.indexOf(parseInt(pid));

            if (index == -1){
                // if process with id is not active
                _StdOut.putText("No process with id: " + pid + " is active"); 
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            } else {
                if (pid == _CpuScheduler.runningProcess.pid){
                    // if current process, exit it
                    this.krnExitProcess(_CpuScheduler.runningProcess);
                } else {
                    // else look and remove from Ready queue
                    for (var i=0; i<_ReadyQueue.getSize(); i++){
                        process = _ReadyQueue.dequeue();
                        if (process.pid == pid){
                            this.krnExitProcess(process);
                            break;
                        } else {
                            _ReadyQueue.enqueue(process);
                        }
                    }
                }
            }
        }

        public userPrgError(error){
            // When user program entry is not a valid op ocde
            _StdOut.putText(error);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public processPrint(text){
            // When user program makes system call to print to canvas
            _StdOut.putText(text);
        }

        public contextSwitch(runningProcess){
            var currProcess;
            var nextProcess;
            // save current process to PCB
            // if process finished, dont save it
            if (_CPU.IR != "00"){
                currProcess = new PCB(runningProcess.pBase, runningProcess.pid, "Ready", 1, null);
                currProcess.pCounter = _CPU.PC;
                currProcess.pAcc = _CPU.Acc;
                currProcess.pXreg = _CPU.Xreg;
                currProcess.pYreg = _CPU.Yreg;
                currProcess.pZflag = _CPU.Zflag;
                currProcess.turnaroundTime = runningProcess.turnaroundTime;
                _ReadyQueue.enqueue(currProcess);
                Control.updateProcessTable(currProcess.pid, currProcess.pState, "Memory");
                console.log("saved pid:" + currProcess.pid); // for debugging
            }
            // load next process to CPU
            nextProcess = _ReadyQueue.dequeue();
            if (nextProcess.pBase == 999){
                // if process is in disk
                // swap with most recent process
                var newTSB: string = _LazySwapper.swapProcess(nextProcess.tsb, runningProcess.pBase, runningProcess.pLimit);
                // if swap was successfull
                if (newTSB){
                    nextProcess.pBase = runningProcess.pBase;
                    if(currProcess){
                        // if most recent process was saved
                        var prevProcess = _ReadyQueue.dequeue();
                        while(prevProcess.pid!=currProcess.pid){
                            _ReadyQueue.enqueue(prevProcess);
                            prevProcess = _ReadyQueue.dequeue();
                        }
                        prevProcess.tsb = newTSB;
                        prevProcess.pBase = 999;
                        Control.updateProcessTable(prevProcess.pid, currProcess.pState, "Disk");
                        _ReadyQueue.enqueue(prevProcess);
                    } // if not, no update to it is needed
                } else{
                    // disk ran out of space
                    // exit current process and stop CPU execution
                    var error = "Disk and memory are full."
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_ERROR_IRQ, error));
                    _Kernel.krnExitProcess(_CpuScheduler.runningProcess);
                    // reset CPU
                    _CPU.init();
                }
            } 
            console.log("loaded pid:" + nextProcess.pid); // for debugging
            // if no error, continue running
            _CPU.PC = nextProcess.pCounter;
            _CPU.Acc = nextProcess.pAcc;
            _CPU.Xreg = nextProcess.pXreg;
            _CPU.Yreg = nextProcess.pYreg;
            _CPU.Zflag = nextProcess.pZflag;
            nextProcess.pState = "Running";
            _CpuScheduler.runningProcess = nextProcess; 
            this.krnTrace(_CpuScheduler.schedule + ": switching to Process id: " + nextProcess.pid);  
            _CpuScheduler.currCycle = 0; 
        }

        // memory out of bound error
        public memoryAccessError(pid){
            _StdOut.putText("Memory access error from process id: " + pid);
            this.krnExitProcess(_CpuScheduler.runningProcess);
        }

        // - WaitForProcessToExit
        
        // - CreateFile
        public krnCreateFile(filename){
            var returnMsg:string = _krnFileSystemDriver.createFile(filename);
            _StdOut.putText(returnMsg);
        }

        // - WriteFile
        public krnWriteFile(filename, fileContent){
            var returnMsg = _krnFileSystemDriver.writeFile(filename, fileContent);
            _StdOut.putText(returnMsg);
        }

        // - ReadFile
        public krnReadFile(filename){
            var returnMsg = _krnFileSystemDriver.readFile(filename);
            _StdOut.putText(returnMsg);
        }

        // - DeleteFile
        public krnDeleteFile(filename){
            var returnMsg = _krnFileSystemDriver.deleteFile(filename);
            _StdOut.putText(returnMsg);
        }
        

        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _StdOut.putText("BSOD. You know what it means. Buy Some Organic Donuts. Well you can, I prefer matcha ones.");
            this.krnShutdown();
        }
    }
}
