"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Clapperboard } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const [countdown, setCountdown] = useState(5);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const topSprocketRef = useRef<HTMLDivElement | null>(null);
  const bottomSprocketRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLSpanElement | null>(null);

  // Detect viewport changes to toggle mobile mode
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handleMatch = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mq.matches);
    mq.addEventListener("change", handleMatch);
    return () => mq.removeEventListener("change", handleMatch);
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next > 0) return next;
        clearInterval(interval);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Desktop-only interactions (GSAP + custom cursor)
  useEffect(() => {
    if (isMobile) return undefined;

    const panels = gsap.utils.toArray<HTMLElement>(".panel");

    // Sprocket generation
    const generateSprockets = () => {
      const topStrip = topSprocketRef.current;
      const bottomStrip = bottomSprocketRef.current;
      if (!topStrip || !bottomStrip) return;

      topStrip.innerHTML = "";
      bottomStrip.innerHTML = "";

      const totalWidth = window.innerWidth * panels.length;
      const holeSize = 60; // width + margin for desktop
      const count = Math.ceil(totalWidth / holeSize);

      const createHole = () => {
        const hole = document.createElement("div");
        hole.className = "sprocket-hole";
        return hole;
      };

      for (let i = 0; i < count; i += 1) {
        topStrip.appendChild(createHole());
        bottomStrip.appendChild(createHole());
      }
    };

    // Custom cursor
    const moveCursor = (event: MouseEvent) => {
      if (!cursorRef.current) return;
      gsap.to(cursorRef.current, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    const handleEnter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      if (!cursorRef.current) return;
      cursorRef.current.classList.add("hovered");
      const text = target.getAttribute("data-cursor-text") || "VIEW";
      cursorRef.current.setAttribute("data-text", text);
    };

    const handleLeave = () => {
      if (!cursorRef.current) return;
      cursorRef.current.classList.remove("hovered");
      cursorRef.current.setAttribute("data-text", "");
    };

    const interactables = document.querySelectorAll<HTMLElement>(
      ".interactable, a, button"
    );
    interactables.forEach((element) => {
      element.addEventListener("mouseenter", handleEnter);
      element.addEventListener("mouseleave", handleLeave);
    });

    document.addEventListener("mousemove", moveCursor);
    window.addEventListener("resize", generateSprockets);
    generateSprockets();

    // GSAP horizontal scroll
    const progressBar = progressRef.current;
    const frameDisplay = frameRef.current;

    const ctx = gsap.context(() => {
      const scrollTween = gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: ".wrapper",
          pin: true,
          scrub: 1,
          end: () => `+=${window.innerWidth * (panels.length - 1)}`,
          onUpdate: (self) => {
            if (progressBar) {
              progressBar.style.width = `${self.progress * 100}%`;
            }
            if (frameDisplay) {
              const frame = Math.min(
                Math.round(self.progress * (panels.length - 1)) + 1,
                panels.length
              );
              frameDisplay.textContent = frame.toString().padStart(3, "0");
            }
          }
        }
      });

      panels.forEach((section) => {
        const img = section.querySelector<HTMLImageElement>(".parallax-img img");
        if (img) {
          gsap.to(img, {
            x: "10%",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              containerAnimation: scrollTween,
              start: "left right",
              end: "right left",
              scrub: true
            }
          });
        }

        const texts = section.querySelectorAll<HTMLElement>(".reveal-text");
        if (texts.length) {
          gsap.set(texts, { y: 30 });
          gsap.to(texts, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
              trigger: section,
              containerAnimation: scrollTween,
              start: "left center",
              toggleActions: "play none none reverse"
            }
          });
        }
      });
    }, wrapperRef);

    ScrollTrigger.refresh();

    return () => {
      interactables.forEach((element) => {
        element.removeEventListener("mouseenter", handleEnter);
        element.removeEventListener("mouseleave", handleLeave);
      });
      document.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("resize", generateSprockets);
      ctx.revert();
      ScrollTrigger.killAll();
    };
  }, [isMobile]);

  const countdownDisplay = countdown > 0 ? countdown : "ACTN";

  const trackClass = useMemo(
    () =>
      isMobile
        ? "flex flex-col w-full h-auto"
        : "flex h-full w-[600vw] relative will-change-transform",
    [isMobile]
  );

  return (
    <main className="relative min-h-screen">
      <div id="cursor" ref={cursorRef} />
      <div className="film-grain" />

      {/* Frame Counter */}
      <div className="fixed top-6 right-6 md:top-10 md:right-10 z-50 font-mono text-xs md:text-sm text-red-carpet mix-blend-screen">
        <div className="flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 rounded-full bg-red-carpet inline-block" />
          REC [ <span ref={frameRef} className="tabular-nums text-white">001</span> / 006 ]
        </div>
      </div>

      {/* Logo */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 z-50 mix-blend-difference pointer-events-none">
        <h1 className="font-oswald font-bold text-xl md:text-2xl tracking-tighter text-white">
          ADVERSE<span className="text-red-carpet">.MEDIA</span>
        </h1>
      </div>

      {/* Timeline Scrubber */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[80%] max-w-md h-[2px] bg-white/10 z-50 rounded-full overflow-visible hidden md:block">
        <div className="absolute inset-y-0 left-0 bg-red-carpet w-0" ref={progressRef}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-celluloid-cream rounded-full shadow-[0_0_10px_rgba(217,30,54,0.8)]" />
        </div>
      </div>

      <div
        className={`wrapper relative w-full ${
          isMobile ? "min-h-screen overflow-visible" : "h-screen overflow-hidden"
        }`}
        ref={wrapperRef}
      >
        <div className={trackClass}>
          {!isMobile && (
            <>
              <div className="sprocket-strip sprocket-top" ref={topSprocketRef} />
              <div className="sprocket-strip sprocket-bottom" ref={bottomSprocketRef} />
            </>
          )}

          {/* Frame 1 */}
          <section className="panel w-screen min-h-screen h-full relative flex-shrink-0 border-r border-white/5 flex items-center justify-center bg-film-black group" data-cursor-text="START">
            <div className="absolute inset-0 flex flex-col justify-center items-center z-10">
              <div className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px] border border-white/10 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 border-t border-red-carpet rounded-full animate-[spin_4s_linear_infinite]" />
                <div className="absolute w-[1px] h-full bg-white/5" />
                <div className="absolute w-full h-[1px] bg-white/5" />
                <span id="countdown" className="text-[8rem] md:text-[16rem] font-oswald font-bold text-celluloid-cream tabular-nums leading-none mt-4">
                  {countdownDisplay}
                </span>
              </div>

              <div className="absolute bottom-[15%] text-center px-4">
                <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-red-carpet mb-4 animate-pulse">
                  Production Mode: Active
                </p>
                <h2 className="text-3xl md:text-6xl font-display italic text-white/90">
                  AI-Crafted Cinematic Marketing
                </h2>
              </div>
            </div>

            <div className="absolute right-0 top-0 h-full w-12 md:w-24 flex items-center justify-center bg-gradient-to-l from-black/80 to-transparent border-l border-white/5 z-20">
              <div className="writing-vertical font-mono text-[10px] md:text-xs tracking-widest flex items-center gap-4 text-white/50 animate-bounce">
                <span>SCROLL TO ENTER</span>
                <ArrowDown className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </section>

          {/* Frame 2 */}
          <section className="panel w-screen min-h-screen h-full relative flex-shrink-0 border-r border-white/5 flex items-center bg-[#080808]">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black" />

            <div className="container mx-auto px-6 md:px-32 relative z-10 grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-8">
                <div className="flex items-center gap-4 mb-6 md:mb-10 opacity-0 reveal-text">
                  <span className="w-12 h-[1px] bg-red-carpet" />
                  <span className="font-mono text-red-carpet text-xs tracking-widest uppercase">
                    Scene 01: The Hook
                  </span>
                </div>

                <h2 className="text-4xl md:text-7xl font-display leading-[1.1] mb-8 text-silver-screen opacity-0 reveal-text">
                  Upload your B-roll. <br />
                  <span className="italic text-celluloid-cream relative inline-block">
                    We turn it into cinema.
                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-red-carpet" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </span>
                </h2>

                <p className="font-mono text-sm md:text-xl text-gray-400 max-w-2xl leading-relaxed opacity-0 reveal-text">
                  Drop in B-roll from your brand or product. We handle scripting, AI voiceovers, AI avatars, and grade it like a feature. Launch-ready films for SaaS, fintech, and enterprise—without reshoots.
                </p>
              </div>
            </div>

            <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] transform -rotate-12 pointer-events-none">
              <Clapperboard className="w-[600px] h-[600px]" />
            </div>
          </section>

          {/* Frame 3 */}
          <section className="panel w-screen min-h-screen h-full relative flex-shrink-0 border-r border-white/5 overflow-hidden group interactable" data-cursor-text="WATCH">
            <div className="absolute inset-0 w-[120%] h-full -left-[10%] parallax-img">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
                className="w-full h-full object-cover grayscale brightness-50 contrast-125 group-hover:grayscale-0 group-hover:brightness-75 transition-all duration-700 ease-out"
                alt="Abstract Architecture"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

            <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-24">
              <div className="relative z-10 transform md:translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="hidden md:block text-[12rem] font-oswald text-white opacity-[0.03] absolute -top-40 -left-10 leading-none select-none pointer-events-none">
                  NOIR
                </h3>

                <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6 mb-4">
                  <h2 className="text-5xl md:text-8xl font-display text-white tracking-tight">Vault.io</h2>
                  <span className="inline-block border border-white/30 px-3 py-1 font-mono text-[10px] md:text-xs text-white/70 rounded-full mb-2 md:mb-6 w-fit">
                    2024 / FINTECH
                  </span>
                </div>

                <div className="mt-4 md:mt-8 max-w-xl">
                  <p className="burned-subtitle font-mono text-sm md:text-lg text-celluloid-cream italic inline-block leading-relaxed">
                    &quot;We uploaded raw office B-roll. AdVerse returned a full heist-style launch film with AI voiceover and avatar host.&quot;
                  </p>
                </div>

                <div className="mt-8 md:mt-12 flex gap-4">
                  <button
                    className="px-8 py-3 bg-red-carpet text-white font-oswald font-bold text-sm hover:bg-white hover:text-black transition-colors uppercase tracking-widest interactable"
                    data-cursor-text="PLAY"
                  >
                    Watch Cut
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Frame 4 */}
          <section className="panel w-screen min-h-screen h-full relative flex-shrink-0 border-r border-white/5 overflow-hidden group interactable" data-cursor-text="WATCH">
            <div className="absolute inset-0 w-[120%] h-full -left-[10%] parallax-img">
              <img
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2659&auto=format&fit=crop"
                className="w-full h-full object-cover grayscale brightness-50 contrast-125 group-hover:grayscale-0 group-hover:brightness-75 transition-all duration-700 ease-out"
                alt="Film Projector Light"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

            <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-24">
              <div className="relative z-10 transform md:translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="hidden md:block text-[12rem] font-oswald text-white opacity-[0.03] absolute -top-40 right-0 leading-none select-none pointer-events-none text-right">
                  DRIFT
                </h3>

                <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6 mb-4">
                  <h2 className="text-5xl md:text-8xl font-display text-white tracking-tight">HyperScale</h2>
                  <span className="inline-block border border-white/30 px-3 py-1 font-mono text-[10px] md:text-xs text-white/70 rounded-full mb-2 md:mb-6 w-fit">
                    2025 / SAAS
                  </span>
                </div>

                <div className="mt-4 md:mt-8 max-w-xl">
                  <p className="burned-subtitle font-mono text-sm md:text-lg text-celluloid-cream italic inline-block leading-relaxed">
                    &quot;We shared rough product B-roll. They cut a kinetic story with AI narration and avatar talent—no dashboards needed.&quot;
                  </p>
                </div>

                <div className="mt-8 md:mt-12 flex gap-4">
                  <button
                    className="px-8 py-3 bg-red-carpet text-white font-oswald font-bold text-sm hover:bg-white hover:text-black transition-colors uppercase tracking-widest interactable"
                    data-cursor-text="PLAY"
                  >
                    Watch Cut
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Frame 5 */}
          <section className="panel w-screen min-h-screen h-full relative flex-shrink-0 border-r border-white/5 bg-silver-screen text-film-black flex items-center">
            <div className="container mx-auto px-6 md:px-32 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <span className="font-mono text-red-carpet text-xs tracking-widest uppercase mb-4 block">
                  Scene 03: AI-First Pipeline
                </span>
                <h2 className="text-4xl md:text-7xl font-oswald uppercase mb-8 md:mb-12 tracking-tighter text-black">
                  Upload. We
                  <br />
                  Deliver Cinema.
                </h2>

                <ul className="space-y-4 md:space-y-6 font-display text-2xl md:text-4xl">
                  {[
                    ["01", "Upload B-roll & Brand Kit"],
                    ["02", "AI Script + Voice + Avatar"],
                    ["03", "Cinematic Cut & Grade"],
                    ["04", "Delivery & Launch Toolkit"]
                  ].map(([step, label]) => (
                    <li
                      key={step}
                      className="flex items-baseline gap-4 group cursor-none interactable"
                      data-cursor-text={`STEP ${step}`}
                    >
                      <span className="text-xs md:text-sm font-mono text-red-carpet">{step}</span>
                      <span className="border-b-2 border-black/10 group-hover:border-red-carpet transition-all duration-300 transform group-hover:translate-x-2">
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden md:flex flex-col justify-center font-mono text-xs md:text-sm border-l-2 border-black/5 pl-12 h-fit py-8 bg-white/50 backdrop-blur-sm rounded-r-lg">
                <p className="mb-4 font-bold text-gray-400">SCRIPT_FINAL_V3.PDF</p>
                <p className="mb-4 tracking-wide">INT. CREATIVE AGENCY - NIGHT</p>
                <p className="mb-4 max-w-sm">
                  The team is huddled around a monitor. The glow of the screen illuminates their faces.
                </p>
                <p className="mb-4 text-gray-500">// We utilize Arri Alexa cinema cameras.</p>
                <p className="mb-4 text-gray-500">// We grade in DaVinci Resolve Studio.</p>
                <p className="text-red-carpet font-bold mt-4 tracking-widest">CUT TO BLACK.</p>
              </div>
            </div>
          </section>

          {/* Frame 6 */}
          <section className="panel w-screen min-h-screen h-full relative flex-shrink-0 bg-film-black flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="animate-[scrollY_20s_linear_infinite] w-full text-center font-oswald text-4xl text-white space-y-24 pt-[100vh]">
                <p>DIRECTED BY ADVERSE</p>
                <p>PRODUCED BY CLIENTS</p>
                <p>EDITED IN LA</p>
                <p>MUSIC BY SYNTHWAVE</p>
              </div>
            </div>

            <div className="max-w-4xl px-8 relative z-10">
              <h2 className="text-5xl md:text-9xl font-display text-white mb-6 md:mb-8 tracking-tight">The End?</h2>
              <p className="font-mono text-sm md:text-xl text-silver-screen mb-12 max-w-lg mx-auto">
                Or just the beginning of your brand&apos;s cinematic universe.
              </p>

              <a
                href="#"
                className="inline-block group relative px-12 md:px-16 py-6 md:py-8 bg-transparent overflow-hidden border border-white/20 interactable"
                data-cursor-text="HIRE US"
              >
                <div className="absolute inset-0 w-full h-full bg-red-carpet group-hover:bg-white transition-colors duration-300 ease-out" />
                <span className="relative font-oswald text-xl md:text-3xl uppercase tracking-[0.2em] text-white group-hover:text-black z-10 transition-colors duration-300">
                  Start Project
                </span>
              </a>

              <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-widest">
                <div className="hover:text-white transition-colors">
                  <span className="block text-red-carpet mb-2">Director</span>
                  AdVerse Media
                </div>
                <div className="hover:text-white transition-colors">
                  <span className="block text-red-carpet mb-2">Location</span>
                  Los Angeles, CA
                </div>
                <div className="hover:text-white transition-colors">
                  <span className="block text-red-carpet mb-2">Contact</span>
                  hello@adverse.media
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 md:bottom-20 font-mono text-[10px] text-gray-700">
              © 2025 ADVERSE MEDIA. FILM STRIP CONCEPT V2.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

