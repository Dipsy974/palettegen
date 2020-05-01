// SELECTORS
const generateBtn = document.querySelector(".generate");
const colorDivs = document.querySelectorAll(".color");
const sliders = document.querySelectorAll("input[type='range']");
const currentHexes = document.querySelectorAll(".color h2");

//FUNCTIONS

//Color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  colorDivs.forEach((colorDiv) => {
    const randomHex = generateHex();
    const hexText = colorDiv.children[0];
    colorDiv.style.background = randomHex;
    hexText.innerText = randomHex;
  });
}

//EVENT LISTENERS
generateBtn.addEventListener("click", randomColors);
