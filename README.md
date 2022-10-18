# GIFPlayer
git player, which allows to control/draw every single frame separately. 


1~ **Parameterts**

1. gif source
2. canvas selector
3. options: 
    `player: {...}` workspace where we assign our parameters.   
      `autoplay` sets autoplay after load. Default is false.        
      `direction` 3~ GifPlayer.states.BACKWARD || GifPlayer.states.FORWARD sets the play direction. Default is GifPlayer.states.FORWARD.   

2~ **Functions**

***Setters***
?set_frame(index)` sets the current frame

***Getters***
`.all` all internal states of player
`.canvas` canvas
`.state` player state
`.frames_length` frames count
`current_frame_index` current frame index
`get_frame(index)` also I getter but it's function because you have to pass frame index you want to get

***Controls***
`play` play the gif
`play_forward` set direction to GifPlayer.states.FORWARD and play
`play_backward` set direction to GifPlayer.states.BACKWARD and play  
`pause` pause the gif
`stop` pause the gif and jump back to the first frame


3~ **Global Vars**
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

