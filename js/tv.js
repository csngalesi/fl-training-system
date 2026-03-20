// js/tv.js
document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.tv-slide');
    const videoElement = document.getElementById('promo-video');

    // Configurações de tempo (em milissegundos)
    const TIME_VIDEO = 7500; // Tempo do slide principal (logo)
    const TIME_SCHEDULE = 5000; // Tempo do slide 2 (aniversário ou turma)
    const TIME_SPONSORS = 15000;  // Tempo mostrando os patrocínios ou timeline (expandimos para ver a estrada)

    // Considera apenas as durações dos slides que realmente existem
    const slideDurations = [TIME_VIDEO, TIME_SCHEDULE, TIME_SPONSORS].slice(0, slides.length);
    let currentSlide = 0;

    // Função que roda o loop mestre da TV
    function nextSlide() {
        // Oculta o slide atual
        slides[currentSlide].classList.remove('active');

        // Pausa o vídeo se estava no primeiro slide
        if (currentSlide === 0 && videoElement) {
            videoElement.pause();
        }

        // Avança o índice
        currentSlide = (currentSlide + 1) % slides.length;

        // Exibe o novo slide
        slides[currentSlide].classList.add('active');

        // Se for o slide do vídeo, dá play novamente do começo (se quiser loop)
        if (currentSlide === 0 && videoElement) {
            videoElement.currentTime = 0;
            videoElement.play().catch(e => console.log('Autoplay bloqueado pelo navegador', e));
        }

        // Atualiza relógio/horários se estivermos no slide de alunos
        if (currentSlide === 1) {
            updateScheduleTime();
        }

        // Agenda a próxima transição usando o tempo específico deste slide
        setTimeout(nextSlide, slideDurations[currentSlide]);
    }

    // Inicia o ciclo com a duração do primeiro slide
    setTimeout(nextSlide, slideDurations[currentSlide]);

    // Função auxiliar para enfeitar o horário
    function updateScheduleTime() {
        const timeHeader = document.getElementById('current-time');
        
        // Proteção contra erro de null caso o slide não tenha um relógio na tela (ex: convite)
        if (!timeHeader) return;
        
        const now = new Date();
        const future = new Date(now.getTime() + 15 * 60000); // 15 mins p/ frente (Próxima Turma)

        const hours = String(future.getHours()).padStart(2, '0');
        const minutes = String(future.getMinutes()).padStart(2, '0');

        // Um exemplo de como você pode montar o sub-título baseando-se no horário
        let category = "Categoria Sub-12";
        if (future.getHours() >= 18) category = "Treinamento Adulto";
        else if (future.getHours() >= 16) category = "Categoria Sub-15";

        timeHeader.textContent = `${hours}:${minutes} - ${category} (Turma de Elite)`;
    }

    // Tenta forçar o video autoplay logo no carregamento
    if (videoElement) {
        videoElement.play().catch(e => console.log('Aguardando interação do usuário', e));
    }
});
