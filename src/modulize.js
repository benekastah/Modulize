(function () {
  
  // Make sure we can use function binding
  // Got this snippet from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
  // There are some caveats. Visit the site to read.
  if (!Function.prototype.bind) {

    Function.prototype.bind = function (oThis) {

      if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

      var aArgs = Array.prototype.slice.call(arguments, 1), 
          fToBind = this, 
          fNOP = function () {},
          fBound = function () {
            return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));    
          };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;

    };

  }

  function module(namespace, moduleBody) {
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
    moduleBody.call(ns_obj, ns_obj);
  }
  
  (function () {
    module.require = function ( /* ...src's, callback */ ) {
      var callback,
      tracker = this.require.requiredScripts,
      srcs,
      args,
      session = getUniqueId("session");
    
      args = resolveArguments.apply(this, arguments);
      callback = args.callback;
      srcs = args.srcs;
      
      // For each src in srcs
      for (var i=0, len=srcs.length; i<len; i++) {
        var src = resolveSrc(srcs[i]), module;
        if (tracker[src] != null) continue;
      
        module = makeModule(src, session);
        handleCallback(module, callback);
        insertScript(module.dom);
        
        // Keep track of all our modules by src
        tracker[src] = module;
      }
    
      return this;
    };
  
    module.require.inferExtension = '.js';
    module.require.requiredScripts = {};
  
    // Generates a unique id. Used to identify each script uniquely.
    function getUniqueId(prefix) {
      prefix = prefix || "";
      return '_' + prefix + "_" + getUniqueId.id++;
    }
    getUniqueId.id = 0;
  
    // Cache first script tag's parent, which we will use to insert more script tags
    var firstScript,
    firstScriptParent;
    function insertScript(s) {
      // Thanks, Google!
      if (!firstScript) {
        firstScript = document.getElementsByTagName('script')[0];
        firstScriptParent = firstScript.parentNode;
      }
      firstScriptParent.insertBefore(s, firstScript);
    }
  
    function resolveArguments(/* ... */) {
      var callback = arguments[arguments.length-1],
      srcs =[],
      prefix;
    
      callback = typeof callback === "function" ? callback : null;
    
      // Get all arguments into the src's array
      srcs.push.apply(srcs, arguments);
      // if we have a callback, then we should remove it from the list of src's
      if (callback) srcs.pop();
    
      // Get our path prefix
      prefix = findPathPrefix.call(this, srcs);
    
      return { callback: callback, srcs: srcs };
    }
  
    var pathPrefix = '';
    function findPathPrefix(srcs) {
      // if our first src ends with "/..." then set that as the path prefix
      if (/\/\.\.\.$/.test(srcs[0]))
        pathPrefix = srcs.shift().replace(/\/\.\.\.$/, '') || '';
      return pathPrefix;
    }
  
    function resolveSrc(src) {
      var ext = module.require.inferExtension;
      src = src.replace(/^\.\.\./, pathPrefix)
      src = ext ? src.replace(new RegExp(ext + "$"), '') + ext : src;
      return src;
    }
    
    function makeModule(src, session) {
      var dom = document.createElement('script');
      dom.id = getUniqueId.call(this, "module");
      dom.src = src;
      dom.async = true;
      // Store some info. The only thing used so far is 'complete'
      var module = {
        id: dom.id,
        fullPath: dom.src,
        inputPath: src,
        dom: dom,
        complete: false,
        session: session
      };
      return module;
    }
  
    function fireCallback() {
      var t = 0,
      tracker = module.require.requiredScripts;
      // Sets the current script as completed
      this.complete = true;
      console.log(this.session);
      for (var src in tracker) {
        var mod = tracker[src];
        if (!tracker.hasOwnProperty(src) || mod.session !== this.session) continue;
        if (!tracker[src].complete) return;
      }
      // If every script was complete, we'll fire the callback
      this.callback();
    }
    
    function handleCallback(module, cb) {
      var onload;
      if (cb) {
        module.callback = cb;
        onload = fireCallback.bind(module);
        // Set up callbacks
        module.dom.onload = onload;
        // This one only for IE. TODO implement IE check.
        module.dom.onreadystatechange = function () {
          if (this.readyState == "complete")
            onload();
        };
      }
    }
  })();
  
  window.module = module;
  // Use `require` instead of `module.require`.
  // This makes more sense semantically if you are requiring something like jQuery,
  // which isn't technically a module by our definition
  window.require = module.require.bind(module);
  
})();
