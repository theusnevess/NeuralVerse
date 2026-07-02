/**
 * Topological Alignment Engine - Interactive Showcase Controller
 */
export function initHomeShowcase() {
  const container = document.querySelector(".nv-showcase-grid-interactive");
  if (!container) return;

  const cursor = document.querySelector(".nv-showcase-cursor");
  const lineEmbeddings = document.getElementById("line-embeddings");
  const lineAttention = document.getElementById("line-attention");
  const lineRag = document.getElementById("line-rag");

  const barEmbeddings = document.querySelector("[data-bar='embeddings']");
  const barAttention = document.querySelector("[data-bar='attention']");
  const barRag = document.querySelector("[data-bar='rag']");

  const valEmbeddings = document.querySelector("[data-metric='embeddings']");
  const valAttention = document.querySelector("[data-metric='attention']");
  const valRag = document.querySelector("[data-metric='rag']");

  if (!cursor || !lineEmbeddings || !lineAttention || !lineRag) return;

  // Targets coordinates in viewBox (400x333)
  const targets = {
    embeddings: { x: 120, y: 100, bar: barEmbeddings, val: valEmbeddings },
    attention: { x: 320, y: 80, bar: barAttention, val: valAttention },
    rag: { x: 200, y: 260, bar: barRag, val: valRag }
  };

  let isUserInteracting = false;
  let animationFrameId = null;
  let lastTime = 0;

  // Gaussian Radial Basis Function (RBF) for similarity calculation
  function calculateSimilarity(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // RBF kernel coefficient: controls how quickly similarity decays with distance
    const sigma = 140;
    return Math.exp(-(distance * distance) / (2 * sigma * sigma));
  }

  function updateProjection(viewX, viewY) {
    // Clamp coordinates
    viewX = Math.max(0, Math.min(400, viewX));
    viewY = Math.max(0, Math.min(333, viewY));

    // Convert back to percentages for cursor position
    const pctX = (viewX / 400) * 100;
    const pctY = (viewY / 333) * 100;

    // Update cursor
    cursor.style.left = `${pctX}%`;
    cursor.style.top = `${pctY}%`;

    // Update connector lines
    lineEmbeddings.setAttribute("x1", viewX);
    lineEmbeddings.setAttribute("y1", viewY);
    lineAttention.setAttribute("x1", viewX);
    lineAttention.setAttribute("y1", viewY);
    lineRag.setAttribute("x1", viewX);
    lineRag.setAttribute("y1", viewY);

    // Calculate similarities
    for (const key in targets) {
      const target = targets[key];
      const similarity = calculateSimilarity(viewX, viewY, target.x, target.y);
      
      if (target.bar) {
        target.bar.style.width = `${Math.round(similarity * 100)}%`;
      }
      if (target.val) {
        target.val.textContent = similarity.toFixed(3);
      }
    }
  }

  function handleInteraction(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    const pctX = (clientX - rect.left) / rect.width;
    const pctY = (clientY - rect.top) / rect.height;

    const viewX = pctX * 400;
    const viewY = pctY * 333;

    updateProjection(viewX, viewY);
  }

  // Pointer event listeners
  const onPointerMove = (e) => {
    if (!isUserInteracting) return;
    handleInteraction(e.clientX, e.clientY);
  };

  const onPointerDown = (e) => {
    isUserInteracting = true;
    container.setPointerCapture(e.pointerId);
    handleInteraction(e.clientX, e.clientY);
  };

  const onPointerUp = (e) => {
    isUserInteracting = false;
    container.releasePointerCapture(e.pointerId);
    startIdleAnimation();
  };

  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerup", onPointerUp);
  container.addEventListener("pointercancel", onPointerUp);

  // Idle automatic loop mapping a smooth Lissajous curve
  function animateIdle(timestamp) {
    if (isUserInteracting) return;

    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp / 1000; // in seconds

    // Smooth trajectory loop
    const viewX = 200 + 100 * Math.sin(elapsed * 0.8);
    const viewY = 166 + 70 * Math.cos(elapsed * 1.3);

    updateProjection(viewX, viewY);

    animationFrameId = requestAnimationFrame(animateIdle);
  }

  function startIdleAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(animateIdle);
  }

  // Initialize
  startIdleAnimation();

  // Cleanup handler returned to the router view controller
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    container.removeEventListener("pointerdown", onPointerDown);
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerup", onPointerUp);
    container.removeEventListener("pointercancel", onPointerUp);
  };
}
