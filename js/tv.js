// js/tv.js
document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.tv-slide');
    let currentSlide = 0;
    let timerTimeout = null;

    // ─── Playlist: IDs dos vídeos no YouTube ───────────────────────────────────
    const playlist = [
        '-AdCu8vFf9s',  // Chutes S
        'bo6QtuYuUyg'   // Dribles S small
    ];
    let currentVideoIndex = 0;
    let ytPlayer = null;
    let playerReady = false;

    // ─── Carrega a YouTube IFrame API de forma assíncrona ─────────────────────
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    // Callback global chamado pela API do YouTube quando ela termina de carregar
    window.onYouTubeIframeAPIReady = function () {
        ytPlayer = new YT.Player('yt-player', {
            videoId: playlist[0],
            playerVars: {
                autoplay:        0,   // Inicia pausado; playVideo() é chamado no slide
                mute:            1,   // Necessário para autoplay funcionar nos browsers
                controls:        0,   // Sem barra de controles
                rel:             0,   // Sem vídeos relacionados ao terminar
                modestbranding:  1,   // Menos branding do YouTube
                playsinline:     1,   // Reproduz inline (TVs / iOS)
                iv_load_policy:  3,   // Sem anotações
                disablekb:       1,   // Sem atalhos de teclado
                fs:              0    // Sem botão de fullscreen
            },
            events: {
                onReady: function () {
                    playerReady = true;
                },
                onStateChange: function (event) {
                    // Quando o vídeo atual termina, avança para o próximo
                    if (event.data === YT.PlayerState.ENDED) {
                        currentVideoIndex++;
                        if (currentVideoIndex >= playlist.length) {
                            nextSlide(); // Playlist completa → próximo slide
                        } else {
                            ytPlayer.loadVideoById(playlist[currentVideoIndex]);
                        }
                    }
                }
            }
        });
    };

    // ─── Controle de slides ───────────────────────────────────────────────────
    function nextSlide() {
        clearTimeout(timerTimeout);

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');

        if (slides[currentSlide].id === 'slide-birthday') {
            // Slide de vídeos: inicia a playlist do YouTube
            playVideoSequence();
        } else {
            // Slides estáticos ficam visíveis por 7 segundos
            timerTimeout = setTimeout(nextSlide, 7000);
        }
    }

    function playVideoSequence() {
        currentVideoIndex = 0;

        if (playerReady && ytPlayer) {
            // Carrega o primeiro vídeo e inicia reprodução
            ytPlayer.loadVideoById(playlist[currentVideoIndex]);
        } else {
            // Player ainda inicializando → aguarda e tenta novamente
            timerTimeout = setTimeout(playVideoSequence, 500);
        }
    }

    // ─── Início: exibe Slide 1 por 7s antes de avançar ───────────────────────
    timerTimeout = setTimeout(nextSlide, 7000);

});
