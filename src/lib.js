
if (Function.prototype.bind == null) {
  Function.prototype.bind = function () {
    var args = [];
    args.push.apply(args, arguments);
    var scope = args.shift();
    var fn = this;
    
    return function () { return fn.apply(scope, args) };
  }
}
