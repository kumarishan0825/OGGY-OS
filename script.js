
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

dragElement(document.getElementById("mydiv4"));

const cmdIcon = document.getElementById("mydivheader4");
const cmdWindow = document.getElementById("cmdWindow");
const cmdHeader = document.getElementById("cmdHeader");
const cmdClose = document.getElementById("cmd-close-button");
const cmdInput = document.getElementById("cmd-input");
const cmdOutput = document.getElementById("cmd-output");

cmdIcon.addEventListener("click", (e) => {
  e.preventDefault();
  cmdWindow.style.display = "block";
  setTimeout(() => cmdInput.focus(), 50);
});

cmdClose.addEventListener("click", () => {
  cmdWindow.style.display = "none";
});

function focusCmdInput() {
  cmdInput.focus();
}

cmdInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    let commandStr = cmdInput.value.trim();
    if (commandStr !== "") {
      processCommand(commandStr);
    }
    cmdInput.value = ""; 
  }
});

function processCommand(cmdText) {
  const echoLine = document.createElement("p");
  echoLine.innerHTML = `<span class="cmd-prompt">C:\\Users\\Oggy&gt;</span>${cmdText}`;
  cmdOutput.appendChild(echoLine);

  let lowerCmd = cmdText.toLowerCase().split(" ")[0]; 
  const systemReply = document.createElement("p");

  switch(lowerCmd) {
    case "help":
      systemReply.innerHTML = `
Available internal execution routines for Oggy-OS shell context loops:<br>
  <span class="highlight">help</span>       - Displays current system diagnostic interface manuals.<br>
  <span class="highlight">clear</span>      - Wipes previous terminal stream character nodes away.<br>
  <span class="highlight">date</span>       - Fetches exact localized device calendar parameters.<br>
  <span class="highlight">google</span>     - Fires open your sandboxed web browser window app frame.<br>
  <span class="highlight">notes</span>      - Launches your persistent structural text file notepad application.<br>
  <span class="highlight">calc</span>       - Executes standalone accessory widget calculation engines.<br>
  <span class="highlight">about</span>      - Outputs detailed project core metadata blueprints.`;
      break;
      
    case "clear":
      cmdOutput.innerHTML = "";
      return; 
      
    case "date":
      systemReply.innerHTML = `Current Local System Timestamp: <span class="system-msg">${new Date().toString()}</span>`;
      break;
      
    case "google":
      document.getElementById("googlewindow").style.display = "block";
      systemReply.innerHTML = `<span class="system-msg">Success: Launched sandboxed Google Browser core application frame.</span>`;
      break;
      
    case "notes":
      document.getElementById("noteswindow").style.display = "block";
      systemReply.innerHTML = `<span class="system-msg">Success: Executed localized document notepad text editor view.</span>`;
      break;
      
    case "calc":
      document.getElementById("calculatorwindow").style.display = "block";
      systemReply.innerHTML = `<span class="system-msg">Success: Loaded standalone calculation mathematics framework widget.</span>`;
      break;
      
    case "about":
      systemReply.innerHTML = `
<span class="system-msg">--- OGGY ARCHITECTURE OS SHELL OVERVIEW ---</span><br>
Platform Core Environment Specification: HTML5, CSS3 Fluid Grids & Native Vanilla JavaScript API.<br>
Systems Layer Status: Operational Framework Online.<br>
Developed by: Kumar Ishan (IsoVoir).`;

    case "kuchupuchu":
      systemReply.innerHTML = `
<span class="system-msg">--- I LOVE YOU SO MUCH SWEETHEART (SHREYA) ---</span><br>
Yaar mai tumhe kaafi miss krta hu aur bari yaad aati ho hmko to isi baat me<br>
Yaha mai kehna chahta hu ki, Will you be my forever one 💖.<br>
---- Ishan.`;
      break;
      
    default:
      systemReply.innerHTML = `<span class="error-msg">'${cmdText}' is not recognized as an internal shell operation command script parameter check rules logic.</span>`;
  }

  cmdOutput.appendChild(systemReply);
  
  cmdWindow.querySelector(".cmd-body").scrollTop = cmdWindow.querySelector(".cmd-body").scrollHeight;
}
let isCmdDrag = false, cmdOffsetX, cmdOffsetY;
cmdHeader.addEventListener('mousedown', (e) => {
  isCmdDrag = true;
  cmdOffsetX = e.clientX - cmdWindow.offsetLeft;
  cmdOffsetY = e.clientY - cmdWindow.offsetTop;
});
document.addEventListener('mousemove', (e) => {
  if (!isCmdDrag) return;
  let left = e.clientX - cmdOffsetX;
  let top = e.clientY - cmdOffsetY;
  if (top < 40) top = 40; 
  cmdWindow.style.left = left + 'px';
  cmdWindow.style.top = top + 'px';
});
document.addEventListener('mouseup', () => { isCmdDrag = false; });

dragElement(document.getElementById("mydiv5"));
const oggyIcon = document.getElementById("mydivheader5");
const oggyWindow = document.getElementById("oggywindow");
const oggyHeader = document.getElementById("oggyheader");
const oggyClose = document.getElementById("oggy-close-button");

oggyIcon.addEventListener("click", (e) => {
    e.preventDefault();
    oggyWindow.style.display = "block";
});

oggyClose.addEventListener("click", (e) => {
    oggyWindow.style.display = "none";
});

let isO_drag = false, O_X, O_Y;
googleHeader.addEventListener("mousedown", (e) => {
    isO_drag = true;
    O_X = e.clientX - oggyWindow.offsetLeft;
    O_Y = e.clientY - oggyWindow.offsetTop;
});
document.addEventListener("mousemove", (e) => {
    if (!isO_drag) return;
    let newLeft = e.clientX - O_X;
    let newTop = e.clientY - O_Y;

    const TASKBAR_LIMIT = 40;
    if (newTop < TASKBAR_LIMIT) newTop = TASKBAR_LIMIT;

    oggyWindow.style.left = newLeft + "px";
    oggyWindow.style.top = newTop + "px";
});
document.addEventListener("mouseup", () => {
    isO_drag = false;
}); 

