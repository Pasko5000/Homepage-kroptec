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
  const chatForm = document.getElementById('askForm');
  const chatInput = document.getElementById('askAnything');
  const chatConsole = document.getElementById('chatConsole');

  // Funkcja do dodawania wiadomości do konsoli czatu
  function postMessage(message, sender = "Użytkownik") {
    const messageElement = document.createElement('p');
    messageElement.classList.add('chatMessage');
    messageElement.textContent = `[${sender}]: ${message}`;
    chatConsole.appendChild(messageElement);

    // Przewijanie konsoli do najnowszej wiadomości
    chatConsole.scrollTop = chatConsole.scrollHeight;
  }

  function askQuestion(question) {
    const url = 'https://llm.kroptec.pl/ask';
    const headers = {
      'Content-Type': 'application/json',
      'sec-ch-ua': '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'sec-ch-ua-platform': "Linux",
      'Referer': 'https://kroptec.pl/',
      'sec-ch-ua-mobile': '?0',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
    };

    const body = JSON.stringify({ prompt: question });

    fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const reply = data.choices[0].message.content;
        postMessage(reply, "System");
      })
      .catch(error => {
        console.error('Error:', error);
        postMessage("Wystąpił błąd podczas próby uzyskania odpowiedzi.", "System");
      });
  }


  // Obsługa wysyłania formularza
  chatForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const userMessage = chatInput.value.trim();
    if (userMessage !== '') {
      postMessage(userMessage);
      askQuestion(userMessage);
      chatInput.value = ''; // Czyszczenie pola tekstowego
    }
  });

  // Opcjonalnie: Obsługa wciśnięcia Enter, jeśli wolisz bezpośrednie podejście bez submit formularza
  chatInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const userMessage = chatInput.value.trim();
      if (userMessage !== '') {
        postMessage(userMessage);
        askQuestion(userMessage);
        chatInput.value = ''; // Czyszczenie pola tekstowego
      }
    }
  });
});
