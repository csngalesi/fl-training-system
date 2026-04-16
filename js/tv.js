// js/tv.js
document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.tv-slide');
    const player = document.getElementById('playlist-player');
    
    let currentSlide = 0;
    let timerTimeout = null;

    // Lista de vídeos puxados da pasta /TV/
    const playlist = [
        "TV/Chutes S.mp4",
        "TV/Dribles S_small.mp4"
    ];
    let currentVideoIndex = 0;

    function nextSlide() {
        clearTimeout(timerTimeout);

        // Oculta slide atual
        slides[currentSlide].classList.remove('active');

        // Avança índice
        currentSlide = (currentSlide + 1) % slides.length;

        // Exibe novo slide
        slides[currentSlide].classList.add('active');

        // Lógica de Direcionamento por Tipo de Slide
        const currentSlideElement = slides[currentSlide];
        
        // Verifica se o slide atual tem o player de vídeo dentro
        if (currentSlideElement.querySelector('#playlist-player')) {
            // Inicia o loop mestre dos vídeos! A transição de volta para o próximo ocorrerá apenas quando a playlist acabar.
            playVideoSequence();
        } else {
            // Outros slides normais (Cartaz, Equipe, etc) ficam por 7 Segundos
            timerTimeout = setTimeout(nextSlide, 7000);
        }
    }

    // Engine da Playlist Sequencial
    function playVideoSequence() {
        if (!player || playlist.length === 0) {
            timerTimeout = setTimeout(nextSlide, 5000); // Fallback
            return;
        }
        currentVideoIndex = 0;
        playNextVideo();
    }

    function playNextVideo() {
        // Se já rodou todos os vídeos do Array
        if (currentVideoIndex >= playlist.length) {
            nextSlide(); // Acabou a fila: Pula para o Slide 1 novamente!
            return;
        }

        player.src = playlist[currentVideoIndex];
        player.play().catch(e => {
            console.log('Autoplay bloqueado no navegador, forçando auto-pulo...', e);
            currentVideoIndex++;
            playNextVideo();
        });
    }

    // Escutador de Fim de Vídeo (O Pulo Automático entre vídeos da mesma fatia)
    if (player) {
        player.addEventListener('ended', () => {
            currentVideoIndex++; // Próximo vídeo da fila
            playNextVideo();
        });
    }

    // Start Inicial da TV -> Slide 1
    timerTimeout = setTimeout(nextSlide, 7000);

});
