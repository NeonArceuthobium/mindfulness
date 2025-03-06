// don't forget to double check JS Babel from the codepen settings

const rippleSettings = {
    maxSize: 100,
    animationSpeed: 1,
    strokeColor: [181, 217, 255],
  };
  
  const canvasSettings = {
    blur: 8,
    ratio: 1,
  };
  
  function Coords(x, y) {
    this.x = x || null;
    this.y = y || null;
  }
  
  const Ripple = function Ripple(x, y, circleSize, ctx) {
    this.position = new Coords(x, y);
    this.circleSize = circleSize;
    this.maxSize = rippleSettings.maxSize;
    this.opacity = 1;
    this.ctx = ctx;
    this.strokeColor = `rgba(${Math.floor(rippleSettings.strokeColor[0])},
      ${Math.floor(rippleSettings.strokeColor[1])},
      ${Math.floor(rippleSettings.strokeColor[2])},
      ${this.opacity})`;
  
    this.animationSpeed = rippleSettings.animationSpeed;
    this.opacityStep = (this.animationSpeed / (this.maxSize - circleSize)) / 2;
  };
  
  Ripple.prototype = {
    update: function update() {
      this.circleSize = this.circleSize + this.animationSpeed;
      this.opacity = this.opacity - this.opacityStep;
      this.strokeColor = `rgba(${Math.floor(rippleSettings.strokeColor[0])},
        ${Math.floor(rippleSettings.strokeColor[1])},
        ${Math.floor(rippleSettings.strokeColor[2])},
        ${this.opacity})`;
    },
    draw: function draw() {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.arc(this.position.x, this.position.y, this.circleSize, 0,
        2 * Math.PI);
      this.ctx.stroke();
    },
    setStatus: function setStatus(status) {
      this.status = status;
    },
  };
  
  const canvas = document.querySelector('#canvas');
  const ctx = canvas.getContext('2d');
  const ripples = [];
  
  const height = document.body.clientHeight;
  const width = document.body.clientWidth;
  
  const rippleStartStatus = 'start';
  
  const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
  
  canvas.style.filter = `blur(${canvasSettings.blur}px)`;
  
  canvas.width = width * canvasSettings.ratio;
  canvas.height = height * canvasSettings.ratio;
  
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  let animationFrame;
  
  // Add GUI settings
  const addGuiSettings = () => {
    const gui = new dat.GUI();
    gui.add(rippleSettings, 'maxSize', 0, 1000).step(1);
    gui.add(rippleSettings, 'animationSpeed', 1, 30).step(1);
    gui.addColor(rippleSettings, 'strokeColor');
  
    const blur = gui.add(canvasSettings, 'blur', 0, 20).step(1);
    blur.onChange((value) => {
      canvas.style.filter = `blur(${value}px)`;
    });
  };
  
  //addGuiSettings();
  
  // Function which is executed on mouse hover on canvas
  const canvasMouseOver = (e) => {
    const x = e.clientX * canvasSettings.ratio;
    const y = e.clientY * canvasSettings.ratio;
    ripples.unshift(new Ripple(x, y, 2, ctx));
  };
  
  const animation = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const length = ripples.length;
    for (let i = length - 1; i >= 0; i -= 1) {
      const r = ripples[i];
  
      r.update();
      r.draw();
  
      if (r.opacity <= 0) {
        ripples[i] = null;
        delete ripples[i];
        ripples.pop();
      }
    }
    animationFrame = window.requestAnimationFrame(animation);
  };
  
  animation();
  canvas.addEventListener('mousemove', canvasMouseOver);
  
  
  // Global variable for tracking rain state
  let isRaining = false;
  
  // Control variables including dynamic spawn area and template selector.
  const rainControls = {
    baseDropDensity: 0.05, // Drops per pixel of container width (adjust as needed)
    fallDurationMin: 4000,       // in ms
    fallDurationMax: 8000,       // in ms
    lightningFlashDuration: 200, // in ms
    lightningDelayMin: 5000,     // in ms
    lightningDelayMax: 15000,    // in ms
    scaleMin: 0.5,               // Fixed scale factor for blossoms
    scaleMax: 0.5,               // Fixed scale factor for blossoms
    windMin: -20,                // Minimum horizontal drift (in pixels)
    windMax: 20,                 // Maximum horizontal drift (in pixels)
    rotationMin: -10,            // Minimum initial rotation (degrees)
    rotationMax: 10,             // Maximum initial rotation (degrees)
    rotationLiltMin: -100,          // Extra rotation for lilt (degrees)
    rotationLiltMax: 100,         // Extra rotation for lilt (degrees)
    templateSelector: '#cherryBlossomTemplate g',
    spawnWidth: 0,  // Will be updated dynamically
    spawnHeight: 0  // Will be updated dynamically
  };
  
  function updateContainer() {
    const container = document.querySelector('.rain');
    // Set container width to full window width
    const newWidth = window.innerWidth;
    // Set container height to full viewport height
    const newHeight = window.innerHeight;
    
    container.style.width = `${newWidth}px`;
    container.style.height = `${newHeight}px`;
    
    // Update spawn area in the control object.
    rainControls.spawnWidth = newWidth;
    // Allow drops to spawn a bit above and fall a bit below the container.
    rainControls.spawnHeight = newHeight + 50;
    
    // Adjust drop count based on container width (if desired).
    rainControls.dropCount = Math.floor(newWidth * rainControls.baseDropDensity);
    
    // If it's already raining, update the scene.
    if (isRaining) {
      container.innerHTML = "";
      generateRain(container);
    }
  }
  
  
  // Debounce helper to limit how often updateContainer runs during resize.
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  window.addEventListener('resize', debounce(updateContainer, 200));
  
  function generateRain(targetSVG) {
    targetSVG.innerHTML = "";
    // Get the template element from the hidden SVG.
    const template = document.querySelector(rainControls.templateSelector);
  
    for (let i = 0; i < rainControls.dropCount; i++) {
      // Calculate spawn positions based on container dimensions.
      let x = Math.random() * rainControls.spawnWidth;
      let startY = -Math.random() * 50;  // spawn a bit above the container
      let endY = rainControls.spawnHeight;
      
      let scale = gsap.utils.random(rainControls.scaleMin, rainControls.scaleMax);
      let initRotation = gsap.utils.random(rainControls.rotationMin, rainControls.rotationMax);
      let windOffset = gsap.utils.random(rainControls.windMin, rainControls.windMax);
      let extraRotation = gsap.utils.random(rainControls.rotationLiltMin, rainControls.rotationLiltMax);
      
      // Clone the cherry blossom template.
      let drop = template.cloneNode(true);
      targetSVG.appendChild(drop);
      
      // Set initial transform values.
      gsap.set(drop, { x: x, y: startY, scale: scale, rotation: initRotation });
      
      // Convert fall duration to seconds.
      let duration = gsap.utils.random(rainControls.fallDurationMin, rainControls.fallDurationMax) / 1000;
      
      // Animate falling motion with wind drift.
      gsap.to(drop, { 
        x: x + windOffset,
        y: endY,
        duration: duration,
        ease: "linear",
        repeat: -1,
        delay: Math.random()
      });
      
      // Animate continuous rotation (oscillate).
      gsap.to(drop, { 
        x: `-=${gsap.utils.random(30, 80)}`, // Moves left over time
        rotation: initRotation + extraRotation,
        duration: duration / 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: Math.random()
        
        
        
        
      });
    }
  }
  
  function toggleRain() {
    isRaining = !isRaining;
    gsap.to(document.querySelector('.rain-overlay'), { opacity: isRaining ? 1 : 0, duration: 0.5 });
    gsap.to(document.querySelector('.rain'), { opacity: isRaining ? 1 : 0, duration: 0.5 });
  
    if (isRaining) {
      generateRain(document.querySelector('.rain'));
      triggerLightning();
    } else {
      document.querySelector('.rain').innerHTML = "";
    }
  }
  
  function triggerLightning() {
    if (!isRaining) return;
    let delay = gsap.utils.random(rainControls.lightningDelayMin, rainControls.lightningDelayMax) / 1000;
    gsap.delayedCall(delay, () => {
      gsap.to(document.querySelector('.lightning-flash'), { 
        opacity: 1, 
        duration: 0.05, 
        onComplete: () => {
          gsap.to(document.querySelector('.lightning-flash'), { 
            opacity: 0, 
            duration: rainControls.lightningFlashDuration / 1000
          });
          triggerLightning();
        }
      });
    });
  }
  
  // Initial setup.
  updateContainer();
  toggleRain();
  
  
  
  
  
  
  
  const quoteLibrary = [ 
    "The next time someone needs me, they can find my atop the mountain, scamming orphans out of their money for karate lessons",
    "I should know this, I watched Yu-Gi-Oh growing up.",
    "Fear is the mind killer, it could kill me.",
    "The only hit point that matters is the last one.",
    "It could be some form of lexical degradation, unfortunately a more erudite expression escaped me.",
    "The problem is that reality, by default, does not validate benevolent ontological magic space cancer. it barely validates regular cancer.",
    "Human and hubris are damn near the same word.",
  "They're internal organs are, how we say,  cosmetic.",
    "A suprisingly profitable dojo for orphans"
  ];
  let max = quoteLibrary.length;
  console.log(Math.floor(Math.random() * max));
  const blockQuote = document.querySelector(".feature-1");
  blockQuote.textContent = quoteLibrary[Math.floor(Math.random() * max)];
  
  
  
  
  
    
  
  
  
  
  
  
  
  
  
  
  /************
  Dynamic Data
  ************/
  // define `theClockApp` stored in function to be ran
  const theClockApp = () => {
    // Get and store current date and time with `new Date()` object
    const timeNow = new Date();
    // Check-Check: See all `Date()` methods and properties
    // console.log( timeNow );
  
    // Get current hours
    let gotHours = timeNow.getHours();
    // Get current minutes
    let gotMinutes = timeNow.getMinutes();
    // Get current seconds
    let gotSeconds = timeNow.getSeconds();
  
    // Check-Check: Is the data correct?
    // console.log(gotHours, gotMinutes, gotSeconds);
  
    /************
  Format Data
  ************/
    // Get AM or PM
    const gotAmOrPM = gotHours >= 12 ? "pm" : "am";
    // Get 12 hour format
    gotHours = gotHours % 12 || 12;
    // Optionally, append zero to single digit hours
    gotHours = gotHours < 10 ? `0${gotHours}` : gotHours;
    // Optionally, append zero to single digit minutes
    gotMinutes = gotMinutes < 10 ? `0${gotMinutes}` : gotMinutes;
    // Optionally, append zero to single digit seconds
    gotSeconds = gotSeconds < 10 ? `0${gotSeconds}` : gotSeconds;
  
    /************
  Get DOM Elements
  ************/
    // Get Time
    const time = document.querySelector("time");
    // Get Hours
    const hours = document.querySelector(".hours");
    // Get minutes
    const minutes = document.querySelector(".minutes");
    // Get seconds
    const seconds = document.querySelector(".seconds");
    // Get AM or PM
    const amOrPM = document.querySelector(".amOrPM");
  
    /************
  Set DOM Elements
  ************/
    // Set the hours
    hours.innerText = gotHours;
    // Set the minutes
    minutes.innerText = gotMinutes;
    // Set the seconds
    seconds.innerText = gotSeconds;
    // Set AM or PM
    amOrPM.innerText = gotAmOrPM;
    // Set `datetime` attribute
    time.setAttribute("datetime", `${gotHours}:${gotMinutes}`);
  };
  
  /************
  Run App
  ************/
  // Re-run `theClockApp` every 1 second (1000 ms)
  setInterval(theClockApp, 1000);
  


// Streak of Days Library
// https://codepen.io/manikoth/pen/QwLYoKr.js

// Unit Test
const startDate = "1995-03-9";
const daysWithoutBernays = getDayStreak(startDate);
console.log( daysWithoutBernays );

// Get HTML element
const elem = document.querySelector('.streakOfDays');

// Set to HTML element
elem.textContent = daysWithoutBernays;
elem.setAttribute("datetime", daysWithoutBernays );  