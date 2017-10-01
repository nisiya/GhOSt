///<reference path="../globals.ts" />

/* ------------
     memoryAccessor.ts

     Requires global.ts.
     ------------ */
    module TSOS {
        export class MemoryAccessor {

            constructor() {
            }

            public loadMemory(userInput): void{
                var loadText: string[] = userInput.split(" ");
                console.log(loadText);
                for (var i = 0; i <loadText.length; i++){
                    _Memory.memoryBox[i] = loadText[i];
                    console.log("i = " + i);
                }
                console.log(_Memory.memoryBox);
                _Memory.createTable(_Memory.memoryBox);   
            }   
        }
    }