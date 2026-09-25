/* =========================================================
   CONFIGURACIÓN DEL SITIO — edita solo este archivo
   ---------------------------------------------------------
   • projects: cada objeto es una tarjeta del carrusel y su pop-up.
   • slides: imágenes, videos o embeds del mini carrusel.
       { type: 'image', src: 'assets/proyectos/archivo.jpg', caption: 'Texto' }
       { type: 'video', src: 'assets/proyectos/clip.mp4', poster: 'assets/proyectos/poster.jpg', caption: '' }
       { type: 'embed', src: 'https://www.youtube.com/watch?v=ID', caption: '' }
         ↑ acepta el enlace normal de YouTube (watch, youtu.be, shorts), Vimeo
           (vimeo.com/123456) o Google Drive (drive.google.com/file/d/ID/view).
           No hace falta copiar el <iframe>: pega el enlace y listo.
           Opcional: poster: 'assets/...jpg' para usar tu propia miniatura.
           Opcional: autoplay: true → el video arranca solo, en silencio y en bucle
             al llegar a esa slide (funciona con YouTube y Vimeo; Drive no lo permite).

   • GOOGLE DRIVE: en cover, image, poster o photo puedes pegar el enlace de "Compartir"
       (drive.google.com/file/d/ID/view) o el de lh3.googleusercontent.com/d/ID. Ambos sirven.
       Imágenes y GIF de Drive van con type: 'image'. Videos de Drive van con type: 'embed'.
   • El recuadro de cada slide toma solo la proporción de su imagen o video (post cuadrado,
       16:9, historia 9:16…). No hay que configurar nada.
   • ratio (solo videos embebidos de YouTube, Vimeo o Drive): esos no informan su tamaño,
       así que por defecto se asume '16:9'. Usa '9:16' para historias/reels o '1:1' para cuadrados.
   • fit: 'contain' en una slide → la imagen o video se ve completo, sin recortar.
       Sin fit (por defecto) → llena todo el recuadro recortando lo que sobra.
       { caption: 'Texto' }   ← sin src = placeholder de color
   • cover: imagen de la tarjeta (opcional). Sin cover = degradado con colors.
       Acepta .jpg, .png, .webp, .gif y también .mp4 / .webm (mucho más livianos que un GIF).
   • link: { url: 'https://...', label: 'Texto del botón' } o null.
   • colors: 2 o 3 colores hex para el degradado de la tarjeta y placeholders.
   ========================================================= */

window.SITE_CONFIG = {
  brand: 'Soy Darso',
  headline: ['Soy', 'Darso'],

  carousel: {
    autoRotateSpeed: 0.035, // grados por frame cuando nadie interactúa (0 = apagado)
    idleDelay: 2200,        // ms sin interacción antes de volver a girar solo
    minCards: 10,           // si hay menos proyectos, se repiten para llenar el anillo
    slideInterval: 4500,    // ms entre slides del mini carrusel (0 = sin autoplay)

    /* ---- COLOR DE LAS PORTADAS ----------------------------------------
       grayscale: 1 = las portadas que no están al centro se ven en gris total,
                  0.5 = medio desaturadas, 0 = todas a color (efecto apagado).
       colorRange: grados desde el centro en los que la portada recupera su color.
       ------------------------------------------------------------------ */
    grayscale: 1,
    colorRange: 24,

    /* ---- EFECTO PIXELADO (tarjetas de los lados y de atrás) ----------- */
    pixelMin: 4,            // tamaño del pixel (px) cuando la tarjeta empieza a alejarse
    pixelMax: 18,           // tamaño del pixel (px) en la tarjeta más lejana
    pixelSpread: 0.14,      // cuánto se sale el mosaico por fuera de la tarjeta (0.14 = 14% de su ancho)

    /* ---- REVERSO DE LAS TARJETAS --------------------------------------
       Tono plano que se ve cuando una tarjeta da la espalda (en vez de la imagen al revés).
       ------------------------------------------------------------------ */
    backColors: ['#1463D6', '#0A2F80']
  },

  /* =========================================================
     LOGO ANIMADO (arriba a la izquierda)
     ========================================================= */
  logoRotator: {
    prefix: 'Soy',
    base: 'Darso',
    baseDuration: 5000,     // ms que se queda "Soy Darso"
    words: ['Editor', 'Director de Arte', 'Animador', 'Diseñador Senior', '3D'],
    wordDuration: 1000      // ms de cada palabra
  },

  /* =========================================================
     MÚSICA DE FONDO
     • Pon tus canciones en assets/musica/ con estos nombres (o cambia las rutas).
     • Recomendado: MP3 a 128 kbps (≈1 MB por minuto) para no pasar el límite de GitHub.
     • autoplay: el navegador bloquea el audio hasta que la persona toca la página,
       así que si no puede sonar sola, arranca con el primer clic o toque.
     ========================================================= */
  music: {
    label: '¡Esto escucho yo!',
    autoplay: true,
    volume: 0.45,
    tracks: [
      { title: 'Canción uno', artist: 'Artista', src: 'assets/musica/cancion-01.mp3' },
      { title: 'Canción dos', artist: 'Artista', src: 'assets/musica/cancion-02.mp3' },
      { title: 'Canción tres', artist: 'Artista', src: 'assets/musica/cancion-03.mp3' }
    ]
  },

  /* =========================================================
     CARRUSEL DE LOGOS (sección "Marcas con las que he trabajado")
     • Guarda los logos en assets/marcas/ (SVG o PNG con fondo transparente).
     • forceWhite: true pinta cualquier logo de blanco, aunque el archivo sea a color.
     • Si un archivo no existe todavía, se muestra el nombre de la marca en texto.
     ========================================================= */
  brandCarousel: {
    speed: 36,              // px por segundo
    forceWhite: true,
    logos: [
      { name: 'Gatorade', src: 'assets/marcas/gatorade.png' },
      { name: 'P&G', src: 'assets/marcas/P&G.png' },
      { name: 'Protex', src: 'assets/marcas/protex.png' },
      { name: 'Cerveza Andina', src: 'assets/marcas/andina.png' },
      { name: 'Colgate', src: 'assets/marcas/colgate.png' },
      { name: 'Pepsi', src: 'assets/marcas/pepsi.png' },
      { name: 'Speed Stick', src: 'assets/marcas/speedstick.png' },
      { name: 'Dropi', src: 'assets/marcas/dropi.png' },
      { name: 'Kwikset', src: 'assets/marcas/kwikset.png' },
      { name: 'Pfister', src: 'assets/marcas/pfister.png' },
      { name: 'Yupi', src: 'assets/marcas/yupi.png' },
      { name: 'Cámara de Comercio de Orlando', src: 'assets/marcas/orlando.png' },
      { name: 'Bary', src: 'assets/marcas/bary.png' },
      { name: 'Grupo UMA', src: 'assets/marcas/uma.png' },
      { name: 'Tostao', src: 'assets/marcas/tostao.png' },
      { name: 'Colombiana', src: 'assets/marcas/colombiana.png' },
    ]
  },

  projects: [

    {
      title: 'Cup of Duty',
      category: 'Innovación',
      year: '2025',
      client: 'Mac & Cheese · D&AD Top Dog',
      role: 'Dirección de arte, 3D y diseño',
      message: 'Proyecto preseleccionado en el shortlist de FIAP 2025 en la categoría innovación.',
      tags: ['Idea', 'Dirección de arte'],
      link: null,
      colors: ['#FFB25B', '#3FD0FF', '#0B1A3A'],
      cover: 'assets/marcas/proyectos/1/Portada-1.webm',
      slides: [
        { type: 'image', src: 'https://drive.google.com/file/d/14_U3UUP_esACK2Gr781fbV72yOE1oDoJ/view?usp=sharing', caption: 'Key visual' },
        { type: 'embed', src: 'https://www.youtube.com/watch?v=BwgEcAEMR7g', caption: 'Manifiesto' },
        { type: 'image', src: 'https://drive.google.com/file/d/1Zgj7yVrf92wivJGY3-xs8c8pbGuski0P/view?usp=sharing', caption: 'Resumen del caso' },
      ]
    },
    {
      title: 'Sex Unlockers',
      category: 'Campaña',
      year: '2024',
      client: 'Durex · 🇦🇷  Miami Ad School Buenos Aires',
      role: 'Diseño senior y motion design',
      message: 'Animación de logotipo para una propuesta publicitaria que ganó el premio Top Dog plata en D&AD 2024.',
      tags: ['Campaña', 'Motion', 'Premiado'],
      link: null,
      colors: ['#F29A3E', '#1463D6', '#140C2E'],
      cover: 'assets/marcas/proyectos/2/Portada-2.webm',
      slides: [
        { type: 'image', src: 'https://drive.google.com/file/d/1bj9bFgIUyWQS-kGUY9lWQci4JYD-Td8K/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'embed', src: 'https://www.youtube.com/watch?v=uGKoW57GGuo', caption: 'Manifiesto' },

      ]
    },
    
    {
      title: 'Andina Master Beats',
      category: 'Campaña',
      year: '2024',
      client: 'Cerveza Andina · Emblue Group',
      role: 'Diseño senior y motion design',
      message: 'Campaña reconocida con dos Bronces en el WINA Festival y un reconocimiento en Ads of the World.',
      tags: ['Campaña', 'Motion', 'Premiado'],
      link: null,
      colors: ['#F29A3E', '#1463D6', '#140C2E'],
      cover: 'assets/marcas/proyectos/3/Portada-3.webm',
      slides: [
        { type: 'image', src: 'https://drive.google.com/file/d/1k44LNRmXw472cjM5bgkYOFHCqbmkWR15/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'embed', src: 'https://www.youtube.com/watch?v=u94-Xi5HD3g', caption: 'Video Caso' },
        { type: 'image', src: 'https://drive.google.com/file/d/1Jc1uWMLrHqB4B6ggpb_rIt63G62231GR/view?usp=sharing',  },
        { type: 'image', src: 'https://drive.google.com/file/d/1pORZ_tWBMVoPwfOohOyOQP2iI6z6vBCe/view?usp=sharing',  },
        { type: 'image', src: 'https://drive.google.com/file/d/1Eo5jza1avU5hYdSZVMgjaN6EZDjLDlko/view?usp=sharing',  },
        
      ]
    },
    {
      title: 'Gatorade Blue Ice',
      category: 'Campaña',
      year: '2024',
      client: 'Emblue Group Panamá-Colombia-Venezuela - Gatorade',
      role: 'Animación, 3D',
      message: 'Activación de marca con piezas gráficas y animadas para agentes de ventas, con renders de producto anunciando la llegada a Colombia del producto Gatorade Blue Ice.',
      tags: ['Idea', 'Dirección de arte'],
      link: null,
      colors: ['#FFB25B', '#3FD0FF', '#0B1A3A'],
      cover: 'assets/marcas/proyectos/4/Portada-4.webm',
      slides: [
        { type: 'embed', src: 'https://drive.google.com/file/d/1_3Su1P5BYdMzXivZEUBaedpyi2fISvZ1/view?usp=sharing', caption: 'Video Caso' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1YoysaG6k-CZQSwErT6ExghPbXK-W-Vlt/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'image', src: 'https://drive.google.com/file/d/1oFOWXQ-VBku5gG5Wz23BIL_yzw6LoyCz/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'image', src: 'https://drive.google.com/file/d/1L8Bk5FTyKbfBYU45fBFe7btlTGiV_yCz/view?usp=sharing', caption: '3D y animación' },
        { type: 'image', src: 'https://drive.google.com/file/d/1Bs4kwT84DIEkaQ5IjdG0GFxuTSQQrPOw/view?usp=sharing', caption: 'Logo-Motion' },
      ]
    },
    {
      title: 'Yupi',
      category: 'Campaña',
      year: '2024 - 2025',
      client: 'Emblue Group Panamá-Colombia-Venezuela',
      role: 'Director de Arte, Diseño senior y 3D',
      message: 'Key visuals y campañas completas: piezas para impresión en gran formato, animaciones y manifiestos.',
      tags: ['KV', 'Impreso', '3D'],
      link: null,
      colors: ['#3FD0FF', '#1463D6', '#061233'],
      cover: 'assets/marcas/proyectos/5/Portada-5.webm',
      slides: [
        { type: 'embed', src: 'https://drive.google.com/file/d/1lX84p6ArzwwurV6mKuhEHQsS_xmoOw6C/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1pyK8q0xkVuyl9rX92PW9_FFcnDOfPitt/view?usp=sharing', caption: 'Video promocional' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1Wbs10R_OGj5M9CbqREbzjWqMfPRbbVsM/view?usp=sharing', caption: 'Video promocional' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1zryUcmM0baIfYUX7R57TqkJE2IMA4M8o/view?usp=sharing', caption: 'Video promocional' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1Q4D6O8mELtX3pKYpMkRNF4HDB6yWcofK/view?usp=sharing', caption: 'Video promocional' },
        { type: 'image', src: 'https://drive.google.com/file/d/1XSi64JRPrsbth7Lm6e3qG8LrgyhSPM1Y/view?usp=sharing', caption: 'Key visual' },
        
      ]
    },
    {
      title: 'Colgate',
      category: 'Campaña',
      year: '2024',
      client: 'Emblue Group Colombia - Colgate',
      role: 'Motion y 3D',
      message: 'Animación para activaciones 360 de la marca colgate',
      tags: ['Producto', 'Render', 'Motion'],
      link: null,
      colors: ['#9DB7FF', '#1463D6', '#0A1330'],
      cover: 'assets/marcas/proyectos/6/Portada-6.webm',
      slides: [
        { type: 'image', src: 'https://drive.google.com/file/d/1wxtUAI44HSikZnhlNzEdA_DvsC9cHvqv/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'image', src: 'https://drive.google.com/file/d/1bi1zYVSTo2PftEv7RCjtzCaMF1S61ZRM/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1-Z7XDYJUK7zVUSvVpTuN56Ka7_Q-_7ir/view?usp=sharing', caption: 'Manifiesto' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1UDO-XXTizv2uRu4D-eUywgSIiBoyFl54/view?usp=sharing', caption: 'Video Caso' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1_S_EHDiKeXJOZDnNRqfdmhLbD8rNtHYi/view?usp=sharing', caption: 'Video Caso' },


      ]
    },
    {
      title: 'P&G',
      category: 'Campaña interna',
      year: '2024-2025',
      client: 'Emblue Group Panamá - P&G Latam',
      role: 'Diseño senior',
      message: 'Piezas gráficas para comunicación interna de marca P&G latinomérica.',
      tags: ['Consumo masivo', 'Social'],
      link: null,
      colors: ['#FFC94D', '#F29A3E', '#1A1235'],
      cover: 'assets/marcas/proyectos/7/Portada-7.webm',
      slides: [
        { type: 'image', src: 'https://drive.google.com/file/d/1p59OBB0vOVfz6QcM3rRvXTW2N4uhFS_T/view?usp=sharing', caption: 'Key visual - Logo-Motion' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1XMiHoSAFiUYXol11ggu9sOn2RLoecZHG/view?usp=sharing', caption: 'Video comercial' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1FSN-qQ0n_HkNN1pzMNPJNQs4qvZkOF1C/view?usp=sharing', caption: 'Video comercial' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1sh0DC7_dO7m1wLAsRq2snrGI_Htfddm_/view?usp=sharing', caption: 'Video comercial' },
        { type: 'image', src: 'https://drive.google.com/file/d/1_4kyUS-tuZkdAWJTuu1M9dZeyLaLH8nF/view?usp=sharing', caption: 'MOF - infinity gauntlet' },

      ]
    },
    {
      title: 'Speed Stick',
      category: 'Campaña',
      year: '2024',
      client: 'Emblue Group Colombia - Speed Stick',
      role: 'Diseño senior',
      message: 'Motion graphics y piezas gráficas para activación de marca en redes sociales.',
      tags: ['Gráfico', 'Campaña'],
      link: null,
      colors: ['#FF8A5B', '#3FD0FF', '#0C1633'],
      cover: 'assets/marcas/proyectos/8/Portada-8.webm',
      slides: [
        { type: 'image', src: 'https://drive.google.com/file/d/1jYcJcT9EhzMIr26BpazpjrN3ZHr8I9e1/view?usp=sharing', caption: 'Logo-Motion' },
        { type: 'embed', src: 'https://drive.google.com/file/d/19CaQcQ3QlAmD0Q-V01RGVHxZGnYtvtSy/view?usp=sharing', caption: 'Video caso' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1f6WW5HKryJFSiMLHtkANfg9QlmpPQ12_/view?usp=sharing', caption: 'Video caso' },
        { type: 'image', src: 'https://drive.google.com/file/d/1GN3ijcDkM98CTXcvoCwEE5XQ_9tqZZBO/view?usp=sharing', caption: 'Logo Motion' },
      ]
    },
    {
      title: 'Dropi Universe',
      category: 'Branding y 3D',
      year: '2024 - Hoy',
      client: 'Dropi',
      role: 'Direccción de arte, diseño y 3D',
      message: 'Diseño y animación de emotes, alertas y overlays personalizados para streamers de Twitch y Facebook Gaming.',
      tags: ['Twitch', 'Emotes', 'Overlays'],
      link: null,
      colors: [],
      cover: 'assets/marcas/proyectos/9/Portada-9.webm',
      slides: [
        { type: 'embed', src: 'https://drive.google.com/file/d/1Nnn8RA_abslZWf9m3PpNbAVhQgvDhch1/view?usp=sharing', caption: 'Logo Motion' },
        { type: 'image', src: 'https://drive.google.com/file/d/1sfYsed-hMh-lscVTRknWoZaExo4AqkVK/view?usp=sharing', caption: 'Modelo 3D y estilización con IA' },
        { type: 'image', src: 'https://drive.google.com/file/d/1vX7igkP71WDdC4pIWLQqSDg_dR__0huF/view?usp=sharing', caption: 'Manillas Leyendas' },
        { type: 'embed', src: 'https://drive.google.com/file/d/13SrgvtW9mCgimgilA6KaWmoJ0NvxONbq/view?usp=sharing', caption: 'Motion - VFX' },
        { type: 'embed', src: 'https://drive.google.com/file/d/12yDd1f-9nbKtgKCC07gz0O4R78enLiWX/view?usp=sharing', caption: 'Video IA' },
        { type: 'image', src: 'https://drive.google.com/file/d/1uKqonZcHtf0du11VZTYVlUiX38W-sGno/view?usp=sharing', caption: 'Diseño 3D placa conmemorativa' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1O6YjRaG5dyl6Dackqsgbe2BY20moXm1U/view?usp=sharing', caption: 'Logo Motion' },
        { type: 'image', src: 'https://drive.google.com/file/d/1sPYPNlVswsZcIvMrbD_oJBs2kBTL9Pwo/view?usp=sharing', caption: 'Key visual Dropi Cup' },
        { type: 'image', src: 'https://drive.google.com/file/d/1qa1SjaiN8sGtD2lO8ZT2EhkFTDJZi3_e/view?usp=sharing', caption: 'Key visual Dropi Cup' },
        { type: 'image', src: 'https://drive.google.com/file/d/1LTpld2Q8vy9MLlBoi1bmmanoItEXD-rA/view?usp=sharing',  },
        { type: 'image', src: 'https://drive.google.com/file/d/1hBaYmPOYn5bPbqlVkUpSMD5CiRvRszwX/view?usp=sharing',  },

        { type: 'embed', src: 'https://drive.google.com/file/d/1E_pbWgQ4K6vW_52dCbeJwNaB4VVDj7XE/view?usp=sharing', caption: 'Video expectativa IA' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1k03jf9hlfgDW8URbFysCCoI_2t0741lF/view?usp=sharing', caption: 'Video expectativa IA' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1g3bAM-TQNb8SlbXPyHCV3V2lZz45bLKR/view?usp=sharing', caption: 'Video expectativa IA' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1JtSW5tA_jyt21pVDgozKcATr6D5Gc-CV/view?usp=sharing', caption: 'Video expectativa IA' },

        { type: 'embed', src: 'https://drive.google.com/file/d/1KQfjOl4FA3YjPZNDdH07tayhXuKEJ6ub/view?usp=sharing', caption: 'Logo Motion' },
        { type: 'image', src: 'https://drive.google.com/file/d/1w4IqhzuWqF2XMKN6OpiFDUfG3bKQZdSY/view?usp=sharing', caption: 'Key visual Dropi IA' },

        { type: 'embed', src: 'https://drive.google.com/file/d/1xyj09xEnbhNnqBDPV1M_ApZP8VEyTx9w/view?usp=sharing', caption: 'Logo Motion Outro' },
        { type: 'embed', src: 'https://drive.google.com/file/d/11jKJxZO-ZXO0G585lvIIXNetgrTdhyzr/view?usp=sharing', caption: 'Video Recap 2do dia evento' },
        { type: 'image', src: 'https://drive.google.com/file/d/1DMYwMpKypk7lCw4xldWsFvdMKgBjniLr/view?usp=sharing', caption: 'Pieza difusión' },

        { type: 'embed', src: 'https://drive.google.com/file/d/1D6e-YI284J2YRhL6K0ohjpgl6nJI1wo5/view?usp=sharing', caption: 'Logo Motion' },

        { type: 'embed', src: 'https://drive.google.com/file/d/1rpCMPUv0nim5GxfLumkX9vQMumKYSbE8/view?usp=sharing', caption: 'Logo Motion videojuego' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1RauT8xbRT2OPrst9q9rUG1aj8eeq6vJM/view?usp=sharing', caption: 'Logo Motion' },
      ]
    },
    {
      title: 'Palco del Barrio',
      category: 'Innovación',
      year: '2025',
      client: 'Emblue Group Colombia - Colombiana',
      role: 'Diseño y animación',
      message: 'Propuesta de activación de marca para la bebida Colombiana.',
      tags: ['Motion'],
      link: null,
      colors: ['#FFB25B', '#3FD0FF', '#0B1A3A'],
      cover: 'assets/marcas/proyectos/10/Portada-10.webm',
      slides: [
        { type: 'image', src: 'https://drive.google.com/file/d/1k0XIJLYLAOsy8B28Tv-V3HQpjuHVbXes/view?usp=sharing', caption: 'Logo Motion' },
        { type: 'embed', src: 'https://www.youtube.com/watch?v=EQiuKqH_mQ8', caption: 'Manifiesto' },
        { type: 'image', src: 'https://drive.google.com/file/d/18EGSuaCXBlcimGS826S_AebwtAH1dM2Y/view?usp=sharing', caption: 'Motion' },
        { type: 'embed', src: 'https://drive.google.com/file/d/1o3nxoGEMme8CtOEm9DADK3Bcf5ojU8OU/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1x_JIcVwQWojny8e9k60rT9d8vC53hPL0/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1BdV8dDwVKYbJ91GH0NOezFP4bMHrEd9k/view?usp=sharing',  },
      ]
    },
    {
      title: 'Pfister , Kwikset',
      category: 'Audiovisual y motion',
      year: '2022 – 2023',
      client: 'Apolo31',
      role: 'Diseño, content planning y motion',
      message: 'Planeación y ejecución de estrategias de contenido, liderando un equipo creativo para mejorar la coherencia visual de las marcas.',
      tags: ['Motion'],
      link: null,
      colors: ['#3FD0FF', '#F29A3E', '#0A1330'],
      cover: 'assets/marcas/proyectos/11/Portada-11.webm' ,
      slides: [
        { type: 'embed', src: 'https://drive.google.com/file/d/1PI7IrlCMAD2L9YM_n0Mj5GQnqZ9yxQ7V/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/14b_yUI_mlEICZ6IfAPrVX6DFnq_qTocR/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/16JA2pAJr9_g9N-iU5b2qYN_hZBlUc_58/view?usp=sharing',  },
      ]
    },
    {
      title: 'KV´s / Motion / 3D',
      category: 'Innovación',
      year: '2025',
      client: 'Colombiana',
      role: 'Diseño, animación y 3D',
      message: 'Diseño y animación de animaciones diversas, desarrollo de 3D, emotes, alertas y overlays personalizados para streamers de Twitch y Facebook Gaming, Logomotion de diversas marcas.',
      tags: ['3D', 'Dirección de arte', 'Motion'],
      link: null,
      colors: ['#FFB25B', '#3FD0FF', '#0B1A3A'],
      cover: 'assets/marcas/proyectos/12/Portada-12.webm',
      slides: [
        { type: 'embed', src: 'https://drive.google.com/file/d/1j1JwiAh2WF7Lrmh-RSp8VAyig2xEFYSh/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1eoK_zvu7IoST0PnN3l5ZvIuhbZULP-cZ/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1Msoq44xSlRw7FBUGQm2FAS-JWD1is5jU/view?usp=sharing',  },

        { type: 'embed', src: 'https://drive.google.com/file/d/1WWe0U4qsEXIp5OACCBq02gsLIVgrbnkW/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1vG5RyYelliLonADIRwaY9JwqFQI4VdjO/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1SdVDAt8Qepb3I14JNxSTLhYzNmMglRgV/view?usp=sharing',  },

        { type: 'embed', src: 'https://drive.google.com/file/d/11UZq95EHW1B_mTYXTyzn_dQcDWwEU-n0/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1Kqq3tPF1rTK3N0rIC2kPR2b7uX8g_U_W/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/12Cx-vwchZBltBM9ccFGXuDDLOPgJ-SRg/view?usp=sharing',  },

        { type: 'embed', src: 'https://drive.google.com/file/d/1U5wu8yGzPWt_CyxyTkDrddRlvUiVtjqQ/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1sRAuv8LYi5goQ1VWxp5vOkPlK3Prvzl2/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1DmRUkRlubTXb4GTibs1W5MBG7JOSDeSz/view?usp=sharing',  },

        { type: 'embed', src: 'https://drive.google.com/file/d/1qzFs8CJxRzFw9-6ssHYGlxs3n0MP8R9x/view?usp=sharing',  },
        { type: 'embed', src: 'https://drive.google.com/file/d/1FdEtbmKxvC1a9nqPxPjhj7ezzmKe3rIO/view?usp=sharing',  },

      ]
    },
  ],

  profile: {
    name: 'Kevin Sánchez',
    alias: 'Soy Darso',
    photo: 'assets/img/foto-perfil.webp',
    location: 'Cali, Colombia',
    roles: ['Diseñador gráfico senior', 'Audiovisual y motion', 'Director de arte jr.', 'Generalista 3D'],
    bio: [
      'Diseño, animo y construyo mundos en 3D. Me muevo entre la idea, la dirección de arte y la producción, y disfruto llevar un concepto desde el primer boceto hasta la pieza que se publica.',
      'Crecí en agencias con enfoque growth, ATL y BTL, lo que me dio una visión 360°: piezas que no solo se ven bien, sino que conectan y funcionan en el entorno digital. Hoy lidero proyectos de 3D y animación, y sigo aprendiendo a dirigir equipos y cuidar cada detalle visual.'
    ],
    disciplines: [
      { title: 'Diseño gráfico senior', text: 'Identidad, key visuals, campañas completas y piezas para impreso y gran formato.' },
      { title: 'Audiovisual y motion', text: 'Animación 2D, manifiestos, piezas para redes y contenidos para streaming.' },
      { title: 'Dirección de arte jr.', text: 'Conceptualización, criterio visual y acompañamiento de equipos en proyectos audiovisuales.' },
      { title: 'Generalista 3D', text: 'Modelado, texturizado, entornos, iluminación y animación en Blender.' }
    ],
    experience: [
      { years: '2024 – hoy', company: 'Dropi', role: 'Diseñador gráfico senior, motion y 3D. Líder de proyectos 3D y animación' },
      { years: '2024 – hoy', company: 'Emblue Group Panamá', role: 'Freelance: diseño senior, motion y 3D' },
      { years: '2023 – 2024', company: 'Emblue Group', role: 'Diseñador gráfico senior y motion designer' },
      { years: '2023', company: 'Universidad Santiago de Cali', role: 'Profesor externo de contenidos digitales' },
      { years: '2022 – 2023', company: 'Apolo31', role: 'Diseñador gráfico, content planner y motion designer' },
      { years: '2019 – 2022', company: 'IamRole', role: 'Motion designer de alertas para streamers' },
      { years: '2017 – 2021', company: 'Actualícese', role: 'Diseñador gráfico, motion designer y UI/UX' },
      { years: '2017 – 2020', company: 'Wonpow', role: 'Diseñador gráfico y motion designer' }
    ],
    tools: ['Photoshop', 'Illustrator', 'After Effects', 'Premiere', 'CapCut', 'Blender'],
    aiTools: ['Gemini', 'ChatGPT', 'Sora', 'Midjourney', 'Suno', 'ElevenLabs', 'Freepik AI', 'Adobe Firefly'],
    awards: [
      { title: '2 Bronces WINA Festival', detail: 'Andina Master Beats, Emblue Group, 2024' },
      { title: 'Reconocimiento Ads of the World', detail: 'Andina Master Beats, Emblue Group, 2024' },
      { title: 'Shortlist FIAP 2025', detail: 'Cup of Duty, Mac & Cheese. Categoría innovación' },
      { title: 'Participación D&AD', detail: 'Premio Top Dog plata, Miami Ad School Argentina' }
    ],
    brands: ['Gatorade', 'P&G', 'Protex', 'Cerveza Andina', 'Colgate', 'Pepsi', 'Speed Stick', 'Dropi', 'Kwikset', 'Pfister', 'Yupi', 'Millonarios', 'Cámara de Comercio de Orlando', 'Bary', 'Grupo UMA', 'Natu Malta', 'Tostao', 'Coomeva', 'Colombiana', 'EcomWom', 'ChateaPro'],
    education: [
      { year: '2016', title: 'Diseño gráfico · Diplomado en animación y modelado 3D', place: 'Fundación Academia de Dibujo Profesional' },
      { year: '2022', title: 'Fundamentos de diseño de interfaces UI y UX · Metodologías para diseñar un producto digital', place: 'Platzi' }
    ],
    contact: {
      email: 'holakevin.w@gmail.com',
      whatsapp: '+57 316 2133684',
      instagram: 'soydarso',
      behance: 'soydarso',
      linkedin: 'https://www.linkedin.com/in/soydarso/'
    }
  }
};
