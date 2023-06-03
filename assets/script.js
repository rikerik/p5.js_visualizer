let song;
let fft;
let img;
let particles = [];
let fileInput;
let cursorVisible = true;
let cursorTimeout;

function preload() {
  // Preload the image file
  img = loadImage('assets/abstract.gif');
}

function setup() {
  // Set up the canvas and initial settings
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  fft = new p5.FFT(0.3);
  img.filter(BLUR, 6);
  noLoop();

  // Create a file input element for handling audio files
  fileInput = createFileInput(handleFile);
  fileInput.position(20, 20);
  fileInput.class('file-input');

  // Initially show or hide the file input based on audio playback
  toggleFileInputVisibility();

  // Add event listener for mouse movement
  document.addEventListener("mousemove", resetCursorVisibilityTimer);

  // Hide the cursor initially
  hideCursor();

}

function windowResized() {
  // Resize the canvas when the window size changes
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Main draw loop
  background(0);
  translate(width / 2, height / 2);

  // Analyze the audio frequencies
  fft.analyze();
  const amp = fft.getEnergy(20, 200);

  // Rotate and display the background image based on audio amplitude
  push();
  if (amp > 230) {
    rotate(random(-0.5, 0.5));
  }
  image(img, 0, 0, width + 100, height + 100);
  pop();

  // Create a translucent rectangle overlay based on audio amplitude
  const alpha = map(amp, 0, 255, 180, 150);
  fill(0, alpha);
  noStroke();
  rect(0, 0, width, height);

  // Draw waveform lines based on audio frequencies
  stroke(255);
  strokeWeight(3);
  noFill();
  const wave = fft.waveform();
  for (let t = -1; t <= 1; t += 2) {
    beginShape();
    for (let i = 0; i <= 180; i += 0.5) {
      const index = floor(map(i, 0, 180, 0, wave.length - 1));
      const r = map(wave[index], -1, 1, 150, 350);
      const x = r * sin(i) * t;
      const y = r * cos(i);
      vertex(x, y);
    }
    endShape();
  }

  // Create and update particles based on audio amplitude
  const p = new Particle();
  particles.push(p);
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].edges()) {
      particles[i].update(amp > 230);
      particles[i].show();
    } else {
      particles.splice(i, 1);
    }
  }

  // Toggle visibility of the file input based on audio playback
  toggleFileInputVisibility();
}

function mouseClicked(event) {
  // Handle mouse click event to play or pause the audio
  if (event.target !== fileInput.elt && song && song.isPlaying()) {
    song.pause();
    noLoop();
  } else if (event.target !== fileInput.elt && song) {
    song.play();
    loop();
  }
}

function handleFile(file) {
  // Handle the selected audio file
  if (song) {
    song.stop();
    song.disconnect();
  }
  song = loadSound(file, playSong);
}

function playSong() {
  // Play the loaded audio
  song.play();
  loop();
}

function toggleFileInputVisibility() {
  // Toggle visibility of the file input based on audio playback
  if (!song || !song.isPlaying()) {
    fileInput.removeClass('hide');
  } else {
    fileInput.addClass('hide');
  }
}

class Particle {
  constructor() {
    // Initialize the particle properties
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.w = random(3, 5);
    this.color = [random(200, 255), random(200, 255), random(200, 255)];
  }

  update(cond) {
    // Update the particle's position and velocity based on audio amplitude
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (cond) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  edges() {
    // Check if the particle is out of the canvas boundaries
    return (
      this.pos.x < -width / 2 ||
      this.pos.x > width / 2 ||
      this.pos.y < -height / 2 ||
      this.pos.y > height / 2
    );
  }

  show() {
    // Display the particle on the canvas
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}

function resetCursorVisibilityTimer() {
  // Reset cursor visibility timer
  showCursor(); // Show the cursor
  clearTimeout(cursorTimeout);
  cursorTimeout = setTimeout(hideCursor, 3000); // Hide cursor after 3 seconds
}

function hideCursor() {
  // Hide the cursor
  if (cursorVisible) {
    document.body.style.cursor = "none";
    cursorVisible = false;
  }
}

function showCursor() {
  // Show the cursor
  if (!cursorVisible) {
    document.body.style.cursor = "auto";
    cursorVisible = true;
  }
}