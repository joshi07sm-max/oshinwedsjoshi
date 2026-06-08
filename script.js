const invitation = {
  coupleName: "Oshine & Joshi",
  displayDate: "July 5, 2026",
  displayTime: "11:00 AM",
  weddingDateISO: "2026-07-05T11:00:00+05:30",
  venueName: "St John's Ephesus Orthodox Syrian Church, Pampakuda, Kerala, India",
  locationLink: "https://www.google.com/maps/dir//St+John's+Ephesus+Orthodox+Syrian+Valiyapalli+Pampakuda+%5BPampakuda+Valiyapalli%5D%5D,+WG9F%2BQ2R,+Muvattupuzha+-+Pampakuda+Rd,+Pampakuda,+Kerala+686667,+India/@52.4484608,13.3824512,14z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3b07deea59698dfb:0x9f05f4114ca4c0d2!2m2!1d76.5225139!2d9.9194944?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D",
  message: "With hearts full of gratitude and joy, we invite you to share in the beginning of our forever.",
  inviteText: "Your presence would make our celebration warmer, brighter, and complete.",
  venueNote: "We would be honored to celebrate this day with you.",
  musicSrc: "assets/background-music.m4a",
  gallery: [
    "assets/gallery-01.jpg",
    "assets/gallery-02.jpg",
    "assets/gallery-03.jpg",
    "assets/gallery-04.jpg",
    "assets/gallery-05.jpg",
    "assets/gallery-06.jpg",
    "assets/gallery-07.jpg",
    "assets/gallery-08.jpg",
    "assets/gallery-09.jpg",
    "assets/gallery-10.jpg"
  ]
};

// Core page elements.
const body = document.body;
const cover = document.getElementById("cover");
const openInvite = document.getElementById("openInvite");
const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const mapButton = document.getElementById("mapButton");
const scrollCue = document.getElementById("scrollCue");

body.classList.add("locked");

// Fill every editable text field from the invitation config above.
document.querySelectorAll("[data-field]").forEach((node) => {
  const value = invitation[node.dataset.field];
  if (value) node.textContent = value;
});

document.title = `${invitation.coupleName} | Wedding Invitation`;
document.querySelector('meta[name="description"]').content = `${invitation.coupleName} invite you to celebrate their wedding.`;
document.querySelector('meta[property="og:title"]').content = `${invitation.coupleName} | Wedding Invitation`;
document.querySelector('meta[property="og:description"]').content = `${invitation.displayDate} at ${invitation.venueName}`;

if (invitation.locationLink && !invitation.locationLink.includes("[")) {
  mapButton.href = invitation.locationLink;
} else {
  mapButton.setAttribute("aria-disabled", "true");
}

music.src = invitation.musicSrc;
music.addEventListener("error", () => {
  musicToggle.hidden = true;
});

// Open the cover after the first tap, then reveal the invitation.
function openInvitation() {
  if (cover.classList.contains("is-opening")) return;
  cover.classList.add("is-opening");
  body.classList.remove("locked");
  body.classList.add("invite-open");
  tryPlayMusic();
  burstPetals(62);
  setTimeout(() => cover.classList.add("is-open"), 440);
}

// Browsers require a user gesture before audio can play, so this runs after tap.
function tryPlayMusic() {
  music.volume = 0;
  music.play().then(() => {
    musicToggle.classList.remove("is-muted");
    fadeMusicIn();
  }).catch(() => {
    musicToggle.classList.add("is-muted");
  });
}

function fadeMusicIn() {
  const targetVolume = 0.55;
  const step = () => {
    if (music.paused || music.volume >= targetVolume) return;
    music.volume = Math.min(targetVolume, music.volume + 0.035);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function openFromCover(event) {
  event.preventDefault();
  event.stopPropagation();
  openInvitation();
}

openInvite.addEventListener("click", openFromCover);
openInvite.addEventListener("pointerup", openFromCover);
openInvite.addEventListener("touchend", openFromCover, { passive: false });

musicToggle.addEventListener("click", () => {
  if (music.paused) {
    tryPlayMusic();
  } else {
    music.pause();
    musicToggle.classList.add("is-muted");
  }
});

scrollCue.addEventListener("click", () => {
  document.querySelector(".message").scrollIntoView({ behavior: "smooth", block: "start" });
});

window.addEventListener("scroll", () => {
  body.classList.toggle("has-scrolled", window.scrollY > 80);
}, { passive: true });

// Build the gallery from editable image paths.
const gallery = document.getElementById("gallery");
invitation.gallery.forEach((src, index) => {
  const image = document.createElement("img");
  image.src = src;
  image.alt = `Wedding gallery photo ${index + 1}`;
  image.loading = "lazy";
  gallery.appendChild(image);
});

// Lightweight scroll reveal: opacity/filter only, no layout-shifting movement.
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.16 });

document.querySelectorAll(".section-reveal").forEach((section) => observer.observe(section));

// Live countdown to the wedding date.
const countdownNodes = [...document.querySelectorAll("#countdown div strong")];

function updateCountdown() {
  const target = new Date(invitation.weddingDateISO).getTime();
  const diff = Math.max(target - Date.now(), 0);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  [days, hours, minutes, seconds].forEach((value, index) => {
    countdownNodes[index].textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Scratch cards reveal the year, month, and date independently.
const scratchTiles = [...document.querySelectorAll(".scratch-canvas")].map((canvas) => ({
  canvas,
  card: canvas.closest(".reveal-card"),
  ctx: canvas.getContext("2d"),
  scratching: false,
  revealed: false
}));

function paintScratchLayer(tile) {
  const rect = tile.card.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  tile.canvas.width = Math.floor(rect.width * dpr);
  tile.canvas.height = Math.floor(rect.height * dpr);
  tile.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const gradient = tile.ctx.createLinearGradient(0, 0, rect.width, rect.height);
  gradient.addColorStop(0, "#8a765f");
  gradient.addColorStop(0.48, "#e8dcc8");
  gradient.addColorStop(1, "#4a3d31");
  tile.ctx.fillStyle = gradient;
  tile.ctx.fillRect(0, 0, rect.width, rect.height);
  tile.ctx.fillStyle = "rgba(48, 40, 32, 0.88)";
  tile.ctx.font = "700 12px Arial";
  tile.ctx.textAlign = "center";
  tile.ctx.fillText(tile.canvas.dataset.scratchLabel || "Scratch", rect.width / 2, rect.height / 2);
}

function scratchAt(tile, clientX, clientY) {
  if (tile.revealed) return;
  const rect = tile.canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  tile.ctx.globalCompositeOperation = "destination-out";
  tile.ctx.beginPath();
  tile.ctx.arc(x, y, 24, 0, Math.PI * 2);
  tile.ctx.fill();
  tile.ctx.globalCompositeOperation = "source-over";
}

function revealTile(tile) {
  if (tile.revealed) return;
  tile.revealed = true;
  tile.card.classList.add("is-revealed");
  if (tile.canvas.dataset.scratchLabel === "Date") {
    document.getElementById("dateReveal").classList.add("is-date-revealed");
  }
  const allRevealed = scratchTiles.every((item) => item.revealed);
  burstPetals(allRevealed ? 52 : 22);
}

function scratchedEnough(tile) {
  const pixels = tile.ctx.getImageData(0, 0, tile.canvas.width, tile.canvas.height).data;
  let transparent = 0;
  for (let index = 3; index < pixels.length; index += 16) {
    if (pixels[index] < 40) transparent++;
  }
  if (transparent / (pixels.length / 16) > 0.32) revealTile(tile);
}

scratchTiles.forEach((tile) => {
  tile.canvas.addEventListener("pointerdown", (event) => {
    tile.scratching = true;
    tile.canvas.setPointerCapture(event.pointerId);
    scratchAt(tile, event.clientX, event.clientY);
  });

  tile.canvas.addEventListener("pointermove", (event) => {
    if (!tile.scratching) return;
    scratchAt(tile, event.clientX, event.clientY);
  });

  tile.canvas.addEventListener("pointerup", () => {
    tile.scratching = false;
    scratchedEnough(tile);
  });

  tile.canvas.addEventListener("click", () => revealTile(tile));
});

window.addEventListener("resize", () => scratchTiles.forEach(paintScratchLayer));
scratchTiles.forEach(paintScratchLayer);

// Floating gold particles are generated once and animated entirely by CSS.
const particles = document.getElementById("particles");
for (let index = 0; index < 34; index++) {
  const particle = document.createElement("span");
  particle.className = "particle";
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.setProperty("--size", `${2 + Math.random() * 4}px`);
  particle.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
  particle.style.setProperty("--duration", `${10 + Math.random() * 10}s`);
  particle.style.setProperty("--delay", `${Math.random() * -16}s`);
  particles.appendChild(particle);
}

function burstPetals(count = 34) {
  const petals = document.getElementById("petals");
  for (let index = 0; index < count; index++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    petal.style.setProperty("--fall", `${2.8 + Math.random() * 2.4}s`);
    petal.style.animationDelay = `${Math.random() * 0.5}s`;
    petals.appendChild(petal);
    setTimeout(() => petal.remove(), 5600);
  }
}
