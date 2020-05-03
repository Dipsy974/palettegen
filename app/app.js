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
//Local storage
let savedPalettes = [];
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-name");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

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

function openPalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function savePalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  saveInput.value = "";
  //Generate palette object

  const localPalettes = JSON.parse(localStorage.getItem("palettes"));
  let paletteNb;
  if (localPalettes) {
    paletteNb = localPalettes.length;
  } else {
    paletteNb = savedPalettes.length;
  }

  const paletteObject = { name, colors, nb: paletteNb };
  savedPalettes.push(paletteObject);

  //Save to local
  saveToLocal(paletteObject);
  //Generate palette in library
  generatePaletteDiv(paletteObject);
}

function saveToLocal(palette) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(palette);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localStorage = [];
  } else {
    const localPalettes = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...localPalettes];
    localPalettes.forEach((localPalette) => {
      const customPalette = document.createElement("div");
      customPalette.classList.add("custom-palette");
      const title = document.createElement("h5");
      title.innerText = localPalette.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      localPalette.colors.forEach((color) => {
        const previewColor = document.createElement("div");
        previewColor.style.background = color;
        preview.appendChild(previewColor);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(localPalette.nb);
      paletteBtn.innerText = "Select";

      //Attach event to the button
      paletteBtn.addEventListener("click", (event) => {
        closeLibrary();
        const paletteIndex = event.target.classList[1];
        initialColors = [];
        localPalettes[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.background = color;
          updateTextUI(index);
          const sliders = colorDivs[index].querySelectorAll(".sliders input");
          const hue = sliders[0];
          const brightness = sliders[1];
          const saturation = sliders[2];
          colorizeSliders(chroma(color), hue, brightness, saturation);
        });

        resetInputs();
      });
      customPalette.appendChild(title);
      customPalette.appendChild(preview);
      customPalette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(customPalette);
    });
  }
}

function generatePaletteDiv(palette) {
  const customPalette = document.createElement("div");
  customPalette.classList.add("custom-palette");
  const title = document.createElement("h5");
  title.innerText = palette.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  palette.colors.forEach((color) => {
    const previewColor = document.createElement("div");
    previewColor.style.background = color;
    preview.appendChild(previewColor);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(palette.nb);
  paletteBtn.innerText = "Select";

  //Attach event to the button
  paletteBtn.addEventListener("click", (event) => {
    closeLibrary();
    const paletteIndex = event.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.background = color;
      updateTextUI(index);
      const sliders = colorDivs[index].querySelectorAll(".sliders input");
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];
      colorizeSliders(chroma(color), hue, brightness, saturation);
    });

    resetInputs();
  });

  customPalette.appendChild(title);
  customPalette.appendChild(preview);
  customPalette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(customPalette);
}

//INITIALIZE PALETTE AND LOCAL
getLocal();
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

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);
