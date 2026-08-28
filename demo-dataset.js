/* FitGlass AI — deterministic demo dataset for Eureka. */
(function(){
  "use strict";
  const days=[];
  days.push({day:"2026-07-30",calories:1620,weight:70.4,protein:85,water:1.8});
  days.push({day:"2026-07-31",calories:1810,weight:70.2,protein:88,water:1.98});
  days.push({day:"2026-08-01",calories:1730,weight:70.1,protein:91,water:2.16});
  days.push({day:"2026-08-02",calories:1960,weight:70.3,protein:94,water:2.34});
  days.push({day:"2026-08-03",calories:1885,weight:69.9,protein:97,water:2.52});
  days.push({day:"2026-08-04",calories:2050,weight:69.8,protein:100,water:1.8});
  days.push({day:"2026-08-05",calories:1715,weight:69.7,protein:103,water:1.98});
  days.push({day:"2026-08-06",calories:1860,weight:69.8,protein:106,water:2.16});
  days.push({day:"2026-08-07",calories:1935,weight:69.6,protein:109,water:2.34});
  days.push({day:"2026-08-08",calories:1790,weight:69.5,protein:85,water:2.52});
  days.push({day:"2026-08-09",calories:2010,weight:69.4,protein:88,water:1.8});
  days.push({day:"2026-08-10",calories:1840,weight:69.5,protein:91,water:1.98});
  days.push({day:"2026-08-11",calories:1765,weight:69.2,protein:94,water:2.16});
  days.push({day:"2026-08-12",calories:1905,weight:69.1,protein:97,water:2.34});
  days.push({day:"2026-08-13",calories:1980,weight:69.3,protein:100,water:2.52});
  days.push({day:"2026-08-14",calories:1850,weight:69.0,protein:103,water:1.8});
  days.push({day:"2026-08-15",calories:2070,weight:68.9,protein:106,water:1.98});
  days.push({day:"2026-08-16",calories:1760,weight:69.0,protein:109,water:2.16});
  days.push({day:"2026-08-17",calories:1890,weight:68.8,protein:85,water:2.34});
  days.push({day:"2026-08-18",calories:1940,weight:68.6,protein:88,water:2.52});
  days.push({day:"2026-08-19",calories:1815,weight:68.7,protein:91,water:1.8});
  days.push({day:"2026-08-20",calories:1995,weight:68.4,protein:94,water:1.98});
  days.push({day:"2026-08-21",calories:1860,weight:68.3,protein:97,water:2.16});
  days.push({day:"2026-08-22",calories:1775,weight:68.5,protein:100,water:2.34});
  days.push({day:"2026-08-23",calories:1910,weight:68.2,protein:103,water:2.52});
  days.push({day:"2026-08-24",calories:2015,weight:68.1,protein:106,water:1.8});
  days.push({day:"2026-08-25",calories:1845,weight:68.2,protein:109,water:1.98});
  days.push({day:"2026-08-26",calories:1960,weight:67.9,protein:85,water:2.16});
  days.push({day:"2026-08-27",calories:1825,weight:68.0,protein:88,water:2.34});
  days.push({day:"2026-08-28",calories:2030,weight:67.8,protein:91,water:2.52});
  function last(n=7){return days.slice(-n);}
  function average(field,n=7){const a=last(n);return a.reduce((s,x)=>s+(Number(x[field])||0),0)/Math.max(1,a.length);}
  function seedIfEmpty(state){if(!state||state.meals?.length||state.history?.length)return false;return true;}
  window.FG_DEMO_DATA={days,last,average,seedIfEmpty};
})();
