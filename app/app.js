// SELECTORS
const generateBtn = document.querySelector(".generate");
const colorDivs = document.querySelectorAll(".color");
const sliders = document.querySelectorAll("input[type='range']");
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
let initialColors;
const adjustBtns = document.querySelectorAll(".adjust");
const lockBtns = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderPanels = document.querySelectorAll(".sliders");

//FUNCTIONS

//Color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((colorDiv) => {
    const randomHex = generateHex();
    const hexText = colorDiv.children[0];

    if (colorDiv.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomHex).hex());
    }

    //Add color to bg and hex text
    colorDiv.style.background = randomHex;
    hexText.innerText = randomHex;

    //Check contrast to change text color
    checkTextContrast(randomHex, hexText);
    const icons = colorDiv.querySelectorAll(".controls button");
    for (icon of icons) {
      checkTextContrast(randomHex, icon);
    }

    //Initial colorize sliders
    const color = chroma(randomHex);
    const sliders = colorDiv.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  resetInputs();
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance >= 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  //Scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //Update input colors
  hue.style.background = `linear-gradient(to right, rgb(204, 75, 75), rgb(204,204 ,75),rgb(75, 204, 75),rgb(75, 204, 204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
  brightness.style.background = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  saturation.style.background = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
}

function hslControls(event) {
  const index =
    event.target.getAttribute("data-brightness") ||
    event.target.getAttribute("data-hue") ||
    event.target.getAttribute("data-saturation");
  let sliders = event.target.parentElement.querySelectorAll(
    "input[type='range']"
  );
  const hue = sliders[0];
  const bright = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", bright.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.background = color;

  colorizeSliders(color, hue, bright, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.background);
  const hexText = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  hexText.innerText = color.hex();

  checkTextContrast(color, hexText);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-brightness")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-saturation")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  //Copy function
  const eph = document.createElement("textarea");
  eph.value = hex.innerText;
  document.body.appendChild(eph);
  eph.select();
  document.execCommand("copy");
  document.body.removeChild(eph);
  //Copy popup
  popup.classList.add("active");
  popup.children[0].classList.add("active");
}

function openFiltersPanel(index) {
  const panel = sliderPanels[index];
  panel.classList.toggle("active");
}

function closeFiltersPanel(index) {
  const panel = sliderPanels[index];
  panel.classList.remove("active");
}

//Switch classes for the main function to know if div is locked
function lockColor(btn, index) {
  colorDivs[index].classList.toggle("locked");
  btn.children[0].classList.toggle("fa-lock-open");
  btn.children[0].classList.toggle("fa-lock");
}

//INITIALIZE PALETTE
randomColors();

//EVENT LISTENERS
generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("click", () => {
  popup.classList.remove("active");
  popup.children[0].classList.remove("active");
});

adjustBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    openFiltersPanel(index);
  });
});

closeAdjustments.forEach((close, index) => {
  close.addEventListener("click", () => {
    closeFiltersPanel(index);
  });
});

lockBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    lockColor(btn, index);
  });
});
