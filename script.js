const screens={splash:document.getElementById("splash"),language:document.getElementById("languageScreen"),permission:document.getElementById("permissionScreen"),app:document.getElementById("appScreen")};
let selectedLang="fr";
setTimeout(()=>show("language"),5800);
document.querySelectorAll(".language").forEach(button=>{button.addEventListener("click",()=>{document.querySelectorAll(".language").forEach(b=>b.classList.remove("selected"));button.classList.add("selected");selectedLang=button.dataset.lang;});});
function show(name){Object.values(screens).forEach(s=>s.classList.remove("active"));screens[name].classList.add("active");}
function confirmLanguage(){show("permission");}
function requestLocation(){if(!navigator.geolocation){openApp(false);return;}navigator.geolocation.getCurrentPosition((position)=>{const lat=position.coords.latitude.toFixed(5);const lon=position.coords.longitude.toFixed(5);openApp(true,lat,lon);},()=>openApp(false),{enableHighAccuracy:true,timeout:7000,maximumAge:0});}
function openApp(hasGps,lat,lon){show("app");const text=document.getElementById("locationText");text.textContent=hasGps?`Position GPS : ${lat}, ${lon}`:"Mode test sans GPS";}
function restart(){show("language");}
