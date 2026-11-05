/* =========================================================
   GLOWIE WORLD – Coffee Quiz (playable ad)
   1. Data      – edit drinks, benefits and recipes here
   2. Capsules  – the moving capsules on the welcome screen
   3. Helpers   – small functions
   4. Quiz flow – what happens when you tap
   ========================================================= */

/* ---------- 1. DATA ---------- */

// Question 1: flavours. "temp" decides the icon and the recipe.
const drinks = [
  {
    name: "Beetroot Latte",
    temp: "hot",
    image: "assets/capsulepink.jpg",
    taste: "earthy, rosy and velvety",
    topping: "a pinch of cinnamon",
  },

  {
    name: "Blue Velvet",
    temp: "cold",
    image: "assets/capsuleblue.jpg",
    taste: "smooth, blueberry-kissed",
    topping: "a few frozen blueberries",
  },

  {
    name: "Salted Caramel",
    temp: "hot",
    image: "assets/capsuleorange.jpg",
    taste: "buttery, slightly salty",
    topping: "a tiny pinch of sea salt",
  },

  {
    name: "Matcha Mint",
    temp: "cold",
    image: "assets/capsulegreen.jpg",
    taste: "fresh, green and cooling",
    topping: "a fresh mint leaf",
  },

  {
    name: "Golden Glow",
    temp: "hot",
    image: "assets/capsuleyellow.jpg",
    taste: "golden, gently spiced",
    topping: "a dusting of turmeric",
  },

  {
    name: "Coconut Mocha",
    temp: "cold",
    image: "assets/capsulebrown.jpg",
    taste: "chocolatey and tropical",
    topping: "toasted coconut flakes",
  },
];

// Question 2: beauty goals
const benefits = [
  {
    name: "Collagen",
    icon: "assets/collagen.svg",
    perk: "for bouncy-looking skin",
  },
  {
    name: "Antioxidant",
    icon: "assets/antioxidant.svg",
    perk: "for a fresh, protected look",
  },
  {
    name: "Biotin Complex",
    icon: "assets/bioten.svg",
    perk: "for happy hair and nails",
  },
  {
    name: "L-Theanine",
    icon: "assets/ltheanine.svg",
    perk: "for calm, jitter-free focus",
  },
  {
    name: "Pearl powder",
    icon: "assets/pearlpowder.svg",
    perk: "for a soft, pearly glow",
  },
  {
    name: "Hydration Surge",
    icon: "assets/hydrationsurge.svg",
    perk: "for dewy-looking skin",
  },
];

// Recipes – kept short so the result fits on one screen
const recipes = {
  hot: [
    "Pop a Glowie pod into your coffee machine.",
    "Brew a long coffee (110 ml) into a mug.",
    "Top with 100 ml warm frothed milk.",
    "Stir and finish with {topping}.",
  ],
  cold: [
    "Fill a tall glass with ice.",
    "Brew the pod as an espresso (40 ml) over the ice.",
    "Pour in 150 ml cold milk.",
    "Stir and add {topping}.",
  ],
};

// CTA link. This is a demo, so it's "#" and shows a message instead.
// Later, put a real link
const SHOP_URL = "#";

const brewingMessages = [
  "Grinding the beans…",
  "Adding your glow boost…",
  "Pouring with love…",
];

/* ---------- 2. CAPSULES ANIMATION ---------- */
// Each frame we calculate a new position for both capsules:
// they fly in from the sides, gently float, follow your finger/mouse
// a little, and do a spin when you tap them.

const capsulesBox = document.getElementById("capsules");
const capsuleLeft = document.getElementById("capsule-left");
const capsuleRight = document.getElementById("capsule-right");

let introStart = null; // when the fly-in started
let pointerX = 0; // -1 (left) to 1 (right)
let pointerY = 0; // -1 (top) to 1 (bottom)
let spin = 0; // extra rotation after a tap, slowly goes back to 0

function animateCapsules(time) {
  if (introStart === null) introStart = time;

  // Fly-in: goes from 0 to 1 during the first second
  const intro = Math.min((time - introStart) / 1000, 1);
  const eased = 1 - Math.pow(1 - intro, 3); // starts fast, ends slow
  const flyIn = (1 - eased) * 160; // px still to travel

  const t = time / 1000; // seconds
  spin = spin * 0.94; // spin slows down each frame

  // Left capsule
  const lx = -flyIn + pointerX * -10;
  const ly = Math.sin(t * 1.6) * 8 + pointerY * 6;
  const lr = Math.sin(t * 1.2) * -6 - spin;
  capsuleLeft.style.transform = `translate(${lx}px, ${ly}px) rotate(${lr}deg)`;

  // Right capsule (different timing so they don't move together)
  const rx = flyIn + pointerX * 14;
  const ry = Math.sin(t * 1.6 + 1.8) * 10 + pointerY * -6;
  const rr = Math.sin(t * 1.1 + 1) * 6 + spin;
  capsuleRight.style.transform = `translate(${rx}px, ${ry}px) rotate(${rr}deg)`;

  requestAnimationFrame(animateCapsules);
}
requestAnimationFrame(animateCapsules);

// Follow the mouse / finger
document.getElementById("phone").addEventListener("pointermove", (e) => {
  const box = e.currentTarget.getBoundingClientRect();
  pointerX = ((e.clientX - box.left) / box.width) * 2 - 1;
  pointerY = ((e.clientY - box.top) / box.height) * 2 - 1;
});

// Tap the capsules: they spin and bounce
capsulesBox.addEventListener("click", () => {
  spin = 360;
  capsulesBox.classList.remove("is-bouncing");
  void capsulesBox.offsetWidth; // restarts the CSS animation
  capsulesBox.classList.add("is-bouncing");
});

/* ---------- 3. HELPERS ---------- */

const phone = document.getElementById("phone");
const toast = document.getElementById("toast");

let chosenDrink = null;
let chosenBenefit = null;

// Switch from the current screen to another one
function showScreen(name) {
  const current = document.querySelector(".screen.is-active");
  const next = document.getElementById("screen-" + name);

  if (current) {
    current.classList.remove("is-active");
    current.classList.add("is-leaving");
    setTimeout(() => current.classList.remove("is-leaving"), 450);
  }

  next.classList.add("is-active");
  phone.dataset.screen = name; // CSS uses this to hide/show the logo header

  if (name === "welcome") introStart = null; // replay the capsule fly-in
  if (name === "q1") renderDrinks();
  if (name === "q2") renderBenefits();
}

// Build one answer button
function createOption(label, iconSrc, iconClass, index, onPick) {
  const btn = document.createElement("button");
  btn.className = "option";
  btn.style.setProperty("--i", index); // for the staggered entrance
  btn.innerHTML = `<img class="${iconClass}" src="${iconSrc}" alt=""><span>${label}</span>`;

  btn.addEventListener("click", () => {
    btn.parentElement
      .querySelectorAll(".option")
      .forEach((o) => o.classList.remove("is-selected"));
    btn.classList.add("is-selected");
    setTimeout(onPick, 550); // short pause so you see your choice
  });

  return btn;
}

function renderDrinks() {
  const list = document.getElementById("options-drinks");
  list.innerHTML = "";
  drinks.forEach((drink, i) => {
    const icon =
      drink.temp === "hot" ? "assets/hotcoffee.svg" : "assets/coldcoffee.svg";
    list.appendChild(
      createOption(drink.name, icon, "icon--white", i, () => {
        chosenDrink = drink;
        showScreen("q2");
      }),
    );
  });
}

function renderBenefits() {
  const list = document.getElementById("options-benefits");
  list.innerHTML = "";
  benefits.forEach((benefit, i) => {
    list.appendChild(
      createOption(benefit.name, benefit.icon, "", i, () => {
        chosenBenefit = benefit;
        startBrewing();
      }),
    );
  });
}

// Show the loading animation, then the result
function startBrewing() {
  // Start loading the result photo now, so it's ready in time
  new Image().src = chosenDrink.image;

  showScreen("brewing");
  const text = document.getElementById("brewing-text");
  let step = 0;
  text.textContent = brewingMessages[0];

  const timer = setInterval(() => {
    step++;
    if (step < brewingMessages.length) {
      text.textContent = brewingMessages[step];
    } else {
      clearInterval(timer);
      showResult();
    }
  }, 800);
}

// Fill the result screen with the matching blend
function showResult() {
  const drink = chosenDrink;
  const benefit = chosenBenefit;
  const warmth = drink.temp === "hot" ? "A warm" : "An iced";

  document.getElementById("result-title").textContent = drink.name;
  document.getElementById("result-subtitle").textContent =
    "+ " + benefit.name + " glow boost";
  document.getElementById("result-desc").textContent =
    `${warmth}, ${drink.taste} cup with ${benefit.name} ${benefit.perk}.`;

  // Icons of the two answers, next to the photo
  const tempIcon = document.getElementById("result-icon-temp");
  tempIcon.src = drink.temp === "hot" ? "assets/hotcoffee.svg" : "assets/coldcoffee.svg";
  tempIcon.alt = drink.temp === "hot" ? "Hot drink" : "Iced drink";
  const benefitIcon = document.getElementById("result-icon-benefit");
  benefitIcon.src = benefit.icon;
  benefitIcon.alt = benefit.name;

  const img = document.getElementById("result-img");
  img.src = drink.image;
  img.alt = drink.name + " Glowie World capsule";

  const steps = document.getElementById("result-steps");
  steps.innerHTML = "";
  recipes[drink.temp].forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line.replace("{topping}", drink.topping);
    steps.appendChild(li);
  });

  showScreen("result");
  sparkleBurst();
}

// Little sparkles flying out of the result photo
function sparkleBurst() {
  const burst = document.getElementById("burst");
  burst.innerHTML = "";
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 14;
    const distance = 70 + Math.random() * 70;
    s.style.setProperty("--x", Math.cos(angle) * distance + "px");
    s.style.setProperty("--y", Math.sin(angle) * distance + "px");
    s.style.animationDelay = Math.random() * 0.2 + 0.3 + "s";
    if (i % 2) s.style.color = "#f2a2a6";
    burst.appendChild(s);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
}

function restart() {
  chosenDrink = null;
  chosenBenefit = null;
  showScreen("welcome");
}

/* ---------- 4. QUIZ FLOW (button clicks) ---------- */

document
  .getElementById("start-btn")
  .addEventListener("click", () => showScreen("q1"));
document.getElementById("restart-btn").addEventListener("click", restart);
document.getElementById("nav-home").addEventListener("click", restart);

document.getElementById("cta-btn").addEventListener("click", () => {
  if (SHOP_URL === "#") {
    showToast(
      `✨ This is a demo – the ${chosenDrink.name} shop page doesn't exist yet.`,
    );
  } else {
    window.open(SHOP_URL, "_blank");
  }
});
