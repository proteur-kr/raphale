// 페이지별 데이터 정의
const profiles = {
    'page1': { name: 'Kang Jun Hyok', img: 'button1.png' },
    'page2': { name: 'Kang Hyo Ju', img: 'button2.png' },
    'page3': { name: 'Kang Hyun Vin', img: 'button3.png' },
    'page4': { name: 'Kang Ryu Vin', img: 'button4.png' }
};

// 현재 페이지 식별
const pageId = window.location.pathname.split('/').pop().replace('.html', '');
const profile = profiles[pageId] || { name: 'Unknown', img: 'button1.png' }; // 기본값

// DOM 요소 업데이트
document.getElementById('page-title').textContent = `${profile.name} - 프로필 페이지`;
document.getElementById('button-image').src = `../assets/images/${profile.img}`;
document.getElementById('nameText').textContent = profile.name;

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
    const buttonTextContainer = document.getElementById("buttonTextContainer");
    const circleContainer = document.getElementById("circleContainer");
    const isKakaoTalk = /KAKAOTALK/i.test(navigator.userAgent);

    if (isKakaoTalk) document.body.classList.add("kakaotalk");

    function adjustCircleContainerPosition() {
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const offset = isKakaoTalk ? viewportHeight * 0.25 : viewportHeight * 0.3;
        const currentTransform = window.getComputedStyle(circleContainer).transform;
        let scaleValue = 1;
        if (currentTransform !== "none") {
            const matrix = currentTransform.match(/matrix\((.+)\)/);
            if (matrix) scaleValue = parseFloat(matrix[1].split(", ")[0]);
        }
        circleContainer.style.transform = `translateY(-${offset}px) scale(${scaleValue})`;
    }

    // 리사이즈 이벤트 디바운싱
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustCircleContainerPosition, 100);
    }
    window.addEventListener("resize", handleResize);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", handleResize);
    adjustCircleContainerPosition();

    // 페이드인 효과
    setTimeout(() => {
        buttonTextContainer.style.opacity = 1;
        circleContainer.style.opacity = 1;
        setTimeout(positionCircles, 500);
    }, 500);
});

// 작은 원 배치
function positionCircles() {
    const radiusLarge = 125;
    const radiusSmall = 15;
    const numberOfCircles = 8;
    const angleStep = 360 / numberOfCircles;
    const container = document.getElementById("circleContainer");
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    for (let i = 0; i < numberOfCircles; i++) {
        const angle = angleStep * i;
        const x = centerX + radiusLarge * Math.cos((angle - 90) * Math.PI / 180) - radiusSmall;
        const y = centerY + radiusLarge * Math.sin((angle - 90) * Math.PI / 180) - radiusSmall;
        const circle = document.getElementById(`circle${i + 1}`);
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.style.opacity = 1;
        circle.addEventListener("click", () => alert(`작은 원 ${i + 1}번 클릭됨!`));
    }
}

// 뒤로가기 처리
if (history.state === null) history.pushState({ page: "current" }, "", location.href);
window.addEventListener("popstate", () => document.getElementById("goBackLink").click());
window.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" || event.key === "ArrowLeft") {
        document.getElementById("goBackLink").click();
    }
});