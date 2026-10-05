module.exports = function(w){
  const param=()=>({value:0,setValueAtTime(){return this},setTargetAtTime(){return this},
    linearRampToValueAtTime(){return this},exponentialRampToValueAtTime(){return this},
    cancelScheduledValues(){return this},setValueCurveAtTime(){return this}});
  const node=()=>({connect(){return node()},disconnect(){},start(){},stop(){},
    frequency:param(),gain:param(),Q:param(),detune:param(),pan:param(),
    type:'sine',buffer:null,loop:false,playbackRate:param(),setPeriodicWave(){},onended:null});
  w.AudioContext=w.webkitAudioContext=function(){
    return {currentTime:0,sampleRate:44100,state:'running',destination:node(),
      createOscillator:node,createGain:node,createBiquadFilter:node,createBufferSource:node,
      createStereoPanner:node,createDynamicsCompressor:node,createConvolver:node,
      createWaveShaper:node,createDelay:node,createPeriodicWave:()=>({}),
      createBuffer:(c,l,r)=>({getChannelData:()=>new Float32Array(l),length:l,duration:l/r}),
      resume(){return Promise.resolve()},suspend(){return Promise.resolve()},close(){return Promise.resolve()}};
  };
};
