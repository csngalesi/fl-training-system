// js/tv.js
document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.tv-slide');
    const playerContainer = document.getElementById('playlist-player').parentNode;
    const templatePlayer = document.getElementById('playlist-player');
    
    let currentSlide = 0;
    let timerTimeout = null;

    // Lista de vídeos puxados da pasta /TV/
    const playlist = [
        "TV/Chutes S.mp4",
        "TV/Dribles S_small.mp4"
    ];
    let currentVideoIndex = 0;
    const videoElements = [];

    // Pre-load de todos os vídeos (Pool) para evitar consumo repetitivo de internet no Vercel
    // e parar as travadas nativas do hardware da TV quando se troca o src.
    playlist.forEach((src, index) => {
        const vid = templatePlayer.cloneNode(true);
        vid.id = `video-pool-${index}`;
        vid.src = src;
        vid.preload = "auto";
        vid.style.display = 'none';

        vid.addEventListener('ended', () => {
            currentVideoIndex++; // Próximo vídeo da fila
            playNextVideo();
        });

        playerContainer.appendChild(vid);
        videoElements.push(vid);
    });

    // Remove o template original
    templatePlayer.remove();

    function nextSlide() {
        clearTimeout(timerTimeout);

        // Oculta slide atual
        slides[currentSlide].classList.remove('active');

        // Avança índice
        currentSlide = (currentSlide + 1) % slides.length;

        // Exibe novo slide
        slides[currentSlide].classList.add('active');

        const currentSlideElement = slides[currentSlide];
        
        // Verifica se o slide atual é o dos vídeos apontando pela ID do Slide
        if (currentSlideElement.id === 'slide-birthday') {
            // Inicia o loop da playlist!
            playVideoSequence();
        } else {
            // Outros slides normais (Cartaz, Equipe, etc) ficam por 7 Segundos
            timerTimeout = setTimeout(nextSlide, 7000);
        }
    }

    function playVideoSequence() {
        if (videoElements.length === 0) {
            timerTimeout = setTimeout(nextSlide, 5000); // Fallback
            return;
        }
        currentVideoIndex = 0;
        playNextVideo();
    }

    function playNextVideo() {
        // Esconde e pausa todos preventivamente
        videoElements.forEach(v => {
            v.style.display = 'none';
            v.pause();
            v.currentTime = 0;
        });

        // Se já rodou todos os vídeos do Array
        if (currentVideoIndex >= playlist.length) {
            nextSlide(); // Acabou a fila: Pula para o Slide 1 novamente!
            return;
        }

        const activeVid = videoElements[currentVideoIndex];
        activeVid.style.display = 'block';
        activeVid.play().catch(e => {
            console.log('Autoplay bloqueado no navegador, forçando auto-pulo...', e);
            currentVideoIndex++;
            playNextVideo();
        });
    }

    // Start Inicial da TV -> Slide 1
    timerTimeout = setTimeout(nextSlide, 7000);

});
