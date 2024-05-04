
/**
 * Essa função alterna entre o estado de play e pause do jingle.
 * Assim como os ícones vínculados
 * 
 * @param {*} barClick -> se clicar na barra de progresso
 */
function activateJingle(barClick = false) {

    const buttonInput = $('#buttonPlay')
    const myState = buttonInput.data('state')

    if (!barClick && myState == 'pause') {
        myJingle.pause();
        $('#svgIcon').html(' <path d="M8 5v14l11-7z"></path>')
        buttonInput.data('state', 'play')
        $('#buttonPlay').removeClass('colorEffect')
    }
    else if (myState == 'play') {
        myJingle.play();
        $('#svgIcon').html('<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-1 14H9V8h2zm4 0h-2V8h2z" ></path > ')
        buttonInput.data('state', 'pause')
        $('#buttonPlay').addClass('colorEffect')
    }
}

/**
 * Converte o tempo do áudio em segundos para o formato mm:ss 
 * @param {*} time 
 * @returns 
 */
function getCurrentTime(time) {

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time - (hours * 3600)) / 60);
    const seconds = Math.floor(time - (hours * 3600) - (minutes * 60));

    const minutesString = minutes < 10 ? '0' + minutes : minutes
    const secondsString = seconds < 10 ? '0' + seconds : seconds

    return `${minutesString}:${secondsString}`
}

/**
 * Atualiza o tempo do áudio para o usuário
 */
function updateJingleTime() {

    const currentTime = myJingle.currentTime
    const totalTime = myJingle.duration

    //atualiza o componente progressbar do jquery com o atual tempo do áudio executado
    $('#jingleProgressbar').progressbar("option", {
        value: (currentTime / totalTime) * 100
    });

    const updatedTime = getCurrentTime(currentTime)

    //imprime o tempo atual do áudio
    $('#currentTimeJingle').html(updatedTime)
}

$(function () {

    //callback quando o usuário clica na barra de progresso do áudio
    $('#jingleProgressbar').on('click', function (event) {

        //retorna o tamanho do elemento 
        const totalWidth = $(this).width()

        //posição onde o usuário clicou no elemento
        const clickPosition = event.pageX - $(this).offset().left

        //converte a posição clicada em porcentagem para definir o tempo do áudio
        const percentageClicked = (clickPosition / totalWidth) * 100

        //atualiza o tempo do áudio
        myJingle.currentTime = (myJingle.duration * percentageClicked) / 100

        updateJingleTime()
        activateJingle(true)
    })

    //se o botão de play/pause for clicado, dispara esse callback
    $("#buttonPlay").on("click", function (event) {
        activateJingle()
    })

    //controlador de volume (componente slider do jquery)
    $("#jingleVolume").slider({
        min: 0,
        max: 100,
        value: 30,
        range: "min",
        slide: function (event, ui) {
            setVolume(ui.value / 100);
        }
    })

    //valor inicial da barra de progresso do áudio >> inicia em zero
    $("#jingleProgressbar").progressbar({
        value: false,

    });
});

$(document).ready(function () {

    //define o elemento audio no DOM
    var myJingle = document.createElement('audio');

    //inclui na div com id 'player'
    $('#player').append(myJingle);

    //define id para o audio
    myJingle.id = "myJingle";

    //carrega o áudio do servidor local, 0.3 é volume do áudio inicial (30%)
    playAudio('./assets/sounds/0548_Uprising_AShamaluevMusic.mp3', 0.3);

    //callback para o evento de carregamento do áudio
    $('#myJingle').on("loadedmetadata", function (event) {

        const mediaTime = getCurrentTime(myJingle.duration)

        //imprime o tempo total do áudio
        $('#totalTimeJingle').html(mediaTime)
    });

    //callback executado quando o há alteração no tempo do áudio
    $('#myJingle').on("timeupdate", updateJingleTime)
})

/**
 * Executa ao iniciar o elemento áudio
 * @param {*} fileName 
 * @param {*} newVolume 
 */
function playAudio(fileName, newVolume) {
    myJingle.src = fileName;
    myJingle.setAttribute('muted', 'true')
    setVolume(newVolume);

    /*Executa o evento abaixo após o primeiro click em tela. Os navegadores mais atuais
    estão bloqueando a execução automática de áudio, então o bloco abaixo ativa o áudio 
    após a primeira interação do usuário. */
    myJingle.addEventListener("canplaythrough", () => {

        /*Não vai conseguir executar, pois o navegador irá bloquear,
        então cria um event de click no catch da promise e executa o play()
        quando o evento de click for executado.
        */
        myJingle.play().catch(e => {
            window.addEventListener('click', () => {
                myJingle.play()
                activateJingle()
            }, { once: true })
        })
    });
}

//para definir o volume do áudio ([0...1])
function setVolume(newVolume) {
    myJingle.volume = newVolume;
}