<h1 style="background-image: linear-gradient(90deg, rgba(255, 0, 0, 1), rgba(0, 0, 0, 0)); padding: 15px"> 
      <span style="color: black;">G</span>IF
      <span style="color: black;">P</span>layer 
</h1>

GIF player, which allows you to control/draw every single frame separately.<br/><br/>

<h2>§0 Installation</h2>

`npm i js-gifplayer --save`<br><br>


<h2>§1 Initialization</h2>

<h3>Import</h3>

``` js
import {GIFPlayerV2} from "../src/GIFPlayerV2.js"
```

<br>
<h3>Usage</h3>

<h4>HTML</h4>

``` html
<div id="wrapper"></div>
```

<h4>JS</h4>

``` js
const sources = 'gif1.gif' || ['gif1.gif', 'gif2.gif'] 
const player = new GIFPlayer(sources, '#wrappper', {
    player: {
        //player config
    },
    plugins: [/* Plug-in names */],
    //plug-in name: { plug-in config }
})
```

<br>
<h2>§2 Parameters</h2>

<ul>
<li>GIF links (multiple GIFS can be passed).</li>
<li>Wrapper selector.</li>
<li>Options:<br>

<ul>
<li>

`player: {...}` This is the workspace where we are going to assign our parameters.
</li>
<li>

`fps:` sets fps. Default is 60.
</li>
<li>

`frame:` sets starting frame (if passed index is invalid, player will run from default value). Default is 0.
</li>
<li>

`autoplay:` sets autoplay. Default is false.
</li>
<li>

`direction:` `GIFPlayerV2.states.BACKWARD` || `GIFPlayerV2.states.FORWARD` sets the play direction. Default is `GIFPlayerV2.states.FORWARD`.
</li><br>
<li>

`plugins`: binds built-in plug-ins `[GIFPlayer.AllPlugins.PLG_NAME...]`.
</li>
<li>

`PLG_NAME: { ... }` set up plug in config.
</li>
</ul>

</li>
</ul>
<br>

<h2>§3 Functions</h2>

<h3>Setters</h3>

`.direction`  set play direction.<br/>
`.frame` set current frame.<br/>
`.fps` set fps limiter.<br>

<h3>Getters</h3>

`.all` all internal states of the player.  
`.canvas` canvas HTML element.  
`.wrapper` wrapper element.  
`.state` player state.  
`.frames_length` frames count.  
`.current_frame_index` current frame index.
`.current_frame` current frame.
`.direction` playing direction.
`.fps` fps limiter-
`get_frame(index)` also a getter, but it's function because you have to pass frame index.<br>

<h3>Controls</h3>

`play()` play the GIF.<br/>
`play_forward()` set direction to `GIFPlayer.states.FORWARD` and play.<br/>
`play_backward()` set direction to `GIFPlayer.states.BACKWARD` and play.<br/>
`pause()` pause the GIF.<br/>
`stop()` pause the GIF and jump back to the first frame.<br/>
`reverse()` reverse playing direction.<br>
`step()` jumps 1 frame forward. (Depends on direction)<br>
`step_back()` jumps 1 frame backward. (Depends on direction)

<h3>GIF Mutators ⭐️<i>From 2.4.0^</i>⭐️</h3>

`shuffle_frames()` randomly shuffles frames.<br>
`remove_frames(...index)` remove frames. <br>
`add_frames(...imgs)` push new frame.<br/>
`remove_gifs(...gifs)` remove GIFs<br>
`add_gifs(...gifs)` push new GIFs frames.<br/><br/>

<h2>§4 Global Vars</h2>

```javascript
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

```javascript
static AllPlugins = Object.freeze({
    Scroller: 'scroller',
    GUI: 'gui'
})
```
<br>

<h2>§5 Plug-Ins</h2>
Currently exist 2 plug-ins:
<ul>
<li>

Scroller `GIFPlayerV2.AllPlugins.Scroller`
</li>
<li>

GUI `GIFPlayerV2.AllPlugins.GUI`
</li>
</ul>
<br>
<strong>Note:</strong> some plug-ins overwrite functions.
<ul>
<li>
Name: Scroller.<br>
Description: synchron play-on-scroll animation.<br>
Options:
<ul>
<li>

`flow` sets the animation flow during scrolling. Default `[0, 1]`.
</li>
<li>

`target` sets the scrolling element.
</li>
</ul>
</li>
<li>
Name: GUI.<br>
Description: Interactive GUI Controller.<br>
Options:
<ul>
<li>

`wrapper` Has been removed.
</li>
<li>

`animationDuration` sets the GUI animation duration.
</li>
</ul>
</li>
</ul>
<br>

<h2>§6 Note</h2>
<p>
Some GIFs may have artifacts when running backwards.<br>
The most common reason is compression, which removes unchanged pixels from the next frame.
</p>
