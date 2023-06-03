let song;
let fft;
let img;
let particles = [];
let fileInput;

function preload() {
  img = loadImage('assets/abstract.gif');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  fft = new p5.FFT(0.3);
  img.filter(BLUR, 6);
  noLoop();

  fileInput = createFileInput(handleFile);
  fileInput.position(20, 20);
  fileInput.class('file-input');

  toggleFileInputVisibility();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  fft.analyze();
  const amp = fft.getEnergy(20, 200);

  push();
  if (amp > 230) {
    rotate(random(-0.5, 0.5));
  }
  image(img, 0, 0, width + 100, height + 100);
  pop();

  const alpha = map(amp, 0, 255, 180, 150);
  fill(0, alpha);
  noStroke();
  rect(0, 0, width, height);

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

  toggleFileInputVisibility();
}

function mouseClicked(event) {
  if (event.target !== fileInput.elt && song && song.isPlaying()) {
    song.pause();
    noLoop();
  } else if (event.target !== fileInput.elt && song) {
    song.play();
    loop();
  }
}

function handleFile(file) {
  if (song) {
    song.stop();
    song.disconnect();
  }
  song = loadSound(file, playSong);
}

function playSong() {
  song.play();
  loop();
}

function toggleFileInputVisibility() {
  if (!song || !song.isPlaying()) {
    fileInput.removeClass('hide');
  } else {
    fileInput.addClass('hide');
  }
}

class Particle {
  constructor() {
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.w = random(3, 5);
    this.color = [random(200, 255), random(200, 255), random(200, 255)];
  }

  update(cond) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (cond) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  edges() {
    return (
      this.pos.x < -width / 2 ||
      this.pos.x > width / 2 ||
      this.pos.y < -height / 2 ||
      this.pos.y > height / 2
    );
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}