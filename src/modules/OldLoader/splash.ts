// require("./prevent-close");

window.addEventListener("DOMContentLoaded", () => {
  Object.defineProperty(window, "SplashComponent", {
    value: Object.entries(document.querySelector("#splash"))[0][1]
      ._currentElement._owner._instance
  });
});
