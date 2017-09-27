///<reference path="../globals.ts" />

/* ------------
     MEMORY.ts

     Requires global.ts.
     ------------ */

     module TSOS {
        
            export class Memory {
        
                constructor(public memory: string[]) {
        
                }
        
                public init(): void {
                    for (var i = 0; i++; i<256){
                        this.memory.push("00");
                    }
                }
            }
        }
        