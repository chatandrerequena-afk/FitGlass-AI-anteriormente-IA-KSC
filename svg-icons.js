/* FitGlass AI — SVG icon registry. */
(function(){
  "use strict";
  const icons={
    "home":"<path d=\"M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z\"/>",
    "camera":"<path d=\"M4 7h4l2-2h4l2 2h4v12H4z\"/><circle cx=\"12\" cy=\"13\" r=\"3.5\"/>",
    "coach":"<path d=\"M5 5h14v11H8l-3 3z\"/><path d=\"M8 9h8M8 12h5\"/>",
    "water":"<path d=\"M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z\"/>",
    "profile":"<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>",
    "heart":"<path d=\"M20 8.5c0 5-8 10-8 10S4 13.5 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z\"/>",
    "flame":"<path d=\"M12 21c4 0 7-3 7-7 0-3-2-6-5-8 0 3-1 4-2 5-1-3-2-5-2-8-3 3-6 7-6 11 0 4 3 7 8 7Z\"/>",
    "sparkle":"<path d=\"m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z\"/>",
    "chart":"<path d=\"M5 19V9M12 19V5M19 19v-7\"/>",
    "check":"<path d=\"m5 12 4 4L19 6\"/>",
    "plus":"<path d=\"M12 5v14M5 12h14\"/>",
    "x":"<path d=\"m6 6 12 12M18 6 6 18\"/>",
    "arrow":"<path d=\"M5 12h13M13 6l6 6-6 6\"/>",
    "calendar":"<rect x=\"4\" y=\"5\" width=\"16\" height=\"15\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M4 9h16\"/>",
    "lock":"<rect x=\"5\" y=\"10\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3\"/>",
    "globe":"<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M4 12h16M12 4c2 2.4 2.8 5.1 2.8 8S14 17.6 12 20c-2-2.4-2.8-5.1-2.8-8S10 6.4 12 4Z\"/>",
    "food":"<path d=\"M6 3v8M4 3v5a2 2 0 0 0 4 0V3M6 10v11M15 3v18M15 3c3 2 4 4 4 7v3h-4\"/>",
  };
  function svg(name,className="icon"){const body=icons[name]||"";return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;}
  function mount(selector,name){document.querySelectorAll(selector).forEach(el=>{el.innerHTML=svg(name);});}
  window.FG_ICONS={icons,svg,mount};
})();
