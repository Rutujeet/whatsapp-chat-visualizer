const uploadContainer = document.getElementById("upload-container");
const fileUpload = document.getElementById("file-upload");
const chatContainer = document.getElementById("chat-container");
const newUploadBtn = document.getElementById("new-upload-btn");
const errorMessage = document.getElementById("error-message");

function showError() {
  uploadContainer.classList.add("error");
  errorMessage.classList.add("visible");

  // Remove error state after animation
  setTimeout(() => {
    uploadContainer.classList.remove("error");
    setTimeout(() => {
      errorMessage.classList.remove("visible");
    }, 3000);
  }, 500);
}

function isValidWhatsAppFormat(text) {
  const messagePattern =
    /^\[\d{2}\/\d{2}\/\d{2},\s\d{1,2}:\d{2}:\d{2}\s[AP]M\]\s.+?:/m;
  const firstLines = text.split("\n").slice(0, 3).join("\n");
  return messagePattern.test(firstLines);
}

function formatContent(content) {
  const lines = content.split("\n");
  const cleanedLines = lines.map((line) => line.replace(/\s+/g, " ").trim());
  return cleanedLines.join("\n");
}

function parseMessages(text) {
  if (!isValidWhatsAppFormat(text)) {
    throw new Error("Invalid WhatsApp chat format");
  }

  const messagePattern =
    /\[(.+?)\] (.+?): ([\s\S]+?)(?=\[\d{2}\/\d{2}\/\d{2}|$)/g;
  const matches = Array.from(text.matchAll(messagePattern));

  if (matches.length === 0) {
    throw new Error("No valid messages found");
  }

  return matches.slice(1).map((match, index) => {
    const [, datetime, sender, content] = match;
    return {
      id: index,
      datetime,
      sender: sender.trim(),
      content: formatContent(content.trim()),
    };
  });
}

function formatTime(datetime) {
  const [date, time] = datetime.split(", ");
  return time;
}

function displayMessages(messages) {
  chatContainer.innerHTML = "";

  messages.forEach((message, index) => {
    const isFirstMessage =
      index === 0 || messages[index - 1].sender !== message.sender;
    const isRutujeet = message.sender.includes("Rutujeet");

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isRutujeet ? "sent" : ""}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    let html = "";
    if (isFirstMessage) {
      html += `<div class="sender">${message.sender}</div>`;
    }
    html += `
            <div class="content">${message.content}</div>
            <div class="timestamp">${formatTime(message.datetime)}</div>
        `;

    bubble.innerHTML = html;
    messageDiv.appendChild(bubble);
    chatContainer.appendChild(messageDiv);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const messages = parseMessages(text);
      displayMessages(messages);

      uploadContainer.style.display = "none";
      chatContainer.style.display = "block";
      newUploadBtn.style.display = "block";
    } catch (error) {
      showError();
    }
  };
  reader.readAsText(file);
}

uploadContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadContainer.classList.add("drag-over");
});

uploadContainer.addEventListener("dragleave", (e) => {
  e.preventDefault();
  uploadContainer.classList.remove("drag-over");
});

uploadContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadContainer.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".txt")) {
    handleFile(file);
  } else {
    showError();
  }
});

uploadContainer.addEventListener("click", () => {
  fileUpload.click();
});

fileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.name.endsWith(".txt")) {
    handleFile(file);
  } else {
    showError();
  }
});

newUploadBtn.addEventListener("click", () => {
  uploadContainer.style.display = "block";
  chatContainer.style.display = "none";
  newUploadBtn.style.display = "none";
  chatContainer.innerHTML = "";
});
