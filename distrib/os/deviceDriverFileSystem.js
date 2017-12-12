///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The File System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = /** @class */ (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            var _this = 
            // Override the base method pointers.
            _super.call(this) || this;
            _this.driverEntry = _this.krnFSDriverEntry;
            _this.track = 8;
            _this.sector = 8;
            _this.block = 8;
            _this.blockSize = 64;
            _this.dirTableSize = _this.sector * _this.block;
            _this.dataTableSize = (_this.track - 1) * _this.sector * _this.block;
            return _this;
        }
        DeviceDriverFileSystem.prototype.krnFSDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            if (sessionStorage) {
                if (sessionStorage.length == 0) {
                    // create file system
                    var tsb;
                    var value = new Array();
                    for (var i = 0; i < 4; i++) {
                        //first byte and pointer
                        value.push("0");
                    }
                    while (value.length < this.blockSize) {
                        value.push("00");
                    }
                    for (var i = 0; i < this.track; i++) {
                        for (var j = 0; j < this.sector; j++) {
                            for (var k = 0; k < this.block; k++) {
                                tsb = i.toString() + j.toString() + k.toString();
                                sessionStorage.setItem(tsb, JSON.stringify(value));
                            }
                        }
                    }
                    TSOS.Control.loadDiskTable();
                }
            }
            else {
                alert("Sorry, your browser do not support session storage.");
            }
        };
        // convert string to array of ascii value in hex
        DeviceDriverFileSystem.prototype.stringToAsciiHex = function (string) {
            var asciiHex = new Array();
            var hexVal;
            for (var i = string.length - 1; i >= 0; i--) {
                hexVal = string.charCodeAt(i).toString(16);
                asciiHex.push(hexVal.toUpperCase());
            }
            console.log(asciiHex);
            return asciiHex;
        };
        // update block in session and display
        DeviceDriverFileSystem.prototype.updateTSB = function (tsb, value) {
            sessionStorage.setItem(tsb, JSON.stringify(value));
            TSOS.Control.updateDiskTable(tsb);
        };
        // removed pointers
        DeviceDriverFileSystem.prototype.quickFormat = function () {
            var tsb;
            var value = new Array();
            for (var i = 0; i < sessionStorage.length; i++) {
                var tsb = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "0";
                this.updateTSB(tsb, value);
            }
            return "SUCCESS_DISK_QUICK_FORMATTED";
        };
        // zero fills all blocks
        DeviceDriverFileSystem.prototype.fullFormat = function () {
            var tsb;
            var value = new Array();
            for (var i = 0; i < sessionStorage.length; i++) {
                var tsb = sessionStorage.key(i);
                this.zeroFill(tsb);
            }
            return "SUCCESS_DISK_FULL_FORMATTED";
        };
        // zero fills one block
        DeviceDriverFileSystem.prototype.zeroFill = function (tsb) {
            var value = value = JSON.parse(sessionStorage.getItem(tsb));
            for (var i = 0; i < 4; i++) {
                value[i] = "0";
            }
            for (var j = 4; j < value.length; j++) {
                value[j] = "00";
            }
            this.updateTSB(tsb, value);
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            var createdFile = false;
            var dirTSB;
            var value = new Array();
            var asciiFilename = new Array();
            // make sure no duplicate filename
            var existFilename = this.lookupDataTSB(filename);
            if (existFilename != null) {
                return "ERROR_DUPLICATE_FILENAME";
            }
            else {
                // 000 is master boot rec
                // 63 is index of last DIR block sector
                for (var i = 1; i < this.dirTableSize; i++) {
                    var dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    if (value[0] == "0") {
                        this.zeroFill(dirTSB);
                        value = JSON.parse(sessionStorage.getItem(dirTSB));
                        var dataTSB = this.findDataTSB();
                        if (dataTSB != null) {
                            value[0] = "1";
                            for (var k = 1; k < 4; k++) {
                                // pointer in dir 
                                value[k] = dataTSB.charAt(k - 1);
                            }
                            asciiFilename = this.stringToAsciiHex(filename.toString());
                            var index = 4;
                            // add filename
                            while (asciiFilename.length > 0) {
                                value[index] = asciiFilename.pop();
                                index++;
                            }
                            this.updateTSB(dirTSB, value);
                            if (value[4] == "2E") {
                                return filename + " - SUCCESS_HIDDEN_FILE_CREATED";
                            }
                            else {
                                return filename + " - SUCCESS_FILE_CREATED";
                            }
                        }
                        else {
                            return "ERROR_DISK_FULL";
                        }
                    }
                }
                return "ERROR_DIR_FULL";
            }
        };
        DeviceDriverFileSystem.prototype.getPointer = function (value) {
            var pointer = value[1] + value[2] + value[3];
            return pointer;
        };
        DeviceDriverFileSystem.prototype.findDataTSB = function () {
            var dataTSB;
            var value = new Array();
            for (var i = this.dirTableSize; i < sessionStorage.length; i++) {
                dataTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                if (value[0] == "0") {
                    this.zeroFill(dataTSB);
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    value[0] = "1";
                    this.updateTSB(dataTSB, value);
                    return dataTSB;
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.getFilename = function (value) {
            var index = 4;
            var letter;
            var dirFilename = "";
            while (value[index] != "00" && index < this.blockSize) {
                letter = String.fromCharCode(parseInt(value[index], 16));
                dirFilename = dirFilename + letter;
                index++;
            }
            return dirFilename;
        };
        DeviceDriverFileSystem.prototype.lookupDataTSB = function (filename) {
            var dirTSB;
            var dataTSB;
            var value = new Array();
            var dirFilename;
            for (var i = 1; i < this.dirTableSize; i++) {
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "1") {
                    dirFilename = this.getFilename(value);
                    if (dirFilename == filename) {
                        dataTSB = value.splice(1, 3).toString().replace(/,/g, "");
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        return dataTSB;
                    }
                    dirFilename = "";
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.writeFile = function (filename, fileContent) {
            // look in dir for data tsb with filename
            var dataTSB = this.lookupDataTSB(filename);
            var content = new Array();
            if (dataTSB != null) {
                content = this.stringToAsciiHex(fileContent);
                var fileCreated = this.writeToFS(dataTSB, content);
                if (fileCreated) {
                    return filename + " - SUCCESS_FILE_MODIFIED";
                }
                else {
                    return "ERROR_DISK_FULL";
                }
            }
            else {
                return "ERROR_FILE_NOT_FOUND";
            }
        };
        DeviceDriverFileSystem.prototype.saveProcess = function (userPrg) {
            // check for empty block
            var dataTSB = this.findDataTSB();
            var content = new Array();
            if (dataTSB != null) {
                // writeToFS will pop from the array
                while (userPrg.length > 0) {
                    content.push(userPrg.pop());
                }
                // write process to disk if data block available
                var processLoaded = this.writeToFS(dataTSB, content);
                if (processLoaded) {
                    return dataTSB;
                    // create process and put in resident queue
                }
                else {
                    // occur when process takes up more than one block 
                    // and no additional ones are available
                    return null;
                }
            }
            else {
                return null;
            }
        };
        DeviceDriverFileSystem.prototype.writeToFS = function (dataTSB, content) {
            var tsbUsed = new Array();
            var firstTSB = dataTSB;
            var value = new Array();
            var valueIndex = 0;
            var firstIndex;
            value = JSON.parse(sessionStorage.getItem(dataTSB));
            var pointer = this.getPointer(value);
            if (pointer == "000") {
                valueIndex = 4;
            }
            else {
                while (pointer != "-1-1-1") {
                    dataTSB = pointer;
                    tsbUsed.push(dataTSB);
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    pointer = this.getPointer(value);
                }
                // find where previous content ends
                for (var i = 4; i < value.length; i++) {
                    if (value[i] == "00") {
                        valueIndex = i;
                        break;
                    }
                }
            }
            firstIndex = valueIndex;
            // add hex value of ascii value of fileContent
            while (content.length > 0) {
                // if more than one block needed...
                if (valueIndex == this.blockSize) {
                    // get new free data block
                    var oldDataTSB = dataTSB;
                    dataTSB = this.findDataTSB();
                    tsbUsed.push(dataTSB);
                    // free block obtained
                    if (dataTSB != null) {
                        // add pointer to new block in current block
                        for (var k = 1; k < 4; k++) {
                            value[k] = dataTSB.charAt(k - 1);
                        }
                        // save current block
                        this.updateTSB(oldDataTSB, value);
                        // set working block to new block
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        valueIndex = 4;
                    }
                    else {
                        // no free block available
                        // undo all file modifications
                        for (var tsb in tsbUsed) {
                            this.zeroFill(tsb);
                        }
                        for (var m = firstIndex; m < this.blockSize; m++) {
                            value = JSON.parse(sessionStorage.getItem(firstTSB));
                            value[m] = "00";
                            this.updateTSB(firstTSB, value);
                        }
                        return false;
                    }
                }
                else {
                    // current block has space
                    value[valueIndex] = content.pop();
                    valueIndex++;
                }
            }
            // save last block
            for (var k = 1; k < 4; k++) {
                value[k] = "-1"; // last block indicator
            }
            this.updateTSB(dataTSB, value);
            return true;
        };
        DeviceDriverFileSystem.prototype.readFile = function (filename) {
            var fileContent = filename + ": ";
            var dataTSB = this.lookupDataTSB(filename);
            var value = new Array();
            var pointer;
            var index;
            var charCode;
            // check if file exist
            if (dataTSB != null) {
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                pointer = this.getPointer(value);
                index = 4;
                while (index < this.blockSize && value[index] != "00") {
                    // append letters to fileContent
                    charCode = parseInt(value[index], 16);
                    fileContent = fileContent + String.fromCharCode(charCode);
                    index++;
                    // if need to read more than one block
                    if (index == this.blockSize && pointer != "-1-1-1") {
                        value = JSON.parse(sessionStorage.getItem(pointer));
                        pointer = this.getPointer(value);
                        index = 4;
                    }
                }
                return fileContent;
            }
            else {
                return "ERROR_FILE_NOT_FOUND";
            }
        };
        DeviceDriverFileSystem.prototype.retrieveProcess = function (tsb) {
            var value = JSON.parse(sessionStorage.getItem(tsb));
            var userPrg = new Array();
            var pointer = this.getPointer(value);
            var index = 4;
            var opCode;
            // if program is more than one block
            while (pointer != "-1-1-1") {
                while (index < value.length) {
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
            while (index < value.length) {
                opCode = value[index];
                userPrg.push(opCode);
                index++;
            }
            // make block available
            value[0] = "0";
            this.updateTSB(tsb, value);
            // trim since max program length is 256
            if (userPrg.length > 256) {
                userPrg.splice(256, (userPrg.length - 256));
            }
            console.log(userPrg.length);
            return userPrg;
        };
        DeviceDriverFileSystem.prototype.deleteHelper = function (tsb) {
            var value = JSON.parse(sessionStorage.getItem(tsb));
            value[0] = "0";
            this.updateTSB(tsb, value);
            var pointer = this.getPointer(value);
            return pointer;
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (filename) {
            var dataTSB = this.lookupDataTSB(filename);
            var dirTSB;
            var value = new Array();
            var pointer;
            if (dataTSB != null) {
                // delete directory first
                for (var i = 0; i < this.dirTableSize; i++) {
                    dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    pointer = this.getPointer(value);
                    if (pointer == dataTSB) {
                        value[0] = "0";
                        this.updateTSB(dirTSB, value);
                        break;
                    }
                }
                // then delete data tsb
                pointer = this.deleteHelper(dataTSB);
                if (pointer != "000") {
                    while (pointer != "-1-1-1") {
                        dataTSB = pointer;
                        pointer = this.deleteHelper(dataTSB);
                    }
                }
                return "SUCCESS_FILE_DELETED";
            }
            else {
                return "ERROR_FILE_NOT_FOUND";
            }
        };
        DeviceDriverFileSystem.prototype.listFiles = function () {
            var dirTSB;
            var value = new Array();
            var dirFilename;
            var files = new Array();
            for (var i = 1; i < this.dirTableSize; i++) {
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "1" && value[4] != "2E") {
                    dirFilename = this.getFilename(value);
                    files.push(dirFilename);
                    dirFilename = "";
                }
            }
            return (files);
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
