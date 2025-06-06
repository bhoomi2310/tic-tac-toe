const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const modeToggle = document.getElementById('modeToggle');
const aiModeBtn = document.getElementById('aiMode');
const twoPlayerModeBtn = document.getElementById('twoPlayerMode');
const soundToggleBtn = document.getElementById('soundToggle');

const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const playerXScoreEl = document.getElementById('playerXScore');
const playerOScoreEl = document.getElementById('playerOScore');
const label1 = document.getElementById('player1Label');
const label2 = document.getElementById('player2Label');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = false;
let mode = ""; // "ai" or "2p"
let scores = { X: 0, O: 0 };
let soundOn = true;

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function playSound(sound) {
  if (soundOn) {
    sound.currentTime = 0;
    sound.play().catch(err => {});
  }
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!isGameActive || board[index] !== "") return;

  makeMove(index, currentPlayer);
  playSound(clickSound);

  const winIndices = getWinningIndices(currentPlayer);
  if (winIndices) {
    animateWin(winIndices);

    statusText.textContent = `${label(currentPlayer)} Wins! 🎉`;
    playSound(winSound);
    scores[currentPlayer]++;
    saveScores();
    updateScoreDisplay();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    isGameActive = false;
    return;
  }

  if (board.every(cell => cell !== "")) {
    statusText.textContent = "It's a Draw!";
    isGameActive = false;
    return;
  }

  if (mode === "ai" && currentPlayer === "X") {
    currentPlayer = "O";
    statusText.textContent = "AI's Turn";
    setTimeout(aiMove, 500);
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${label(currentPlayer)}'s Turn`;
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
}

function aiMove() {
  if (!isGameActive) return;

  const emptyIndices = board.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);
  const index = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  makeMove(index, "O");
  playSound(clickSound);

  if (checkWinner("O")) {
    statusText.textContent = "AI Wins! 🤖";
    scores.O++;
    saveScores();
    updateScoreDisplay();
    playSound(winSound);
    isGameActive = false;
    return;
  }

  if (board.every(cell => cell !== "")) {
    statusText.textContent = "It's a Draw!";
    isGameActive = false;
    return;
  }

  currentPlayer = "X";
  statusText.textContent = "Your Turn";
}

function checkWinner(player) {
  return winningConditions.some(condition => {
    return condition.every(index => board[index] === player);
  });
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  isGameActive = mode !== "";
  currentPlayer = "X";
  statusText.textContent = isGameActive ? `${label(currentPlayer)}'s Turn` : "Select a Mode";

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win-animate"); 
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function toggleSound() {
  soundOn = !soundOn;
  soundToggleBtn.textContent = soundOn ? "🔊 Sound: ON" : "🔇 Sound: OFF";
}

function label(player) {
  const nameX = document.getElementById("nameX").value || "Player X";
  const nameO = document.getElementById("nameO").value || (mode === "ai" ? "AI" : "Player O");
  return player === "X" ? nameX : nameO;
}


function startGame(selectedMode) {
  mode = selectedMode;
  scores = loadScores(mode);
  updateScoreDisplay();

  label1.textContent = `${label("X")}:`;
  label2.textContent = `${label("O")}:`;

  restartGame();
}


function resetScores() {
  scores = { X: 0, O: 0 };
  updateScoreDisplay();
  localStorage.removeItem(`tictactoe-${mode}-scores`);
}


function updateScoreDisplay() {
  playerXScoreEl.textContent = scores.X ?? 0;
  playerOScoreEl.textContent = scores.O ?? 0;
}

function saveScores() {
  if (mode) {
    localStorage.setItem(`tictactoe-${mode}-scores`, JSON.stringify(scores));
  }
}

function loadScores(selectedMode) {
  const stored = localStorage.getItem(`tictactoe-${selectedMode}-scores`);
  return stored ? JSON.parse(stored) : { X: 0, O: 0 };
}




cells.forEach(cell => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', restartGame);
modeToggle.addEventListener('click', toggleDarkMode);
soundToggleBtn.addEventListener('click', toggleSound);
resetScoreBtn.addEventListener('click', resetScores);
aiModeBtn.addEventListener('click', () => startGame("ai"));
twoPlayerModeBtn.addEventListener('click', () => startGame("2p"));


function getWinningIndices(player) {
  for (const condition of winningConditions) {
    if (condition.every(i => board[i] === player)) {
      return condition;
    }
  }
  return null;
}

function animateWin(indices) {
  indices.forEach(i => {
    cells[i].classList.add('win-animate');
  });
}
