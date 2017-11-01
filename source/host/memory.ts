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

                public init(): void {
                    // creates the memory at boot
                    this.memory = new Array<string>();
                    for (var i = 0; i<768; i++){
                        this.memory.push("00");
                    }
                }

            }
        }
        