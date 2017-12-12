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
            var saveUserPrg = new Array();
            var loadUserPrg = new Array();
            var opCode;
            // save last ran process to disk
            for (var i = 0; i < limitReg; i++) {
                opCode = _MemoryAccessor.retreiveMemory(baseReg + i);
                saveUserPrg.push(opCode);
            }
            var newTSB = _krnFileSystemDriver.writeProcess(saveUserPrg);
            // if successfully written to disk
            if (newTSB) {
                // clear memory partition
                _MemoryManager.clearPartition(baseReg);
                // bring needed process from disk to memory
                loadUserPrg = _krnFileSystemDriver.retrieveProcess(tsb);
                for (var j = 0; j < loadUserPrg.length; j++) {
                    _MemoryAccessor.appendMemory(baseReg, baseReg + j, loadUserPrg[j]);
                }
                return newTSB;
            }
            else {
                // if disk ran out of space
                return null;
            }
        };
        return LazySwapper;
    }());
    TSOS.LazySwapper = LazySwapper;
})(TSOS || (TSOS = {}));
