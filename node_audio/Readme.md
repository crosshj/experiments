More about this at: [Video Notes](https://www.youtube.com/watch?v=r1Z30D6iIYY)

Drone Music on Koala
[Drone 1](https://www.youtube.com/watch?v=fLomyo-x4sk)
I have been playing around in [Koala sampler](https://www.koalasampler.com/) like this:
1) use a WAV file with a simple tone like a piano key hit or a sine wave
2) reduce bpm as low as I can go (40 bpm)
3) trigger the tone from #1 once per bar; probably a chord is triggered, not just a note
4) go crazy with reverb, talkbox, and many other effects

Inspired by this Workflow:
a) Can I get an algorithm to do #4 similar to how I do it?
b) What happens if the algorithm tweaks something and the output goes too loud or too shrill?
c) Can I go much lower than Koala to get myself algorithmic control?

Potential Solutions:
Concerning (c) from the "Inspired" section above; how to make this idea work
a) raspberry pi
    i) [MiniDexed](https://github.com/probonopd/MiniDexed)
    ii) [minisynth](https://github.com/rsta2/minisynth)
    iii) [mt32-pi](https://github.com/dwhinham/mt32-pi)
b) web / Web Audio
    i) [tonejs](https://github.com/Tonejs/Tone.js)
    ii) [tuna](https://github.com/Theodeus/tuna) - effects for web audio
c) nodejs
    i) [web-audio-api](https://github.com/audiojs/web-audio-api)
    ii) [web-audio-engine](https://github.com/mohayonao/web-audio-engine)
    iii) [node-speaker](https://github.com/TooTallNate/node-speaker) 
d) C/C++ (and maybe some audio lib) on whatever computer I can get this going on

## That one old wind chimes program
I liked this program because it output MIDI; this meant I could hook it up to whatever instrument/effects.
[Syntrillium Wind Chimes](https://archive.org/details/syntrillium-wind-chimes)
[Zen Chimes](http://www.zendogsoftware.com/about_b.asp) - same thing but later released by original author for free?