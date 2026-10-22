      (function () {
        // ---- theme toggle ----
        var root = document.documentElement,
          btn = document.getElementById("themeBtn");
        function isLight() {
          var t = root.getAttribute("data-theme");
          if (t) return t === "light";
          return window.matchMedia("(prefers-color-scheme: light)").matches;
        }
        function paintBtn() {
          btn.textContent = isLight() ? "☾" : "☀";
        }
        btn.addEventListener("click", function () {
          root.setAttribute("data-theme", isLight() ? "dark" : "light");
          paintBtn();
          drawStars();
        });
        paintBtn();

        // ---- stars ----
        var cv = document.getElementById("stars"),
          cx = cv.getContext("2d"),
          stars = [];
        function drawStars() {
          var dpr = window.devicePixelRatio || 1;
          cv.width = innerWidth * dpr;
          cv.height = innerHeight * dpr;
          cx.setTransform(dpr, 0, 0, dpr, 0, 0);
          cx.clearRect(0, 0, innerWidth, innerHeight);
          if (isLight()) return;
          if (!stars.length)
            for (var i = 0; i < 90; i++)
              stars.push({
                x: Math.random(),
                y: Math.random(),
                r: Math.random() * 1.4 + 0.3,
                a: Math.random() * 0.6 + 0.2,
              });
          stars.forEach(function (s) {
            cx.globalAlpha = s.a;
            cx.fillStyle = "#fff";
            cx.beginPath();
            cx.arc(s.x * innerWidth, s.y * innerHeight, s.r, 0, 6.283);
            cx.fill();
          });
        }
        addEventListener("resize", drawStars);
        drawStars();

        // ---- envelope ----
        var env = document.getElementById("envelope"),
          openBtn = document.getElementById("openBtn"),
          letter = document.getElementById("letter"),
          opened = false;
        function openLetter() {
          if (opened) return;
          opened = true;
          env.classList.add("opened");
          openBtn.textContent = "Basahin";
          setTimeout(function () {
            letter.classList.add("show");
            observe();
            letter.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 1500);
        }
        env.addEventListener("click", openLetter);
        openBtn.addEventListener("click", openLetter);

        // ---- reveal on scroll ----
        function observe() {
          var els = document.querySelectorAll(".reveal");
          if (!("IntersectionObserver" in window)) {
            els.forEach(function (e) {
              e.classList.add("in");
            });
            return;
          }
          var io = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (en) {
                if (en.isIntersecting) {
                  en.target.classList.add("in");
                  io.unobserve(en.target);
                }
              });
            },
            { threshold: 0.05 },
          );
          els.forEach(function (e) {
            io.observe(e);
          });
        }

        // ---- progress bar ----
        var bar = document.getElementById("progress");
        addEventListener(
          "scroll",
          function () {
            var h = document.documentElement.scrollHeight - innerHeight;
            bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
          },
          { passive: true },
        );

        // ---- flip cards & whispers ----
        document.querySelectorAll(".flip").forEach(function (b) {
          b.addEventListener("click", function () {
            b.classList.toggle("flipped");
          });
        });
        document.querySelectorAll(".whisper").forEach(function (b) {
          b.addEventListener("click", function () {
            b.classList.toggle("shown");
          });
        });

        // ---- counter ----
        var n = 0,
          cn = document.getElementById("cnum"),
          cm = document.getElementById("cmsg");
        var lines = {
          1: "Isa pa lang 'yan. Sige pa.",
          5: "Busy na naman kakaisip sa'yo for no reason haha.",
          10: "Wala ka namang ginagawa, pero nakakagulo ka pa rin ng tahimik kong buhay.",
          20: "Kung bayad 'to, mayaman na ako.",
          30: "Kasalanan mo to, Hans!!!",
        };
        document.getElementById("cbtn").addEventListener("click", function () {
          n++;
          cn.textContent = n;
          if (lines[n]) cm.textContent = lines[n];
        });

        // ---- ingat overlay ----
        var ov = document.getElementById("ingat");
        document
          .getElementById("ingatBtn")
          .addEventListener("click", function () {
            ov.classList.add("show");
          });
        ov.addEventListener("click", function () {
          ov.classList.remove("show");
        });
        addEventListener("keydown", function (e) {
          if (e.key === "Escape") ov.classList.remove("show");
        });

        // ---- soft music box (generated in the browser) ----
        var mb = document.getElementById("musicBtn"),
          ac = null,
          timer = null,
          step = 0;
        var scale = [
          261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25,
        ];
        var pattern = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 7, 5, 4, 2, 3];
        function note(freq, t) {
          var o = ac.createOscillator(),
            g = ac.createGain();
          o.type = "sine";
          o.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.12, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0008, t + 1.8);
          o.connect(g);
          g.connect(out);
          o.start(t);
          o.stop(t + 1.9);
        }
        var out;
        function startMusic() {
          ac = ac || new (window.AudioContext || window.webkitAudioContext)();
          if (ac.state === "suspended") ac.resume();
          if (!out) {
            out = ac.createGain();
            out.gain.value = 0.8;
            var d = ac.createDelay(1.0),
              fb = ac.createGain();
            d.delayTime.value = 0.38;
            fb.gain.value = 0.4;
            out.connect(ac.destination);
            out.connect(d);
            d.connect(fb);
            fb.connect(d);
            d.connect(ac.destination);
          }
          timer = setInterval(function () {
            note(scale[pattern[step % pattern.length]], ac.currentTime);
            if (step % 4 === 0)
              note(scale[pattern[step % pattern.length]] / 2, ac.currentTime);
            step++;
          }, 520);
        }
        mb.addEventListener("click", function () {
          var on = mb.getAttribute("aria-pressed") === "true";
          var song = document.getElementById("song");
          if (on) {
            song.pause();
          } else {
            var pr = song.play();
            if (pr && pr.catch) pr.catch(function () {});
          }
          mb.setAttribute("aria-pressed", String(!on));
        });

        // ---- hearts ----
        document
          .getElementById("heartBtn")
          .addEventListener("click", function (e) {
            var r = e.currentTarget.getBoundingClientRect();
            for (var i = 0; i < 6; i++) {
              var h = document.createElement("span");
              h.className = "float-heart";
              h.textContent = ["♥", "💗", "💖"][i % 3];
              h.style.left =
                r.left + r.width / 2 + (Math.random() * 90 - 45) + "px";
              h.style.top = r.top + Math.random() * 20 + "px";
              h.style.animationDelay = i * 0.08 + "s";
              document.body.appendChild(h);
              setTimeout(
                function (el) {
                  el.remove();
                }.bind(null, h),
                2200,
              );
            }
          });
      })();