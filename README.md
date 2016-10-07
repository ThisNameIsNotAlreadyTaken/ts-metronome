## Metronome

The simple typescript metronome based on the article https://www.html5rocks.com/en/tutorials/audio/scheduling/, remastered and extended.

## Description

The main idea of the algorythm is a helper worker, created on the metronom initialization. Worker implements a standard JavaScript "setInterval" cycle and sends to the main thread nessessary tick commands. Main thread scheduling the messages and gonna play it, when the time will come. 

It represents a good way to handle timings throughout the collaboration between between JavaScript timers and the audio hardware scheduling.

This version of the metronom provides two playing methods (tick and audio), that allows you to play your own sounds or use the standart Web Audio ticks. You can also change some options like tempo, noteLength, noteResolution "on the fly" (while playing).

#### Options

- ``tempo``: ``number`` beats per minute ``(default 120)``
- ``audioUrl``: ``string`` custom url to play you own sound as a tick ``(default null)``
- ``noteLength``: ``number`` length of "beep" (in seconds) ``(default 0.1)``
- ``noteResolution``: ``MetronomeNoteResolution`` length of note (full, half, quarter, etc..) ``(default Quarter)``
- ``playType``: ``MetronomePlayType`` tick or audio (will require an audioUrl) ``(default Tick)``

#### Usage

Simple init: 

```typescript

let m = new Metronome();
m.start();

```

Advanced init:

```typescript

// ticks

let mTick = new Metronome({
    tempo: 120,
    playType: MetronomePlayType.Tick,
    noteResolution: MetronomeNoteResolution.Quarter,
    noteLength: 0.1
});

mTick.start();

// audio

let mAudio = new Metronome({
    tempo: 120,
    playType: MetronomePlayType.Audio,
    audioUrl: "https://crossorigin.me/http://audiosoundclips.com/wp-content/uploads/2011/12/Drum1.mp3",
    noteResolution: MetronomeNoteResolution.Quarter,
    noteLength: 0.1
});

mAudio.start();

```

Stopping: 

```typescript

m.stop();

```
