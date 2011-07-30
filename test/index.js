
module("appName.index", function (exports) {
  //debugger;
  exports.initialize = function () {
    $(function () {
        doSomethingCool();
    });
  };

  function doSomethingCool() {
    $('h1').html("Something cool!");
  }
  
});
