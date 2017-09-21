///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public prevCmd: string[] = [], // store handled commands
                    public updown = 0, // counter to index through previous commands
                    public matchCmd: string[] = [], // store all matching commands
                    public matchIndex = 0) { // index of current command tab key is showing from matching list
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // add command to previous command list
                    this.prevCmd.push(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { //   Backspace key
                    // delete a character
                    chr = this.buffer[this.buffer.length-1];
                    this.removeChr(chr);
                } else if (chr === '38') { //   Up key .. special case so two characters
                    // counter is within length of previous command list
                    if (this.updown < this.prevCmd.length){
                        this.updown ++;
                        // remove current text
                        this.removeLine();                        
                        // put previous command
                        this.putText(this.prevCmd[this.prevCmd.length-this.updown]);
                        // current text is now previous command so add to buffer
                        this.buffer = this.prevCmd[this.prevCmd.length-this.updown];
                    }              
                } else if (chr === '40') { //   Down key .. special case so two characters
                    // only if up key was used before
                    if(this.updown > 1){
                        this.updown--;
                        this.removeLine();
                        this.putText(this.prevCmd[this.prevCmd.length-this.updown]);
                        this.buffer = this.prevCmd[this.prevCmd.length-this.updown];                        
                    }
                } else if (chr === String.fromCharCode(9)) { //  Tab key
                    if (this.matchCmd.length == 0){
                        // first tab on new line
                        var re = new RegExp('^' + this.buffer + '', 'i');     
                        // find all commands that start with str in buffer               
                        for (var i=0; i<_OsShell.commandList.length; i++){
                            if(re.test(_OsShell.commandList[i].command)){
                                this.matchCmd.push(_OsShell.commandList[i].command);
                            }
                        }
                        console.log(this.matchCmd.length);
                        this.matchIndex = 0;                 
                    }
                    if (this.matchCmd.length > 0){
                        // replace current text with previous command
                        this.removeLine();
                        this.putText(this.matchCmd[this.matchIndex]);
                        this.buffer = this.matchCmd[this.matchIndex];
                        if (this.matchIndex == (this.matchCmd.length - 1)){
                            this.matchCmd = [];
                        } else {
                            this.matchIndex++;
                        }
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
            // console.log(this.currentXPosition);
        }

        public removeChr(chr): void {
            if (this.buffer !== "") {
                // if beginning of line, move cursor back to previous line
                if(this.currentXPosition <= 0){
                    this.currentYPosition -= _DefaultFontSize + 
                                            _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                            _FontHeightMargin;
                    // get end of text position from that line
                    this.currentXPosition = _SaveX;
                }
                // Move cursor back to X position before chr written.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, chr);
                this.currentXPosition = this.currentXPosition - offset;
                // clear chr with clearRect
                var chrHeight = _DefaultFontSize + 
                            _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                            _FontHeightMargin;
                // highest point of chr
                var chrTop = this.currentYPosition - (_DefaultFontSize + 
                                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));    
                // offset is the width of the rectangle
                _DrawingContext.clearRect(this.currentXPosition, chrTop , offset, chrHeight); 
                // console.log(this.currentXPosition);
                
                // save for future debugging
                // console.log(chrHeight + "," + chrTop)
                // _DrawingContext.beginPath();
                // _DrawingContext.rect(this.currentXPosition, chrTop , offset, chrHeight);
                // _DrawingContext.stroke();

                // remove chr from buffer
                var newBuffer:string = this.buffer.substring(0, this.buffer.length - 1);
                this.buffer = newBuffer;
            }
        }

        public removeLine(): void {
            if(this.buffer !== ""){
                var i = this.buffer.length - 1;
                while (this.buffer.length > 0){
                    this.removeChr(this.buffer[i]);
                    i--;
                }
            }
        }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;
                                     
            // TODO: Handle scrolling. (iProject 1)
            if (this.currentYPosition > _Canvas.height){ 
                // keep track of position of last line
                var saveYPosition = this.currentYPosition;
                // start copying after first line which will "scroll up"
                var copyYPostion = this.currentYPosition - _Canvas.height;
                // save screenshot
                var imgData = _DrawingContext.getImageData(0, copyYPostion, _Canvas.width, _Canvas.height);
                // use below for debugging
                // console.log(imgData);
                // clear screen
                this.init();
                // put screenshot to top of screen
                _DrawingContext.putImageData(imgData, 0, 0);
                // put cursor back to correct
                this.currentYPosition = saveYPosition - copyYPostion - _FontHeightMargin;
            }
        }
    }
 }
