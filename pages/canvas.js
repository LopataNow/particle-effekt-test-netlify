import React, { useRef, useEffect, useState }  from 'react';
import PerlinNoise from '../untils/perlin-noise';

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

class Particle{
  settings = {
    radius: 15,
    //radius: 1.3,
    color: '#ffffff'
  }
  offsetX=0;
  offsetY=0;
  constructor(positionX, positionY, noiseX, noiseY){
    this.positionX = positionX;
    this.positionY = positionY;

    const lightness = 30 + PerlinNoise.noise(noiseX * 5, noiseY * 5, 0.8) * 60;
    //const lightness = 30 + Math.random() * 70;
    //console.log(lightness);
    this.settings.color = `hsl( 230, 80%,${lightness}%)`;
  }
  update(mousePosition){
    if(mousePosition.x < 0 | mousePosition.y < 0)
      return;
    
    var dx = mousePosition.x - this.positionX - this.offsetX;
    var dy = mousePosition.y - this.positionY - this.offsetY;
    var dist = Math.sqrt(dx*dx + dy*dy);
      
    if(dist < 100) {
      var ax = dx, ay = dy;

      this.offsetX -= ax*3/dist;
      this.offsetY -= ay*3/dist;
    }
    else if(dist > 103){

      this.offsetX -= this.offsetX * 0.15;
      this.offsetY -= this.offsetY * 0.15;
    }
  }
  draw(context){
    context.fillStyle = this.settings.color;
    context.beginPath();
    context.arc(this.positionX+this.offsetX, this.positionY+this.offsetY, this.settings.radius, 0, Math.PI*2, true); 
    context.closePath();
    context.fill();
  }
}

class ParticleManager{
  particles = new Set();
  settings = {
    windowWidth: undefined,
    windowHeight: undefined,
    backgrousColor: '#000000',
    spaces: 32,
    padding:15
    //spaces: 18,
  }
  mousePosition = {
    x:-1,
    y:-1
  }
  constructor(canvas, context){
    this.canvas = canvas;
    this.context = context;

    this.init();
  }
  addParticle(x, y, noiseX, noiseY){
    this.particles.add(new Particle(x, y, noiseX, noiseY));
  }
  removeParticle(particle){
    this.particles.delete(particle);
  }
  init(){
    const width = window.innerWidth;
    const height = window.innerHeight;
    var random = Math.random();

    for(var x = this.settings.padding; x < this.canvas.width - this.settings.padding; x+= this.settings.spaces){
      for(var y = this.settings.padding + 5; y < this.canvas.height -this.settings.padding; y+= this.settings.spaces){
        
        var noise = PerlinNoise.noise( (random+x/this.canvas.width)*10, (random+y/this.canvas.height)*10,1) 
        //if(noise > 0.4)
        this.addParticle(x, y, random+x/this.canvas.width, random+y/this.canvas.height);
      }
    }
  }
  update(){
    for(let particle of this.particles){
      particle.update(this.mousePosition);
    }
  }
  draw(context){
    this.update();
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    for(let particle of this.particles){
      particle.draw(this.context);
    }
  }
  setMousePosition(pos){
    this.mousePosition = pos;
  }
}

var particleManager;
var canvas;

function Canvas(props){
    const canvasRef = useRef(null);

    const onMoveHandle = function(e){
      if(particleManager){
        particleManager.setMousePosition(getMousePos(canvas, e))
      }
    }
    
    useEffect(() => {
      canvas = canvasRef.current
      const context = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      particleManager = new ParticleManager(canvas, context);

      const interval = setInterval(() => {
        particleManager.draw(context);
      }, 1000/60);

      return () => clearInterval(interval);
    }, [])
    return <canvas 
            ref={canvasRef} {...props} 
             onMouseMove={onMoveHandle}
    />;
}

export default ()=> {
  const back = '#ebedf9';
    return <>
    <Canvas style={{width: '100%', height: '100vh', background: back}}/>
    <div style={{height:'50px'}}/>
    </>;
}