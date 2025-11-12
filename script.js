document.addEventListener('DOMContentLoaded', function() {

const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      document.getElementById('contactResult').textContent =
        'Köszi, ' + (name || 'barátom') + ' — a leveled elvitte a postagalambunk. (Demo, nincs backend.)';
      contactForm.reset();
    });
  }

const playfield = document.getElementById("playfield");
  if (playfield) {
    const scoreText = document.getElementById("score");
    const timeText = document.getElementById("time");
    const restartBtn = document.getElementById("restartBtn");

    let score = 0;
    let timeLeft = 60;
    let target;
    let timerInterval;
    let moveInterval;

    startGame();

    function startGame() {
      score = 0;
      timeLeft = 60;
      updateScore();
      updateTime();
      spawnTarget();

      timerInterval = setInterval(updateTime, 1000);
      moveInterval = setInterval(moveTarget, 800);
    }

    function spawnTarget() {
      if (target) target.remove();
      target = document.createElement("div");
      target.classList.add("target");
      playfield.appendChild(target);

      moveTarget();

      target.addEventListener("click", hitTarget);
      target.addEventListener("touchstart", hitTarget);
    }

    function moveTarget() {
      if (!target) return;
      const fieldSize = playfield.getBoundingClientRect();
      const size = parseInt(getComputedStyle(target).width);
      const x = Math.random() * (fieldSize.width - size);
      const y = Math.random() * (fieldSize.height - size);
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    }

    function hitTarget() {
      score++;
      updateScore();
      moveTarget();
    }

    function updateScore() {
      scoreText.textContent = `Score: ${score}`;
    }

    function updateTime() {
      timeLeft--;
      timeText.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }

    function endGame() {
      clearInterval(timerInterval);
      clearInterval(moveInterval);
      if (target) target.remove();

      const message = document.createElement("div");
      message.classList.add("muted");
      message.style.marginTop = "10px";
      message.innerHTML = `<strong>Time’s up!</strong> Final score: ${score}`;
      playfield.appendChild(message);

      // optional: visszalépés gomb
      const backBtn = document.createElement("a");
      backBtn.href = "index.html";
      backBtn.classList.add("btn");
      backBtn.textContent = "Back to Home";
      backBtn.style.marginTop = "10px";
      playfield.appendChild(backBtn);
    }

    restartBtn.addEventListener("click", () => {
      clearInterval(timerInterval);
      clearInterval(moveInterval);
      playfield.innerHTML = "";
      startGame();
    });
  }

});

