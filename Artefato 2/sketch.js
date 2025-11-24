let cols = 20;
let rows = 12;
let tiles = [];
let revealed = [];
let tileW, tileH;

let mic;
let fft;

function setup() {
  createCanvas(800, 480);
  noStroke();

  // Inicia o microfone
  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);

  tileW = width / cols;
  tileH = height / rows;

  // Cria o mosaico proceduralmente
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      tiles.push({
        x: x * tileW,
        y: y * tileH,
        w: tileW,
        h: tileH,
        pattern: int(random(6)),
        c1: color(random(255), random(255), random(255)),
        c2: color(random(255), random(255), random(255))
      });
      revealed.push(false);
    }
  }
}

function draw() {
  background(20);

  for (let i = 0; i < tiles.length; i++) {
    let t = tiles[i];
    if (revealed[i]) {
      drawPattern(t);
    } else {
      fill(40);
      rect(t.x, t.y, t.w, t.h);
    }
  }

  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  text('Fale ou faça sons! Clique no mosaico — graves, médios e agudos mudam quantas formas aparecem 🎤', 10, 10);
}

function drawPattern(t) {
  push();
  translate(t.x, t.y);
  let w = t.w;
  let h = t.h;

  switch (t.pattern) {
    case 0:
      fill(t.c1);
      triangle(0, h, w / 2, 0, w, h);
      break;
    case 1:
      fill(t.c1);
      ellipse(w / 2, h / 2, w * 0.8, h * 0.8);
      break;
    case 2:
      fill(t.c1);
      rect(0, 0, w / 2, h);
      fill(t.c2);
      rect(w / 2, 0, w / 2, h);
      break;
    case 3:
      fill(t.c1);
      arc(w / 2, h / 2, w, h, 0, PI + QUARTER_PI, PIE);
      break;
    case 4:
      fill(t.c1);
      rect(w * 0.25, 0, w * 0.5, h);
      rect(0, h * 0.25, w, h * 0.5);
      break;
    case 5:
      for (let i = 0; i < 5; i++) {
        stroke(t.c1);
        strokeWeight(2);
        line(i * w / 5, 0, 0, i * h / 5);
      }
      noStroke();
      break;
  }
  pop();
}

function mousePressed() {
  let spectrum = fft.analyze();
  let low = fft.getEnergy(20, 150); // graves
  let mid = fft.getEnergy(150, 1000); // médios
  let high = fft.getEnergy(1000, 5000); // agudos

  let amount = 1;
  if (low > mid && low > high) amount = 3; // graves
  else if (mid > high && mid > low) amount = 2; // médios
  else amount = 1; // agudos

  // Pega os tiles ainda não revelados
  let hiddenTiles = [];
  for (let i = 0; i < tiles.length; i++) {
    if (!revealed[i]) hiddenTiles.push(i);
  }

  // Revela 'amount' tiles aleatoriamente
  for (let i = 0; i < amount && hiddenTiles.length > 0; i++) {
    let index = floor(random(hiddenTiles.length));
    revealed[hiddenTiles[index]] = true;
    hiddenTiles.splice(index, 1);
  }
}

