if(window != undefined) {
  window.jsCallback = function() {
  }
}

if(Android != undefined) {
  Android.askThis("What is your name", 
    'window.jsCallback=function(s) {Android.speakThis("Hello, "+s)};');
}
