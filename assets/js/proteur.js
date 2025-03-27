        // 페이지 로드 시 접근 권한 확인
        if (sessionStorage.getItem('access_to_proteur') !== 'true') {
            window.location.href = "hacking_terminal.html";
        }

        function fadeOutAndRedirect(url) {
            document.body.style.opacity = '0'; // 페이드 아웃 효과
            setTimeout(() => {
                window.location.href = url; // 페이지 이동
            }, 500); // 0.5초 후 이동
        }