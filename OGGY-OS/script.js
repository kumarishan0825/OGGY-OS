
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

dragElement(document.getElementById("mydiv2"));

const notepadIcon = document.getElementById("mydivheader2");
const notepadWindow = document.getElementById("noteswindow");
const notepadHeader = document.getElementById("notesheader");
const notepadClose = document.getElementById("notes-close-button");
const notepadTextarea = document.getElementById("notes-textarea");

notepadIcon.addEventListener("click", (e) => {
    e.preventDefault();
    notepadWindow.style.display = "block";
});

notepadClose.addEventListener("click", (e) => {
  notepadWindow.style.display = "none";
});

const downloadPdfBtn = document.getElementById("download-pdf");
downloadPdfBtn.addEventListener("click", () => {
  const noteText = notepadTextarea.value;
  if (!noteText.trim() === "") { alert("Bro! Write something naa."); return; }
  const printWindow = window.open('', '_blank', 'width=600,height=600');
  printWindow.document.write(`<html><head><title>OGGY-OS</title><style>body{font-family: monospace, sans-serif; padding: 30px; white-space: pre-wrap;}</style></head><body>${noteText.replace(/</g, '&lt;').replace(/>/g, '&gt;'  )}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
});

let isN_drag = false, n_X, n_Y;
notepadHeader.addEventListener("mousedown", (e) => {
    isN_drag = true;
    n_X = e.clientX - notepadWindow.offsetLeft;
    n_Y = e.clientY - notepadWindow.offsetTop;
});
document.addEventListener("mousemove", (e) => {
    if (!isN_drag) return;
    let Left = e.clientX - n_X;
    let Top = e.clientY - n_Y;
    const TASKBAR_LIMIT = 40;
    if (Top < TASKBAR_LIMIT) Top = TASKBAR_LIMIT;
    notepadWindow.style.left = Left + "px";
    notepadWindow.style.top = Top + "px";
});
document.addEventListener("mouseup", () => {
    isN_drag = false;
}); 

dragElement(document.getElementById("mydiv3"));

const calcIcon = document.getElementById("mydivheader3");
const calcWindow = document.getElementById("calculatorwindow");
const calcHeader = document.getElementById("calculatorheader");
const calcClose = document.getElementById("calc-close-button");
const calcScreen = document.getElementById("calc-screen");

calcIcon.addEventListener("click", (e) => {
    e.preventDefault();
    calcWindow.style.display = "block";
});

calcClose.addEventListener("click", (e) => {
  calcWindow.style.display = "none";
});

function pressKey(key) {
  if (calcScreen.value === "0" && key !== ".") {
    calcScreen.value = key;
  }
  else{
    calcScreen.value += key;
  }
}
function clearScreen(){
  calcScreen.value = "0";
}
function backspace(){
  if (calcScreen.value.length > 1){
    calcScreen.value = calcScreen.value.slice(0, -1);
  }
  else{
    calcScreen.value = "0";
  }
}
function calculateResult(){
  try{
    let inputExpression = calcScreen.value;
    let result = Function('"use strict"; return(' + inputExpression + ')')();
    calcScreen.value = result;
  }
  catch(error){
    calcScreen.value = "Error";
  }
}

let isC_drag = false, c_X, c_Y;
calcHeader.addEventListener("mousedown", (e) => {
    isC_drag = true;
    c_X = e.clientX - calcWindow.offsetLeft;
    c_Y = e.clientY - calcWindow.offsetTop;
});
document.addEventListener("mousemove", (e) => {
    if (!isC_drag) return;
    let left = e.clientX - c_X;
    let top = e.clientY - c_Y;
    const TASKBAR_LIMIT = 40;
    if (top < TASKBAR_LIMIT) top = TASKBAR_LIMIT;
    calcWindow.style.left = left + "px";
    calcWindow.style.top = top + "px";
});
document.addEventListener("mouseup", () => {
    isC_drag = false;
}); 