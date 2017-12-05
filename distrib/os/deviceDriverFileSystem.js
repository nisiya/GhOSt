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
                    while (value.length < 65) {
                        value.push("00");
                    }
                    console.log(value);
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
                    var sessionLength = sessionStorage.length;
                    console.log(sessionLength.toString());
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
            console.log(sessionLength.toString());
            for (var i = 0; i < sessionLength; i++) {
                var tsb = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "00";
                sessionStorage.setItem(tsb, JSON.stringify(value));
            }
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            var createdFile = false;
            var dirTSB;
            var value = new Array();
            var asciiFilename;
            var sessionLength = sessionStorage.length;
            console.log(sessionLength.toString());
            // 000 is master boot rec
            // 77 is index of last DIR block sector
            for (var i = 1; i < 78; i++) {
                var dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "00") {
                    var dataTSB = this.findDataTSB();
                    if (dataTSB != null) {
                        value[0] = "01";
                        for (var k = 1; k < 4; k++) {
                            value[k] = "0" + dataTSB.charAt(k - 1);
                        }
                        asciiFilename = filename.toString();
                        for (var j = 0; j < asciiFilename.length; j++) {
                            value[j + 4] = asciiFilename.charCodeAt(j).toString(16);
                        }
                        sessionStorage.setItem(dirTSB, JSON.stringify(value));
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
                if (value[0] == "00") {
                    value[0] = "01";
                    sessionStorage.setItem(dataTSB, JSON.stringify(value));
                    return dataTSB;
                }
            }
            return dataTSB;
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
