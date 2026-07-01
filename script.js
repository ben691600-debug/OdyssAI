setTimeout(() => {
  document.getElementById("splash").classList.remove("active");
  document.getElementById("home").classList.add("active");
}, 6800);

function showDashboard(){
  document.getElementById("home").classList.remove("active");
  document.getElementById("dashboard").classList.add("active");
}
