///<reference path="../globals.ts" />

/* ------------
     MEMORY.ts

     Requires global.ts.
     ------------ */

     module TSOS {
        
            export class Memory {
        
                public memory: string[];
                public memoryP1: boolean = false;
                public memoryP2: boolean = false;
                public memoryP3: boolean = false;

                public init(): void {
                    console.log("pop");
                    this.memory = new Array<string>();
                    for (var i = 0; i<768; i++){
                        this.memory.push("00");
                    }
                    this.memoryP1 = false;
                    this.memoryP2 = false;
                    this.memoryP3 = false;
                    this.loadTable();
                }

                public loadTable(): void {
                    var memoryContainer = document.getElementById("memoryContainer");
                    memoryContainer.innerHTML = " ";
                    var memoryTable = <HTMLTableElement> document.createElement("table");
                    memoryTable.className = "taMemory";
                    memoryTable.id = "taMemory";
                    var memoryTableBody = document.createElement("tbody");
                    
                    // creating cells
                    for (var i = 0; i < 96; i++){
                        // create rows
                        var row = <HTMLTableRowElement> document.createElement("tr");
                        row.id = "memoryRow-" + (8*i);
                        var cell = <HTMLTableCellElement> document.createElement("td");
                        var cellText = document.createTextNode("0x" + (8*i));
                        cell.id = "byte" + (8*i);
                        cell.appendChild(cellText);
                        row.appendChild(cell);                        
                        for (var j = 0; j < 8; j++) {
                            var cell = document.createElement("td");
                            var index: number = j + (8 * i);
                            var memoryValue = this.memory[index];
                            console.log(memoryValue);
                            var cellText = document.createTextNode(memoryValue);
                            cell.id = "memoryCell-" + index;
                            cell.appendChild(cellText);
                            row.appendChild(cell);
                        }
                        memoryTableBody.appendChild(row);
                        console.log(memoryTable);
                    }
                    
                    memoryTable.appendChild(memoryTableBody);
                    memoryContainer.appendChild(memoryTable);
                }

                public updateTable(baseReg): void {
                    var memoryTable = <HTMLTableElement> document.getElementById("taMemory");
                    var rowId: string;
                    var index: number;                    
                    var cellId: string;
                    var limitReg: number = baseReg + 256;
                    for (var i = baseReg; i < limitReg/8 ; i++){
                        rowId = "memoryRow-" + (8*i);
                        for (var j = 0; j < 8; j ++){
                            index = j + (8 * i);
                            cellId = "memoryCell-" + index;
// =                            console.log(memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML);
                            memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = this.memory[index];
                        }
                    }
                }

            }
        }
        