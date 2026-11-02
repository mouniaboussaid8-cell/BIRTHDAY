// --- DONNÉES DU QUIZ (Réponses libres) ---
const quizData = [
  {
    question: "Quel est mon film préféré ?",
    answers: ["harry potter", "harry-potter"]
  },
  {
    question: "Quel est mon goût de glace préféré ?",
    answers: ["cantaloupe", "melon"]
  },
  {
    question: "Quel est le nom de mon cheval préféré ?",
    answers: ["luna"]
  }
];

let currentQuizIndex = 0;
let heartScore = 0;

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", () => {
  setDialogue("La date du jour où ta préférée est née... ❤️");
});

function setDialogue(text) {
  document.getElementById("dialogue-text").innerText = text;
}

// --- JEU 1 : CODE SECRET ---
function checkCode() {
  const input = document.getElementById("passcode-input").value.trim();
  if (input === "31/12" || input === "3112") {
    document.getElementById("code-error").innerText = "";
    document.getElementById("game-1").classList.remove("active-screen");
    document.getElementById("game-1").classList.add("hidden-screen");
    
    document.getElementById("game-2").classList.remove("hidden-screen");
    document.getElementById("game-2").classList.add("active-screen");
    
    loadQuizQuestion();
  } else {
    document.getElementById("code-error").innerText = "Oups ! Mauvais code... Réessaie 🙈";
  }
}

// --- JEU 2 : QUIZ (Champs de texte libres) ---
function loadQuizQuestion() {
  const current = quizData[currentQuizIndex];
  setDialogue(`Question ${currentQuizIndex + 1} ! Montre-moi que tu me connais bien 😉`);
  document.getElementById("quiz-step").innerText = currentQuizIndex + 1;
  document.getElementById("quiz-question-text").innerText = current.question;
  
  const optionsDiv = document.getElementById("quiz-options");
  optionsDiv.innerHTML = `
    <input type="text" id="quiz-text-input" placeholder="Ta réponse ici..." autocomplete="off">
    <button onclick="checkQuizAnswer()">Valider ma réponse ❤️</button>
  `;
}

function checkQuizAnswer() {
  const userInput = document.getElementById("quiz-text-input").value.toLowerCase().trim();
  const current = quizData[currentQuizIndex];
  
  if (current.answers.includes(userInput)) {
    document.getElementById("quiz-error").innerText = "";
    currentQuizIndex++;
    
    if (currentQuizIndex < quizData.length) {
      loadQuizQuestion();
    } else {
      document.getElementById("game-2").classList.remove("active-screen");
      document.getElementById("game-2").classList.add("hidden-screen");
      
      document.getElementById("game-3").classList.remove("hidden-screen");
      document.getElementById("game-3").classList.add("active-screen");
      
      startHeartGame();
    }
  } else {
    document.getElementById("quiz-error").innerText = "Mmmh non, ce n'est pas ça ! Réessaie 😜";
  }
}

// --- JEU 3 : ATTRAPE LES CŒURS QUI TOMBENT ---
function startHeartGame() {
  setDialogue("Dernière étape ! Attrape 5 cœurs en mouvement 💖");
  heartScore = 0;
  document.getElementById("score-count").innerText = heartScore;
  
  for (let i = 0; i < 3; i++) {
    setTimeout(spawnFallingHeart, i * 800);
  }
}

function spawnFallingHeart() {
  if (heartScore >= 5) return;
  
  const area = document.getElementById("tap-game-area");
  const heart = document.createElement("div");
  heart.className = "falling-heart";
  heart.innerText = "💖";
  
  const randomX = Math.floor(Math.random() * (area.clientWidth - 40));
  heart.style.left = randomX + "px";
  heart.style.top = "-30px";
  
  const duration = 2 + Math.random() * 2;
  heart.style.animationDuration = duration + "s";
  
  heart.onclick = (e) => {
    e.stopPropagation();
    heartScore++;
    document.getElementById("score-count").innerText = heartScore;
    heart.remove();
    
    if (heartScore >= 5) {
      area.innerHTML = "";
      showBirthdayPage();
    } else {
      spawnFallingHeart();
    }
  };
  
  heart.addEventListener("animationend", () => {
    if (heart.parentNode) {
      heart.remove();
      if (heartScore < 5) {
        spawnFallingHeart();
      }
    }
  });
  
  area.appendChild(heart);
}

// --- PAGE D'ANNIVERSAIRE ---
function showBirthdayPage() {
  document.getElementById("game-3").classList.remove("active-screen");
  document.getElementById("game-3").classList.add("hidden-screen");
  
  document.getElementById("birthday-page").classList.remove("hidden-screen");
  document.getElementById("birthday-page").classList.add("active-screen");
  
  setDialogue("BRAVO ! 🎉 Joyeux Anniversaire! Souffle sur la bougie ! 🔥");
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

// --- DÉTECTION DU SOUFFLE ET LECTURE AUDIO ---
function startMicDetection() {
  // 1. Lancer la musique au clic sur le bouton micro
  const bdayAudio = document.getElementById("bday-audio");
  if (bdayAudio) {
    bdayAudio.volume = 0.7;
    bdayAudio.play().catch(err => console.log("Audio bloqué :", err));
  }

  // 2. Activer l'écoute du microphone pour la bougie
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      document.getElementById("mic-status").innerText = "Écoute du souffle en cours... 🌬️";
      
      function checkVolume() {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        let average = sum / dataArray.length;
        
        if (average > 45) {
          document.getElementById("candle-flame").classList.add("blown-out");
          document.getElementById("mic-status").innerText = "✨ Bougie éteinte ! Fais un vœu ! ✨";
          
          setDialogue("Yay ! Tu as soufflé la bougie ! Regarde, une enveloppe est apparue ! 🥳✉️");
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
          
          document.getElementById("envelope-section").classList.remove("hidden-screen");
          
        } else {
          requestAnimationFrame(checkVolume);
        }
      }
      checkVolume();
    })
    .catch(err => {
      document.getElementById("mic-status").innerText = "Accès au micro refusé ou indisponible.";
    });
}

// --- OUVERTURE DE LA LETTRE ---
function openEnvelope() {
  document.getElementById("letter-modal").classList.remove("hidden-screen");
  setDialogue("Lis bien ce qu'il y a à l'intérieur... 🤫💖");
}

function closeEnvelope() {
  document.getElementById("letter-modal").classList.add("hidden-screen");
  setDialogue("J'espère que le message te plaît ! 🥰");
}