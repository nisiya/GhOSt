///<reference path="../globals.ts" />

/* ------------
     MEMORYACCESSOR.ts

     Memory Accessor
        - Read and write to memory
        - Translate physical address to logical and vice versa
        
     Requires global.ts.
     ------------ */

     module TSOS {
        
            export class MemoryAccessor {

                // checks if memory partition is loaded
                public memoryS1: boolean = false;
                public memoryS2: boolean = false;
                public memoryS3: boolean = false;

                public init(): void {
                    // all partitions are available
                    this.memoryS1 = false;
                    this.memoryS2 = false;
                    this.memoryS3 = false;

                    // load table on user interface
                    // Control.loadMemoryTable();
                }

            }
        }
        