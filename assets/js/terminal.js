document.addEventListener("DOMContentLoaded", () => {
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

    // 초기 타이핑 함수
    function type() {
        if (lineIndex < textLines.length) {
            if (charIndex < textLines[lineIndex].length) {
                typingText.innerHTML = textLines.slice(0, lineIndex).join("<br>") +
                    (lineIndex > 0 ? "<br>" : "") +
                    textLines[lineIndex].slice(0, charIndex + 1);
                charIndex++;
                setTimeout(() => type(), 50);
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

    // 이벤트 핸들러 함수 정의
    const handleClick = () => activateInput();
    const handleInput = () => {
        // 입력값을 hiddenInput에서만 가져오고 필터링
        userInput = hiddenInput.value.trim().replace(/[^0-9]/g, "");
        if (userInput.length > 4) userInput = userInput.slice(0, 4); // 4자리 제한
        hiddenInput.value = userInput;
        updateText();
        console.log("Current input:", userInput); // 디버깅용
        if (userInput.length === 4) {
            checkPassword();
        }
    };

    // 이벤트 리스너 등록
    document.addEventListener("click", handleClick);
    hiddenInput.addEventListener("input", handleInput);

    // 패스워드 검증 함수
    function checkPassword() {
        userInput = userInput.trim();
        console.log("Checking password:", userInput); // 디버깅용
        if (userInput === "0705") {
            clearInterval(traceInterval);
            document.removeEventListener("click", handleClick);
            hiddenInput.removeEventListener("input", handleInput);
            sessionStorage.setItem("access_to_proteur", "true");
            console.log("Password correct, redirecting to /proteur.html");
            window.location.href = "/proteur.html";
        } else {
            typingText.innerHTML += "<br>>> Incorrect password!";
            setTimeout(() => {
                userInput = "";
                hiddenInput.value = "";
                updateText();
            }, 1500);
        }
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
