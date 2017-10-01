///<reference path="../globals.ts" />
/* ------------
     MEMORY.ts

     Memory
        - array of 768 bytes
        - 3 partitions
        
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            // checks if memory partition is loaded
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
        Memory.prototype.init = function () {
            // creates the memory at boot
            this.memory = new Array();
            for (var i = 0; i < 768; i++) {
                this.memory.push("00");
            }
            // all partitions are available
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
            // load table on user interface
            this.loadTable();
        };
        Memory.prototype.loadTable = function () {
            // load Memory table at start up
            var memoryContainer = document.getElementById("memoryContainer");
            var memoryTable = document.createElement("table");
            memoryTable.className = "taMemory";
            memoryTable.id = "taMemory";
            var memoryTableBody = document.createElement("tbody");
            // creating cells for "bytes"
            for (var i = 0; i < 96; i++) {
                // create rows
                var row = document.createElement("tr");
                row.id = "memoryRow-" + (8 * i);
                var cell = document.createElement("td");
                // row label
                var cellText = document.createTextNode("0x" + (8 * i));
                cell.id = "byte" + (8 * i);
                cell.appendChild(cellText);
                row.appendChild(cell);
                for (var j = 0; j < 8; j++) {
                    cell = document.createElement("td");
                    var index = j + (8 * i);
                    var memoryValue = this.memory[index];
                    cellText = document.createTextNode(memoryValue);
                    cell.id = "memoryCell-" + index;
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                memoryTableBody.appendChild(row);
                // for debugging
                // console.log(memoryTable);
            }
            memoryTable.appendChild(memoryTableBody);
            memoryContainer.appendChild(memoryTable);
        };
        Memory.prototype.updateTable = function (baseReg) {
            // update Memory table after new process is loaded
            var memoryTable = document.getElementById("taMemory");
            var rowId;
            var index;
            var cellId;
            var limitReg = baseReg + 256;
            for (var i = baseReg; i < limitReg / 8; i++) {
                rowId = "memoryRow-" + (8 * i);
                for (var j = 0; j < 8; j++) {
                    index = j + (8 * i);
                    cellId = "memoryCell-" + index;
                    // =                            console.log(memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML);
                    memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = this.memory[index];
                }
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
