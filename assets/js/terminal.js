// 페이지 로드 시 DOM이 준비된 후 실행
document.addEventListener("DOMContentLoaded", () => {
    // 접근 권한 확인
    if (sessionStorage.getItem('access_to_terminal') !== 'true') {
        window.location.href = "/index.html";
        return;
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

    // 0705의 SHA-256 해시값
    const correctHash = "f5d0c08626d19b1e5e6f7d67f5f7f5f7f5f7f5f7f5f7f5f7f5f7f5f7f5f7f5f";

    // SHA-256 해시 생성 함수
    function hashString(str) {
        if (typeof sha256 === "undefined") {
            typingText.innerHTML += "<br>>> Error: Hashing library not loaded!";
            throw new Error("js-sha256 library not loaded!");
        }
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
                setTimeout(() => type(), 50); // 속도를 50ms로 조정
            } else {
                charIndex = 0;
                lineIndex++;
                setTimeout(() => type(), 50);
            }
        } else {
            isTypingComplete = true;
            typingText.innerHTML += "<br>>>> ";
            typingText.innerHTML += "<br>>> trace_block = " + tracePercentage + "%";
            startTrace();
            activateInput();
        }
    }

    // 트레이스 진행
    function startTrace() {
        traceInterval = setInterval(() => {
            if (tracePercentage < 100 && !userInput) {
                tracePercentage++;
                updateText();
            }
            if (tracePercentage >= 100) {
                clearInterval(traceInterval);
                typingText.innerHTML = '';
                setTimeout(() => {
                    window.location.href = "/index.html";
                }, 3000);
            }
        }, 500);
    }

    // 입력 필드 활성화
    function activateInput() {
        hiddenInput.focus();
    }

    // 화면 터치 시 입력 활성화
    document.addEventListener("click", activateInput);

    // 입력 처리 (PC와 모바일 통합)
    hiddenInput.addEventListener("input", () => {
        userInput = hiddenInput.value.trim().replace(/[^0-9]/g, "");
        hiddenInput.value = userInput;
        updateText();
        if (userInput.length === 4) {
            checkPassword();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!isTypingComplete) return;
        if (event.key === "Backspace") {
            userInput = userInput.slice(0, -1);
            hiddenInput.value = userInput;
            updateText();
        }
    });

    // 패스워드 검증 함수
    function checkPassword() {
        userInput = userInput.trim();
        if (!/^\d{4}$/.test(userInput)) {
            typingText.innerHTML += "<br>>> Please enter a 4-digit number!";
            resetInput();
            return;
        }

        const inputHash = hashString(userInput);
        if (!inputHash) return;

        if (inputHash === correctHash) {
            clearInterval(traceInterval); // 트레이스 중지
            sessionStorage.setItem('access_to_proteur', 'true');
            window.location.href = "/proteur.html";
        } else {
            typingText.innerHTML += "<br>>> Incorrect password!";
            resetInput();
        }
    }

    // 입력 초기화 함수
    function resetInput() {
        setTimeout(() => {
            userInput = "";
            hiddenInput.value = "";
            updateText();
        }, 1500); // 1.5초로 늘려 가독성 향상
    }

    // 텍스트 업데이트 함수
    function updateText() {
        const initialText = textLines.join("<br>");
        const maskedInput = "*".repeat(userInput.length);
        typingText.innerHTML = initialText + "<br>>> trace_block = " + tracePercentage + "%<br>>>> " + maskedInput;
    }

    // 타이핑 시작
    type();
});
