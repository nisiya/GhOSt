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
            console.log(saveUserPrg.length);
            var newTSB = _krnFileSystemDriver.saveProcess(saveUserPrg);
            // if successfully written to disk
            if (newTSB) {
                // clear memory partition
                _MemoryManager.clearPartition(baseReg);
                // bring needed process from disk to memory
                loadUserPrg = _krnFileSystemDriver.retrieveProcess(tsb);
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
        return LazySwapper;
    }());
    TSOS.LazySwapper = LazySwapper;
})(TSOS || (TSOS = {}));
