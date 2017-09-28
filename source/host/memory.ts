///<reference path="../globals.ts" />

/* ------------
     MEMORY.ts

     Requires global.ts.
     ------------ */

     module TSOS {
        
            export class Memory {
        
                constructor(public memoryBox: string[] = []) {
        
                }
                
                public init(): void {
                    for (var i = 0; i<256; i++){
                        this.memoryBox.push("00");
                    }
                    this.createTable(this.memoryBox);
                }

                public createTable(memoryBox): void {
                    var memBox = memoryBox;
                    var memoryContainer = document.getElementById("memoryContainer");
                    memoryContainer.innerHTML = " ";
                    var memoryTable = document.createElement("table");
                    memoryTable.className = "taMemory";
                    memoryTable.id = "taMemory";
                    var memoryTableBody = document.createElement("tbody");
                    
                    // creating cells
                    for (var i = 0; i < 32; i++){
                        // create rows
                        var row = document.createElement("tr");
                        row.id = "memoryRow-" + (8*i);
                        var cell = document.createElement("td");
                        var cellText = document.createTextNode("0x" + (8*i));
                        cell.appendChild(cellText);
                        row.appendChild(cell);                        
                        for (var j = 0; j < 8; j++) {
                            var cell = document.createElement("td");
                            var index = j + (8 * i);
                            var str = memBox[index];
                            console.log(str);
                            var cellText = document.createTextNode(str);
                            cell.appendChild(cellText);
                            row.appendChild(cell);
                        }
                    
                        memoryTableBody.appendChild(row);
                    }
                    
                    memoryTable.appendChild(memoryTableBody);
                    memoryContainer.appendChild(memoryTable);
                }

            }
        }
        