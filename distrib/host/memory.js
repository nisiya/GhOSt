///<reference path="../globals.ts" />
/* ------------
     MEMORY.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memoryBox) {
            if (memoryBox === void 0) { memoryBox = []; }
            this.memoryBox = memoryBox;
        }
        Memory.prototype.init = function () {
            this.createTable();
        };
        Memory.prototype.createTable = function () {
            for (var i = 0; i < 256; i++) {
                this.memoryBox.push("00");
            }
            var memoryContainer = document.getElementById("memoryContainer");
            var memoryTable = document.createElement("table");
            memoryTable.className = "taMemory";
            memoryTable.id = "taMemory";
            var memoryTableBody = document.createElement("tbody");
            // creating cells
            for (var i = 0; i < 32; i++) {
                // create rows
                var row = document.createElement("tr");
                row.id = "memoryRow-" + (8 * i);
                var cell = document.createElement("td");
                var cellText = document.createTextNode("0x" + (8 * i));
                cell.appendChild(cellText);
                row.appendChild(cell);
                for (var j = 0; j < 8; j++) {
                    var cell = document.createElement("td");
                    var str = this.memoryBox[j];
                    var cellText = document.createTextNode(str);
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
