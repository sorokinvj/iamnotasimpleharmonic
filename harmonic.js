const canvas = document.getElementById('oscillatorCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioCtx;
let oscillator;
let analyser;

const BACKGROUND_COLOR = '#d3d3d3'; // Light gray background
const LINE_COLOR = '#5e5e5e'; // Dark gray lines

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', function () {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();

    let modulator = audioCtx.createOscillator();
    let modGain = audioCtx.createGain();
    modulator.frequency.setValueAtTime(2, audioCtx.currentTime);
    modGain.gain.setValueAtTime(150, audioCtx.currentTime);

    modulator.connect(modGain);
    modGain.connect(oscillator.frequency);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    analyser = audioCtx.createAnalyser();
    gainNode.connect(analyser);

    modulator.start();
    oscillator.start();

    draw(); // Start the visual drawing function
  }

  startButton.style.display = 'none'; // Optionally hide the button after it's pressed
});

function draw() {
  if (!analyser) return;
  requestAnimationFrame(draw);

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Effectively clear the canvas

  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  ctx.lineWidth = 2;
  ctx.strokeStyle = LINE_COLOR;

  ctx.beginPath(); // Ensure a new path is started here
  let sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    let v = dataArray[i] / 128.0;
    let y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - calculateOtherElementsHeight();
  draw();
}

function calculateOtherElementsHeight() {
  let height = 0;
  const containers = document.querySelectorAll('.container');
  containers.forEach(container => {
    height += container.offsetHeight;
  });

  // Adjusting this may be necessary if there's any padding or explicit margin applied at the body level
  const computedStyle = getComputedStyle(document.body);
  height +=
    parseInt(computedStyle.marginTop, 10) +
    parseInt(computedStyle.marginBottom, 10);

  return height;
}
window.addEventListener('DOMContentLoaded', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
