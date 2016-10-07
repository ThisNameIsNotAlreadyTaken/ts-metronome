"use strict";
var MetronomePlayType;
(function (MetronomePlayType) {
    MetronomePlayType[MetronomePlayType["Tick"] = 0] = "Tick";
    MetronomePlayType[MetronomePlayType["Audio"] = 1] = "Audio";
})(MetronomePlayType || (MetronomePlayType = {}));
var MetronomeNoteResolution;
(function (MetronomeNoteResolution) {
    MetronomeNoteResolution[MetronomeNoteResolution["Sixteenth"] = 0] = "Sixteenth";
    MetronomeNoteResolution[MetronomeNoteResolution["Eighth"] = 1] = "Eighth";
    MetronomeNoteResolution[MetronomeNoteResolution["Quarter"] = 2] = "Quarter";
    MetronomeNoteResolution[MetronomeNoteResolution["Half"] = 3] = "Half";
    MetronomeNoteResolution[MetronomeNoteResolution["Full"] = 4] = "Full";
})(MetronomeNoteResolution || (MetronomeNoteResolution = {}));
var MetronotePitches;
(function (MetronotePitches) {
    MetronotePitches[MetronotePitches["High"] = 770] = "High";
    MetronotePitches[MetronotePitches["Medium"] = 440] = "Medium";
    MetronotePitches[MetronotePitches["Low"] = 220] = "Low";
})(MetronotePitches || (MetronotePitches = {}));
var Metronome = (function () {
    function Metronome(options) {
        // default options
        this.options = {
            tempo: 120,
            noteLength: 0.05,
            noteResolution: MetronomeNoteResolution.Quarter,
            playType: MetronomePlayType.Tick
        };
        this.isPlaying = false;
        this.lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec) This is calculated from lookahead, and overlaps with next interval (in case the timer is late)
        this.nextNoteTime = 0.0; // when the next note is due.
        Object.assign(this.options, options);
        this.audioContext = new AudioContext();
        this.initWorker();
    }
    Metronome.prototype.initWorker = function () {
        var _this = this;
        var blob = new Blob(["\n                var timer = null;\n\t            var interval = 100;\n\t            self.onmessage = function(e) {\n\t\t            if (e.data == \"start\") {\n                        console.log(\"Metronome worker starting\");\n                        if (timer) {\n                            clearInterval(timer);\n                        }\n\t\t\t            timer = setInterval(function(){ postMessage(\"tick\"); }, interval);\n\t\t            }\n\t\t            else if (e.data.interval) {\n\t\t\t            interval = e.data.interval;\n                        console.log(\"Metronome interval = \" + interval + \" .ms\");\n\t\t\t            if (timer) {\n\t\t\t\t            clearInterval(timer);\n\t\t\t\t            timer = setInterval(function(){ postMessage(\"tick\"); }, interval);\n\t\t\t            }\n\t\t            }\n\t\t            else if (e.data==\"stop\") {\n                        console.log(\"Metronome worker stopping\");\n                        if (timer) {\n                            clearInterval(timer);\n                        }\n\t\t\t            timer = null;\n\t\t            }\n\t            };"], { type: "text/javascript" });
        this.timerWorker = new Worker(window.URL.createObjectURL(blob));
        this.timerWorker.onmessage = function (e) {
            if (e.data === "tick") {
                while (_this.nextNoteTime < _this.audioContext.currentTime + _this.scheduleAheadTime) {
                    _this.scheduleNote({ position: _this.current16ThNote, time: _this.nextNoteTime });
                    _this.nextNote();
                }
            }
            else
                console.log("Metronome message: " + e.data);
        };
        this.timerWorker.postMessage({ "interval": this.lookahead });
    };
    Metronome.prototype.scheduleNote = function (note) {
        if ((this.options.noteResolution === 1) && (note.position % 2))
            return; // we're not playing non-8th 16th notes
        if ((this.options.noteResolution === 2) && (note.position % 4))
            return; // we're not playing non-quarter 8th notes
        if ((this.options.noteResolution === 3) && (note.position % 8))
            return; // we're not playing non-half quarter notes
        if ((this.options.noteResolution === 4) && note.position)
            return; // we're not playing non-full half notes
        if (this.options.playType === MetronomePlayType.Audio && this.audioBuffer) {
            var bufferNode = this.audioContext.createBufferSource();
            bufferNode.buffer = this.audioBuffer;
            bufferNode.connect(this.audioContext.destination);
            bufferNode.start(note.time);
            bufferNode.stop(note.time + this.options.noteLength);
        }
        else {
            var oscillatorNode = this.audioContext.createOscillator();
            oscillatorNode.connect(this.audioContext.destination);
            if (note.position % 16 === 0)
                oscillatorNode.frequency.value = MetronotePitches.High;
            else if (note.position % 4 === 0)
                oscillatorNode.frequency.value = MetronotePitches.Medium;
            else
                oscillatorNode.frequency.value = MetronotePitches.Low;
            oscillatorNode.start(note.time);
            oscillatorNode.stop(note.time + this.options.noteLength);
        }
    };
    Metronome.prototype.nextNote = function () {
        var secondsPerBeat = 60.0 / this.options.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
        this.nextNoteTime += 0.25 * secondsPerBeat; // Add beat length to last beat time
        this.current16ThNote++; // Advance the beat number, wrap to zero
        if (this.current16ThNote === 16) {
            this.current16ThNote = 0;
        }
    };
    Metronome.prototype.startWorker = function () {
        this.current16ThNote = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        this.timerWorker.postMessage("start");
    };
    Metronome.prototype.startAudioMode = function () {
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("GET", this.options.audioUrl, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            var audioData = request.response;
            _this.audioContext.decodeAudioData(audioData, function (buffer) {
                _this.audioBuffer = buffer;
                _this.startWorker();
            }, function () { console.error("Error with decoding audio data"); });
        };
        request.send();
    };
    Metronome.prototype.start = function () {
        console.log("Metronome starting");
        this.isPlaying = true;
        if (this.options.playType === MetronomePlayType.Audio) {
            this.startAudioMode();
        }
        else {
            this.startWorker();
        }
    };
    Metronome.prototype.stop = function () {
        this.isPlaying = false;
        this.timerWorker.postMessage("stop");
        console.log("Metronome stopping");
    };
    return Metronome;
}());
