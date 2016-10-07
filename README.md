## Metronome

The simple typescript metronome based on the article https://www.html5rocks.com/en/tutorials/audio/scheduling/, remastered and extended.

## Description

The main idea of the algorythm is a helper worker, created on the metronom initialization. Worker implements a standard JavaScript "setInterval" cycle and sends to the main thread nessessary tick commands. Main thread scheduling the messages and gonna play it, when the time will come. 

It represents a good way to handle timings throughout the collaboration between between JavaScript timers and the audio hardware scheduling.

This version of the metronom provides two playing methods (tick and audio), that allows you to play your own sounds or use the standart Web Audio ticks. You can also change some options like tempo, noteLength, noteResolution "on the fly" (while playing).

#### Options

- ``tempo``: beats per minute (int number)
- ``audioUrl``: custom url to play you own sound as a tick
- ``noteLength``: length of "beep" (in seconds)
- ``noteLength``: length of note (full, half, quarter, etc..)
- ``playType``: 
