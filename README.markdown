#Modulize
###Bringing separation of concerns to your client-side javascript
===========


Modulize is a little library that allows you to lazy-load (*__read__: asynchronous*) your 
javascript files as modules. Think CommonJS modules optimized for the browser. This 
allows for improved load times and a smooth experience 
for site users. It is extremely simple and easy to learn, yet it has an expressive 
syntax to make it easy for you to get what you want from it.

-----------

##How it works

There are currently only two functions to know:

1.  `module`
    
    This function allows you to define a module in your client-side javascript.
    This function takes two arguments:
    1.  `namespace` (`string`)
        *   ex: `"my.namespace.object"`
        *   use: This will automatically create the object described in the `string`
            (in this case, `my.namespace.object`). This object will be bound as `this`
            for the module body (see argument 2), and will also be passed in as its
            first (and only) argument.
    2.  `moduleBody` (`function`)
        *   ex: see example below
        *   use: This is basically just the file contents. Everything you would put 
            in the file, you should now put here. This does a couple things for you:
            1.  **It allows you to avoid crowding the global namespace.**
                Things you don't explicitly bind to `this` won't even be available 
                outside the file! This offers great encapsulation, and allows you
                to easily whip out many elegant design patterns.
            2.  It aliases the namespace object created from the first argument to
                both `this` and the first argument of your function. See example below.
    
    ***Example:***
    
    ```javascript
    // contents of js/downloader/popup.js
    module("myApp.downloader.popup", function (exports) {
      // Both "this" and "exports" are aliases to "myApp.downloader.popup" (created from the first argument).
      // Everything you add to "this" or "exports" is also added to myApp.downloader.popup.
      // It is recommended to use the first argument of the function instead of "this" 
      // because "this" will not automatically be the scope of any functions not bound to it.
      
      exports.height = 500;
      exports.width = 600;
      exports.contents = "<some>html</here>";
      
      var popup;
      exports.show = function () {
        popup = someLibrary.showPopup({
          html: exports.contents,
          height: exports.height,
          width: exports.width,
          cancel: closePopup
        });
      };
      
      function closePopup() {
        myApp.cookies.saveForm(popup.form);
        popup.close();
      }
    });
    ```

2.  `module.require`, or simply `require` for convenience

    This function allows you to require a module that you have defined. It actually will
    let you successfully require any javascript file, whether or not it defined as a module.
    This function takes three kinds of arguments:
    1. `prefix` (`string`). Optional.
        *   ex: `"js/3rdParty/..."`
        *   use: If you want to use this, the last four characters of the first argument
            you pass in must be `/...`. Everything before those last four characters
            will be used as the path prefix. NOTE: This prefix will only be used on files
            that have `.../` as the first four characters of the name. The `...` will be
            replaced with the `prefix`.
    2.  `src` (`string`)
        *   ex: `js/index` maps to `js/index.js`
        *   use: Everything but the first and last argument is an `src`. `src`
            represents the path to the javascript source. By default, you don't have to
            put the `.js` extension at the end. It will be added automatically if missing.
            NOTE: If the first argument does not match the criteria for a `prefix` it will
            be treated as an `src`.
    3.  `callback` (`function`). Optional.
        *   ex: see example below
        *   use: Any code that depends on the files described by the `src`s goes here.
            This code will be run immediately after *all* the files in the current function
            call have loaded properly.
    
    ***Examples:***
    
    ```html
    <!-- portion of index.html -->
    <script src="modulize.js"></script>
    <script>
      require("js/jquery", "js/index", function () {
        // This function will run as soon as "js/jquery.js" and "js/index.js" are through loading
        
        // Code that depends on "js/index.js" can be run safely now
        myApp.index.initialize();
        
        // Same with jQuery code
        $(function () {
          // manipulate DOM
        });
      });
    </script>
    ```
    
    ```javascript
    // portion of someFile.js
    require("js/downloader/...", ".../index", ".../popup", function () {
      // This function will run as soon as "js/downloader/index.js" and "js/downloader/popup.js" have loaded
      
      // etc...
    });
    ```