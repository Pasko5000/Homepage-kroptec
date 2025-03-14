document.addEventListener('DOMContentLoaded', function () {
  const target = document.querySelector('h1');
  const text = target.innerText;
  const length = text.length;
  target.innerText = randomizeString(length);

  function randomizeString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ĄąĆćĘęŁłŃńÓóŚśŹźŻż';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  function decodeText() {
    let currentText = target.innerText;
    let newText = '';

    for (let i = 0; i < length; i++) {
      newText += currentText[i] === text[i] ? text[i] : randomizeString(1);
    }

    target.innerText = newText;

    if (newText !== text) {
      setTimeout(decodeText, 30);
    } else {
      triggerRandomCharacterDecoding();
    }
  }

  setTimeout(decodeText, 30);

  function triggerRandomCharacterDecoding() {
    const randomInterval = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000; // Losowy czas między 1 a 3 sekundami

    setTimeout(function () {
      const randomPosition = Math.floor(Math.random() * length);
      reDecodeCharacter(randomPosition);
    }, randomInterval);
  }

  function reDecodeCharacter(position) {
    let currentChar = target.innerText[position];
    let newChar = randomizeString(1);
    while (newChar === text[position]) {
      newChar = randomizeString(1); // Zapewniamy, że nowy znak będzie różny
    }

    let newText = target.innerText.substring(0, position) + newChar + target.innerText.substring(position + 1);
    target.innerText = newText;

    // Ponownie dekodujemy znak, aż dojście do oryginału
    let decodeInterval = setInterval(function () {
      if (target.innerText[position] === text[position]) {
        clearInterval(decodeInterval);
        triggerRandomCharacterDecoding(); // Ponownie uruchamiamy proces dla innego znaku po zakończeniu
      } else {
        let newText = target.innerText.substring(0, position) + text[position] + target.innerText.substring(position + 1);
        target.innerText = newText;
      }
    }, 100);
  }
});


document.addEventListener("DOMContentLoaded", function () {
  const chatConsole = document.getElementById("chatConsole");
  const askForm = document.getElementById("askForm");
  const askInput = document.getElementById("askAnything");
  const sendButton = document.getElementById("sendButton");
  
  askForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const userMessage = askInput.value.trim();
      if (!userMessage) return;
      
      displayMessage("Ty", userMessage);
      askInput.value = "";
      sendButton.disabled = true;
      
      try {
          const response = await fetch("https://n8n.kroptec.pl/webhook/7b17da6a-fb3c-4ae9-846f-8b8fa5d4796c", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ question: userMessage })
          });
          
          if (!response.ok) {
              throw new Error("Błąd podczas pobierania odpowiedzi");
          }
          
          const data = await response.json();
          displayMessage("Chat", data.output || "Nie udało się pobrać odpowiedzi.");
      } catch (error) {
          displayMessage("System", "Wystąpił błąd podczas komunikacji z serwerem.");
      } finally {
          sendButton.disabled = false;
      }
  });
  
  function displayMessage(sender, message) {
      const messageElement = document.createElement("p");
      messageElement.classList.add("chatMessage");
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
      chatConsole.appendChild(messageElement);
      chatConsole.scrollTop = chatConsole.scrollHeight;
  }
});
