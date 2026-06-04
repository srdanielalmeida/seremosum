import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, Music, VolumeX, Heart, Share2 } from 'lucide-react';

// Estilos injetados para fontes e animações customizadas
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,300;0,400;1,300&display=swap');

    :root {
      --gold-primary: #D4A574;
      --gold-light: #F3E0C8;
      --dark-bg: #0A0A0A;
    }

    .font-playfair { font-family: 'Playfair Display', serif; }
    .font-lora { font-family: 'Lora', serif; }

    .glow-text {
      text-shadow: 0 0 20px rgba(212, 165, 116, 0.3), 0 0 40px rgba(212, 165, 116, 0.1);
    }

    .glass-panel {
      background: rgba(10, 10, 10, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(212, 165, 116, 0.15);
    }

    /* Floating Particles Animation */
    @keyframes float {
      0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
      50% { transform: translateY(-100px) translateX(20px); opacity: 0.6; }
    }
    
    .particle {
      position: absolute;
      background: var(--gold-light);
      border-radius: 50%;
      pointer-events: none;
      animation: float 8s infinite ease-in-out;
    }

    /* Fade in cascade */
    .fade-in-cascade {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 1s ease-out, transform 1s ease-out;
    }
    .fade-in-cascade.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .hero-bg {
      background-image: url("/images/bg-optimized.webp");
      background-size: cover;
      background-position: left center;
    }
    @media (min-width: 768px) {
      .hero-bg {
        background-position: center;
      }
    }

    .details-bg {
      background-image: url("/images/_MG_7003-Edit-2.jpg");
      background-size: cover;
      background-position: top center;
      background-attachment: fixed;
      background-color: var(--dark-bg);
    }
    @media (max-width: 768px) {
      .details-bg {
        background-attachment: scroll;
        background-size: 100% auto;
        background-repeat: no-repeat;
        background-position: top center;
      }
    }
    
    html {
      scroll-behavior: smooth;
    }
    body {
      background-color: var(--dark-bg);
      color: #FDFBF7;
    }
  `}</style>
);

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [elementsVisible, setElementsVisible] = useState({});
  const sectionRefs = useRef([]);

  // Handle Scroll for Parallax and Intersection
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Preload background image
    const img = new Image();
    img.src = '/images/bg-optimized.webp';
    img.onload = () => setIsLoaded(true);
    // Fallback if image fails to load or takes too long (e.g. 1.5s)
    const fallbackTimer = setTimeout(() => setIsLoaded(true), 1500);

    // Intersection Observer for fade-ins
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setElementsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.2 });

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Tentar tocar o áudio automaticamente ao carregar a página
  useEffect(() => {
    let startPlay;
    let removeInteractionListeners;

    const playAudio = () => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setAudioPlaying(true);
            })
            .catch((error) => {
              console.log("Autoplay impedido pelo navegador. Aguardando interação do usuário...", error);
              
              // Se foi impedido, ouvimos interações na página para iniciar o som
              startPlay = () => {
                if (audioRef.current) {
                  audioRef.current.play()
                    .then(() => {
                      setAudioPlaying(true);
                      removeInteractionListeners();
                    })
                    .catch((err) => console.log("Falha ao tocar após interação:", err));
                }
              };

              removeInteractionListeners = () => {
                window.removeEventListener('click', startPlay);
                window.removeEventListener('touchstart', startPlay);
                window.removeEventListener('keydown', startPlay);
              };

              window.addEventListener('click', startPlay);
              window.addEventListener('touchstart', startPlay);
              window.addEventListener('keydown', startPlay);
            });
        }
      }
    };

    // Tenta tocar imediatamente após a renderização
    playAudio();

    return () => {
      if (removeInteractionListeners) {
        removeInteractionListeners();
      }
    };
  }, []);

  // Áudio Background
  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  // Parallax calculations
  const heroScale = 1 + (scrollY * 0.0005);
  const heroOpacity = Math.max(0, 1 - (scrollY * 0.002));
  const heroTranslateY = scrollY * 0.4;
  
  const detailsScale = 1 + (scrollY * 0.0002);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      <GlobalStyles />
      <audio ref={audioRef} src="/music/My Love.mp4" loop autoPlay />

      {/* Audio Control */}
      <button
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 p-3 rounded-full glass-panel text-[#D4A574] hover:text-white transition-all duration-500 hover:scale-110"
        aria-label="Toggle Audio"
      >
        {audioPlaying ? <Music size={20} className="animate-pulse" /> : <VolumeX size={20} />}
      </button>

      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>

      {/* HERO SECTION (Parallax) */}
      <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 transition-transform duration-1000 ease-out hero-bg"
          style={{
            transform: `scale(${heroScale}) translateY(${heroTranslateY}px)`,
            opacity: heroOpacity,
          }}
        >
          {/* Moody Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0A0A0A]"></div>
        </div>

        <div className={`relative z-10 text-center px-4 transition-all duration-1500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="font-lora tracking-[0.3em] text-[#D4A574] text-sm md:text-base uppercase mb-6 opacity-80">
            Save The Date
          </p>
          <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl text-white mb-8 glow-text leading-tight">
            Daniel <br className="md:hidden" />
            <span className="text-[#D4A574] italic font-light mx-4">&amp;</span> <br className="md:hidden" />
            Ellen Maria
          </h1>
          <p className="font-lora text-lg md:text-xl text-gray-300 italic max-w-xl mx-auto">
            "Aonde fores irei, onde ficares ficarei! O teu povo será o meu povo e o teu Deus será o meu Deus!."
          </p>

          <div className="mt-16 animate-bounce opacity-50">
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4A574] to-transparent mx-auto"></div>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="relative z-20 py-24 md:py-32 overflow-hidden">
        
        {/* Animated Background */}
        <div 
          className="absolute inset-0 z-0 transition-transform duration-1000 ease-out details-bg"
          style={{ transform: `scale(${detailsScale})` }}
        ></div>

        {/* Overlay escuro para contraste */}
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">

          <div
            id="invitation-text"
            ref={addToRefs}
            className={`text-center space-y-8 fade-in-cascade ${elementsVisible['invitation-text'] ? 'visible' : ''}`}
          >
            <Heart className="mx-auto text-[#D4A574] mb-8" size={32} strokeWidth={1} />
            <h2 className="font-playfair italic text-3xl md:text-5xl text-white">Para todo o sempre</h2>

            <p className="font-lora text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Com imensa alegria, convidamos você para celebrar o momento mais especial de nossas vidas. Reserve esta data para brindarmos juntos ao amor.
            </p>
          </div>

          {/* Date & Time Glass Panel */}
          <div
            id="date-panel"
            ref={addToRefs}
            className={`relative mt-24 bg-[#0A0A0A] border border-[#D4A574]/15 rounded-3xl overflow-hidden fade-in-cascade bg-cover bg-center ${elementsVisible['date-panel'] ? 'visible' : ''}`}
            style={{ 
              transitionDelay: '200ms',
              backgroundImage: 'url("/images/_MG_7060-Edit.jpg")' 
            }}
          >
            {/* Overlay para legibilidade do texto */}
            <div className="absolute inset-0 bg-black/60 z-0"></div>

            {/* Informações */}
            <div className="relative z-10 p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-center">
                <div className="space-y-4">
                  <Calendar className="mx-auto text-[#D4A574]" size={28} strokeWidth={1.5} />
                  <h3 className="font-playfair text-2xl text-white">A Data</h3>
                  <p className="font-lora text-gray-400">31 de Outubro de 2026<br />Sábado</p>
                </div>

                <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-[#D4A574]/30 to-transparent mx-auto"></div>
                <div className="md:hidden h-px w-24 bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent mx-auto"></div>

                <div className="space-y-4">
                  <Clock className="mx-auto text-[#D4A574]" size={28} strokeWidth={1.5} />
                  <h3 className="font-playfair text-2xl text-white">A Hora</h3>
                  <p className="font-lora text-gray-400">Cerimônia às 16:00<br />Recepção a seguir</p>
                </div>

                <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-[#D4A574]/30 to-transparent mx-auto"></div>
                <div className="md:hidden h-px w-24 bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent mx-auto"></div>

                <div className="space-y-4">
                  <MapPin className="mx-auto text-[#D4A574]" size={28} strokeWidth={1.5} />
                  <h3 className="font-playfair text-2xl text-white">O Local</h3>
                  <p className="font-lora text-gray-400">Marabá, PA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Actions */}
          <div
            id="actions"
            ref={addToRefs}
            className={`mt-24 flex flex-col md:flex-row gap-6 justify-center items-center fade-in-cascade ${elementsVisible['actions'] ? 'visible' : ''}`}
            style={{ transitionDelay: '400ms' }}
          >
            <a 
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Casamento+de+Daniel+e+Ellen+Maria&dates=20261031T190000Z/20261101T025900Z&details=Com+imensa+alegria%2C+convidamos+voc%C3%AA+para+celebrar+o+momento+mais+especial+de+nossas+vidas.+Cerim%C3%B4nia+%C3%A0s+16%3A00.&location=Marab%C3%A1%2C+PA"
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto px-10 py-4 bg-[#D4A574] text-[#0A0A0A] rounded-full font-lora font-semibold tracking-wider uppercase text-sm hover:bg-[#F3E0C8] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(212,165,116,0.3)] text-center block"
            >
              Adicionar ao Calendário
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#0A0A0A] py-12 text-center relative z-20">
        <div className="w-16 h-[1px] bg-[#D4A574]/30 mx-auto mb-8"></div>

        <div className="flex flex-col items-center gap-2 mb-12 px-6">
          <p className="font-lora text-[#D4A574] italic text-base md:text-lg max-w-2xl mx-auto opacity-80">
            "Para que todos vejam, e saibam, e considerem, e juntamente entendam que a mão do Senhor fez isso."
          </p>
          <p className="font-lora text-[#D4A574] text-xs tracking-widest uppercase opacity-60">
            Isaías 41:20
          </p>
        </div>

        <p className="font-playfair text-[#D4A574] text-xl italic mb-4">D & E</p>
        <p className="font-lora text-gray-500 text-sm">
          Mal podemos esperar para celebrar com você.
        </p>
      </footer>
    </div>
  );
}
