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

        // Simulation parameters
        let g = 9.8;
        const damping = 0.00002;

        let l1 = Math.min(window.innerHeight * 0.22, 160);
        let l2 = Math.min(window.innerHeight * 0.18, 130);
        const m1 = 10;
        const m2 = 12;

        // 3 pendulums — each gets a distinct visible warm color for both modes.
        // Trail opacity is handled per-segment in the draw loop for a fading effect,
        // so these are the full-opacity base colors.
        const pendulums = [
            {
                a1: 2.2,
                a2: 1.8,
                a1_v: 0.5,
                a2_v: -0.2,
                trail: [],
                // Terracotta / rust
                r: 196, g_c: 90, b: 48
            },
            {
                a1: 2.2,
                a2: 1.8 + 0.001,
                a1_v: 0.5,
                a2_v: -0.2,
                trail: [],
                // Sage green
                r: 72, g_c: 130, b: 100
            },
            {
                a1: 2.2,
                a2: 1.8 + 0.002,
                a1_v: 0.5,
                a2_v: -0.2,
                trail: [],
                // Dusty blue / slate
                r: 80, g_c: 120, b: 180
            }
        ];

        const maxTrailLength = 350;

        // Scroll → gravity
        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;
            const pct = window.scrollY / maxScroll;
            g = 9.8 - pct * 15.8;
        });

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

            // Always centred, both desktop and mobile
            const pivotX = canvas.width * 0.5;
            const pivotY = canvas.height * 0.32;

            // Physics — 10 substeps for numerical stability
            const subSteps = 10;
            const dt = 0.04 / subSteps;
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

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Per-trail max opacity — higher in light mode so they actually show.
            // Dark mode background is dark so they're naturally more visible.
            const trailMaxAlpha = isDark ? 0.55 : 0.65;
            const bobAlpha      = isDark ? 0.45 : 0.50;

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

                // Draw each segment with alpha proportional to its position in the trail
                // (oldest = transparent, newest = trailMaxAlpha)
                for (let i = 1; i < len; i++) {
                    const progress = i / len;             // 0 → 1 (old → new)
                    const alpha = progress * trailMaxAlpha;
                    ctx.beginPath();
                    ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
                    ctx.lineTo(p.trail[i].x,     p.trail[i].y);
                    ctx.strokeStyle = `rgba(${p.r}, ${p.g_c}, ${p.b}, ${alpha.toFixed(3)})`;
                    ctx.lineWidth = 1.2;
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

                // Rods (only draw for primary pendulum to avoid visual clutter)
                if (idx === 0) {
                    ctx.beginPath();
                    ctx.moveTo(pivotX, pivotY);
                    ctx.lineTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = rodColor;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // Bobs
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
