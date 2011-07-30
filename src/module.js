(function () {

  function module(namespace, mod_fn) {
    var ns,
    // start is the starting point for defining the namespace object
    start = window,
    ns_obj;
    
    if (typeof namespace === "string")
      ns = namespace;
    else {
      ns = namespace.base;
      start = namespace.start || window;
    }
    
    // Check to see if our namespace path exists, and create it if it doesn't
    var ns_path = ns.split(".");
    // holds our current place in ns_path
    var place = start;
    for (var i=0, len=ns_path.length; i<len; i++) {
      // key to next piece of object
      var key = ns_path[i];
      
      if (place[key] == null)
        place[key] = {};
      
      place = place[key];
    }
    ns_obj = place;
    
    // Call our module body with our namespace object as the scope and first argument
    mod_fn.call(ns_obj, ns_obj);
  }
  
  module.require = function ( /* ...src's, callback */ ) {
    var callback = arguments[arguments.length-1],
    tracker = [],
    srcs = [],
    cwd = '',
    i = 0;
    
    callback = typeof callback === "function" ? callback : null;
    
    // Get all arguments into the src's array
    srcs.push.apply(srcs, arguments);
    // if we have a callback, then we should remove it from the list of src's
    if (callback) srcs.pop();
    
    // if our first src ends with "/..." then set that as the current working directory
    if (/\/\.\.\.$/.test(srcs[0])) {
      cwd = srcs.shift();
      cwd = cwd.replace(/\/\.\.\.$/, '');
    }
    
    function fireCallback() {
      var t = 0;
      // `this` is bound to the current script. It just finished running.
      this.complete = true;
      for (len=tracker.length; t<len; t++)
        if (!tracker[t].complete) return;
      // If every script was complete, we'll get here
      callback();
    }
    
    for (var i=0, len=srcs.length; i<len; i++) {
      var ext = this.inferExtension,
      // replace "..." with the cwd
      src = srcs[i].replace(/^\.\.\./, cwd),
      mod, result, onload, s;
      
      // Infer the file extension. Will use ".js" by default
      src = ext ? src.replace(new RegExp(ext + "$"), '') + ext : src;
      
      // our module script
      mod = document.createElement('script');
      mod.id = getUniqueId("module");
      mod.src = src;
      // Store some info. The only thing used so far is 'complete'
      result = {
        id: mod.id,
        fullPath: mod.src,
        dom: mod,
        complete: false
      };
      
      if (callback) {
        onload = fireCallback.bind(result);
        // Set up callbacks
        mod.onload = onload;
        // This one only for IE. TODO implement IE check.
        mod.onreadystatechange = function () {
          if (this.readyState == "complete")
            onload();
        };
      }
      
      // Insert our script before the first script element (like Google does).
      s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(mod, s);
      
      // Keep track of all our results
      tracker.push(result);
    }
    
    return this;
  };
  
  module.inferExtension = '.js';
  
  // Generates a unique id. Used to identify each script uniquely.
  function getUniqueId(prefix) {
    prefix = prefix || "";
    return '_' + prefix + "_" + getUniqueId.id++;
  }
  getUniqueId.id = 0;
  
  window.module = module;
  // Use `require` instead of `module.require`.
  // This makes more sense semantically if you are requiring something like jQuery,
  // which isn't technically a module by our definition
  window.require = module.require.bind(module);
  
})();
