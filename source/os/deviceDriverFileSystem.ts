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
            public track: number;
            public sector: number;
            public block:number;
            public blockSize:number;
            public dirTableSize:number;
            public dataTableSize:number;
            constructor() {
                // Override the base method pointers.
                super();
                this.driverEntry = this.krnFSDriverEntry;
                this.track = 8;
                this.sector = 8;
                this.block = 8;
                this.blockSize = 64;
                this.dirTableSize =  this.sector * this.block;
                this.dataTableSize = (this.track-1) * this.sector * this.block;
            }
            
            public krnFSDriverEntry() {
                // Initialization routine for this, the kernel-mode File System Device Driver.
                this.status = "loaded";
                if(sessionStorage){
                    if(sessionStorage.length == 0){ // load new file system driver only if new window
                        // create file system
                        var tsb: string;
                        var value = new Array<string>();
                        for (var i=0; i<4; i++){
                            //first byte and pointer
                            value.push("0");
                        }
                        while (value.length<this.blockSize){
                            value.push("00");
                        }
                        for (var i=0; i<this.track; i++){
                            for (var j=0; j<this.sector; j++){
                                for (var k=0; k<this.block; k++){
                                    tsb = i.toString() + j.toString() + k.toString();
                                    sessionStorage.setItem(tsb, JSON.stringify(value));
                                }
                            }
                        }
                        Control.loadDiskTable();
                    }
                } else{
                    alert("Sorry, your browser do not support session storage.");
                }
            }

            public stringToAsciiHex(string): string[]{
                var asciiHex= new Array<string>();
                var hexVal:string;
                for(var i=string.length-1; i>=0; i--){
                    hexVal = string.charCodeAt(i).toString(16);
                    asciiHex.push(hexVal.toUpperCase());
                }
                return asciiHex;
            }

            public updateTSB(tsb, value){
                sessionStorage.setItem(tsb,JSON.stringify(value));
                Control.updateDiskTable(tsb);
            }

            public formatDisk(): string{
                var tsb: string;
                var value = new Array<string>();
                for (var i=0; i<sessionStorage.length;i++){
                    var tsb = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(tsb));
                    value[0] = "0"
                    this.updateTSB(tsb,value);
                }
                return "SUCCESS_DISK_FORMATTED";
            }

            public zeroFill(tsb){
                var value = value = JSON.parse(sessionStorage.getItem(tsb));
                for (var i=0; i<4; i++){
                    value[i] = "0";
                }
                for (var j=4; j<value.length; j++){
                    value[j] = "00";
                }
                this.updateTSB(tsb,value);
            }

            public createFile(filename): string{
                var createdFile:boolean = false;
                var dirTSB: string;
                var value = new Array<string>();
                var asciiFilename: string;
                // make sure no duplicate filename
                var existFilename = this.lookupDataTSB(filename);
                if (existFilename != null){
                    return "ERROR_DUPLICATE_FILENAME";
                } else{
                    // 000 is master boot rec
                    // 63 is index of last DIR block sector
                    for (var i=1; i<this.dirTableSize; i++){
                        var dirTSB = sessionStorage.key(i);
                        value = JSON.parse(sessionStorage.getItem(dirTSB));
                        if(value[0]=="0"){
                            this.zeroFill(dirTSB);
                            value = JSON.parse(sessionStorage.getItem(dirTSB));
                            var dataTSB = this.findDataTSB();
                            if(dataTSB != null){
                                value[0] = "1";
                                for (var k=1; k<4; k++){
                                    // pointer in dir 
                                    value[k] = dataTSB.charAt(k-1);
                                }
                                asciiFilename = filename.toString();
                                for (var j=0; j<asciiFilename.length; j++){
                                    value[j+4] = asciiFilename.charCodeAt(j).toString(16).toUpperCase();
                                }
                                this.updateTSB(dirTSB,value);
                                return filename + " - SUCCESS_FILE_CREATED";
                            } else {
                                return "ERROR_DISK_FULL";
                            }
                        }
                    }
                    return "ERROR_DIR_FULL";
                }   
            }

            public getPointer(value): string{
                var pointer: string = value[1] + value[2] + value[3];
                return pointer;
            }

            public findDataTSB():string {
                var dataTSB: string;
                var value = new Array<string>();
                for (var i=this.dirTableSize; i<sessionStorage.length; i++){
                    dataTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    if(value[0]=="0"){
                        this.zeroFill(dataTSB);
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        value[0]="1";
                        this.updateTSB(dataTSB,value);
                        return dataTSB; 
                    }
                }
                return null;
            }
        
            public getFilename(value): string{
                var index = 4;
                var letter;
                var dirFilename:string = "";
                while(value[index]!="00" && index<this.blockSize){
                    letter = String.fromCharCode(parseInt(value[index],16));
                    dirFilename = dirFilename + letter;
                    index++;
                }
                return dirFilename;
            }

            public lookupDataTSB(filename): string{
                var dirTSB: string;
                var dataTSB: string;
                var value = new Array<string>();
                var dirFilename: string;
                for (var i=1; i<this.dirTableSize; i++){
                    dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    if(value[0]=="1"){
                        dirFilename = this.getFilename(value);
                        if (dirFilename == filename){
                            dataTSB = value.splice(1,3).toString().replace(/,/g,"");
                            value = JSON.parse(sessionStorage.getItem(dataTSB));
                            return dataTSB;
                        }
                        dirFilename = "";
                    }
                }
                return null;
            }

            public writeFile(filename, fileContent): string{
                // look in dir for data tsb with filename
                var dataTSB: string = this.lookupDataTSB(filename);
                var content = new Array<string>();
                if(dataTSB != null){
                    content = this.stringToAsciiHex(fileContent);
                    var fileCreated = this.writeToFS(dataTSB, content);
                    if (fileCreated){
                        return filename + " - SUCCESS_FILE_MODIFIED";
                    } else{
                        return "ERROR_DISK_FULL";
                    }
                } else {
                    return "ERROR_FILE_NOT_FOUND";
                }
            }

            public saveProcess(userPrg): string{
                // check for empty block
                var dataTSB: string = this.findDataTSB();
                var content = new Array<string>();
                if(dataTSB != null){
                    // writeToFS will pop from the array
                    while(userPrg.length>0){
                        content.push(userPrg.pop());
                    }
                    // write process to disk if data block available
                    var processLoaded = this.writeToFS(dataTSB, content);
                    if (processLoaded){
                        return dataTSB;
                        // create process and put in resident queue
                    } else{
                        // occur when process takes up more than one block 
                            // and no additional ones are available
                        return null;
                    }
                } else {
                    return null;
                }
            }

            public writeToFS(dataTSB, content): boolean{
                var tsbUsed: string[] = new Array<string>();
                var firstTSB: string = dataTSB;
                var value = new Array<string>();
                var valueIndex: number = 0;
                var firstIndex: number;
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                var pointer: string = this.getPointer(value);
                if (pointer == "000"){
                    valueIndex = 4;
                } else {
                    while(pointer!="-1-1-1"){
                        dataTSB = pointer;
                        tsbUsed.push(dataTSB);
                        value = JSON.parse(sessionStorage.getItem(dataTSB));      
                        pointer = this.getPointer(value);                         
                    }
                    // find where previous content ends
                    for(var i=4; i<value.length; i++){
                        if(value[i]=="00"){
                            valueIndex = i;
                            break;
                        }
                    }
                }
                firstIndex = valueIndex;
                // add hex value of ascii value of fileContent
                while(content.length>0){
                    // if more than one block needed...
                    if(valueIndex == this.blockSize){
                        // get new free data block
                        var oldDataTSB: string = dataTSB;
                        dataTSB = this.findDataTSB();
                        tsbUsed.push(dataTSB);
                        // free block obtained
                        if(dataTSB!=null){
                            // add pointer to new block in current block
                            for (var k=1; k<4; k++){
                                value[k] = dataTSB.charAt(k-1);
                            }
                            // save current block
                            this.updateTSB(oldDataTSB,value);
                            // set working block to new block
                            value = JSON.parse(sessionStorage.getItem(dataTSB));
                            valueIndex = 4;
                        } else{
                            // no free block available
                            // undo all file modifications
                            for (var tsb in tsbUsed){
                                this.zeroFill(tsb);
                            }
                            for (var m=firstIndex; m<this.blockSize; m++){
                                value = JSON.parse(sessionStorage.getItem(firstTSB));
                                value[m] = "00";
                                this.updateTSB(firstTSB,value);
                            }
                            return false;
                        }
                    } else{
                        // current block has space
                        value[valueIndex] = content.pop();
                        valueIndex++;
                    }
                }
                // save last block
                for (var k=1; k<4; k++){
                    value[k] = "-1"; // last block indicator
                }
                this.updateTSB(dataTSB,value);
                return true;
            }

            public readFile(filename): string{
                var fileContent:string = filename + ": ";
                var dataTSB: string = this.lookupDataTSB(filename);
                var value = new Array<string>();
                var pointer: string;
                var index: number;
                var charCode: number;

                // check if file exist
                if (dataTSB!=null){
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    pointer = this.getPointer(value);
                    index = 4;
                    while(index<this.blockSize && value[index]!="00"){
                        // append letters to fileContent
                        charCode = parseInt(value[index],16);
                        fileContent = fileContent + String.fromCharCode(charCode)
                        index++;
                        // if need to read more than one block
                        if(index==this.blockSize && pointer!="-1-1-1"){
                            value = JSON.parse(sessionStorage.getItem(pointer));
                            pointer = this.getPointer(value);
                            index = 4;
                        }
                    }
                    return fileContent;
                } else{
                    return "ERROR_FILE_NOT_FOUND";
                }
            }

            public retrieveProcess(tsb): string[]{
                var value:string[] = JSON.parse(sessionStorage.getItem(tsb));
                var userPrg = new Array<string>();
                var pointer: string = this.getPointer(value);
                var index: number = 4;
                var opCode: string;
                // if program is more than one block
                while (pointer!="-1-1-1"){
                    while (index<value.length){
                        // get bytes 
                        opCode = value[index];
                        userPrg.push(opCode);
                        index++;
                    }
                    // make block available
                    value[0] = "0";
                    this.updateTSB(tsb, value);
                    value = JSON.parse(sessionStorage.getItem(pointer));
                    pointer = this.getPointer(value);
                    index = 4;
                }
                // add the last block
                while (index<value.length){
                    opCode = value[index];
                    userPrg.push(opCode);
                    index++;
                }
                // make block available
                value[0] = "0";
                this.updateTSB(tsb, value);
                // trim since max program length is 256
                if (userPrg.length > 256){
                    userPrg.splice(256,(userPrg.length-256));
                }
                console.log(userPrg.length);
                return userPrg;
            }

            public deleteHelper(tsb): string{
                var value = JSON.parse(sessionStorage.getItem(tsb));
                value[0]="0";
                this.updateTSB(tsb,value);
                var pointer = this.getPointer(value);
                return pointer;
            }

            public deleteFile(filename): string{
                var dataTSB: string = this.lookupDataTSB(filename);
                var dirTSB: string;
                var value = new Array<string>();
                var pointer: string;

                if (dataTSB!=null){
                    // delete directory first
                    for(var i=0; i<this.dirTableSize; i++){
                        dirTSB = sessionStorage.key(i);
                        value = JSON.parse(sessionStorage.getItem(dirTSB));
                        pointer = this.getPointer(value);
                        if(pointer == dataTSB){
                            value[0] = "0";
                            this.updateTSB(dirTSB,value);
                            break;
                        }
                    }
                    // then delete data tsb
                    pointer = this.deleteHelper(dataTSB);
                    if(pointer != "000"){
                        while(pointer != "-1-1-1"){
                            dataTSB = pointer;
                            pointer = this.deleteHelper(dataTSB);
                        }
                    }
                    return "SUCCESS_FILE_DELETED";
                } else {
                    return "ERROR_FILE_NOT_FOUND";
                }
            }

            public listFiles(): string[]{
                var dirTSB: string;
                var value = new Array<string>();
                var dirFilename: string;
                var files = new Array<string>();
                for (var i=1; i<this.dirTableSize; i++){
                    dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    if(value[0]=="1"){
                        dirFilename = this.getFilename(value);
                        files.push(dirFilename);
                        dirFilename = "";
                    }
                }
                return(files);
            }
        }
    }
    