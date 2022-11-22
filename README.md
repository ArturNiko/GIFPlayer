<h1 style="background-image: linear-gradient(90deg, rgba(255, 0, 0, 1), rgba(0, 0, 0, 0)); padding: 15px"> 
      <span style="color: black;">G</span>IF
      <span style="color: black;">P</span>layer 
</h1>

GIF player, which allows you to control/draw every single frame separately.<br><br>

## Navigation 

+ [Installation](#0-installation)
+ [Initialization](#1-initialization)
  * [Import](#import-into-js-module)
  * [Import](#usage)
+ [Parameters](#2-parameters)
+ [Functions](#3-functions)
  * [Setters](#setters)
  * [Getters](#getters)
  * [Controls](#controls)
  * [GIF mutators](#gif-mutators)
+ [Global variables](#4-global-variables)
+ [Plug-Ins](#5-plug-ins)
+ [Note](#6-note)

## §0 Installation

`npm i js-gifplayer`<br><br>


## §1 Initialization
### Import into JS module
``` js
import GIFPlayerV2 from "js-gifplayer" // or path to GIFPlayerV2.js
```
<br>

### Usage
#### HTML
``` html
<div id="wrapper"></div>
```

#### JS
``` js
const sources = 'gif1.gif' || ['gif1.gif', 'gif2.gif'] 
const player = new GIFPlayer(sources, '#wrappper', {
    player: {
        //player config
    },
    plugins: [/* Plug-in names */],
    //plug-in name in lowercase: { plug-in config }
})
```
<br>

## §2 Parameters
+ GIF links (multiple GIFS can be passed).</li>
+ Wrapper selector.</li>
+ Options:<br>
  * `player: {...}` This is the workspace where we are going to assign our parameters.
  * `fps:` sets fps. Default is 60.
  * `frame:` sets starting frame (if passed index is invalid, player will run from default value). Default is 0.
  * `autoplay:` sets autoplay. Default is false.
  * `direction:` `GIFPlayerV2.states.BACKWARD` || `GIFPlayerV2.states.FORWARD` sets the play direction. Default is `GIFPlayerV2.states.FORWARD`.
  * `plugins`: binds built-in plug-ins `[GIFPlayer.AllPlugins.PLG_NAME...]`.
  * `PLG_NAME: { ... }` set up plug in config.
<br><br>

## §3 Functions
### Setters
`.direction`  set play direction.<br/>
`.frame` set current frame.<br/>
`.fps` set fps limiter.<br>

### Getters
`.all` all internal states of the player.<br>
`.canvas` canvas HTML element.<br>
`.wrapper` wrapper element.<br>
`.state` player state.<br>
`.frames_length` frames count.<br>
`.current_frame_index` current frame index.<br>
`.current_frame` current frame.<br>
`.direction` playing direction.<br>
`.fps` fps limiter.<br>
`.urls` gifs urls and its frame indexes.<br>
`get_frame(index)` also a getter, but it's function because you have to pass an index.<br>

### Controls
`play()` play the GIF.<br>
`play_forward()` set direction to `GIFPlayer.states.FORWARD` and play.<br>
`play_backward()` set direction to `GIFPlayer.states.BACKWARD` and play.<br>
`pause()` pause the GIF.<br>
`stop()` pause the GIF and jump back to the first frame.<br>
`reverse()` reverse playing direction.<br>
`step(count)` jumps `count` frames forward. (Depends on direction)<br>
`step_back(count)` jumps back `count` frame. (Depends on direction)<br>

### GIF Mutators
`shuffle_frames()` randomly shuffles frames.<br>
`remove_frames(...indices)` remove frames. <br>
`add_frames(...imgs)` push new frames.<br>
`remove_gifs(...gifs)` remove GIFs frames.<br>
`add_gifs(...gifs)` push new GIFs frames.<br><br>

## §4 Global variables
```javascript
static States = Object.freeze({
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

## §5 Plug-Ins
**Note:** some plug-ins overwrite functions.<br>
Currently exist 2 plug-ins:
+ Scroller `GIFPlayerV2.AllPlugins.Scroller`
    * Name: Scroller.<br>
    * Description: synchron play-on-scroll animation.<br>
    * Options:
      - `flow` set the animation flow during scrolling. Default `[0, 1]`.
      - `target` set the scrolling element.<br><br>
+ GUI `GIFPlayerV2.AllPlugins.GUI` 
  * Name: GUI.<br>
  * Description: Interactive GUI Controller.<br>
  * Options:
    - `hidden` hide GUI visuals. Default `false`.
    - `animationDuration` set GUIs animation duration. 
<br><br>

## §6 Note
Some GIFs may have artifacts when running backwards.<br>
The most common reason is compression, which removes unchanged pixels from the next frame.

