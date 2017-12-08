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
                    if(sessionStorage.length == 0){ // load new file system driver only if new window
                        // create file system
                        var tsb: string;
                        var value = new Array<string>();
                        while (value.length<65){
                            value.push("0");
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
                    }
                } else{
                    alert("Sorry, your browser do not support session storage.");
                }
            }

            public formatDisk(){
                var tsb: string;
                var value = new Array<string>();
                var sessionLength = sessionStorage.length;
                console.log(sessionLength.toString());
                for (var i=0; i<sessionLength;i++){
                    var tsb = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(tsb));
                    value[0] = "0"
                    sessionStorage.setItem(tsb,JSON.stringify(value));
                }
            }

            public createFile(filename): boolean{
                var createdFile:boolean = false;
                var dirTSB: string;
                var value = new Array<string>();
                var asciiFilename: string;
                var sessionLength = sessionStorage.length;
                console.log(sessionLength.toString());
                // 000 is master boot rec
                // 77 is index of last DIR block sector
                for (var i=1; i<78; i++){
                    var dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    if(value[0]=="0"){
                        var dataTSB = this.findDataTSB();
                        if(dataTSB != null){
                            value[0] = "1";
                            for (var k=1; k<4; k++){
                                value[k] = "0" + dataTSB.charAt(k-1);
                            }
                            asciiFilename = filename.toString();
                            for (var j=0; j<asciiFilename.length; j++){
                                value[j+4] = asciiFilename.charCodeAt(j).toString(16).toUpperCase();
                            }
                            sessionStorage.setItem(dirTSB, JSON.stringify(value));
                            return true;
                        } else {
                            return false;
                        }
                    }
                }   
                return false;
            }

            public findDataTSB():string {
                var dataTSB: string;
                var value = new Array<string>();
                for (var i=78; i<sessionStorage.length; i++){
                    dataTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    if(value[0]=="00"){
                        value[0] = "01";
                        sessionStorage.setItem(dataTSB, JSON.stringify(value));
                        return dataTSB; 
                    }
                }
                return dataTSB;
            }

        }
    }
    