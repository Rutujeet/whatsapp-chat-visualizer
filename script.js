const uploadContainer = document.getElementById("upload-container");
const fileUpload = document.getElementById("file-upload");
const chatContainer = document.getElementById("chat-container");
const newUploadBtn = document.getElementById("new-upload-btn");

function formatContent(content) {
  const lines = content.split("\n");
  const cleanedLines = lines.map((line) => line.replace(/\s+/g, " ").trim());
  return cleanedLines.join("\n");
}

function parseMessages(text) {
  const messagePattern =
    /\[(.+?)\] (.+?): ([\s\S]+?)(?=\[\d{2}\/\d{2}\/\d{2}|$)/g;
  const matches = Array.from(text.matchAll(messagePattern));

  // Skip first message (encryption notice)
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
    const text = e.target.result;
    const messages = parseMessages(text);
    displayMessages(messages);

    uploadContainer.style.display = "none";
    chatContainer.style.display = "block";
    newUploadBtn.style.display = "block";
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
  if (file) handleFile(file);
});

// Click to upload
uploadContainer.addEventListener("click", () => {
  fileUpload.click();
});

fileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// New upload button
newUploadBtn.addEventListener("click", () => {
  uploadContainer.style.display = "block";
  chatContainer.style.display = "none";
  newUploadBtn.style.display = "none";
  chatContainer.innerHTML = "";
});
