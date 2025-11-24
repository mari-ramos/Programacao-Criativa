// ==========================================
// PONG DINÂMICO: MUSIC FINAL EDITION 
// ==========================================
// Controles: 
// Jogador 1: W / S
// Jogador 2: SETA CIMA / SETA BAIXO
// ==========================================

// --- Variáveis Globais ---
let ball, ballVel;
let leftPaddle, rightPaddle;
let obstacles = [];
let spawnTimer = 0;

// Áudio e Análise
let songs = [];       // Array para guardar os arquivos de som
let currentSound = null; 
let fft;              // Analisador de frequências (graves/agudos)
let amplitude;        // Analisador de volume (força)

// Estado do Jogo
let gameStartTime;
let songTimer = 0;
let currentSongConfig = null;
let gameStarted = false; // Trava para esperar o clique inicial

// Tela inicial - Nome dos Jogadores - apaguei songselector
let player1NameInput, player2NameInput;
let player1Name = "P1";
let player2Name = "P2";

// Placar
let scoreP1 = 0;
let scoreP2 = 0;

let gameEnded = false;
let winner = "";

let showRules = false;
let rulesEndTime = 0;

// Configurações das Raquetes
const INITIAL_PADDLE_H = 110;
const MIN_PADDLE_H = 40; 

// --- Configuração da Playlist ---
// Define as características de cada nível baseado na música
const playlist = [
  { 
    id: 0, // Carrega songs[0] -> musica1
    name: "quirky_goblins.ogg",
    displayName: "Quirky Goblins",
    ballSpeedMult: 4.5, 
    spawnRate: 100, 
    theme: { r: 20, g: 40, b: 60 } // Cor base do fundo
  },
  { 
    id: 1, // Carrega songs[1] -> musica2
    name: "funky_pixel_town.mp3",
    displayName: "Funky Pixel Town",
    ballSpeedMult: 7.0, 
    spawnRate: 60, 
    theme: { r: 60, g: 20, b: 30 } 
  },
  { 
    id: 2, // Carrega songs[2] -> musica3
    name: "coin-op_shenanigans.ogg",
    displayName: "Coin-Op Shenanigans",
    ballSpeedMult: 9.0, 
    spawnRate: 25, 
    theme: { r: 10, g: 10, b: 20 } 
  },
  { 
    id: 3,// Carrega songs[3]-> musica4
    name: "mossy_grotto.mp3",
    displayName: "Mossy Grotto",
    ballSpeedMult: 9.0, 
    spawnRate: 25, 
    theme: { r: 10, g: 10, b: 20 } 
  },
  { 
    id: 4,// Carrega songs[4]-> musica5 
    name: "the_monster_factory_looping.ogg",
    displayName: "Monster Factory",
    ballSpeedMult: 9.0, 
    spawnRate: 25, 
    theme: { r: 10, g: 10, b: 20 } 
  }
];

function preload() {
  // Aceita arquivos de áudio .mp3 ou .ogg
  songs[0] = loadSound('quirky_goblins.ogg');
  songs[1] = loadSound('funky_pixel_town.mp3');
  songs[2] = loadSound('coin-op_shenanigans.ogg');
  songs[3] = loadSound('mossy_grotto.mp3');
  songs[4] = loadSound('the_monster_factory_looping.ogg');
}

// nova funcao - tela inicial
function startGame() {
  userStartAudio();

  player1Name = player1NameInput.value();
  player2Name = player2NameInput.value();

  showRules = true;              // ativa tela de regras
  rulesEndTime = millis() + 5000; // 5 segundos de regras

  // esconde UI
  player1NameInput.hide();
  player2NameInput.hide();
  startButton.hide();

  loop();
}

function startActualGameplay() {
  // agora sim escolhe música, inicia timers etc.
  currentSongConfig = random(playlist);
  currentSound = songs[currentSongConfig.id];
  currentSound.play();

  let dur = currentSound.duration() * 1000;
  if (dur === 0) dur = 30000;
  songTimer = millis() + dur;
  
  gameStarted = true;
  gameStartTime = millis();
}

function setup() {
  createCanvas(960, 540);
  rectMode(CENTER);
  angleMode(RADIANS);
  noStroke();
  
  // Inicializa analisadores
  fft = new p5.FFT(0.8, 64); // Suavização e bins
  amplitude = new p5.Amplitude();

  // Inicializa posições
  leftPaddle = { x: 48, y: height / 2, w: 14, h: INITIAL_PADDLE_H };
  rightPaddle = { x: width - 48, y: height / 2, w: 14, h: INITIAL_PADDLE_H };
  ball = createVector(width / 2, height / 2);
  ballVel = p5.Vector.random2D(); 
  
  // Pausa o loop até o usuário interagir
  noLoop();
  
  // --- Interface da Tela Inicial ---
  textAlign(CENTER, CENTER);

  // Nome do Jogador 1
  player1NameInput = createInput("Jogador 1 (W/S)");
  player1NameInput.position(width/2 - 90, height/2 - 80);
  player1NameInput.size(180);

  // Nome do Jogador 2
  player2NameInput = createInput("Jogador 2 (↑/↓)");
  player2NameInput.position(width/2 - 90, height/2 - 40);
  player2NameInput.size(180);


// novo - apaguei

// Botão Iniciar
  startButton = createButton("🎵 Iniciar Jogo 🎮");
  startButton.position(width/2 - 70, height/2 + 10);
  startButton.size(140, 40);
  startButton.mousePressed(startGame);

  }

function draw() {
  // Tela de "Clique para começar"
  
  if (!gameStarted) {
    background(0);
    fill(255);
    textSize(40);
    text("PONG DINÂMICO: MUSIC FINAL EDITION ", width / 2, height / 2 - 150);

    textSize(22);
    text("Digite seu nome e clique em Iniciar.", 
         width / 2, height / 2 - 110);
    // --- TELA DE REGRAS DEPOIS DO INICIAR ---
  if (showRules) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);

    textSize(42);
    text("REGRAS DO JOGO", width/2, height/2 - 120);

    textSize(26);
    text("• 15 pontos quando a bola passa pela raquete do oponente\n" +
         "• 1 ponto quando você rebate a bola com sua raquete\n" +
         "• Vence quem alcançar 100 pontos primeiro!", 
         width/2, height/2);

    textSize(18);
    fill(200);
    let restante = floor((rulesEndTime - millis()) / 1000);
    text("O jogo começará em " + restante + " segundos...", width/2, height/2 + 150);

    // já acabou o tempo?
    if (millis() > rulesEndTime) {
      showRules = false;
      startActualGameplay();
    }

    return;
  }

    return;
}

  if (gameEnded) {
    drawEndScreen();
    return;
}

  // --- 1. Análise de Áudio ---
  let spectrum = fft.analyze(); 
  let bassEnergy = fft.getEnergy("bass"); // 0 a 255
  let trebleEnergy = fft.getEnergy("treble"); // 0 a 255
  let level = amplitude.getLevel(); // 0.0 a 1.0 (Volume total)

  // --- 2. Fundo Reativo ---
  // Mistura a cor do tema com a batida dos graves
  // Se o grave for forte, o fundo clareia um pouco na cor do tema
  let bgR = map(bassEnergy, 0, 255, currentSongConfig.theme.r, currentSongConfig.theme.r + 60);
  let bgG = map(bassEnergy, 0, 255, currentSongConfig.theme.g, currentSongConfig.theme.g + 60);
  let bgB = map(bassEnergy, 0, 255, currentSongConfig.theme.b, currentSongConfig.theme.b + 80);
  background(bgR, bgG, bgB);

  // --- 3. Lógica do Jogo ---
  manageMusicAndDifficulty();
  
  // Diminuir Raquete com o Tempo
  let timePlayed = millis() - gameStartTime;
  let minutes = timePlayed / 60000;
  let currentH = max(MIN_PADDLE_H, INITIAL_PADDLE_H - (minutes * 20));
  leftPaddle.h = currentH;
  rightPaddle.h = currentH;

  // Movimento
  movePaddles();
  
  // Bola
  ball.add(ballVel);
  if (ball.y < 10) { ball.y = 10; ballVel.y *= -1; }
  else if (ball.y > height - 10) { ball.y = height - 10; ballVel.y *= -1; }
  
  // Pontuação quando a bola passa das raquetes
  if (ball.x < 0) {
    scoreP2 += 15;   // Gol do jogador 2
    resetBall();
}

  if (ball.x > width) {
    scoreP1 += 15;   // Gol do jogador 1
    resetBall();
}

// --- VERIFICA SE ACABOU ---
  if (scoreP1 >= 100 || scoreP2 >= 100) {
     winner = scoreP1 >= 100 ? player1Name : player2Name;
    endGame();
}

  // --- 4. Desenho dos Elementos Reativos ---
  
  // Calcula o "Pulsar" baseado no volume (para os obstáculos)
  let pulseSize = map(level, 0, 0.5, 1.0, 2.0); // Se volume alto, dobra o tamanho visual
  pulseSize = constrain(pulseSize, 1.0, 2.5);

  updateAndDrawObstacles(pulseSize, trebleEnergy);
  
  checkPaddleCollision();

  // Desenha Raquetes
  fill(220);
  rect(leftPaddle.x, leftPaddle.y, leftPaddle.w, leftPaddle.h, 6);
  rect(rightPaddle.x, rightPaddle.y, rightPaddle.w, rightPaddle.h, 6);

  // Desenha Bola que brilha com o som
  push();
  translate(ball.x, ball.y);
  let ballColor = map(bassEnergy, 0, 255, 200, 255);
  fill(255, ballColor, 100);
  ellipse(0, 0, 20 + (level * 20)); // Bola pulsa levemente também
  pop();

  drawHUD();
}

// --- Gerenciamento de Música ---
function manageMusicAndDifficulty() {
  if (millis() > songTimer) {
    changeTrack();
  }
}

function changeTrack() {
  // Para a anterior
  if (currentSound && currentSound.isPlaying()) {
    currentSound.stop();
  }
  
  // Nova escolha aleatória
  currentSongConfig = random(playlist);
  currentSound = songs[currentSongConfig.id];
  
  // Toca
  currentSound.play();
  
  // Define duração - padrão 30s
  let dur = currentSound.duration() * 1000;
  if (dur === 0) dur = 30000;
  songTimer = millis() + dur;
  
  // Aplica dificuldade física
  ballVel.setMag(currentSongConfig.ballSpeedMult);
  
  console.log("Tocando: " + currentSongConfig.name);
}

// --- Controles ---
function movePaddles() {
  const speed = 8;
  // Player 1 (W/S)
  if (keyIsDown(87)) leftPaddle.y -= speed;
  if (keyIsDown(83)) leftPaddle.y += speed;
  // Player 2 (Setas)
  if (keyIsDown(UP_ARROW)) rightPaddle.y -= speed;
  if (keyIsDown(DOWN_ARROW)) rightPaddle.y += speed;
  
  // Constrain
  leftPaddle.y = constrain(leftPaddle.y, leftPaddle.h/2 + 5, height - leftPaddle.h/2 - 5);
  rightPaddle.y = constrain(rightPaddle.y, rightPaddle.h/2 + 5, height - rightPaddle.h/2 - 5);
}

// --- Obstáculos e Colisão ---
function updateAndDrawObstacles(pulseMult, trebleColorVal) {
  // Update Physics
  for (let obs of obstacles) {
    obs.phase += 0.02;
    // Movimento orgânico
    obs.x += obs.vx * (0.6 + 0.4 * sin(obs.phase));
    obs.y += obs.vy * (0.6 + 0.4 * cos(obs.phase));

    // Paredes
    if (obs.x < 100) { obs.x = 100; obs.vx *= -1; }
    if (obs.x > width - 100) { obs.x = width - 100; obs.vx *= -1; }
    if (obs.y < 40) { obs.y = 40; obs.vy *= -1; }
    if (obs.y > height - 40) { obs.y = height - 40; obs.vy *= -1; }

    obs.life--;
    obs.alpha = constrain(map(obs.life, 0, obs.maxLife, 0, 1), 0, 1);
    
    checkObstacleCollision(obs);

    // --- DESENHO VISUAL ---
    push();
    translate(obs.x, obs.y);
    rotate(obs.phase * 0.3);
    
    // Escala reativa ao som 
    let s = (0.7 + 0.6 * obs.alpha) * pulseMult;
    scale(s);

    // Cor reativa aos agudos (trebleColorVal vem do FFT)
    // Agudos altos deixam obstáculos mais "elétricos" (ciano/branco)
    // Agudos baixos deixam eles mais opacos/escuros
    let r = map(trebleColorVal, 0, 255, 50, 255);
    let g = map(trebleColorVal, 0, 255, 100, 255);
    let b = 200;
    
    fill(r, g, b, floor(220 * obs.alpha));

    if (obs.type === "circle") ellipse(0, 0, obs.size);
    else if (obs.type === "rect") rect(0, 0, obs.size, obs.size, 8);
    else if (obs.type === "triangle") {
      beginShape();
      vertex(0, -obs.size/2); vertex(-obs.size/2, obs.size/2); vertex(obs.size/2, obs.size/2);
      endShape(CLOSE);
    }
    pop();
  }
  
  // Limpa e Spawna
  obstacles = obstacles.filter(o => o.life > 0);
  spawnTimer++;
  if (spawnTimer > currentSongConfig.spawnRate) { 
    if (random() < 0.8) spawnObstacle();
    spawnTimer = 0;
  }
}

function checkObstacleCollision(obs) {
    if (obs.type === "circle") {
      const d = dist(ball.x, ball.y, obs.x, obs.y);
      const minDist = obs.size / 2 + 10; // +10 é o raio da bola
      if (d < minDist && d > 0.0001) {
        let normal = createVector(ball.x - obs.x, ball.y - obs.y).normalize();
        let dot = ballVel.dot(normal);
        ballVel.sub(p5.Vector.mult(normal, 2 * dot));
        ball.add(p5.Vector.mult(normal, (minDist - d) + 0.5));
      }
    } else if (obs.type === "rect") {
       const half = obs.size / 2;
       if (ball.x > obs.x - half && ball.x < obs.x + half &&
           ball.y > obs.y - half && ball.y < obs.y + half) {
         const dx = min(ball.x - (obs.x - half), (obs.x + half) - ball.x);
         const dy = min(ball.y - (obs.y - half), (obs.y + half) - ball.y);
         if (dx < dy) {
           ballVel.x *= -1;
           ball.x = (ball.x < obs.x) ? obs.x - half - 10 : obs.x + half + 10;
         } else {
           ballVel.y *= -1;
           ball.y = (ball.y < obs.y) ? obs.y - half - 10 : obs.y + half + 10;
         }
       }
    } else if (obs.type === "triangle") {
       const d = dist(ball.x, ball.y, obs.x, obs.y);
       const minDist = obs.size * 0.45 + 10;
       if (d < minDist) {
         let normal = createVector(ball.x - obs.x, ball.y - obs.y).normalize();
         let dot = ballVel.dot(normal);
         ballVel.sub(p5.Vector.mult(normal, 2 * dot));
         ball.add(p5.Vector.mult(normal, (minDist - d) + 0.5));
       }
    }
}

function checkPaddleCollision() {
  // Colisão com a raquete da ESQUERDA (Jogador 1)
  if (ball.x - 10 < leftPaddle.x + leftPaddle.w / 2 && ball.x > leftPaddle.x - leftPaddle.w/2) {
    if (ball.y > leftPaddle.y - leftPaddle.h / 2 && ball.y < leftPaddle.y + leftPaddle.h / 2) {

      // rebate
      ball.x = leftPaddle.x + leftPaddle.w / 2 + 10;
      ballVel.x = abs(ballVel.x); 
      let hitFactor = (ball.y - leftPaddle.y) / (leftPaddle.h / 2);
      ballVel.y += hitFactor * 2; 
      ballVel.setMag(currentSongConfig.ballSpeedMult);

      // +1 ponto por defesa
      scoreP1 += 1;
    }
  }

  // Colisão com a raquete da DIREITA (Jogador 2)
  if (ball.x + 10 > rightPaddle.x - rightPaddle.w / 2 && ball.x < rightPaddle.x + rightPaddle.w/2) {
    if (ball.y > rightPaddle.y - rightPaddle.h / 2 && ball.y < rightPaddle.y + rightPaddle.h / 2) {

      // rebate
      ball.x = rightPaddle.x - rightPaddle.w / 2 - 10;
      ballVel.x = -abs(ballVel.x);
      let hitFactor = (ball.y - rightPaddle.y) / (rightPaddle.h / 2);
      ballVel.y += hitFactor * 2;
      ballVel.setMag(currentSongConfig.ballSpeedMult);

      // +1 ponto por defesa
      scoreP2 += 1;
    }
  }
}

function spawnObstacle() {
  let types = ["circle", "rect", "triangle"];
  let type = random(types);
  let x = random(180, width - 180);
  let y = random(60, height - 60);
  let size = random(30, 70);
  let speed = random(0.5, 1.5);
  let ang = random(TWO_PI);
  
  obstacles.push({
    type: type, x: x, y: y, size: size,
    vx: speed * cos(ang), vy: speed * sin(ang),
    phase: random(TWO_PI),
    life: int(random(300, 600)), 
    maxLife: 600, alpha: 0
  });
}

function resetBall() {
  ball.set(width / 2, height / 2);
  ballVel = p5.Vector.random2D();
  ballVel.setMag(currentSongConfig.ballSpeedMult);
  obstacles = [];
}

function endGame() {
  gameEnded = true;

  // para a música atual
  if (currentSound && currentSound.isPlaying()) {
    currentSound.stop();
  }

  // toca musiquinha de vitória
  let osc = new p5.Oscillator("sine");
  osc.freq(220);
  osc.amp(0.25, 1);
  osc.start();
  osc.stop(2.5);

  // só pausa depois de desenhar 1 frame com a tela final
  setTimeout(() => noLoop(), 50);

}


function drawHUD() {
  fill(255);
  textSize(20);
  textAlign(CENTER, TOP);

  // --- PLACAR ---
  text(player1Name + ": " + scoreP1 + "   |   " + scoreP2 + " : " + player2Name, 
       width/2, 40);

  // Música atual
  textSize(14);
  let tName = currentSongConfig ? currentSongConfig.displayName : "Carregando...";
  text("Faixa: " + tName, width/2, 10);
  
  // Tempo
  textAlign(LEFT, BOTTOM);
  let tempo = floor((millis()-gameStartTime)/1000);
  text("Tempo: " + tempo + "s", 10, height - 10);
}

function drawEndScreen() {
  background(0);

  textAlign(CENTER, CENTER);

  textSize(72);
  fill((frameCount * 2) % 255, 150, 255);
  text("🏁 FIM DE JOGO 🏁", width/2, height/2 - 120);

  textSize(40);
  fill(255);
  text("Vencedor: " + winner, width/2, height/2 - 40);

  textSize(26);
  text(`${player1Name}: ${scoreP1} pts   |   ${player2Name}: ${scoreP2} pts`,
       width/2, height/2 + 10);

  textSize(20);
  fill(200);
  text("Pressione ENTER para voltar ao menu", width/2, height/2 + 120);
}

function keyPressed() {
  if (gameEnded && keyCode === ENTER) {
    resetToMenu();
  }
}

function resetToMenu() {
  scoreP1 = 0;
  scoreP2 = 0;
  winner = "";
  gameEnded = false;
  gameStarted = false;

  // mostra inputs
  player1NameInput.show();
  player2NameInput.show();
  startButton.show();

  loop();
}


