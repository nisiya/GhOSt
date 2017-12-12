///<reference path="../globals.ts" />
/* ------------
     lazySwapper.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var LazySwapper = /** @class */ (function () {
        function LazySwapper() {
        }
        LazySwapper.prototype.swapProcess = function (tsb, baseReg, limitReg) {
            var newLocs = new Array();
            // var saveUserPrg = new Array<string>();
            var loadUserPrg = new Array();
            var opCode;
            // save last ran process to disk
            var saveUserPrg = _MemoryAccessor.readPartition(baseReg, limitReg);
            saveUserPrg = this.trimUserPrg(saveUserPrg);
            console.log("Save " + saveUserPrg.length);
            var newTSB = _krnFileSystemDriver.saveProcess(saveUserPrg);
            // if successfully written to disk
            if (newTSB) {
                // clear memory partition
                _MemoryManager.clearPartition(baseReg);
                // bring needed process from disk to memory
                loadUserPrg = _krnFileSystemDriver.retrieveProcess(tsb);
                loadUserPrg = this.trimUserPrg(loadUserPrg);
                console.log("load " + loadUserPrg.length);
                for (var j = 0; j < loadUserPrg.length; j++) {
                    _MemoryAccessor.writePartition(baseReg, baseReg + j, loadUserPrg[j]);
                }
                return newTSB;
            }
            else {
                // if disk ran out of space
                return null;
            }
        };
        LazySwapper.prototype.trimUserPrg = function (userPrg) {
            var opCode = userPrg.pop();
            while (opCode == "00") {
                opCode = userPrg.pop();
            }
            userPrg.push(opCode);
            return userPrg;
        };
        return LazySwapper;
    }());
    TSOS.LazySwapper = LazySwapper;
})(TSOS || (TSOS = {}));
