<h1 style="background-image: linear-gradient(90deg, rgba(255, 0, 0, 1), rgba(0, 0, 0, 0)); padding: 15px"> 
      <span style="color: black;">G</span>IF
      <span style="color: black;">P</span>layer 
</h1>

GIF player, which allows to control/draw every single frame separately.<br/><br/> 


<h2>1~ Parameters</h2>
    <ul>
         <li>GIF link</li>
         <li>canvas selector</li>
         <li>
            options:  
               `player: {...}` is the workspace where we are going to assign our parameters. (For future stuff)    
               `autoplay:` sets autoplay after load. Default is false.   
               `direction:` `GifPlayer.states.BACKWARD` || `GifPlayer.states.FORWARD` sets the play direction. Default is `GifPlayer.states.FORWARD`.
         </li>
    </ul>
<br/><br/>

<h2>2~ Functions</h2>

<h3>Setters</h3>
`.direction`  sets play direction.  
`set_frame(index)` set the current frame.

<h3>Getters</h3>
`.all` all internal states of the player.  
`.canvas` canvas.  
`.state` player state.  
`.frames_length` frames count.  
`.current_frame_index` current frame index.  
`get_frame(index)` also I getter, but it's function because you have to pass frame index you want to get.  

<h3>Controls</h3>
`play()` play the GIF<br/>
`play_forward()` set direction to `GifPlayer.states.FORWARD` and play.<br/>
`play_backward()` set direction to `GifPlayer.states.BACKWARD` and play.<br/>  
`pause` pause the GIF.<br/>
`stop()` pause the GIF and jump back to the first frame.<br/><br/>


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

