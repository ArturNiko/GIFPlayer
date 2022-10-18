# GIFPlayer
git player, which allows to control/draw every single frame separately.<br/><br/> 


1~ **Parameterts**<br/>

1. gif source
2. canvas selector
3. options:
    `player: {...}` workspace where we assign our parameters.<br/>   
      `autoplay` sets autoplay after load. Default is false.<br/>        
      `direction` 3~ GifPlayer.states.BACKWARD || GifPlayer.states.FORWARD sets the play direction. Default is GifPlayer.states.FORWARD.<br/><br/>


2~ **Functions**<br/>

***Setters***<br/>
?set_frame(index)` sets the current frame<br/>

***Getters***<br/>
`.all` all internal states of player<br/>
`.canvas` canvas<br/>
`.state` player state<br/>
`.frames_length` frames count<br/>
`current_frame_index` current frame index<br/>
`get_frame(index)` also I getter but it's function because you have to pass frame index you want to get<br/>

**Controls**<br/>
`play` play the gif<br/>
`play_forward` set direction to GifPlayer.states.FORWARD and play<br/>
`play_backward` set direction to GifPlayer.states.BACKWARD and play<br/>  
`pause` pause the gif<br/>
`stop` pause the gif and jump back to the first frame<br/><br/>


3~ **Global Vars**<br/>
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

