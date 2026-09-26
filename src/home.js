const languageButton = document.querySelector('[data-action="language"]');
const panelButtons = document.querySelectorAll("[data-panel]");
const closeButtons = document.querySelectorAll("[data-close]");
const translatedElements = document.querySelectorAll("[data-fr][data-en]");
let language = "fr";

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  translatedElements.forEach((element) => {
    element.textContent = element.dataset[language];
  });
  languageButton.textContent = language === "fr" ? "FR / EN" : "EN / FR";
  languageButton.classList.toggle("active", true);
}

function closePanels() {
  document.querySelectorAll(".utility-panel").forEach((panel) => {
    panel.hidden = true;
  });
}

languageButton?.addEventListener("click", () => {
  setLanguage(language === "fr" ? "en" : "fr");
});

panelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closePanels();
    const panel = document.getElementById(button.dataset.panel);
    if (panel) panel.hidden = false;
  });
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closePanels);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePanels();
});

setLanguage(language);
