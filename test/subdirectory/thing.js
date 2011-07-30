module("appName.thing", function () {
    this.doSomething = function () {
      var h1 = document.getElementsByTagName('h1')[0];
      h1.style.fontColor = "#bbb";
    };
});
