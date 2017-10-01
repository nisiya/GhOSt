///<reference path="../globals.ts" />
/* ------------
     MEMORY.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
        Memory.prototype.init = function () {
            console.log("pop");
            this.memory = new Array();
            for (var i = 0; i < 768; i++) {
                this.memory.push("00");
            }
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
            this.loadTable();
        };
        Memory.prototype.loadTable = function () {
            var memoryContainer = document.getElementById("memoryContainer");
            memoryContainer.innerHTML = " ";
            var memoryTable = document.createElement("table");
            memoryTable.className = "taMemory";
            memoryTable.id = "taMemory";
            var memoryTableBody = document.createElement("tbody");
            // creating cells
            for (var i = 0; i < 96; i++) {
                // create rows
                var row = document.createElement("tr");
                row.id = "memoryRow-" + (8 * i);
                var cell = document.createElement("td");
                var cellText = document.createTextNode("0x" + (8 * i));
                cell.id = "byte" + (8 * i);
                cell.appendChild(cellText);
                row.appendChild(cell);
                for (var j = 0; j < 8; j++) {
                    var cell = document.createElement("td");
                    var index = j + (8 * i);
                    var memoryValue = this.memory[index];
                    console.log(memoryValue);
                    var cellText = document.createTextNode(memoryValue);
                    cell.id = index.toString();
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                memoryTableBody.appendChild(row);
            }
            memoryTable.appendChild(memoryTableBody);
            memoryContainer.appendChild(memoryTable);
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
