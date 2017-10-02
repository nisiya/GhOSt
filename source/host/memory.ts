///<reference path="../globals.ts" />

/* ------------
     MEMORY.ts

     Memory
        - array of 768 bytes
        - 3 partitions
        
     Requires global.ts.
     ------------ */

     module TSOS {
        
            export class Memory {
                
                // array of bytes as memory
                public memory: string[];

                // checks if memory partition is loaded
                public memoryP1: boolean = false;
                public memoryP2: boolean = false;
                public memoryP3: boolean = false;

                public init(): void {
                    // creates the memory at boot
                    this.memory = new Array<string>();
                    for (var i = 0; i<768; i++){
                        this.memory.push("00");
                    }

                    // all partitions are available
                    this.memoryP1 = false;
                    this.memoryP2 = false;
                    this.memoryP3 = false;

                    // load table on user interface
                    this.loadTable();
                }

                public loadTable(): void {
                    // load Memory table at start up
                    var memoryContainer: HTMLDivElement = <HTMLDivElement> document.getElementById("memoryContainer");
                    var memoryTable: HTMLTableElement = <HTMLTableElement> document.createElement("table");
                    memoryTable.className = "taMemory";
                    memoryTable.id = "taMemory";
                    var memoryTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.createElement("tbody");
                    
                    // creating cells for "bytes"
                    for (var i = 0; i < 96; i++){
                        // create rows
                        var row: HTMLTableRowElement = <HTMLTableRowElement> document.createElement("tr");
                        row.id = "memoryRow-" + (8*i);
                        var cell: HTMLTableCellElement = <HTMLTableCellElement> document.createElement("td");

                        // row label
                        var val: number = 8*i;
                        var hexVal: string = "000" + val.toString(16).toUpperCase();
                        var cellText = document.createTextNode(hexVal.slice(-4));
                        cell.id = "byte" + hexVal.slice(-4);
                        cell.appendChild(cellText);
                        row.appendChild(cell);        

                        for (var j = 0; j < 8; j++) {
                            cell = document.createElement("td");
                            var index: number = j + (8 * i);
                            var id: string = "000" + index.toString(16).toUpperCase();
                            var memoryValue: string = this.memory[index];
                            cellText = document.createTextNode(memoryValue);
                            cell.id = id.slice(-4);
                            cell.appendChild(cellText);
                            row.appendChild(cell);
                        }
                        memoryTableBody.appendChild(row);

                        // for debugging
                        console.log(memoryTable);
                    }
                    
                    memoryTable.appendChild(memoryTableBody);
                    memoryContainer.appendChild(memoryTable);
                }

                public updateTable(baseReg): void {
                   
                    // update Memory table after new process is loaded
                    var memoryTable: HTMLTableElement = <HTMLTableElement> document.getElementById("taMemory");
                    var rowId: string;
                    var index: number;                    
                    var cellId: string;
                    var limitReg: number = baseReg + 256;
                    for (var i = baseReg; i < limitReg/8 ; i++){
                        rowId = "memoryRow-" + (8*i);
                        for (var j = 0; j < 8; j ++){
                            index = j + (8 * i);
                            var id: string = "000" + index.toString(16).toUpperCase();                            
                            cellId = id.slice(-4);                            
                            memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = this.memory[index];
                        }
                    }
                }

            }
        }
        