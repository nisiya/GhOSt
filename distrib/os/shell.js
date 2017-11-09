///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays the users current location.");
            this.commandList[this.commandList.length] = sc;
            // whomai
            sc = new TSOS.ShellCommand(this.shellWhoami, "whoami", "- Displays the users identity.");
            this.commandList[this.commandList.length] = sc;
            // meow
            sc = new TSOS.ShellCommand(this.shellMeow, "meow", "- Flushes the toilet. [audio warning]");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates and loads user program input into memory.");
            this.commandList[this.commandList.length] = sc;
            // run <id>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- <pid> - Runs the process with the id.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", "- Runs all loaded process.");
            this.commandList[this.commandList.length] = sc;
            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- <int> - Sets the Round Robin quantum to this value.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "Outputs pid of active processes.");
            this.commandList[this.commandList.length] = sc;
            // kill <pid>
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kills the specified process id.");
            this.commandList[this.commandList.length] = sc;
            // welp
            sc = new TSOS.ShellCommand(this.shellWelp, "welp", "- Displays BSOD when the kernel traps an OS error.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the user status.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "clear all memory partition");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        // Invalid commands
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, " + TEST_SUBJECT + ",");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        // Curse
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        // apology
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        // ver
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION + " or so I thought");
        };
        // help
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        // shutdown
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        // cls
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        // man
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                // explains what each topic does
                var topic = args[0];
                switch (topic) {
                    // help
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // Descriptive MANual page entries for the the rest of the shell commands here.
                    // ver
                    case "ver":
                        _StdOut.putText("Ver displays the version of the OS");
                        break;
                    // shutdown
                    case "shutdown":
                        _StdOut.putText("Shuts down the OS.");
                        break;
                    // cls
                    case "cls":
                        _StdOut.putText("Cls clears the CLI");
                        break;
                    // trace
                    case "trace":
                        _StdOut.putText("Trace followed by on would turn on the OS trace on and ");
                        _StdOut.advanceLine();
                        _StdOut.putText("followed by off would turn it off.");
                        break;
                    // rot13
                    case "rot13":
                        _StdOut.putText("Rot13 followed by a string would rotate each letter of the string by 13 places. E.g. 'ace' would be 'npr'.");
                        break;
                    // prompt
                    case "prompt":
                        _StdOut.putText("Prompt followed by a string would set the prompt as the string instead of the default >.");
                        break;
                    // date
                    case "date":
                        _StdOut.putText("Date displays the current date and time in EST.");
                        break;
                    // whereami
                    case "whereami":
                        _StdOut.putText("Whereami displays the users current location.");
                        break;
                    // whoami
                    case "whoami":
                        _StdOut.putText("Whoami displays the users identity.");
                        break;
                    // meow
                    case "meow":
                        _StdOut.putText("Meow flushes the toilet.");
                        break;
                    // load
                    case "load":
                        _StdOut.putText("Validates and loads the 6502a op codes in User Program Input.");
                        break;
                    // run <pid>
                    case "run":
                        _StdOut.putText("Runs the process with id <pid>.");
                        break;
                    // runall
                    case "runall":
                        _StdOut.putText("Runs all the loaded processes.");
                        break;
                    // quantum <int>
                    case "quantum":
                        _StdOut.putText("Sets the Round Robin quantum to <int>.");
                        break;
                    // ps
                    case "ps":
                        _StdOut.putText("Ps displays a list of current processes and their IDs.");
                        break;
                    // kill <pid>
                    case "kill":
                        _StdOut.putText("Kill followed by the process ID would kill that process.");
                        break;
                    // welp
                    case "welp":
                        _StdOut.putText("Welp triggers the BSOD, when the kernel traps an OS error.");
                        break;
                    // status
                    case "status":
                        _StdOut.putText("Status followed by a string would set the user status as the string.");
                        break;
                    // clearmem
                    case "clearmem":
                        _StdOut.putText("Clears all memory partitions.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        // date
        Shell.prototype.shellDate = function (args) {
            var currDate = _Datetime;
            _StdOut.putText(currDate);
        };
        // whereami
        Shell.prototype.shellWhereami = function (args) {
            _StdOut.putText("Definitely not here.");
        };
        // whoami
        Shell.prototype.shellWhoami = function (args) {
            _StdOut.putText("Nope. Wrong. Not my father.");
        };
        // meow
        Shell.prototype.shellMeow = function (args) {
            var audio = new Audio('distrib/audio/meow.mp3');
            audio.play();
            _StdOut.putText("He's a cat~ Meow~ Flushing the toliet~");
        };
        // load
        Shell.prototype.shellLoad = function (args) {
            // gets text of textarea
            var userProgram = document.getElementById("taProgramInput").value;
            // remove line breaks and extra spaces
            userProgram = userProgram.replace(/(\r\n|\n|\r)/gm, "");
            // checks if text only contains hex decimals and spaces and is not empty
            var valText = /^[a-f\d\s]+$/i;
            if (valText.test(userProgram)) {
                var inputOpCodes = userProgram.split(" ");
                if (inputOpCodes.length > 256) {
                    _StdOut.putText("Process is too big for memory.");
                }
                else {
                    // base register value from when memory was loaded
                    var baseReg = _MemoryManager.loadMemory(inputOpCodes);
                    if (baseReg == 999) {
                        _StdOut.putText("Memory is full. Please run process to free up space.");
                    }
                    else {
                        var pid = _Kernel.krnCreateProcess(baseReg);
                        _StdOut.putText("Process id: " + pid + " is in Resident Queue");
                    }
                }
            }
            else if (userProgram == "") {
                _StdOut.putText("Please enter 6502a op codes in the input area below.");
            }
            else {
                _StdOut.putText("Only hex digits and spaces are allowed. Please enter a new set of codes.");
            }
        };
        // run <pid>
        Shell.prototype.shellRun = function (args) {
            var valText = /^\d*$/;
            // validate input for integer
            if (valText.test(args) && args != "") {
                if (_ResidentQueue.isEmpty()) {
                    _StdOut.putText("No process is loaded in memory.");
                }
                else {
                    _Kernel.krnExecuteProcess(args);
                }
            }
            else {
                _StdOut.putText("Please enter an integer for process id after run command.");
            }
        };
        // runall
        Shell.prototype.shellRunall = function (args) {
            if (_ResidentQueue.isEmpty()) {
                _StdOut.putText("No process is loaded in memory.");
            }
            else {
                _Kernel.krnExecuteAllProcess();
            }
        };
        // quantum
        Shell.prototype.shellQuantum = function (args) {
            var valText = /^\d*$/;
            // validate input for integer
            if (valText.test(args) && args != "") {
                _CpuScheduler.quantum = args;
            }
            else {
                _StdOut.putText("Please enter an integer for quantum value after quantum command.");
            }
        };
        // ps
        Shell.prototype.shellPs = function (args) {
            if (_CpuScheduler.activePIDs.length == 0) {
                _StdOut.putText("No process is active");
            }
            else {
                _StdOut.putText("Active process id(s): [" + _CpuScheduler.activePIDs.toString() + "]");
            }
        };
        // kill
        Shell.prototype.shellKill = function (args) {
            var valText = /^\d*$/;
            // validate input for integer
            if (valText.test(args) && args != "") {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KILL_PROCESS_IRQ, args));
            }
            else {
                _StdOut.putText("Please enter an integer for process id after kill command.");
            }
        };
        // welp aka BSOD
        Shell.prototype.shellWelp = function (args) {
            // adds element that Interrupt Handler does not know how to handle
            _KernelInterruptQueue.enqueue(777);
        };
        // status
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                var status = document.getElementById("usrStatus");
                // change user status
                status.innerHTML = args.join(" ");
                _StdOut.putText("Your status has changed.");
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        };
        // clearmem
        Shell.prototype.shellClearmem = function (args) {
            _MemoryManager.clearMemory();
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
