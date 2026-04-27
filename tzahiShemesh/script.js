/**
 * ==========================================
 * חלק 1: לוגיקה (Glitch Generator & Recorder)
 * ==========================================
 */

/**
 * GlitchGenerator - מנוע הגליץ' (Warp & Weft)
 */
class GlitchGenerator {
  generate(data) {
    const container = document.querySelector('.image-container');
    if (!container) return;

    // שליפת התמונה הנוכחית (מה-Inline Style או מה-CSS)
    let imgUrl = "";
    const layer = document.querySelector('.image-layer');
    if (layer.style.backgroundImage) {
        imgUrl = layer.style.backgroundImage.slice(4, -1).replace(/"/g, "");
    } else {
        const rawUrl = getComputedStyle(layer).backgroundImage;
        imgUrl = rawUrl.slice(4, -1).replace(/"/g, "");
    }

    const rect = container.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.className = 'glitch-canvas';
    
    Object.assign(canvas.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      zIndex: '100', pointerEvents: 'none', opacity: '0', transition: 'opacity 0.8s ease',
      mixBlendMode: 'normal' 
    });

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;

    img.onload = () => {
      // ציור תמונת הבסיס
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      let prevPoint = data.path[0];

      // לולאת הגליץ'
      data.path.forEach((point, i) => {
        if (i === 0) return;

        // חישוב כיוון ומהירות
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        const dist = Math.hypot(dx, dy);
        const timeDiff = point.t - prevPoint.t;
        const velocity = timeDiff > 0 ? dist / timeDiff : 0;

        // סף הפעלה
        if (velocity > 0.3 || Math.random() > 0.95) {
            
            // גליץ' אופקי (Weft) אם התנועה אנכית
            if (Math.abs(dy) > Math.abs(dx)) {
                this.drawHorizontalSlice(ctx, img, point, velocity, canvas.width, canvas.height);
            }
            // גליץ' אנכי (Warp) אם התנועה אופקית
            else {
                this.drawVerticalSlice(ctx, img, point, velocity, canvas.width, canvas.height);
            }
        }
        prevPoint = point;
      });

      const oldCanvas = container.querySelector('.glitch-canvas');
      if(oldCanvas) oldCanvas.remove();
      container.appendChild(canvas);
      requestAnimationFrame(() => canvas.style.opacity = '1');
    };
  }

  // גליץ' אופקי
  drawHorizontalSlice(ctx, img, point, intensity, w, h) {
    const sliceHeight = Math.max(2, Math.min(60, intensity * 15));
    const shiftAmount = (Math.random() - 0.5) * (intensity * 150);
    const sourceY = (point.y / h) * img.naturalHeight;
    const destY = point.y;

    try {
        ctx.drawImage(
            img, 
            0, sourceY, img.naturalWidth, sliceHeight, 
            shiftAmount, destY, w, sliceHeight         
        );
    } catch(e) {}

    if (Math.abs(shiftAmount) > 10) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = Math.random() > 0.5 ? '#ff00ff30' : '#00ffff30';
        ctx.fillRect(0, destY, w, sliceHeight);
        ctx.globalCompositeOperation = 'source-over';
    }
  }

  // גליץ' אנכי
  drawVerticalSlice(ctx, img, point, intensity, w, h) {
    const sliceWidth = Math.max(2, Math.min(60, intensity * 15));
    const shiftAmount = (Math.random() - 0.5) * (intensity * 150);
    const sourceX = (point.x / w) * img.naturalWidth;
    const destX = point.x;

    try {
        ctx.drawImage(
            img,
            sourceX, 0, sliceWidth, img.naturalHeight, 
            destX, shiftAmount, sliceWidth, h          
        );
    } catch(e) {}

    if (Math.abs(shiftAmount) > 10) {
        ctx.globalCompositeOperation = 'multiply'; 
        ctx.fillStyle = Math.random() > 0.5 ? '#ffff0030' : '#0000ff30';
        ctx.fillRect(destX, 0, sliceWidth, h);
        ctx.globalCompositeOperation = 'source-over';
    }
  }

  download() {
      const canvas = document.querySelector('.glitch-canvas');
      if (!canvas) { alert("Please generate first."); return; }
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      
      let imgUrl = "";
      const layer = document.querySelector('.image-layer');
      if (layer.style.backgroundImage) {
          imgUrl = layer.style.backgroundImage.slice(4, -1).replace(/"/g, "");
      } else {
          const rawUrl = getComputedStyle(layer).backgroundImage;
          imgUrl = rawUrl.slice(4, -1).replace(/"/g, "");
      }

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imgUrl;
      
      img.onload = () => {
          ctx.fillStyle = "#111";
          ctx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
          
          ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
          ctx.fillStyle = "rgba(0,0,0,0.1)"; 
          ctx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
          ctx.drawImage(canvas, 0, 0);
          
          const link = document.createElement('a');
          const timestamp = new Date().toISOString().slice(0,19).replace(/:/g,"-");
          link.download = `insaption-warp-${timestamp}.png`;
          link.href = tempCanvas.toDataURL('image/png');
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
      };
  }
}

/**
 * CreativeSessionRecorder
 */
class CreativeSessionRecorder {
  constructor() { this.sessionData = { path: [], shapes: {}, startTime: Date.now() }; this.lastRecordTime = 0; }
  
  recordMovement(x, y) {
    const now = Date.now();
    if (now - this.lastRecordTime > 30) {
      this.sessionData.path.push({ x: Math.round(x), y: Math.round(y), t: now - this.sessionData.startTime });
      this.lastRecordTime = now;
    }
  }
  
  trackShape(shape) { if (!this.sessionData.shapes[shape]) this.sessionData.shapes[shape] = 0; this.sessionData.shapes[shape]++; }
  reset() { this.sessionData = { path: [], shapes: {}, startTime: Date.now() }; this.lastRecordTime = 0; }
  exportData() { 
      if (this.sessionData.path.length < 5) { alert("Interact with image first!"); return; } 
      artGenerator.generate(this.sessionData); 
  }
}

const recorder = new CreativeSessionRecorder();
const artGenerator = new GlitchGenerator();

/**
 * ==========================================
 * חלק 2: ממשק משתמש ופונקציית רנדומליות
 * ==========================================
 */

// --- פונקציה חדשה: יצירת URL דינמי ---
function pickRandomImage() {
    const layers = document.querySelectorAll('.image-layer');
    
    // 1. הגרלת מספר בין 1 ל-20
    const randomNum = Math.floor(Math.random() * 20) + 1;
    
    // 2. פירמוט המספר לשלוש ספרות (למשל: 1 הופך ל-001)
    const formattedNum = String(randomNum).padStart(3, '0');
    
    // 3. בניית הכתובת
    const randomUrl = `https://assets.codepen.io/7558/portrait-fashion-${formattedNum}.jpg`;
    
    // 4. החלפה בכל השכבות
    layers.forEach(layer => {
        layer.style.backgroundImage = `url(${randomUrl})`;
    });
}

function initButtons() {
    const genBtn = document.getElementById('genBtn');
    if (genBtn) genBtn.addEventListener('click', () => recorder.exportData());
    
    // כפתור RESET - מפעיל את בחירת התמונה החדשה
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
        const canvas = document.querySelector('.glitch-canvas');
        if(canvas) {
            canvas.style.opacity = '0';
            setTimeout(() => canvas.remove(), 800);
        }
        recorder.reset();
        pickRandomImage(); // <--- קריאה לפונקציה החדשה
    });

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => artGenerator.download());
}

function initDragAndDrop() {
  const container = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const layers = document.querySelectorAll('.image-layer');

  const updateImage = (src) => {
    layers.forEach(layer => {
      layer.style.backgroundImage = `url(${src})`;
    });
    const oldCanvas = document.querySelector('.glitch-canvas');
    if(oldCanvas) oldCanvas.remove();
  };

  if(uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => updateImage(e.target.result);
          reader.readAsDataURL(fileInput.files[0]);
        }
      });
  }

  if(container) {
      ['dragenter', 'dragover'].forEach(eventName => {
        container.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          container.classList.add('drag-over');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        container.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          container.classList.remove('drag-over');
        }, false);
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => updateImage(e.target.result);
          reader.readAsDataURL(e.dataTransfer.files[0]);
        }
      });
  }
}

// GSAP Logic (ללא שינוי)
const debounce = (fn, d) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), d); }; };

function initImageHover() {
  const container = document.querySelector("[data-image-hover]");
  if(!container) return;
  
  const rawLayers = Array.from(container.querySelectorAll(".image-layer"));
  if(!container.querySelector('.image-stack')) {
      let stackEl = document.createElement("div"); stackEl.className = "image-stack"; container.appendChild(stackEl);
      rawLayers.forEach((l) => stackEl.appendChild(l));
  }
  const stackEl = container.querySelector('.image-stack');
  const layers = Array.from(stackEl.querySelectorAll(".image-layer"));

  const duration = 0.8, ease = "power2.inOut", scaleInterval = 0.06, opacityInterval = 0.05, rotationInterval = 15;
  const blurSeq = [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1.0, 1.3, 1.6];
  const stagger = 0.1, followStrength = 0.15;
  let cssVarCache = { depthStep: 36, scale3D: 0.07, tiltMax: 45, panMax: 88, opacityFalloff: 0.1, moveAmplify: 0.54, tiltBoost: 1.25, panBoost: 1.25 };
  
  const updateCSSCache = () => {
    const css = getComputedStyle(document.documentElement);
    cssVarCache.depthStep = parseFloat(css.getPropertyValue("--depth-step")) || 36;
    cssVarCache.scale3D = parseFloat(css.getPropertyValue("--scale-3d")) || 0.07;
    cssVarCache.tiltMax = parseFloat(css.getPropertyValue("--tilt-max")) || 45;
    cssVarCache.panMax = parseFloat(css.getPropertyValue("--pan-max")) || 88;
    cssVarCache.opacityFalloff = parseFloat(css.getPropertyValue("--opacity-falloff")) || 0.1;
    cssVarCache.moveAmplify = parseFloat(css.getPropertyValue("--move-amplify")) || 0.54;
    cssVarCache.tiltBoost = parseFloat(css.getPropertyValue("--tilt-boost")) || 1.25;
    cssVarCache.panBoost = parseFloat(css.getPropertyValue("--pan-boost")) || 1.25;
  }; updateCSSCache();

  let timeline = null, isTransitioning = false, isParallax = false, isOpacity = false, isRotation = false, isBlur = false, isColor = false, is3D = false, isHovered = false;
  let rect = container.getBoundingClientRect(); let rafId = null, pendingMouseEvent = null;

  window.addEventListener("resize", debounce(() => { rect = container.getBoundingClientRect(); }, 50));
  const quickTos = layers.map((layer, i) => { if (i === 0) return null; const sv = 1 - scaleInterval * i; const mult = sv > 0 ? (1 - sv) * 3 + 0.2 : 1; return { layer, mult, xTo: gsap.quickTo(layer, "x", { duration: 0.6, ease: "power3" }), yTo: gsap.quickTo(layer, "y", { duration: 0.6, ease: "power3" }) }; }).filter(Boolean);

  const getScale = (i) => Math.max(1 - scaleInterval * i, 0); const getOpacity = (i) => !isOpacity ? 1 : Math.max(1 - opacityInterval * i, 0.1); const getRotVal = (i) => rotationInterval * i * (i % 2 === 0 ? 1 : -1); const getBlur = (i) => !isBlur || i === 0 ? 0 : blurSeq[Math.min(i, blurSeq.length - 1)]; const getColor = (i) => !isColor ? "none" : (i === 0 ? "grayscale(1)" : `grayscale(${1 - Math.min(i * 0.15, 1)}) saturate(${1 + Math.min(i * 0.15, 1) * 0.5})`);
  function applyFilters() { layers.forEach((l, i) => { const b = getBlur(i), c = getColor(i); let f = ""; if (b > 0) f += `blur(${b}px) `; if (c !== "none") f += c; l.style.filter = f.trim() || "none"; }); }
  function reset2D() { gsap.killTweensOf(stackEl); gsap.set(layers, { scale: (i, t) => (t === layers[0] ? 1 : 0.95), opacity: (i, t) => (t === layers[0] ? 1 : 0), rotation: 0, rotationZ: 0, x: 0, y: 0, z: 0 }); layers.forEach((l) => (l.style.filter = "none")); gsap.set(stackEl, { rotationX: 0, rotationY: 0, rotationZ: 0, x: 0, y: 0, z: 0, scale: 1 }); }
  function createTimeline() { if (timeline) timeline.kill(); const rev = [...layers].reverse(); timeline = gsap.timeline({ paused: true }).to(rev, { scale: (i, t) => getScale(layers.indexOf(t)), opacity: (i, t) => (layers.indexOf(t) === 0 ? 1 : getOpacity(layers.indexOf(t))), rotation: (i, t) => isRotation ? getRotVal(layers.indexOf(t)) : 0, duration, ease, stagger }); applyFilters(); }
  function applyShape(shape) { recorder.trackShape(shape); layers.forEach((l, i) => { if (i === 0) return; l.classList.remove("rectangle", "circle", "diamond", "hexagon"); l.classList.add(shape); }); }
  function center2D() { quickTos.forEach(({ layer }) => gsap.to(layer, { x: 0, y: 0, duration: 0.6, ease: "power2.out" })); }
  function compute3DOpacity(i) { const base = Math.max(1 - cssVarCache.opacityFalloff * i, 0.25); return isOpacity ? Math.max(base - opacityInterval * i, 0.1) : base; }
  function layout3D(depthFactor = 1) { const depth = cssVarCache.depthStep * depthFactor; layers.forEach((l, i) => { const z = Math.round(i * depth) + i * 0.1; const s = Math.max(1 - i * cssVarCache.scale3D, 0.35); const o = compute3DOpacity(i); const rotZ = isRotation ? getRotVal(i) : 0; l.style.transform = `translateZ(${z}px) scale(${s}) rotateZ(${rotZ}deg)`; l.style.opacity = o; }); applyFilters(); }
  function pose3DFlat() { gsap.to(stackEl, { rotationX: 0, rotationY: 0, x: 0, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }); }
  function center3D() { gsap.to(stackEl, { rotationX: 0, rotationY: 0, x: 0, y: 0, duration: 0.6, ease: "power2.out" }); }
  function enable3D() { is3D = true; if (timeline) timeline.pause(0); const rev = [...layers].reverse(); gsap.to(rev, { scale: (i, t) => (layers.indexOf(t) === 0 ? 1 : Math.max(1 - layers.indexOf(t) * cssVarCache.scale3D, 0.35)), opacity: (i, t) => (layers.indexOf(t) === 0 ? 1 : compute3DOpacity(layers.indexOf(t))), duration, ease, stagger, onComplete: () => { layout3D(); if (isHovered) { container.classList.add("is-3d"); pose3DFlat(); } } }); }
  function disable3D() { is3D = false; container.classList.remove("is-3d"); gsap.killTweensOf(stackEl); gsap.to(stackEl, { rotationX: 0, rotationY: 0, rotationZ: 0, x: 0, y: 0, z: 0, scale: 1, duration: 0.28, ease: "power2.out" }); const rev = [...layers].reverse(); gsap.to(rev, { scale: (i, t) => (layers.indexOf(t) === 0 ? 1 : 0.95), opacity: (i, t) => (layers.indexOf(t) === 0 ? 1 : 0), rotation: 0, duration, ease, stagger: -stagger, onComplete: () => { layers.forEach((l) => (l.style.transform = "")); reset2D(); createTimeline(); } }); }
  function tiltPan(e) { if (!is3D || !isHovered) return; const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2; layout3D(0.9 + Math.min(1, Math.hypot(nx, ny)) * 0.2); const tilt = cssVarCache.tiltMax * cssVarCache.tiltBoost * cssVarCache.moveAmplify; const pan = cssVarCache.panMax * cssVarCache.panBoost * cssVarCache.moveAmplify; gsap.to(stackEl, { rotationY: nx * tilt, rotationX: -ny * tilt, x: nx * pan, y: ny * pan, scale: 1, duration: 0.18, ease: "power2.out" }); }
  function onEnter() { isHovered = true; if (is3D) { container.classList.add("is-3d"); layout3D(); pose3DFlat(); } else if (timeline) { timeline.play(); } }
  function onLeave() { isHovered = false; if (is3D) { center3D(); container.classList.remove("is-3d"); } else if (timeline && !isParallax) { timeline.reverse(); } if (isParallax) center2D(); setTimeout(() => { if (!isHovered && !is3D && !isParallax) center2D(); }, duration * 1000); }
  function onMove(e) { pendingMouseEvent = e; if (!rafId) rafId = requestAnimationFrame(processMouseMove); }
  function processMouseMove() { if (!pendingMouseEvent) { rafId = null; return; } const e = pendingMouseEvent; pendingMouseEvent = null; rafId = null; if (e.clientX >= rect.left && e.clientX <= rect.left + rect.width && e.clientY >= rect.top && e.clientY <= rect.top + rect.height) { recorder.recordMovement(e.clientX - rect.left, e.clientY - rect.top); if (is3D) tiltPan(e); } else if (is3D) center3D(); if (!is3D && isParallax && isHovered) { const rx = (e.clientX - rect.left) / rect.width - 0.5, ry = (e.clientY - rect.top) / rect.height - 0.5; quickTos.forEach(({ xTo, yTo, mult }) => { xTo(rx * 2 * rect.width * followStrength * mult); yTo(ry * 2 * rect.height * followStrength * mult); }); } }

  document.addEventListener("mousemove", onMove); container.addEventListener("mouseenter", onEnter); container.addEventListener("mouseleave", onLeave);
  container._changeShape = (shape) => { if (isTransitioning) return; isTransitioning = true; if (timeline) timeline.pause(); reset2D(); applyShape(shape); createTimeline(); isTransitioning = false; if (is3D) layout3D(); };
  container._toggleRotation = (v) => { isRotation = v; if (is3D) layout3D(); else { if (!isRotation) layers.forEach((l) => gsap.set(l, { rotation: 0 })); if (timeline) timeline.kill(); createTimeline(); timeline.progress(isHovered ? 1 : 0); } };
  container._toggleBlur = (v) => { isBlur = v; applyFilters(); if (is3D) layout3D(); };
  container._toggleColor = (v) => { isColor = v; applyFilters(); if (is3D) layout3D(); };
  container._toggleOpacity = (v) => { isOpacity = v; if (is3D) layout3D(); else { if (timeline) timeline.kill(); createTimeline(); timeline.progress(isHovered ? 1 : 0); } };
  container._toggleParallax = (v) => { isParallax = v; if (!isParallax) { center2D(); if (timeline) isHovered ? timeline.play() : timeline.reverse(); } };
  container._toggle3D = (v) => { v ? enable3D() : disable3D(); };
  container._updateCSSCache = updateCSSCache;
  reset2D(); createTimeline();
}

function initShapeControls() {
  const cc = document.querySelector("[data-shape-controls]"); const img = document.querySelector("[data-image-hover]");
  if (!cc || !img || !img._changeShape) return;
  cc.querySelectorAll("[data-shape]").forEach((b) => {
    b.addEventListener("click", () => { cc.querySelectorAll(".active").forEach((x) => x.classList.remove("active")); b.classList.add("active"); img._changeShape(b.dataset.shape); });
  });
}

function initToggleControls() {
  const img = document.querySelector("[data-image-hover]");
  const settings3d = document.getElementById("settings3d");
  const toggles = [ { selector: "[data-rotation-toggle]", method: "_toggleRotation", name: "rotation" }, { selector: "[data-blur-toggle]", method: "_toggleBlur", name: "blur" }, { selector: "[data-color-toggle]", method: "_toggleColor", name: "color" }, { selector: "[data-opacity-toggle]", method: "_toggleOpacity", name: "opacity" }, { selector: "[data-parallax-toggle]", method: "_toggleParallax", name: "parallax" }, { selector: "[data-3d-toggle]", method: "_toggle3D", name: "3d" } ];
  toggles.forEach(({ selector, method, name }) => {
    const t = document.querySelector(selector);
    if (t && img[method]) {
      t.addEventListener("click", () => {
        t.classList.toggle("active");
        const nowOn = t.classList.contains("active");
        t.textContent = nowOn ? `${name} on` : name.toLowerCase();
        img[method](nowOn);
        if (name === "3d") settings3d.classList.toggle("active", nowOn);
      });
    }
  });
}

// ניהול סליידרים (Tuners) - מלא ותקין
function initLiveTuner() {
  const img = document.querySelector("[data-image-hover]");
  const tiltR = document.getElementById("tiltRange");
  const panR = document.getElementById("panRange");
  const depthR = document.getElementById("depthRange");
  const ampR = document.getElementById("ampRange");
  
  const tiltV = document.getElementById("tiltVal");
  const panV = document.getElementById("panVal");
  const depthV = document.getElementById("depthVal");
  const ampV = document.getElementById("ampVal");

  if (!tiltR) return;

  const formatValue = (val, type) => {
    if (type === "amp") return (val / 100).toFixed(2);
    return String(val).padStart(3, " ");
  };

  const css = getComputedStyle(document.documentElement);
  
  const setFromVar = (el, varName, fallback) => {
    const v = parseFloat(css.getPropertyValue(varName)) || fallback;
    if (varName === "--move-amplify") {
      el.value = Math.round(v * 100);
      return Math.round(v * 100);
    }
    el.value = v;
    return v;
  };

  // אתחול
  let tilt = setFromVar(tiltR, "--tilt-max", 45);
  if(tiltV) tiltV.textContent = formatValue(tilt, "tilt");
  
  let pan = setFromVar(panR, "--pan-max", 88);
  if(panV) panV.textContent = formatValue(pan, "pan");
  
  let depth = setFromVar(depthR, "--depth-step", 36);
  if(depthV) depthV.textContent = formatValue(depth, "depth");
  
  let amp = setFromVar(ampR, "--move-amplify", 54);
  if(ampV) ampV.textContent = formatValue(amp, "amp");

  const applyVar = (name, val) => {
    const unit = (name.includes("pan-max") || name.includes("depth-step")) ? "px" : "";
    document.documentElement.style.setProperty(name, String(val) + unit);
    if (img && img._updateCSSCache) {
      img._updateCSSCache();
    }
  };

  // אירועים
  tiltR.addEventListener("input", (e) => {
    tilt = +e.target.value;
    if(tiltV) tiltV.textContent = formatValue(tilt, "tilt");
    applyVar("--tilt-max", tilt);
  });

  panR.addEventListener("input", (e) => {
    pan = +e.target.value;
    if(panV) panV.textContent = formatValue(pan, "pan");
    applyVar("--pan-max", pan);
  });

  depthR.addEventListener("input", (e) => {
    depth = +e.target.value;
    if(depthV) depthV.textContent = formatValue(depth, "depth");
    applyVar("--depth-step", depth);
  });

  ampR.addEventListener("input", (e) => {
    amp = +e.target.value;
    if(ampV) ampV.textContent = formatValue(amp, "amp");
    applyVar("--move-amplify", amp / 100);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initImageHover(); initShapeControls(); initToggleControls(); initLiveTuner(); initButtons(); initDragAndDrop();
});