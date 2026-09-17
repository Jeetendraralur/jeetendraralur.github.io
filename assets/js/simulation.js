(function() {
    function initSimulation() {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Handle full viewport resizing
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Determine base gravity based on current page environment
        // Home page = Earth gravity (9.81 m/s²), Blog section = Moon gravity (1.62 m/s²)
        const isBlogPage = window.location.pathname.includes('/blog/');
        const baseG = isBlogPage ? 1.62 : 9.81;
        let g = baseG;

        const damping = 0.00002;

        let l1 = Math.min(window.innerHeight * 0.22, 160);
        let l2 = Math.min(window.innerHeight * 0.18, 130);
        const m1 = 10;
        const m2 = 12;

        // 3 pendulums — distinct warm colors for light and dark themes
        const pendulums = [
            {
                a1: 2.2,
                a2: 1.8,
                a1_v: 0.5,
                a2_v: -0.2,
                trail: [],
                r: 196, g_c: 90, b: 48 // Terracotta / rust
            },
            {
                a1: 2.2,
                a2: 1.8 + 0.001,
                a1_v: 0.5,
                a2_v: -0.2,
                trail: [],
                r: 72, g_c: 130, b: 100 // Sage green
            },
            {
                a1: 2.2,
                a2: 1.8 + 0.002,
                a1_v: 0.5,
                a2_v: -0.2,
                trail: [],
                r: 80, g_c: 120, b: 180 // Dusty blue / slate
            }
        ];

        const maxTrailLength = 350;

        // ── Scroll Velocity Acceleration ────────────────────────────────────
        let lastScrollY = window.scrollY;
        let lastScrollTime = performance.now();
        let scrollVelocity = 0; // pixels per ms

        window.addEventListener('scroll', () => {
            const now = performance.now();
            const dtMs = Math.max(1, now - lastScrollTime);
            const currentScrollY = window.scrollY;
            const dist = Math.abs(currentScrollY - lastScrollY);
            
            const instantVel = dist / dtMs;
            // Smoothly boost velocity
            scrollVelocity = Math.max(scrollVelocity, instantVel);

            lastScrollY = currentScrollY;
            lastScrollTime = now;
        });

        // ── Theme Switch Flare & Trail Dissolve ─────────────────────────────
        let flareTimer = 0; // frames remaining for theme transition flare
        const maxFlareFrames = 30;

        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'data-theme') {
                    flareTimer = maxFlareFrames; // trigger flare & trail dissolve
                }
            });
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Lagrangian equations of motion
        function getDerivatives(a1, a2, a1_v, a2_v) {
            const num1 = -g * (2 * m1 + m2) * Math.sin(a1)
                       - m2 * g * Math.sin(a1 - 2 * a2)
                       - 2 * Math.sin(a1 - a2) * m2 * (a2_v * a2_v * l2 + a1_v * a1_v * l1 * Math.cos(a1 - a2));
            const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
            const alpha1 = num1 / den1;

            const term1 = a1_v * a1_v * l1 * (m1 + m2);
            const term2 = g * (m1 + m2) * Math.cos(a1);
            const term3 = a2_v * a2_v * l2 * m2 * Math.cos(a1 - a2);
            const num2 = 2 * Math.sin(a1 - a2) * (term1 + term2 + term3);
            const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
            const alpha2 = num2 / den2;

            return [alpha1, alpha2];
        }

        function animate() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

            l1 = Math.min(canvas.height * 0.22, 160);
            l2 = Math.min(canvas.height * 0.18, 130);

            // Always centred
            const pivotX = canvas.width * 0.5;
            const pivotY = canvas.height * 0.32;

            // Decay scroll velocity smoothly back to zero
            scrollVelocity *= 0.92;
            if (scrollVelocity < 0.01) scrollVelocity = 0;

            // Compute speed multiplier: normal 1.0x up to 3.5x based on scroll speed
            const speedMultiplier = 1.0 + Math.min(scrollVelocity * 1.5, 2.5);

            // Physics — 10 substeps scaled by scroll speed multiplier
            const subSteps = 10;
            const dt = (0.04 * speedMultiplier) / subSteps;
            for (let s = 0; s < subSteps; s++) {
                pendulums.forEach(p => {
                    const [a1, a2] = getDerivatives(p.a1, p.a2, p.a1_v, p.a2_v);
                    p.a1_v += a1 * dt;
                    p.a2_v += a2 * dt;
                    p.a1_v *= (1 - damping);
                    p.a2_v *= (1 - damping);
                    p.a1 += p.a1_v * dt;
                    p.a2 += p.a2_v * dt;
                });
            }

            // Theme switch flare handling
            let flareAlphaBoost = 1.0;
            if (flareTimer > 0) {
                const progress = flareTimer / maxFlareFrames;
                flareAlphaBoost = 1.0 + progress * 0.8; // temporary brightness flare
                
                // Rapidly dissolve older trail segments during transition
                pendulums.forEach(p => {
                    if (p.trail.length > 5) {
                        p.trail.splice(0, Math.ceil(p.trail.length * 0.08));
                    }
                });

                flareTimer--;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Per-trail max opacity
            const baseMaxAlpha = isDark ? 0.55 : 0.65;
            const trailMaxAlpha = Math.min(0.95, baseMaxAlpha * flareAlphaBoost);
            const bobAlpha = isDark ? 0.45 : 0.50;

            // ── Draw fading trails ──────────────────────────────────────────────
            pendulums.forEach(p => {
                const x1 = pivotX + l1 * Math.sin(p.a1);
                const y1 = pivotY + l1 * Math.cos(p.a1);
                const x2 = x1   + l2 * Math.sin(p.a2);
                const y2 = y1   + l2 * Math.cos(p.a2);

                p.trail.push({ x: x2, y: y2 });
                if (p.trail.length > maxTrailLength) p.trail.shift();

                const len = p.trail.length;
                if (len < 2) return;

                // Draw each segment with alpha proportional to position in trail
                for (let i = 1; i < len; i++) {
                    const progress = i / len; // 0 → 1
                    const alpha = progress * trailMaxAlpha;
                    ctx.beginPath();
                    ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
                    ctx.lineTo(p.trail[i].x,     p.trail[i].y);
                    ctx.strokeStyle = `rgba(${p.r}, ${p.g_c}, ${p.b}, ${alpha.toFixed(3)})`;
                    ctx.lineWidth = flareTimer > 0 ? 1.6 : 1.2;
                    ctx.stroke();
                }
            });

            // ── Draw rods & bobs ────────────────────────────────────────────────
            pendulums.forEach((p, idx) => {
                const x1 = pivotX + l1 * Math.sin(p.a1);
                const y1 = pivotY + l1 * Math.cos(p.a1);
                const x2 = x1   + l2 * Math.sin(p.a2);
                const y2 = y1   + l2 * Math.cos(p.a2);

                const rodColor = `rgba(${p.r}, ${p.g_c}, ${p.b}, ${bobAlpha * 0.5})`;
                const bobColor = `rgba(${p.r}, ${p.g_c}, ${p.b}, ${bobAlpha})`;

                if (idx === 0) {
                    ctx.beginPath();
                    ctx.moveTo(pivotX, pivotY);
                    ctx.lineTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = rodColor;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                ctx.beginPath();
                ctx.arc(x1, y1, idx === 0 ? 5 : 3, 0, 2 * Math.PI);
                ctx.fillStyle = bobColor;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x2, y2, idx === 0 ? 6 : 4, 0, 2 * Math.PI);
                ctx.fillStyle = bobColor;
                ctx.fill();
            });

            // ── Pivot dot ───────────────────────────────────────────────────────
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, 3, 0, 2 * Math.PI);
            ctx.fillStyle = isDark ? 'rgba(150,143,131,0.3)' : 'rgba(100,95,88,0.35)';
            ctx.fill();

            requestAnimationFrame(animate);
        }

        animate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimulation);
    } else {
        initSimulation();
    }
})();
