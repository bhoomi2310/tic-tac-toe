const boardEl = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const playerXScoreEl = document.getElementById("playerXScore");
const playerOScoreEl = document.getElementById("playerOScore");
const player1Label = document.getElementById("player1Label");
const player2Label = document.getElementById("player2Label");
const soundState = document.getElementById("soundState");

let currentPlayer = "X";
let board = Array(9).fill("");
let isGameActive = false;
let mode = "2p";
let soundEnabled = true;
let scores = { X: 0, O: 0 };
let playerNames = { X: "Player X", O: "Player O" };

const moveSound = new Audio("button.mp3");
const winSound = new Audio("win.mp3");

function label(player) {
  return playerNames[player] || player;
}

function startGame(selectedMode) {
  mode = selectedMode;
  playerNames.X = document.getElementById("playerXName").value || "Player X";
  playerNames.O = document.getElementById("playerOName").value || (mode === "ai" ? "AI" : "Player O");

  player1Label.textContent = `${label("X")}:`;
  player2Label.textContent = `${label("O")}:`;

  scores = loadScores(mode);
  updateScoreDisplay();

  resetBoard();
  isGameActive = true;
  if (currentPlayer === "O" && mode === "ai") aiMove();
}

function handleClick(e) {
  const index = +e.target.dataset.index;
  handleMove(index);
}

function handleMove(index) {
  if (!isGameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  playSound(moveSound);

  if (checkWinner(currentPlayer)) {
    statusText.textContent = `${label(currentPlayer)} Wins! 🎉`;
    highlightWin(currentPlayer);
    playSound(winSound);
    scores[currentPlayer]++;
    saveScores();
    updateScoreDisplay();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    isGameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw!";
    isGameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${label(currentPlayer)}'s Turn`;

  if (mode === "ai" && currentPlayer === "O") {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  const bestMove = getBestMove();
  if (bestMove !== -1) {
    playSound(moveSound);
    handleMove(bestMove);
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = -1;
  board.forEach((cell, i) => {
    if (cell === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  });
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWinner("O")) return 10 - depth;
  if (checkWinner("X")) return depth - 10;
  if (!newBoard.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    newBoard.forEach((cell, i) => {
      if (cell === "") {
        newBoard[i] = "O";
        best = Math.max(best, minimax(newBoard, depth + 1, false));
        newBoard[i] = "";
      }
    });
    return best;
  } else {
    let best = Infinity;
    newBoard.forEach((cell, i) => {
      if (cell === "") {
        newBoard[i] = "X";
        best = Math.min(best, minimax(newBoard, depth + 1, true));
        newBoard[i] = "";
      }
    });
    return best;
  }
}

function resetBoard() {
  board = Array(9).fill("");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win");
  });
  currentPlayer = "X";
  statusText.textContent = `${label(currentPlayer)}'s Turn`;
  isGameActive = true;
  if (mode === "ai" && currentPlayer === "O") aiMove();
}

function highlightWin(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  wins.forEach(pattern => {
    if (pattern.every(i => board[i] === player)) {
      pattern.forEach(i => cells[i].classList.add("win"));
    }
  });
}

function checkWinner(p) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winPatterns.some(pattern => pattern.every(i => board[i] === p));
}

function saveScores() {
  localStorage.setItem(`ttt_scores_${mode}`, JSON.stringify(scores));
}

function loadScores() {
  return JSON.parse(localStorage.getItem(`ttt_scores_${mode}`)) || { X: 0, O: 0 };
}

function updateScoreDisplay() {
  playerXScoreEl.textContent = scores["X"];
  playerOScoreEl.textContent = scores["O"];
}

function resetScores() {
  scores = { X: 0, O: 0 };
  saveScores();
  updateScoreDisplay();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundState.textContent = soundEnabled ? "ON" : "OFF";
}

function playSound(sound) {
  if (soundEnabled) {
    sound.currentTime = 0;
    sound.play();
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

cells.forEach(cell => cell.addEventListener("click", handleClick));
