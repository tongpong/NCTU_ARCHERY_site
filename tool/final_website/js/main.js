function shake() {
  var supportsVibrate = "vibrate" in navigator;
  navigator.vibrate(1000);
}
