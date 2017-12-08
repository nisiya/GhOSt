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
            return _this;
            // this.isr = this.krnFsDispatchKeyPress;
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
                    while (value.length < 65) {
                        value.push("00");
                    }
                    for (var i = 0; i < 8; i++) {
                        for (var j = 0; j < 78; j++) {
                            tsb = j.toString();
                            if (tsb.length < 2) {
                                tsb = "0" + tsb;
                            }
                            tsb = i.toString() + tsb;
                            sessionStorage.setItem(tsb, JSON.stringify(value));
                        }
                    }
                    TSOS.Control.loadDiskTable();
                    var sessionLength = sessionStorage.length;
                }
            }
            else {
                alert("Sorry, your browser do not support session storage.");
            }
        };
        DeviceDriverFileSystem.prototype.formatDisk = function () {
            var tsb;
            var value = new Array();
            var sessionLength = sessionStorage.length;
            for (var i = 0; i < sessionLength; i++) {
                var tsb = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "1";
                sessionStorage.setItem(tsb, JSON.stringify(value));
                TSOS.Control.updateDiskTable(tsb);
            }
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            var createdFile = false;
            var dirTSB;
            var value = new Array();
            var asciiFilename;
            var sessionLength = sessionStorage.length;
            // 000 is master boot rec
            // 77 is index of last DIR block sector
            for (var i = 1; i < 78; i++) {
                var dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "0") {
                    var dataTSB = this.findDataTSB();
                    if (dataTSB != null) {
                        value[0] = "1";
                        for (var k = 1; k < 4; k++) {
                            value[k] = dataTSB.charAt(k - 1);
                        }
                        asciiFilename = filename.toString();
                        for (var j = 0; j < asciiFilename.length; j++) {
                            value[j + 4] = asciiFilename.charCodeAt(j).toString(16).toUpperCase();
                        }
                        sessionStorage.setItem(dirTSB, JSON.stringify(value));
                        TSOS.Control.updateDiskTable(dirTSB);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            return false;
        };
        DeviceDriverFileSystem.prototype.findDataTSB = function () {
            var dataTSB;
            var value = new Array();
            for (var i = 78; i < sessionStorage.length; i++) {
                dataTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                if (value[0] == "0") {
                    value[0] = "1";
                    sessionStorage.setItem(dataTSB, JSON.stringify(value));
                    TSOS.Control.updateDiskTable(dataTSB);
                    return dataTSB;
                }
            }
            return dataTSB;
        };
        DeviceDriverFileSystem.prototype.lookupDataTSB = function (filename) {
            var dirTSB;
            var dataTSB;
            var value = new Array();
            var dirFilename = "";
            for (var i = 1; i < 78; i++) {
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "1") {
                    var index = 4;
                    var letter;
                    while (value[index] != "00") {
                        letter = String.fromCharCode(parseInt(value[index], 16));
                        dirFilename = dirFilename + letter;
                        index++;
                    }
                    if (dirFilename == filename) {
                        dataTSB = value.splice(1, 3).toString().replace(/,/g, "");
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
            var value = new Array();
            var charCode;
            // if found
            if (dataTSB != null) {
                console.log("exist");
                console.log("write data " + dataTSB);
                // modify the value
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                var contentIndex = 0;
                var valueIndex = 4;
                // add hex value of ascii value of fileContent
                console.log("content " + fileContent + " len " + fileContent.length);
                while (contentIndex < fileContent.length) {
                    // if more than one block needed...
                    if (valueIndex == 64) {
                        // get new free data block
                        var oldDataTSB = dataTSB;
                        dataTSB = this.findDataTSB();
                        console.log("write new data " + dataTSB);
                        // add pointer to new block in current block
                        for (var k = 1; k < 4; k++) {
                            value[k] = dataTSB.charAt(k - 1);
                        }
                        // save current block
                        console.log("old val " + value);
                        sessionStorage.setItem(oldDataTSB, JSON.stringify(value));
                        TSOS.Control.updateDiskTable(oldDataTSB);
                        // set working block to new block
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        console.log("new val " + value);
                        valueIndex = 4;
                    }
                    else {
                        // current block has space
                        console.log("cont in " + contentIndex);
                        charCode = fileContent.charCodeAt(contentIndex);
                        console.log("value in " + valueIndex);
                        value[valueIndex] = charCode.toString(16).toUpperCase();
                        contentIndex++;
                        valueIndex++;
                    }
                }
                // save last block
                for (var k = 1; k < 4; k++) {
                    value[k] = "-1"; // last block indicator
                }
                sessionStorage.setItem(dataTSB, JSON.stringify(value));
                TSOS.Control.updateDiskTable(dataTSB);
                return true;
            }
            else {
                return false;
            }
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
