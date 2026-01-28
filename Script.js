const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// MediaPipe Hands
const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults(onResults);

// Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720,
});
camera.start();

// Draw loop
function onResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks.length) return;

  const hand = results.multiHandLandmarks[0];

  // Palm center (landmark 9)
  const x = hand[9].x * canvas.width;
  const y = hand[9].y * canvas.height;

  drawParticles(x, y);

  // Gesture detection
  const thumb = hand[4];
  const index = hand[8];

  const dist = Math.hypot(
    thumb.x - index.x,
    thumb.y - index.y
  );

  if (dist < 0.04) {
    drawHeart(x, y);
  } else {
    drawCircle(x, y);
  }
}

// Particle effect
function drawParticles(x, y) {
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(
      x + Math.random() * 40 - 20,
      y + Math.random() * 40 - 20,
      2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "cyan";
    ctx.fill();
  }
}

// Circle
function drawCircle(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 50, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,255,255,0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Heart
function drawHeart(x, y) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - 30, y - 30, x - 60, y + 20, x, y + 60);
  ctx.bezierCurveTo(x + 60, y + 20, x + 30, y - 30, x, y);
  ctx.fill();
}
