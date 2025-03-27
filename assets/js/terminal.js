// 페이지 접근 권한 확인
if (sessionStorage.getItem('access_to_terminal') !== 'true') {
    window.location.href = "index.html";
}

const textLines = [
    ">>> import hacking_tools",
    ">>> hacking_tools.init()",
    ">>> System access granted",
    ">>> firewall.bypass()",
    ">>> Encryption decoded",
    ">>> mainframe.connect()",
    ">>> Downloading data...",
    ">>> backdoor.install()",
    ">>> security.override()"
];

const typingText = document.getElementById("typing-text");
const hiddenInput = document.getElementById("hidden-input");
let lineIndex = 0;
let charIndex = 0;
let userInput = "";
let isTypingComplete = false;
let tracePercentage = 82;
let traceInterval;

// 타이핑 속도 설정 (ms 단위)
const charTypingSpeed = 50; // 글자 간 타이핑 속도
const lineTypingSpeed = 200; // 줄 간 전환 속도

function type() {
    if (lineIndex < textLines.length) {
        if (charIndex < textLines[lineIndex].length) {
            typingText.innerHTML = textLines.slice(0, lineIndex).join("<br>") +
                (lineIndex > 0 ? "<br>" : "") +
                textLines[lineIndex].slice(0, charIndex + 1);
            charIndex++;
            setTimeout(type, charTypingSpeed); // 글자 간 타이핑 속도
        } else {
            charIndex = 0;
            lineIndex++;
            setTimeout(type, lineTypingSpeed); // 줄 간 전환 속도
        }
    } else {
        isTypingComplete = true;
        typingText.innerHTML += "<br>>>> ";
        typingText.innerHTML += "<br>>> trace_block = " + tracePercentage + "%";
        startTrace();
        activateInput();
    }
}

function startTrace() {
    traceInterval = setInterval(() => {
        if (tracePercentage < 100 && !userInput) {
            tracePercentage++;
            updateText();
        }
        if (tracePercentage >= 100) {
            clearInterval(traceInterval);
            setTimeout(() => {
                typingText.innerHTML = '';
                setTimeout(() => window.location.href = "index.html", 3000);
            }, 500);
        }
    }, 500);
}

function activateInput() {
    hiddenInput.focus();
}

function updateText() {
    const initialText = textLines.join("<br>");
    const maskedInput = "*".repeat(userInput.length);
    typingText.innerHTML = initialText + "<br>>> trace_block = " + tracePercentage + "%<br>>>> " + maskedInput;
}

function checkPassword() {
    if (userInput === "0705") {
        sessionStorage.setItem('access_to_proteur', 'true');
        window.location.href = "proteur.html";
    } else {
        typingText.innerHTML += "<br>>> Incorrect password!";
        setTimeout(() => {
            userInput = "";
            hiddenInput.value = "";
            updateText();
        }, 1000);
    }
}

// 이벤트 리스너
document.addEventListener("click", activateInput);

document.addEventListener("keydown", (event) => {
    if (!isTypingComplete) return;
    const key = event.key;
    if (key === "Backspace") {
        userInput = userInput.slice(0, -1);
        updateText();
    } else if (key.length === 1 && /[0-9]/.test(key) && userInput.length < 4) {
        userInput += key;
        updateText();
        if (userInput.length === 4) checkPassword();
    }
});

hiddenInput.addEventListener("input", () => {
    userInput = hiddenInput.value;
    updateText();
    if (userInput.length === 4) checkPassword();
});

// 타이핑 시작
type();
