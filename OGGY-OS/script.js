
dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}



const googleIcon = document.getElementById("mydivheader");
const googleWindow = document.getElementById("googlewindow");
const googleHeader = document.getElementById("googleheader");
const googleClose = document.getElementById("google-close-button");

googleIcon.addEventListener("click", (e) => {
    e.preventDefault();
    googleWindow.style.display = "block";
});

googleClose.addEventListener("click", (e) => {
    googleWindow.style.display = "none";
});
let isDragging = false;
let offsetX, offsetY;

googleHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - googleWindow.offsetLeft;
    offsetY = e.clientY - googleWindow.offsetTop;
});
document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    const TASKBAR_LIMIT = 40;
    if (newTop < TASKBAR_LIMIT) newTop = TASKBAR_LIMIT;

    googleWindow.style.left = newLeft + "px";
    googleWindow.style.top = newTop + "px";
});
document.addEventListener("mouseup", () => {
    isDragging = false;
}); 