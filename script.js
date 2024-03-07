const fullName = "PAWEŁ SKORNIA";
const encodingText = document.getElementById("encoding-text");
const decodedText = document.getElementById("decoded-text");
let currentLength = 0;
const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
const updateFrequency = 100; // Częstotliwość aktualizacji losowych znaków
const revealFrequency = 300; // Jak często ujawniany jest kolejny znak

function getRandomChar() {
  return randomChars[Math.floor(Math.random() * randomChars.length)];
}

function updateRandomChars() {
  let randomString = "";
  for (let i = currentLength; i < fullName.length; i++) {
    randomString += getRandomChar();
  }
  encodingText.textContent = randomString;
}

function revealNextChar() {
  if (currentLength < fullName.length) {
    decodedText.textContent += fullName.charAt(currentLength);
    currentLength++;
    updateRandomChars();
  } else {
    clearInterval(randomCharInterval);
  }
}

// Aktualizuj losowe znaki co określony interwał czasu
const randomCharInterval = setInterval(updateRandomChars, updateFrequency);
// Ujawnij kolejny znak w imieniu i nazwisku co określony interwał czasu
setInterval(revealNextChar, revealFrequency);
