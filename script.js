const char_name = ["bocchi", "nijika", "ryo", "ikuyo"];
const char_fullname = ["hitori gotoh", "nijika ijichi", "ryo yamada", "ikuyo kita"];
const char_name_jp = ["後藤 ひとり", "伊地知 虹夏", "山田 リョウ", "喜多 郁代"];
const char_color = ["#FF2291", "#FFB400", "#02D1E0", "#FF4637"];
const char_role = ["GUITAR", "DRUMS", "BASS", "VOCAL & GUITAR"];
const char_profile = [
      "極度の人見知りで陰キャな高校一年生。結束バンドのリードギター担当。陰キャでも輝けそうなバンド活動に憧れギターを始める。腕前は本物だが、バンドや人前でうまく発揮することができない。会話の頭に必ず「あっ」って付けちゃう。",
      "元気いっぱいの明るい高校二年生。結束バンドのドラム担当。結束バンドに加入したひとりにいろいろ世話を焼いてくれるバンドのまとめ役。ライブハウス「STARRY」の店長である星歌を姉に持ち、ライブハウスに特別な思いを持っている。",
      "クールで孤高な高校二年生。結束バンドのベース担当。虹夏の親友。趣味などが浮世離れしており、変わり者と言われると喜ぶ。裕福な家庭で暮らしているが楽器に対してお金遣いが荒く常に金欠。たまに雑草を食べて空腹を紛らわす。",
      "明るく人望もある高校一年生。結束バンドのギターボーカル担当。人と関わることが好きで初対面でも臆することなく笑顔で話しかけられる陽キャ。リョウに対して憧れを抱いており、その感情が行き過ぎることも。イソスタに写真をよくあげる。"
];

const runningText = document.querySelector(".running-text"),
      tickerTrack = document.querySelector(".ticker-track"),
      kanjiName = document.querySelector(".kanji-name"),
      profileText = document.querySelector(".profile-text"),
      pagination = document.querySelector(".pagination"),
      paginationBar = document.querySelector(".pagination-bar"),
      charBg = document.querySelector(".char-bg .bg-wrapper img"),
      charImg = document.querySelector(".img-char .main-char"),
      charProfileHeader = document.querySelector(".profile-header img"),
      charIcon = document.querySelector(".profile-inner .right .middle img"),
      profileQuote1 = document.querySelector(".profile-inner .right .text-1"),
      profileQuote2 = document.querySelector(".profile-inner .right .text-2"),
      quote1 = document.querySelector(".profile-inner .right .text-1 img"),
      quote2 = document.querySelector(".profile-inner .right .text-2 img"),
      charQuoteImg = document.querySelector(".char-quote img"),
      prevBtn = document.querySelector(".prev-btn"),
      nextBtn = document.querySelector(".next-btn");

const displayOrder = [2, 1, 3, 0];
let currentIndex = 1;
let isAnimating = false;
let mainLoop = null;
let tickerLoop = null;
let autoplayTimer = null;

const AUTOPLAY_DELAY = 4000;

function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
}

function stopAutoplay() {
      clearInterval(autoplayTimer);
}

function populateMarquee(container, text, minTotalWidth = window.innerWidth * 2.5) {
      if (!container) return;
      container.innerHTML = "";
      const temp = document.createElement("span");
      temp.textContent = text;
      container.appendChild(temp);
      const spanWidth = temp.offsetWidth || (text.length * 16);
      const count = Math.max(Math.ceil(minTotalWidth / spanWidth) + 4, 16);

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
            const span = document.createElement("span");
            span.textContent = text;
            fragment.appendChild(span);
      }
      container.innerHTML = "";
      container.appendChild(fragment);
}

function initLoops() {
      if (typeof horizontalLoop !== "function") return;
      if (mainLoop) mainLoop.kill();
      if (tickerLoop) tickerLoop.kill();
      // Velocidades bajas: ~45px/s principal, ~30px/s ticker
      mainLoop = horizontalLoop(runningText.querySelectorAll("span"), { speed: 0.45, repeat: -1, paddingRight: 14 });
      if (tickerTrack) {
            tickerLoop = horizontalLoop(tickerTrack.querySelectorAll("span"), { speed: 0.3, repeat: -1, paddingRight: 8 });
      }
}

function refreshLoopText() {
      const bannerText = `${char_name[currentIndex].toUpperCase()}\u00A0`;
      populateMarquee(runningText, bannerText, window.innerWidth * 2.5);

      if (tickerTrack) {
            const tickerText = `${char_fullname[currentIndex].toUpperCase()} — ${char_role[currentIndex]} — KESSOKU BAND — `;
            populateMarquee(tickerTrack, tickerText, window.innerWidth * 2.5);
      }

      // Esperar un frame a que el navegador registre los elementos y crear el loop continuo
      requestAnimationFrame(() => {
            initLoops();
      });
}

function updatePaginationBar() {
      const activeItem = document.querySelector(`.pagination-item[data-index="${currentIndex}"]`);
      if (activeItem && paginationBar) {
            // offsetLeft es más fiable que getBoundingClientRect en load con fuentes/imágenes
            gsap.to(paginationBar, {
                  left: activeItem.offsetLeft,
                  width: activeItem.offsetWidth,
                  duration: 0.45,
                  ease: "power3.out",
                  overwrite: true
            });
      }
}

function setSlide(newIndex, direction = 1) {
      if (isAnimating || newIndex === currentIndex) return;
      isAnimating = true;

      currentIndex = newIndex;

      document.documentElement.style.setProperty("--theme-color", char_color[currentIndex]);

      document.querySelectorAll(".pagination-item").forEach((item) => {
            const idx = parseInt(item.getAttribute("data-index"), 10);
            if (idx === currentIndex) {
                  item.classList.add("active");
            } else {
                  item.classList.remove("active");
            }
      });
      updatePaginationBar();

      gsap.to(charImg, {
            opacity: 0,
            x: -direction * 45,
            scale: 0.96,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                  charImg.src = `assets/char/${char_name[currentIndex]}/${char_name[currentIndex]}.png`;
                  gsap.fromTo(
                        charImg,
                        { opacity: 0, x: direction * 45, scale: 0.96 },
                        {
                              opacity: 1,
                              x: 0,
                              scale: 1,
                              duration: 0.35,
                              ease: "power2.out",
                              onComplete: () => {
                                    isAnimating = false;
                              }
                        }
                  );
            }
      });

      gsap.to(charBg, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                  charBg.src = `assets/char/${char_name[currentIndex]}/${char_name[currentIndex]}-bg.png`;
                  gsap.to(charBg, { opacity: 0.5, duration: 0.35 });
            }
      });

      gsap.to(charQuoteImg, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            onComplete: () => {
                  charQuoteImg.src = `assets/char/${char_name[currentIndex]}/${char_name[currentIndex]}-quote.svg`;
                  gsap.to(charQuoteImg, { opacity: 1, y: 0, duration: 0.3 });
            }
      });

      gsap.to(charProfileHeader, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                  charProfileHeader.src = `assets/char/${char_name[currentIndex]}/${char_name[currentIndex]}-profile.svg`;
                  gsap.to(charProfileHeader, { opacity: 1, duration: 0.3 });
            }
      });

      gsap.to(profileText, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                  profileText.textContent = char_profile[currentIndex];
                  gsap.to(profileText, { opacity: 1, duration: 0.3 });
            }
      });

      gsap.to([charIcon, quote1, quote2], {
            opacity: 0,
            scale: 0.9,
            duration: 0.2,
            onComplete: () => {
                  charIcon.src = `assets/char/${char_name[currentIndex]}/${char_name[currentIndex]}-icon.png`;
                  quote1.src = `assets/char/${char_name[currentIndex]}/${char_name[currentIndex]}-txt1.svg`;
                  quote2.src = `assets/char/${char_name[currentIndex]}/${char_name[currentIndex]}-txt2.svg`;
                  gsap.to([charIcon, quote1, quote2], {
                        opacity: 1,
                        scale: 1,
                        stagger: 0.05,
                        duration: 0.3,
                        ease: "back.out(1.2)"
                  });
            }
      });

      gsap.to(kanjiName, {
            opacity: 0,
            y: direction * 10,
            duration: 0.2,
            onComplete: () => {
                  kanjiName.textContent = char_name_jp[currentIndex];
                  gsap.fromTo(
                        kanjiName,
                        { opacity: 0, y: -direction * 10 },
                        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
                  );
            }
      });

      refreshLoopText();
}

function nextSlide() {
      const orderIdx = displayOrder.indexOf(currentIndex);
      const nextOrderIdx = (orderIdx + 1) % displayOrder.length;
      setSlide(displayOrder[nextOrderIdx], 1);
}

function prevSlide() {
      const orderIdx = displayOrder.indexOf(currentIndex);
      const prevOrderIdx = (orderIdx - 1 + displayOrder.length) % displayOrder.length;
      setSlide(displayOrder[prevOrderIdx], -1);
}

prevBtn.addEventListener("click", () => { prevSlide(); resetAutoplay(); });
nextBtn.addEventListener("click", () => { nextSlide(); resetAutoplay(); });

document.querySelectorAll(".pagination-item").forEach((item) => {
      item.addEventListener("click", () => {
            const targetIndex = parseInt(item.getAttribute("data-index"), 10);
            const currentPos = displayOrder.indexOf(currentIndex);
            const targetPos = displayOrder.indexOf(targetIndex);
            const dir = targetPos >= currentPos ? 1 : -1;
            setSlide(targetIndex, dir);
            resetAutoplay();
      });
});

window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { nextSlide(); resetAutoplay(); }
      if (e.key === "ArrowLeft") { prevSlide(); resetAutoplay(); }
});

// Arrastrar con el cursor (o dedo) para cambiar de slide
(function initDragNav() {
      const stage = document.querySelector(".tab-container");
      if (!stage) return;
      let startX = 0, startY = 0, tracking = false;
      const THRESHOLD = 60;

      stage.addEventListener("pointerdown", (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            if (e.target.closest("button")) return;
            tracking = true;
            startX = e.clientX;
            startY = e.clientY;
            stage.classList.add("dragging");
      });

      stage.addEventListener("pointermove", (e) => {
            if (!tracking) return;
            if (Math.abs(e.clientX - startX) > 10) stage.classList.add("dragging");
      });

      const endDrag = (e) => {
            if (!tracking) return;
            tracking = false;
            stage.classList.remove("dragging");
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) >= THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2) {
                  if (dx < 0) nextSlide();
                  else prevSlide();
                  resetAutoplay();
            }
      };

      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", () => {
            tracking = false;
            stage.classList.remove("dragging");
      });
      stage.addEventListener("dragstart", (e) => e.preventDefault());
})();

window.addEventListener("resize", () => {
      updatePaginationBar();
});
window.addEventListener("load", () => {
      updatePaginationBar();
      setTimeout(updatePaginationBar, 300);
});
if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
            updatePaginationBar();
            refreshLoopText();
      });
}

window.addEventListener("DOMContentLoaded", () => {
      const params = new URLSearchParams(window.location.search);
      const slideParam = params.get("slide") || params.get("char");
      if (slideParam !== null) {
            let target = parseInt(slideParam, 10);
            if (isNaN(target)) target = char_name.indexOf(slideParam.toLowerCase());
            if (target >= 0 && target < char_name.length && target !== currentIndex) {
                  setSlide(target, 1);
            }
      }
      updatePaginationBar();
      setTimeout(updatePaginationBar, 100);
      refreshLoopText();
      if (!params.has("noautoplay")) {
            resetAutoplay();
      }
});
