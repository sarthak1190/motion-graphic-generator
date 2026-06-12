export function animationCss() {
  return `
    @keyframes backgroundPan {
      from { transform: translate3d(-2%, -1%, 0) scale(1); }
      to { transform: translate3d(2%, 1%, 0) scale(1.02); }
    }

    @keyframes fadeRise {
      from { opacity: 0; transform: translate3d(0, 56px, 0) scale(0.96); visibility: visible; }
      35% { opacity: 1; }
      to { opacity: 1; transform: none; visibility: visible; }
    }

    @keyframes slideLeft {
      from { opacity: 0; transform: translate3d(92px, 0, 0) scale(0.98); }
      35% { opacity: 1; }
      to { opacity: 1; transform: none; }
    }

    @keyframes slideRightShake {
      from { opacity: 0; transform: translate3d(-92px, 0, 0) scale(0.98); }
      35% { opacity: 1; }
      72% { opacity: 1; transform: translate3d(4px, 0, 0) scale(1.01); }
      84% { transform: translate3d(-3px, 0, 0); }
      to { opacity: 1; transform: none; }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.88); }
      35% { opacity: 1; }
      to { opacity: 1; transform: none; }
    }

    @keyframes heroPop {
      from { opacity: 0; transform: translate3d(0, 36px, 0) scale(0.90); }
      35% { opacity: 1; }
      70% { opacity: 1; transform: translate3d(0, -6px, 0) scale(1.02); }
      to { opacity: 1; transform: none; }
    }

    @keyframes progressGrow {
      from { width: 0; }
      to { width: var(--progress, 100%); }
    }

    @keyframes glowSweep {
      from { transform: translateX(-120%); opacity: 0; }
      35% { opacity: 0.72; }
      to { transform: translateX(120%); opacity: 0; }
    }

    @keyframes drawConnector {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }

    @keyframes flowPulse {
      0%, 100% { box-shadow: 0 24px 80px rgba(83, 130, 161, 0.22); }
      50% { box-shadow: 0 30px 110px rgba(248, 152, 32, 0.38); }
    }

    @keyframes checkPop {
      from { transform: scale(0.5) rotate(-18deg); opacity: 0; }
      to { transform: scale(1) rotate(0deg); opacity: 1; }
    }

    @keyframes keywordGlow {
      0%, 100% { text-shadow: 0 0 0 rgba(248, 152, 32, 0); }
      45% { text-shadow: 0 0 18px rgba(248, 152, 32, 0.82); }
    }

    @keyframes importantLineGlow {
      0%, 100% { box-shadow: inset 4px 0 0 var(--primary), 0 0 24px rgba(248,152,32,0.18); }
      45% { box-shadow: inset 5px 0 0 var(--primary), 0 0 34px rgba(248,152,32,0.42); }
    }

    @keyframes ctaPulse {
      0%, 100% { transform: scale(1); box-shadow: none; }
      50% { transform: scale(1.035); box-shadow: 0 10px 24px rgba(11,31,77,0.12); }
    }

    @keyframes ctaRise {
      from { opacity: 0; transform: translate3d(0, 72px, 0) scale(0.94); }
      35% { opacity: 1; }
      70% { opacity: 1; transform: translate3d(0, -8px, 0) scale(1.01); }
      to { opacity: 1; transform: none; }
    }

    @keyframes takeawayGlow {
      from { opacity: 0; transform: translate3d(0, 48px, 0); box-shadow: 0 18px 48px rgba(11,31,77,0.12); }
      35% { opacity: 1; }
      70% { opacity: 1; transform: none; box-shadow: 0 24px 70px rgba(248,152,32,0.24); }
      to { opacity: 1; transform: none; box-shadow: 0 18px 48px rgba(11,31,77,0.12); }
    }

    @keyframes mistakeShake {
      from { opacity: 0; transform: translate3d(-36px, 0, 0); }
      35% { opacity: 1; }
      55% { opacity: 1; transform: translate3d(6px, 0, 0); }
      68% { transform: translate3d(-5px, 0, 0); }
      82% { transform: translate3d(3px, 0, 0); }
      to { opacity: 1; transform: none; }
    }

    @keyframes floatDrift {
      0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.16; }
      50% { transform: translate3d(16px, -18px, 0); opacity: 0.30; }
    }

    @keyframes particleFloat {
      0%, 100% { transform: translate3d(0, 0, 0) scale(0.9); opacity: 0.16; }
      50% { transform: translate3d(-18px, -24px, 0) scale(1.14); opacity: 0.34; }
    }

    @keyframes lineSweep {
      from { transform: translateX(-28px); opacity: 0; }
      35% { opacity: 0.32; }
      to { transform: translateX(40px); opacity: 0; }
    }

    @keyframes brandGlow {
      0%, 100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
      50% { text-shadow: 0 0 26px rgba(255,255,255,0.72); }
    }

    @keyframes lineReveal {
      from { opacity: 0; transform: translateX(-28px); clip-path: inset(0 100% 0 0); }
      35% { opacity: 1; }
      to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); }
    }

    @keyframes blink {
      0%, 45% { opacity: 1; }
      46%, 100% { opacity: 0; }
    }
  `;
}
