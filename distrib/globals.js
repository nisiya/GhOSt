/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "GhOSt"; // spooky
var APP_VERSION = "7"; // I like 7
var TEST_SUBJECT = "Wendy"; // for glados...why did I sign up for it?
var CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var PROCESS_ERROR_IRQ = 2; // print error in user program
var PROCESS_PRINT_IRQ = 3; // print text produced by user program
var CONTEXT_SWITCH_IRQ = 4; // save current process and switch to next one
var KILL_PROCESS_IRQ = 5; // kill a process
var MEMACCESS_ERROR_IRQ = 6; // process accessing something out of bound
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory; // same with Memory
var _MemoryAccessor; // and Memory Accessor
var _MemoryManager; // and Memory Manager
var _CpuScheduler; // and CPU Scheduler
var _LazySwapper; // and Swapper
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue; // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue = null; // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers = null; // when clearly 'any' is not what we want. There is likely a better way, but what is it?
var _ResidentQueue;
var _ReadyQueue;
var _RunningQueue;
var _PID = -1; // keep track of process ids
var _singleMode = false;
// Standard input and output
var _StdIn; // Same "to null or not to null" issue as above.
var _StdOut;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _krnFileSystemDriver;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
// current time and date
var _Datetime;
function updateTime() {
    var clock = document.getElementById("clock");
    updateClock(clock);
    setInterval(function () {
        updateClock(clock);
    }, 1000);
}
function updateClock(clock) {
    var dateTime = new Date();
    var date = dateTime.toDateString();
    var time = dateTime.toLocaleTimeString();
    _Datetime = date + " " + time;
    clock.innerHTML = _Datetime;
}
var _KeyToChr = {
    "48": { "noShChr": 48, "shChr": 41 },
    "49": { "noShChr": 49, "shChr": 33 },
    "50": { "noShChr": 50, "shChr": 64 },
    "51": { "noShChr": 51, "shChr": 35 },
    "52": { "noShChr": 52, "shChr": 36 },
    "53": { "noShChr": 53, "shChr": 37 },
    "54": { "noShChr": 54, "shChr": 94 },
    "55": { "noShChr": 55, "shChr": 38 },
    "56": { "noShChr": 56, "shChr": 42 },
    "57": { "noShChr": 57, "shChr": 40 },
    // others
    "186": { "noShChr": 59, "shChr": 58 },
    "187": { "noShChr": 61, "shChr": 43 },
    "188": { "noShChr": 44, "shChr": 60 },
    "189": { "noShChr": 45, "shChr": 95 },
    "190": { "noShChr": 46, "shChr": 62 },
    "191": { "noShChr": 47, "shChr": 63 },
    "192": { "noShChr": 96, "shChr": 126 },
    "219": { "noShChr": 91, "shChr": 123 },
    "220": { "noShChr": 92, "shChr": 124 },
    "221": { "noShChr": 93, "shChr": 125 },
    "222": { "noShChr": 39, "shChr": 34 }
};
var _SaveX = 0; // use for backspace and line wrapping for now, will improve
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
    updateTime();
    if (sessionStorage) {
        if (sessionStorage.length != 0) {
            // create file system
            TSOS.Control.loadDiskTable();
        }
    }
    else {
        alert("Sorry, your browser do not support session storage.");
    }
};
