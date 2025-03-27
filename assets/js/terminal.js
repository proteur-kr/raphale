// 페이지 로드 시 접근 권한 확인
if (sessionStorage.getItem('access_to_terminal') !== 'true') {
    window.location.href = "/index.html";
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
const hiddenInput = document.getElementById("hidden-input"); // 숨겨진 입력 필드
let lineIndex = 0;
let charIndex = 0;
let userInput = "";
let isTypingComplete = false;
let tracePercentage = 82; // 82%부터 시작
let traceInterval;

// 0705의 SHA-256 해시값
const correctHash = "f5d0c08626d19b1e5e6f7d67f5f7f5f7f5f7f5f7f5f7f5f7f5f7f5f7f5f7f5f";

// SHA-256 해시 생성 함수 (js-sha256 사용)
function hashString(str) {
    return sha256(str);
}

// 초기 타이핑 함수
function type() {
    if (lineIndex < textLines.length) {
        if (charIndex < textLines[lineIndex].length) {
            typingText.innerHTML = textLines.slice(0, lineIndex).join("<br>") + 
                (lineIndex > 0 ? "<br>" : "") + 
                textLines[lineIndex].slice(0, charIndex + 1);
            charIndex++;
            setTimeout(type, 3); // 타이핑 속도 조절
        } else {
            charIndex = 0;
            lineIndex++;
            setTimeout(type, 3);
        }
    } else {
        // 초기 타이핑이 끝나면 사용자 입력 모드로 전환
        isTypingComplete = true;
        typingText.innerHTML += "<br>>>> "; // 새로운 입력 프롬프트 추가
        typingText.innerHTML += "<br>>> trace_block = " + tracePercentage + "%";
        startTrace(); // 트레이스 진행 시작
        activateInput(); // 입력 필드 활성화
    }
}

// 타이핑 중 숫자 올라가는 부분
function startTrace() {
    traceInterval = setInterval(() => {
        if (tracePercentage < 100 && !userInput) { // 입력값이 없으면 숫자 증가
            tracePercentage++;
            updateText();
        }
        if (tracePercentage >= 100) {
            clearInterval(traceInterval); // 100%에 도달하면 증가 멈춤
            setTimeout(() => {
                typingText.innerHTML = ''; // 화면을 지움
                setTimeout(() => {
                    window.location.href = "/index.html"; // 3초 뒤 index.html로 이동
                }, 3000);
            }, 500); // 100% 도달 후 0.5초 대기
        }
    }, 500); // 0.5초마다 1% 증가
}

// 입력 필드 활성화 (모바일 키패드 표시)
function activateInput() {
    hiddenInput.focus();
}

// 사용자가 화면 터치하면 입력 필드 활성화 (모바일 대응)
document.addEventListener("click", activateInput);

// 키보드 입력 처리 (PC)
document.addEventListener("keydown", (event) => {
    if (!isTypingComplete) return; // 초기 타이핑 중에는 입력 무시

    const key = event.key;

    if (key === "Backspace") {
        userInput = userInput.slice(0, -1); // 백스페이스로 삭제
        updateText();
        return;
    }

    if (key.length === 1 && /[0-9]/.test(key)) {
        if (userInput.length < 4) {
            userInput += key;
            updateText();
        }
        if (userInput.length === 4) {
            checkPassword(); // 4자리 입력되면 자동 확인
        }
    }
});

// 모바일 입력 처리 (숨어있는 input 필드)
hiddenInput.addEventListener("input", () => {
    userInput = hiddenInput.value;
    updateText();

    if (userInput.length === 4) {
        checkPassword(); // 4자리 입력되면 자동 확인
    }
});

// 패스워드 검증 함수
function checkPassword() {
    userInput = userInput.trim(); // 공백 제거
    if (!/^\d{4}$/.test(userInput)) {
        typingText.innerHTML += "<br>>> Please enter a 4-digit number!";
        setTimeout(() => {
            userInput = "";
            hiddenInput.value = "";
            updateText();
        }, 1000);
        return;
    }

    const inputHash = hashString(userInput);
    console.log("User input:", userInput);
    console.log("Input hash:", inputHash);
    console.log("Correct hash:", correctHash);
    if (inputHash === correctHash) {
        sessionStorage.setItem('access_to_proteur', 'true');
        window.location.href = "/proteur.html";
    } else {
        typingText.innerHTML += "<br>>> Incorrect password!";
        setTimeout(() => {
            userInput = "";
            hiddenInput.value = "";
            updateText();
        }, 1000);
    }
}

// 텍스트 업데이트 함수
function updateText() {
    const initialText = textLines.join("<br>");
    const maskedInput = "*".repeat(userInput.length); // 입력된 글자를 별표로 마스킹
    typingText.innerHTML = initialText + "<br>>> trace_block = " + tracePercentage + "%<br>>>> " + maskedInput;
}

// 타이핑 시작
type();
