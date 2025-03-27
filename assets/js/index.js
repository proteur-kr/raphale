let timer;

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
    const input = document.getElementById("password").value;
    if (!input) return; // 빈 입력 방지
    const hashedInput = await hashPassword(input);
    const correctHash = "b92a65abeeab7f4ac08564e073d6c58e397b71c1042d9da8ba44ea2ab67dc005";

    if (hashedInput === correctHash) {
        sessionStorage.setItem('access_to_terminal', 'true');
        window.location.href = "hacking_terminal.html";
    } else {
        document.querySelector(".input-wrapper").classList.add("hidden");
        document.getElementById("proteurText").style.display = "block";
    }
}

function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(checkPassword, 2000);
}

// 이벤트 리스너 등록
document.getElementById("password").addEventListener("input", resetTimer);