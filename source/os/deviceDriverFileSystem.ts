///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The File System Device Driver.
   ---------------------------------- */

   module TSOS {
    
        // Extends DeviceDriver
        export class DeviceDriverFileSystem extends DeviceDriver {
    
            constructor() {
                // Override the base method pointers.
                super();
                this.driverEntry = this.krnFSDriverEntry;
                // this.isr = this.krnFsDispatchKeyPress;
            }
            
            public krnFSDriverEntry() {
                // Initialization routine for this, the kernel-mode File System Device Driver.
                this.status = "loaded";
                if(sessionStorage){
                    // create file system
                    var tsb: string;
                    var value = new Array<string>();
                    // var value: string = "0";
                    while (value.length<65){
                        value.push("00");
                    }
                    console.log(value);
                    for (var i=0; i<8; i++){
                        for (var j=0; j<78; j++){
                            tsb = j.toString();
                            if (tsb.length<2){
                                tsb = "0" + tsb;
                            } 
                            tsb = i.toString() + tsb;
                            sessionStorage.setItem(tsb, JSON.stringify(value));
                        }
                    }
                    var sessionLength = sessionStorage.length;
                    console.log(sessionLength.toString());
                } else{
                    alert("Sorry, your browser do not support session storage.");
                }
            }

            public formatDisk(){
                var tsb: string;
                var value = new Array<string>();
                for (var i=0; i<8; i++){
                    for (var j=0; j<78; j++){
                        tsb = j.toString();
                        if (tsb.length<2){
                            tsb = "0" + tsb;
                        } 
                        tsb = i.toString() + tsb;
                        value = JSON.parse(sessionStorage.getItem(tsb));
                        value[0] = "00"
                        sessionStorage.setItem(tsb,JSON.stringify(value));
                    }
                }
                var sessionLength = sessionStorage.length;
                console.log(sessionLength.toString());
            }

            public createFile(): boolean{
                return 
            }
    
        }
    }
    