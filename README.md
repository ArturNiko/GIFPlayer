<h1 style="background-image: linear-gradient(90deg, rgba(255, 0, 0, 1), rgba(0, 0, 0, 0)); padding: 15px"> 
      <span style="color: black;">G</span>IF
      <span style="color: black;">P</span>layer 
</h1>

GIF player, which allows you to control/draw every single frame separately.<br/><br/>

<h2>1~ Parameters</h2>

<ul>
<li>GIF link</li>
<li>canvas selector</li>
<li>options:<br><br>

`player: {...}` This is the workspace where we are going to assign our parameters.<br>
&emsp;&emsp;&emsp;`fps:` sets fps. Default is 60<br>
&emsp;&emsp;&emsp;`frame:` sets starting frame (if passed index is invalid, player will run from default value). Default is 0<br>
&emsp;&emsp;&emsp;`autoplay:` sets autoplay. Default is false.<br>
&emsp;&emsp;&emsp;`direction:` `GIFPlayerV2.states.BACKWARD` || `GIFPlayerV2.states.FORWARD` sets the play direction. Default is `GIFPlayerV2.states.FORWARD`.

</li>
</ul>
<br/>

<h2>2~ Functions</h2>

<h3>Setters</h3>

`.direction`  set play direction.<br/>
`.frame` set current frame.<br/>
`.fps` set fps limiter.<br> 

<h3>Getters</h3>

`.all` all internal states of the player.  
`.canvas` canvas HTML element.  
`.state` player state.  
`.frames_length` frames count.  
`.current_frame_index` current frame index.  
`get_frame(index)` also a getter, but it's function because you have to pass frame index you want to get.

<h3>Controls</h3>

`play()` play the GIF.<br/>
`play_forward()` set direction to `GIFPlayer.states.FORWARD` and play.<br/>
`play_backward()` set direction to `GIFPlayer.states.BACKWARD` and play.<br/>
`pause()` pause the GIF.<br/>
`stop()` pause the GIF and jump back to the first frame.<br/>
`reverse()` Reverse playing direction.<br/><br/>

<h2>3~ Global Vars</h2>

```
static states = Object.freeze({
LOADING: 0,  //loading states
READY: 1,
PAUSED: 2,
PLAYING: 3,
ERROR: 4,

FORWARD: 5, //play direction states
BACKWARD: 6,
})
```
<br>

<h2>4~ Note</h2>
<p>
Some GIFs may have artifacts when running backwards.<br>
The most common reason is compression, which removes unchanged pixels from the next frame.
</p>
