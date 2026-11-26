// Once Upon a Time — storybook illustrations drawn in SVG.
// Each card name maps to a small scene: a background plus a few motifs.
// Motifs are drawn around (0,0), about 60 units wide, in a 200x150 frame.
(function () {
  const INK = "#3b2414";

  // ---------- helpers ----------
  const starPath = (r, inner = 0.45, n = 5) => {
    let d = "";
    for (let i = 0; i < n * 2; i += 1) {
      const rad = i % 2 ? r * inner : r;
      const a = (Math.PI / n) * i - Math.PI / 2;
      d += `${i ? "L" : "M"}${(Math.cos(a) * rad).toFixed(1)} ${(Math.sin(a) * rad).toFixed(1)}`;
    }
    return d + "Z";
  };
  const sparkle = (x, y, s = 1, c = "#fff3b0") =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0-8C1-2 2-1 8 0 2 1 1 2 0 8-1 2-2 1-8 0-2-1-1-2 0-8Z" fill="${c}" stroke="none"/>`;

  // ---------- figures ----------
  // A storybook bust: shoulders, head, hair. Kept deliberately generic.
  function figure(o = {}) {
    const skin = o.skin || "#f2c9a0";
    const hair = o.hair || "#6b3f1f";
    const coat = o.coat || "#4f7fb0";
    const style = o.style || "short";
    let back = "";
    let front = "";
    if (style === "long") {
      back = `<path d="M-19-28c-8 14-8 40-4 52h46c4-12 4-38-4-52z" fill="${hair}"/>`;
      front = `<path d="M-18-30c4-16 32-16 36 0-8-6-14-4-18 2-4-6-10-8-18-2z" fill="${hair}"/>`;
    } else if (style === "bun") {
      back = `<circle cx="0" cy="-48" r="9" fill="${hair}"/>`;
      front = `<path d="M-18-28c2-18 34-18 36 0-10-8-26-8-36 0z" fill="${hair}"/>`;
    } else if (style === "curly") {
      back = `<path d="M-22-26a10 10 0 0 1 4-16 10 10 0 0 1 18-6 10 10 0 0 1 18 6 10 10 0 0 1 4 16c2 10-4 22-8 24H-14c-4-2-10-14-8-24z" fill="${hair}"/>`;
    } else if (style === "short") {
      front = `<path d="M-17-26c0-16 34-16 34 0-6-4-12-6-17-2-5-4-11-2-17 2z" fill="${hair}"/>`;
    } else if (style === "beard") {
      front = `<path d="M-17-26c0-16 34-16 34 0-6-4-12-6-17-2-5-4-11-2-17 2z" fill="${hair}"/><path d="M-15-14c0 18 8 24 15 24s15-6 15-24c-4 6-26 6-30 0z" fill="${hair}"/>`;
    } else if (style === "whitebeard") {
      front = `<path d="M-16-12c-2 26 10 34 16 34s18-8 16-34c-6 8-26 8-32 0z" fill="#f4f1ea"/><path d="M-10-6c4-3 16-3 20 0-4 3-16 3-20 0z" fill="#f4f1ea"/>`;
    }
    const collar = o.collar ? `<path d="M-12 14 0 26 12 14" fill="${o.collar}"/>` : "";
    return `${back}
      <path d="M-34 44c0-22 14-32 34-32s34 10 34 32z" fill="${coat}"/>${collar}
      <rect x="-6" y="2" width="12" height="14" fill="${skin}"/>
      <ellipse cx="0" cy="-18" rx="17" ry="20" fill="${skin}"/>
      <circle cx="-6" cy="-18" r="2.2" fill="${INK}" stroke="none"/><circle cx="6" cy="-18" r="2.2" fill="${INK}" stroke="none"/>
      <circle cx="-10" cy="-10" r="3.5" fill="#e88a7a" opacity=".5" stroke="none"/><circle cx="10" cy="-10" r="3.5" fill="#e88a7a" opacity=".5" stroke="none"/>
      <path d="M-4-7c2 2 6 2 8 0" fill="none" stroke-width="1.8"/>
      ${front}`;
  }

  // ---------- motif library ----------
  const M = {
    figure,
    apple: () => `<path d="M0-18c-10-8-30-4-30 12 0 18 14 30 22 28 4-1 6-3 8-3s4 2 8 3c8 2 22-10 22-28 0-16-20-20-30-12z" fill="#c8312b"/><path d="M0-18c0-6 2-12 6-16" fill="none"/><path d="M4-26c8-8 18-6 20-2-6 6-14 6-20 2z" fill="#5d9a3c"/><ellipse cx="-14" cy="-4" rx="5" ry="8" fill="#fff" opacity=".45" stroke="none"/>`,
    crown: (o = {}) => `<path d="M-30 14-34-16-16 0 0-22 16 0 34-16 30 14z" fill="${o.c || "#e7b43a"}"/><rect x="-30" y="12" width="60" height="10" rx="3" fill="${o.c2 || "#c9922a"}"/><circle cx="0" cy="4" r="5" fill="${o.gem || "#2f7fc4"}"/><circle cx="-18" cy="6" r="3.5" fill="#c8312b"/><circle cx="18" cy="6" r="3.5" fill="#c8312b"/>`,
    sword: () => `<path d="M-5-40 0-50 5-40 5 12-5 12z" fill="#dfe6ec"/><path d="M0-44V10" stroke="#9aa8b4" stroke-width="1.5"/><rect x="-18" y="12" width="36" height="7" rx="3" fill="#e7b43a"/><rect x="-4" y="19" width="8" height="17" rx="2" fill="#7a4a26"/><circle cx="0" cy="40" r="5" fill="#e7b43a"/>`,
    bow: () => `<path d="M-6-40C26-28 26 28-6 40" fill="none" stroke="${INK}" stroke-width="7"/><path d="M-6-40C26-28 26 28-6 40" fill="none" stroke="#a8692f" stroke-width="4"/><path d="M-6-40V40" stroke="#efe6d2" stroke-width="1.5"/><path d="M-36 0H24" stroke-width="3"/><path d="M30 0l-10-6v12z" fill="#dfe6ec"/><path d="M-36 0l-8-7m8 7-8 7M-30 0l-8-7m8 7-8 7" stroke="#c8312b" stroke-width="2.5"/>`,
    horn: () => `<path d="M-34 0c22 4 42-4 52-24 6 6 12 18 10 30-16 6-42 12-62 4z" fill="#ead7a6"/><path d="M18-24c6 6 12 18 10 30-4 2-8 2-10 0 2-10 0-20 0-30z" fill="#c9922a"/><path d="M-22 1l2 8M-8 0l2 9M6-4l3 9" stroke="#8a5a2b" stroke-width="2"/><path d="M-34 0c-4 2-4 8 0 10" fill="#c9922a"/><path d="M-20 10c10 14 30 12 40-2" fill="none" stroke="#7a4a26" stroke-width="2.5"/>`,
    mirror: (o = {}) => `<ellipse cx="0" cy="-8" rx="25" ry="31" fill="${o.frame || "#e7b43a"}"/><ellipse cx="0" cy="-8" rx="17" ry="23" fill="${o.glass || "#9fd0e6"}"/><path d="M-8-22 6-32M-11-12 10-26" stroke="#fff" stroke-width="2.5" opacity=".75"/><rect x="-5" y="22" width="10" height="22" rx="3" fill="#c9922a"/>${o.face ? `<path d="M-6-10c3 3 9 3 12 0" fill="none" stroke="#4d6f86" stroke-width="2"/><circle cx="-6" cy="-16" r="2" fill="#4d6f86" stroke="none"/><circle cx="6" cy="-16" r="2" fill="#4d6f86" stroke="none"/>` : ""}`,
    hourglass: () => `<rect x="-22" y="-37" width="44" height="7" rx="3" fill="#8a5a2b"/><rect x="-22" y="30" width="44" height="7" rx="3" fill="#8a5a2b"/><path d="M-16-30C-16-8-3-4-3 0S-16 8-16 30H16C16 8 3 4 3 0S16-8 16-30z" fill="#d8eef6"/><path d="M-11 30c0-8 7-12 11-14 4 2 11 6 11 14z" fill="#e7b43a" stroke="none"/><path d="M-9-20h18L0-4z" fill="#e7b43a" stroke="none"/><path d="M-20-30v60M20-30v60" stroke-width="3"/>`,
    watch: (o = {}) => `<rect x="-5" y="-43" width="10" height="9" rx="2" fill="#c9922a"/><circle cy="-46" r="5" fill="none" stroke-width="2.5"/><circle r="30" fill="${o.c || "#e7b43a"}"/><circle r="23" fill="#fbf4e2"/><path d="M0-19v5M0 19v-5M-19 0h5M19 0h-5" stroke-width="2"/><path d="M0 0V-14M0 0l10 6" stroke-width="3"/><circle r="2.5" fill="${INK}"/>`,
    tophat: (o = {}) => `<ellipse cx="0" cy="22" rx="36" ry="9" fill="${o.c2 || "#4c3260"}"/><path d="M-22 20-18-28h36l4 48z" fill="${o.c || "#6c4a85"}"/><path d="M-21 8h42l1 8h-44z" fill="#d6a43a"/>${o.tag ? `<rect x="6" y="-8" width="13" height="10" fill="#fbf4e2" transform="rotate(12 12 -3)"/>` : ""}`,
    boot: (o = {}) => `<path d="M-14-36h24l-2 42c12 2 26 6 28 16 0 4-2 6-6 6h-46c-4 0-6-4-6-8l4-20z" fill="${o.c || "#8a5a2b"}"/><path d="M-16-38h30v12h-30z" fill="${o.c2 || "#c9922a"}"/><rect x="-14" y="2" width="22" height="6" fill="${INK}" opacity=".35" stroke="none"/>${o.feather ? `<path d="M-10-38c-10-18-4-30 8-34-2 12 0 24-8 34z" fill="#c8312b"/>` : ""}`,
    slipper: (o = {}) => `<path d="M-36 10c6-14 24-16 34-12 10-12 22-16 30-10 4 4 2 14-4 20l-6 2-2 14h-6l-2-12c-14 4-30 6-44 0z" fill="${o.c || "#bfe3f2"}" opacity="${o.glass ? 0.85 : 1}"/><path d="M-26 4c8-4 18-4 24 0" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/>${o.bow ? `<circle cx="-4" cy="-2" r="5" fill="${o.bow}"/>` : ""}`,
    ring: () => `<ellipse cy="10" rx="24" ry="19" fill="none" stroke="${INK}" stroke-width="12"/><ellipse cy="10" rx="24" ry="19" fill="none" stroke="#e7b43a" stroke-width="7"/><path d="M-11-12 0-28 11-12 0-4z" fill="#d9467a"/><path d="M-5-14 0-22" stroke="#fff" stroke-width="2" opacity=".8"/>`,
    book: (o = {}) => `<path d="M-44 22c14-6 32-6 44 4 12-10 30-10 44-4v-42c-14-6-32-6-44 4-12-10-30-10-44-4z" fill="${o.c || "#8a3b3b"}"/><path d="M0-14C-12-22-28-22-38-18v36c10-4 26-4 38 4z" fill="#fbf4e2"/><path d="M0-14c12-8 28-8 38-4v36c-10-4-26-4-38 4z" fill="#f2e6c8"/><path d="M-30-8h22M-30 0h22M-30 8h16M8-8h22M8 0h22M8 8h16" stroke="#b39b72" stroke-width="2"/>`,
    tome: (o = {}) => `<rect x="-26" y="-32" width="52" height="64" rx="4" fill="${o.c || "#2f5d8a"}"/><rect x="-20" y="-32" width="44" height="64" fill="none"/><path d="M-26 26h50" stroke="#fbf4e2" stroke-width="4"/><path d="M${starPath(10).slice(1)}" transform="translate(0 -4)" fill="#e7b43a"/><rect x="-26" y="-32" width="8" height="64" fill="${INK}" opacity=".3" stroke="none"/>`,
    wand: () => `<path d="M-30 30 12-12" stroke="${INK}" stroke-width="7"/><path d="M-30 30 12-12" stroke="#5a3b6e" stroke-width="4"/><path d="M-30 30-22 22" stroke="#fbf4e2" stroke-width="4"/><path d="${starPath(14)}" transform="translate(18 -18)" fill="#f3c64a"/>${sparkle(36, -34, 0.9)}${sparkle(30, 2, 0.6)}`,
    star: (o = {}) => `<path d="${starPath(o.r || 20)}" fill="${o.c || "#f3c64a"}"/>`,
    lamp: () => `<path d="M-30 4c0 10 14 16 30 16s28-8 34-22l10-6c2 6-2 12-8 14-6 14-20 20-36 20-12 0-24-4-30-12z" fill="#e7b43a"/><path d="M-30 4c-10-2-14-10-10-16 4 6 10 8 16 8" fill="#e7b43a"/><path d="M-14 0c0-12 6-18 14-18s14 6 14 18z" fill="#d6a43a"/><circle cy="-22" r="4" fill="#c9922a"/><rect x="-10" y="20" width="20" height="6" rx="2" fill="#c9922a"/>`,
    smoke: (o = {}) => `<path d="M0 20c-14-6-4-18 6-20-12-6-4-22 10-20-6-10 6-22 18-14" fill="none" stroke="${o.c || "#b79be0"}" stroke-width="9" opacity=".85"/>`,
    carpet: () => `<path d="M-46-4 40-18 46 10-40 22z" fill="#a8323a"/><path d="M-36-1 34-12 38 6-32 16z" fill="none" stroke="#e7b43a" stroke-width="3"/><circle cx="2" cy="2" r="5" fill="#2f7fc4"/><path d="M-46-4l-6 2m4 6-6 2m4 6-6 2M46 10l6-2m-8-6 6-2m-8-6 6-2" stroke-width="2"/>`,
    rose: (o = {}) => `${o.dome ? `<path d="M-24 30v-34a24 24 0 0 1 48 0v34z" fill="#d8eef6" opacity=".55"/>` : ""}${o.dome ? `<rect x="-30" y="28" width="60" height="8" rx="3" fill="#8a5a2b"/>` : ""}<path d="M0 28V-2" stroke="#3f7a32" stroke-width="3.5"/><path d="M0 12c-8-6-14-2-14 2 6 2 10 2 14-2zM0 18c8-6 14-2 14 2-6 2-10 2-14-2z" fill="#5d9a3c"/><circle cy="-8" r="11" fill="${o.c || "#c8312b"}"/><path d="M-5-10c3-4 8-4 10 0M-7-5c4 3 10 3 14 0" fill="none" stroke="#7d1a18" stroke-width="2"/>`,
    shell: () => `<path d="M0 26-32 0c-6-18 8-36 32-36S38-18 32 0z" fill="#f4b9a8"/><path d="M0 26V-34M0 26-18-30M0 26 18-30M0 26-29-12M0 26 29-12" stroke="#c97b68" stroke-width="2"/><rect x="-9" y="22" width="18" height="8" rx="3" fill="#f4b9a8"/>`,
    pearl: () => `<circle r="7" fill="#fbf4e2"/><circle cx="-2" cy="-2" r="2" fill="#fff" stroke="none"/>`,
    trident: () => `<path d="M0 44V-14" stroke="${INK}" stroke-width="8"/><path d="M0 44V-14" stroke="#e7b43a" stroke-width="4"/><path d="M-22-38v16c0 8 8 10 22 10s22-2 22-10v-16" fill="none" stroke="${INK}" stroke-width="8"/><path d="M-22-38v16c0 8 8 10 22 10s22-2 22-10v-16" fill="none" stroke="#e7b43a" stroke-width="4"/><path d="M0-44v30" stroke="${INK}" stroke-width="8"/><path d="M0-44v30" stroke="#e7b43a" stroke-width="4"/><path d="M-26-36l4-10 4 10M18-36l4-10 4 10M-4-42l4-10 4 10" fill="#e7b43a"/>`,
    coach: () => `<path d="M-38 6c0-26 18-36 38-36s38 10 38 36c0 12-10 16-38 16S-38 18-38 6z" fill="#e8892c"/><path d="M-14-28c-6 14-6 34 0 48M14-28c6 14 6 34 0 48" fill="none" stroke="#b5591a" stroke-width="2.5"/><rect x="-10" y="-14" width="20" height="16" rx="6" fill="#fbf4e2"/><circle cx="-24" cy="26" r="11" fill="#e7b43a"/><circle cx="24" cy="26" r="11" fill="#e7b43a"/><circle cx="-24" cy="26" r="3" fill="${INK}"/><circle cx="24" cy="26" r="3" fill="${INK}"/><path d="M0-30c0-6 4-10 8-12" fill="none" stroke="#3f7a32" stroke-width="3.5"/>`,
    pumpkin: () => `<path d="M-30 6c0-20 14-28 30-28s30 8 30 28-14 24-30 24S-30 26-30 6z" fill="#e8892c"/><path d="M-10-20c-6 12-6 36 0 48M10-20c6 12 6 36 0 48" fill="none" stroke="#b5591a" stroke-width="2.5"/><path d="M0-22c0-6 4-10 8-12" fill="none" stroke="#3f7a32" stroke-width="3.5"/>`,
    balloon: () => `<path d="M0 12C-26-2-30-18-30-28a30 30 0 0 1 60 0c0 10-4 26-30 40z" fill="#d9467a"/><path d="M0-58c-12 8-12 62 0 70M0-58c12 8 12 62 0 70" fill="none" stroke="#f3c64a" stroke-width="3.5"/><path d="M-6 12-10 28M6 12l4 16" stroke-width="1.8"/><rect x="-12" y="26" width="24" height="14" rx="2" fill="#a8692f"/>`,
    cottage: (o = {}) => `<rect x="-30" y="-6" width="60" height="38" fill="${o.wall || "#e9cf9e"}"/><path d="M-38-4 0-36 38-4z" fill="${o.roof || "#a8323a"}"/><rect x="-8" y="10" width="16" height="22" rx="7" fill="#7a4a26"/><rect x="-24" y="2" width="11" height="11" fill="#f3c64a"/><rect x="13" y="2" width="11" height="11" fill="#f3c64a"/><rect x="16" y="-32" width="8" height="14" fill="#8a5a2b"/>`,
    coffin: () => `<path d="M-14-40h28l12 30-8 50h-36l-8-50z" fill="#d8eef6" opacity=".8"/><path d="M-14-40h28l12 30-8 50h-36l-8-50z" fill="none" stroke="#e7b43a" stroke-width="4"/><path d="M-6-28 8-12M-4-14 6-4" stroke="#fff" stroke-width="2.5" opacity=".8"/>`,
    bottle: (o = {}) => `<path d="M-6-36h12v14c14 6 18 16 18 30 0 18-10 28-24 28s-24-10-24-28c0-14 4-24 18-30z" fill="#d8eef6"/><path d="M-21 8c0 18 8 26 21 26s21-8 21-26z" fill="${o.c || "#8f5bb5"}" stroke="none"/><path d="M-6-36h12v14c14 6 18 16 18 30 0 18-10 28-24 28s-24-10-24-28c0-14 4-24 18-30z" fill="none"/><rect x="-8" y="-45" width="16" height="10" rx="2" fill="#b07b48"/><rect x="-14" y="-6" width="28" height="13" fill="#fbf4e2" transform="rotate(-6)"/><path d="M-9-1h18" stroke="#8a5a2b" stroke-width="2" transform="rotate(-6)"/>`,
    cake: () => `<rect x="-28" y="-4" width="56" height="30" rx="4" fill="#f4c9a3"/><path d="M-28 4c6 8 10-4 14 4s10-4 14 4 10-4 14 4 8-4 14 0v-16h-56z" fill="#fbf4e2"/><rect x="-34" y="24" width="68" height="7" rx="3" fill="#e9d6a8"/><circle cy="-11" r="7" fill="#c8312b"/><path d="M0-18c2-4 6-6 8-6" fill="none" stroke="#3f7a32" stroke-width="2"/><rect x="12" y="6" width="16" height="11" fill="#fbf4e2" transform="rotate(8 20 11)"/>`,
    wheel: () => `<path d="M-30 36-6-6 18 36M-6-6 30 30" stroke="#7a4a26" stroke-width="5"/><circle cx="-6" cy="-6" r="28" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="-6" cy="-6" r="28" fill="none" stroke="#c98f4a" stroke-width="4.5"/><path d="M-6-34v56M-34-6h56M-26-26l40 40M14-26l-40 40" stroke="#a8692f" stroke-width="2.5"/><circle cx="-6" cy="-6" r="5" fill="#e7b43a"/><path d="M30-30 44-44" stroke="#7a4a26" stroke-width="4"/><circle cx="40" cy="-40" r="4" fill="#f3c64a"/>`,
    basket: () => `<path d="M-26-4c0-30 52-30 52 0" fill="none" stroke="${INK}" stroke-width="8"/><path d="M-26-4c0-30 52-30 52 0" fill="none" stroke="#c98f4a" stroke-width="4.5"/><rect x="-24" y="-12" width="48" height="10" rx="3" fill="#fbf4e2"/><circle cx="-12" cy="-10" r="6" fill="#c8312b"/><circle cx="6" cy="-12" r="7" fill="#e7b43a"/><path d="M-32-4h64l-8 34h-48z" fill="#c98f4a"/><path d="M-30 6h60M-28 16h56M-14-4v34M0-4v34M14-4v34" stroke="#8a5a2b" stroke-width="2"/><path d="M-32-4h64" stroke-width="2"/><path d="M-20-4 20-4" stroke="#c8312b" stroke-width="4"/>`,
    pouch: () => `<path d="M-20-12c-12 10-14 40 20 40s32-30 20-40z" fill="#c98f4a"/><path d="M-14-18h28l-6 8h-16z" fill="#a8692f"/><path d="M-20-12c10 4 30 4 40 0" fill="none" stroke="#c8312b" stroke-width="3"/>${sparkle(-6, -30, 1.2)}${sparkle(10, -40, 0.9)}${sparkle(20, -24, 0.7)}${sparkle(-18, -42, 0.7)}`,
    scroll: () => `<rect x="-26" y="-34" width="52" height="64" fill="#f2e6c8"/><rect x="-32" y="-40" width="64" height="10" rx="5" fill="#e9d6a8"/><rect x="-32" y="26" width="64" height="10" rx="5" fill="#e9d6a8"/><path d="M-18-20h36M-18-12h36M-18-4h30M-18 4h24" stroke="#8a5a2b" stroke-width="2"/><circle cx="12" cy="16" r="8" fill="#a8323a"/><path d="M-18 16c4-4 8 4 12-2" fill="none" stroke-width="1.8"/>`,
    ship: (o = {}) => `<path d="M-46 8h92l-12 22h-68z" fill="#7a4a26"/><path d="M-46 8h92" stroke-width="3"/><path d="M-30 16h8M-12 16h8M6 16h8M24 16h8" stroke="#e7b43a" stroke-width="3"/><path d="M-6 8V-46M18 8V-34" stroke-width="3.5"/><path d="M-6-42c14 6 16 22 0 34-10-12-10-24 0-34z" fill="${o.sail || "#fbf4e2"}"/><path d="M18-30c10 6 12 18 0 28-8-10-8-18 0-28z" fill="${o.sail || "#fbf4e2"}"/><path d="M-6-46h14l-4 4 4 4h-14z" fill="${o.flag || "#2b2b2b"}"/>`,
    throne: () => `<path d="M-30 34V-10c0-24 14-40 30-40s30 16 30 40v44z" fill="#2f8f8a"/><path d="M-20 34V-6c0-16 8-28 20-28s20 12 20 28v40z" fill="#63c2b6"/><path d="M-6-40 0-50 6-40" fill="#e7b43a"/><rect x="-34" y="10" width="68" height="12" rx="4" fill="#d9a5c2"/><rect x="-34" y="22" width="68" height="16" fill="#2f8f8a"/>${M_shellMini(0, -26)}`,
    croc: () => `<path d="M-46 6c10-14 40-16 70-10 10 2 20 6 24 12-6 6-20 8-30 8H-36c-6 0-10-4-10-10z" fill="#5d9a3c"/><path d="M-6 12-2 18 2 12 6 18 10 12 14 18 18 12 22 18 26 12" fill="#fbf4e2" stroke-width="1.5"/><circle cx="-24" cy="-4" r="7" fill="#e7d25a"/><path d="M-24-9v10" stroke-width="2.5"/><path d="M-34-6c4-8 14-10 22-6" fill="none" stroke="#3f7a32" stroke-width="3"/><path d="M0-6c4-2 8-2 12 0M18-4c4-2 8-2 12 0" stroke="#3f7a32" stroke-width="2.5"/>`,
    wolf: () => `<path d="M-24-34-14-8l-16 10 4 14c10 8 24 10 40 8l24-8c4-4 4-10 0-12l-22-6-6-28-12 14z" fill="#8a8f96"/><path d="M-24-34-18-16-10-22z" fill="#d6b7a8"/><path d="M14 2l18 4" stroke-width="2"/><circle cx="34" cy="2" r="4" fill="${INK}"/><path d="M-2-10l8 2" stroke="#f3c64a" stroke-width="4"/><path d="M8 12l3 6 3-6 3 6" fill="#fbf4e2" stroke-width="1.5"/>`,
    mouse: (o = {}) => `<ellipse cx="0" cy="10" rx="22" ry="16" fill="${o.c || "#a5a0a8"}"/><circle cx="-16" cy="-10" r="10" fill="#e8b9c2"/><circle cx="-16" cy="-10" r="10" fill="none"/><circle cx="12" cy="-8" r="10" fill="#e8b9c2"/><circle cx="-2" cy="-4" r="15" fill="${o.c || "#a5a0a8"}"/><circle cx="-7" cy="-6" r="2" fill="${INK}"/><circle cx="4" cy="-6" r="2" fill="${INK}"/><circle cx="-2" cy="2" r="3" fill="#e88a7a"/><path d="M20 18c14 4 18-8 12-14" fill="none" stroke-width="2.5"/>${o.hat ? `<path d="M-14-18 0-40 10-18z" fill="${o.hat}"/>` : ""}`,
    catgrin: () => `<path d="M-30 4c10 22 50 22 60 0-14 8-46 8-60 0z" fill="#fbf4e2"/><path d="M-30 4c14 8 46 8 60 0" fill="none" stroke-width="3"/><path d="M-20 10v6M-10 12v7M0 12v7M10 12v7M20 10v6" stroke-width="1.5"/><ellipse cx="-16" cy="-18" rx="9" ry="7" fill="#f3e04a"/><ellipse cx="16" cy="-18" rx="9" ry="7" fill="#f3e04a"/><ellipse cx="-16" cy="-18" rx="2.5" ry="6" fill="${INK}"/><ellipse cx="16" cy="-18" rx="2.5" ry="6" fill="${INK}"/>`,
    cathead: (o = {}) => `<path d="M-30-6-34-40-12-26C-4-30 4-30 12-26L34-40 30-6c4 22-12 34-30 34S-34 16-30-6z" fill="${o.c || "#9a9aa2"}"/><path d="M-26-30-20-14M26-30 20-14M-28 0c8 2 12 0 16-4M28 0c-8 2-12 0-16-4M-6-30v10M6-30v10" stroke="${o.s || "#6a6a72"}" stroke-width="3"/>`,
    rabbit: () => `<path d="M-10-24c-8-20-6-34 0-36 6 2 8 16 4 36M10-24c4-20 8-32 14-32 4 4 0 18-8 34" fill="#fbf4e2"/><path d="M-6-28c-4-12-2-24 0-26M14-24c4-12 8-22 10-24" stroke="#e8b9c2" stroke-width="3"/><ellipse cx="0" cy="-12" rx="16" ry="15" fill="#fbf4e2"/><circle cx="-6" cy="-14" r="2.2" fill="#c8312b"/><circle cx="6" cy="-14" r="2.2" fill="#c8312b"/><path d="M-2-6 0-4 2-6" stroke-width="1.8"/><path d="M-22 40c0-24 10-36 22-36s22 12 22 36z" fill="#c8312b"/><path d="M0 4v36" stroke-width="2"/><path d="M-12 8 0 14 12 8" fill="#fbf4e2"/>`,
    tail: (o = {}) => `<path d="M-8-40c-10 30 6 50 2 66-16 4-26 10-30 18 16-4 26-4 36 0 10-4 20-4 36 0-4-8-14-14-30-18 8-20-2-42-14-66z" fill="${o.c || "#2f9f8a"}"/><path d="M-6-20c4 4 8 4 10 0M-4-6c4 4 8 4 10 0M-2 8c4 4 8 4 10 0" fill="none" stroke="#1f6b5e" stroke-width="2"/>`,
    lionhead: () => `<circle r="32" fill="#c98f2a"/><path d="M-32 0a32 32 0 0 1 64 0" fill="none"/><circle r="21" fill="#efc36a"/><circle cx="-7" cy="-5" r="2.5" fill="${INK}"/><circle cx="7" cy="-5" r="2.5" fill="${INK}"/><path d="M-5 4h10l-5 5z" fill="#7a4a26"/><path d="M-6 12c3 3 9 3 12 0" fill="none" stroke-width="2"/><path d="M-6-2c2 3-6 6-4 8M6-2c-2 3 6 6 4 8" fill="none" stroke-width="1.5" opacity=".5"/><path d="M-10 18c4-2 8-2 10 2" fill="none" stroke="#5aa0d0" stroke-width="2.5"/>`,
    strawhat: () => `<ellipse cy="6" rx="38" ry="9" fill="#e2c063"/><path d="M-18 4c0-22 8-30 18-30s18 8 18 30z" fill="#d6ad4a"/><path d="M-18-2h36" stroke="#8a5a2b" stroke-width="5"/><path d="M-36 8l-8 6M-30 12l-4 8M36 8l8 6M30 12l4 8" stroke="#c99a2e" stroke-width="2.5"/>`,
    funnel: () => `<path d="M-14-10 14-10 4 14-4 14z" fill="#c2ccd4"/><rect x="-3" y="-34" width="6" height="24" fill="#c2ccd4"/><path d="M-10-4 10-4" stroke="#8a9aa6" stroke-width="2"/>`,
    axe: () => `<path d="M-28 34 14-14" stroke="${INK}" stroke-width="7"/><path d="M-28 34 14-14" stroke="#a8692f" stroke-width="4"/><path d="M4-26c10-10 26-6 28 4 0 8-8 16-16 16z" fill="#c2ccd4"/><path d="M4-26c10-10 26-6 28 4" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>`,
    cardsoldier: (o = {}) => `<rect x="-22" y="-30" width="44" height="62" rx="5" fill="#fbf4e2"/><text x="-16" y="-14" font-size="14" font-family="Georgia,serif" fill="${o.red ? "#c8312b" : INK}" stroke="none">${o.red ? "♥" : "♠"}</text><text x="0" y="12" text-anchor="middle" font-size="26" font-family="Georgia,serif" fill="${o.red ? "#c8312b" : INK}" stroke="none">${o.red ? "♥" : "♠"}</text><circle cy="-42" r="12" fill="#f2c9a0"/><circle cx="-4" cy="-43" r="1.8" fill="${INK}"/><circle cx="4" cy="-43" r="1.8" fill="${INK}"/><path d="M-30 40V-24" stroke="#8a5a2b" stroke-width="4"/><path d="M-34-28-30-40-26-28z" fill="#c2ccd4"/>`,
    tricorn: (o = {}) => `<path d="M-38 6c10-6 20-24 38-24s28 18 38 24c-12 6-26 10-38 10s-26-4-38-10z" fill="${o.c || "#2b2b2b"}"/><path d="M-30 6c14 6 46 6 60 0" fill="none" stroke="#e7b43a" stroke-width="2.5"/>${o.skull ? `<circle cy="-4" r="5" fill="#fbf4e2"/><path d="M-6 4l12 4M6 4l-12 4" stroke="#fbf4e2" stroke-width="2"/>` : ""}`,
    hook: () => `<path d="M0 40V0c0-24 30-24 30-4 0 10-8 14-14 10" fill="none" stroke="${INK}" stroke-width="9"/><path d="M0 40V0c0-24 30-24 30-4 0 10-8 14-14 10" fill="none" stroke="#c2ccd4" stroke-width="5"/><rect x="-12" y="34" width="24" height="18" rx="4" fill="#8a2b2b"/>`,
    featherCap: (o = {}) => `<path d="M-30 10c4-22 20-30 36-26 10 2 22 14 26 26z" fill="${o.c || "#4f9a45"}"/><path d="M-30 10h62" stroke-width="3"/><path d="M8-12c10-20 26-26 36-24-6 10-18 22-36 24z" fill="${o.f || "#c8312b"}"/><path d="M10-12 40-34" stroke="#7d1a18" stroke-width="1.5"/>`,
    fairy: (o = {}) => `<circle r="${o.glow || 22}" fill="${o.light || "#fff3b0"}" opacity=".55" stroke="none"/><path d="M-2-2c-20-22-34-8-26 6 6 8 20 4 26-6zM2-2c20-22 34-8 26 6-6 8-20 4-26-6z" fill="#d8eef6" opacity=".85"/><path d="M-2 4c-14 4-20 16-12 20 8 2 12-8 12-20zM2 4c14 4 20 16 12 20-8 2-12-8-12-20z" fill="#d8eef6" opacity=".85"/><ellipse cy="6" rx="5" ry="10" fill="${o.c || "#7cc46a"}"/><circle cy="-8" r="6" fill="#f2c9a0"/>`,
    witchhat: (o = {}) => `<ellipse cy="14" rx="38" ry="9" fill="${o.c || "#2b2b2b"}"/><path d="M-20 14C-14-10-4-26 18-42 6-22 14-2 20 14z" fill="${o.c || "#2b2b2b"}"/><path d="M-18 8c12 4 28 4 38 0" fill="none" stroke="${o.band || "#7a4fa0"}" stroke-width="5"/><rect x="-4" y="2" width="9" height="9" fill="none" stroke="#e7b43a" stroke-width="2"/>`,
    broom: () => `<path d="M-40 30 22-20" stroke="${INK}" stroke-width="6"/><path d="M-40 30 22-20" stroke="#a8692f" stroke-width="3"/><path d="M18-16c8-10 20-16 30-16-4 8-8 18-16 28z" fill="#d6ad4a"/>`,
    tree: (o = {}) => `<rect x="-6" y="6" width="12" height="30" fill="#7a4a26"/><path d="M0-40c-24 0-30 20-24 30-10 10 0 24 12 20 6 6 18 6 24 0 12 4 22-10 12-20 6-10 0-30-24-30z" fill="${o.c || "#4f9a45"}"/>${o.apples ? `<circle cx="-10" cy="-12" r="3.5" fill="#c8312b"/><circle cx="8" cy="-20" r="3.5" fill="#c8312b"/><circle cx="12" cy="0" r="3.5" fill="#c8312b"/>` : ""}`,
    pine: (o = {}) => `<rect x="-4" y="22" width="8" height="14" fill="#7a4a26"/><path d="M0-40-22 0h10L-26 24h52L12 0h10z" fill="${o.c || "#2f6b3c"}"/>`,
    castle: (o = {}) => `<rect x="-34" y="-10" width="68" height="44" fill="${o.c || "#e3d6c4"}"/><rect x="-44" y="-30" width="18" height="64" fill="${o.c || "#e3d6c4"}"/><rect x="26" y="-30" width="18" height="64" fill="${o.c || "#e3d6c4"}"/><path d="M-48-30-35-52-22-30zM22-30 35-52 48-30z" fill="${o.roof || "#3f6fa8"}"/><rect x="-8" y="12" width="16" height="22" rx="8" fill="#7a4a26"/><rect x="-38" y="-18" width="6" height="9" rx="3" fill="#f3c64a"/><rect x="32" y="-18" width="6" height="9" rx="3" fill="#f3c64a"/><path d="M-34-10v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6" fill="none"/>`,
    moon: () => `<path d="M8-22a24 24 0 1 0 14 40A20 20 0 1 1 8-22z" fill="#f6e7a8"/>`,
    sun: () => `<circle r="18" fill="#f3c64a"/><g stroke="#f3c64a" stroke-width="4">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0-24V-32" transform="rotate(${a})"/>`).join("")}</g>`,
    heart: (o = {}) => `<path d="M0 22C-30 2-28-22-14-24-6-25-2-20 0-14 2-20 6-25 14-24 28-22 30 2 0 22z" fill="${o.c || "#c8312b"}"/>`,
    key: () => `<circle cx="-20" r="12" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="-20" r="12" fill="none" stroke="#e7b43a" stroke-width="4"/><path d="M-8 0h40M24 0v10M32 0v8" stroke="${INK}" stroke-width="8"/><path d="M-8 0h40M24 0v10M32 0v8" stroke="#e7b43a" stroke-width="4"/>`,
    quill: () => `<path d="M-30 34C-10 0 10-30 34-42 30-16 6 12-24 30z" fill="#fbf4e2"/><path d="M-30 34 26-34" stroke="#b39b72" stroke-width="2"/><path d="M-34 40-28 30" stroke-width="3"/>`,
    inkpot: () => `<path d="M-16-6h32l4 24c0 8-8 12-20 12s-20-4-20-12z" fill="#2a3550"/><rect x="-8" y="-14" width="16" height="9" fill="#2a3550"/>`,
    cauldron: () => `<path d="M-30-8h60c0 30-12 40-30 40S-30 22-30-8z" fill="#3a3a3a"/><ellipse cy="-8" rx="32" ry="7" fill="#5d9a3c"/>${sparkle(-8, -20, 0.8, "#b8f28a")}${sparkle(10, -26, 0.6, "#b8f28a")}`,
    coins: () => `<ellipse cx="-12" cy="20" rx="16" ry="6" fill="#e7b43a"/><ellipse cx="-12" cy="14" rx="16" ry="6" fill="#e7b43a"/><ellipse cx="-12" cy="8" rx="16" ry="6" fill="#f3c64a"/><ellipse cx="12" cy="20" rx="16" ry="6" fill="#e7b43a"/><ellipse cx="12" cy="14" rx="16" ry="6" fill="#f3c64a"/><circle cx="4" cy="-6" r="11" fill="#f3c64a"/><circle cx="4" cy="-6" r="6" fill="none" stroke="#c9922a" stroke-width="2"/>`,
    mask: () => `<path d="M-34-6c10-10 24-8 34 0 10-8 24-10 34 0-2 18-14 24-24 20-6-2-8-8-10-8s-4 6-10 8c-10 4-22-2-24-20z" fill="#2b2b2b"/><ellipse cx="-14" cy="0" rx="7" ry="4" fill="#fbf4e2"/><ellipse cx="14" cy="0" rx="7" ry="4" fill="#fbf4e2"/>`,
    hood: (o = {}) => `<path d="M-30 44c-4-30 0-74 30-74S34 14 30 44z" fill="${o.c || "#c8312b"}"/><ellipse cy="-4" rx="16" ry="19" fill="#f2c9a0"/><path d="M-16-12c4-10 28-10 32 0-10-6-22-6-32 0z" fill="#e7b43a"/><circle cx="-6" cy="-4" r="2" fill="${INK}"/><circle cx="6" cy="-4" r="2" fill="${INK}"/><path d="M-4 6c2 2 6 2 8 0" fill="none" stroke-width="1.8"/>`,
    horns: () => `<path d="M-20 0c-20-6-26-24-18-36 2 12 10 22 24 22zM20 0c20-6 26-24 18-36-2 12-10 22-24 22z" fill="#ead7a6"/>`,
    mane: () => `<path d="M-34 10c-6-30 10-50 34-50s40 20 34 50c-8 12-60 12-68 0z" fill="#6b3f1f"/>`,
    ears: (o = {}) => `<path d="M-22-14-26-40-6-26zM22-14 26-40 6-26z" fill="${o.c || "#6b3f1f"}"/>`,
    tiara: () => `<path d="M-16 0-12-12-6-4 0-16 6-4 12-12 16 0z" fill="#e7b43a"/><circle cy="-8" r="2.5" fill="#d9467a"/>`,
    bowtie: (o = {}) => `<path d="M0 0-14-8v16zM0 0 14-8v16z" fill="${o.c || "#c8312b"}"/><circle r="3" fill="${o.c || "#c8312b"}"/>`,
    leaf: (o = {}) => `<path d="M-14 10C-14-10 4-18 18-18 18-2 8 14-14 10z" fill="${o.c || "#5d9a3c"}"/><path d="M-14 10 12-12" stroke="#3f7a32" stroke-width="2"/>`,
    bird: () => `<path d="M-10 0c4-6 10-6 14-2 6-6 14-6 18 0-6-2-12 0-16 4-4-4-10-4-16-2z" fill="none" stroke-width="2.5"/>`,
    sparkles: (o = {}) => [[-24, -16, 1.1], [18, -26, 0.8], [26, 12, 1], [-16, 20, 0.7], [0, -34, 0.6]].map(([x, y, s]) => sparkle(x, y, s, o.c)).join(""),
    deer: () => `<ellipse cx="0" cy="10" rx="24" ry="14" fill="#c98f4a"/><path d="M-16 20v20M-6 22v18M10 22v18M18 20v20" stroke="#8a5a2b" stroke-width="4"/><path d="M14 2c4-14 10-22 18-22 6 0 8 6 6 10l-10 6c-2 6-6 10-14 10z" fill="#c98f4a"/><path d="M28-20c-2-8-8-12-8-20M30-20c4-8 10-10 10-18M24-32l-6-4M34-30l6-4" stroke="#7a4a26" stroke-width="2.5" fill="none"/><circle cx="30" cy="-14" r="2" fill="${INK}"/><path d="M-8 4h4M2 6h4M-2 14h4" stroke="#fbf4e2" stroke-width="3"/>`,
    owl: () => `<ellipse cy="6" rx="18" ry="24" fill="#a8692f"/><ellipse cy="12" rx="11" ry="16" fill="#e9cf9e"/><circle cx="-8" cy="-8" r="8" fill="#fbf4e2"/><circle cx="8" cy="-8" r="8" fill="#fbf4e2"/><circle cx="-8" cy="-8" r="3.5" fill="${INK}"/><circle cx="8" cy="-8" r="3.5" fill="${INK}"/><path d="M-3-2h6l-3 5z" fill="#e7b43a"/><path d="M-16-18-12-28-6-20M16-18l-4-10-6 8" fill="#a8692f"/>`,
    ghost: () => `<path d="M-18 30V-6a18 18 0 0 1 36 0v36l-6-6-6 6-6-6-6 6-6-6z" fill="#fbf4e2" opacity=".75"/><circle cx="-6" cy="-6" r="2.5" fill="${INK}" opacity=".6"/><circle cx="6" cy="-6" r="2.5" fill="${INK}" opacity=".6"/>`,
    tray: () => `<ellipse cy="10" rx="36" ry="8" fill="#c2ccd4"/><path d="M-26 8c0-28 52-28 52 0z" fill="#dfe6ec"/><circle cy="-14" r="4" fill="#c2ccd4"/><path d="M-14-6c4-6 10-8 14-8" fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"/>`,
    candle: () => `<rect x="-6" y="-10" width="12" height="34" fill="#fbf4e2"/><path d="M0-14c-6-6-2-16 0-20 2 4 6 14 0 20z" fill="#f3c64a"/><rect x="-14" y="22" width="28" height="6" rx="3" fill="#e7b43a"/>`,
    teacup: () => `<path d="M-20-8h34c0 20-6 28-17 28s-17-8-17-28z" fill="#fbf4e2"/><path d="M14-2c10 0 10 14 0 14" fill="none" stroke-width="3"/><ellipse cx="-3" cy="22" rx="24" ry="5" fill="#fbf4e2"/><circle cx="-3" cy="6" r="4" fill="#5aa0d0"/><path d="M-10-16c0-6 6-6 6-12M2-16c0-6 6-6 6-12" fill="none" stroke="#b39b72" stroke-width="2"/>`,
    wave: (o = {}) => `<path d="M-50 10c10-14 20-14 30 0s20 14 30 0 20-14 30 0 20 14 30 0v20h-120z" fill="${o.c || "#3f8fc4"}"/>`,
    feather: () => `<path d="M-6 30C-14 6-2-22 18-36 18-12 12 12-6 30z" fill="#7fb05c"/><path d="M-10 36 14-28" stroke="#3f7a32" stroke-width="2"/>`,
    goldfish: () => `<ellipse rx="16" ry="10" fill="#e8892c"/><path d="M14 0l14-10v20z" fill="#e8892c"/><circle cx="-8" cy="-2" r="2" fill="${INK}"/>`,
    hearthcard: () => `<rect x="-18" y="-26" width="36" height="52" rx="4" fill="#fbf4e2"/><text y="10" text-anchor="middle" font-size="28" fill="#c8312b" stroke="none" font-family="Georgia,serif">♥</text>`,
    flag: (o = {}) => `<path d="M-20 34V-34" stroke-width="3.5"/><path d="M-20-34c14-6 24 6 40 0v24c-16 6-26-6-40 0z" fill="${o.c || "#c8312b"}"/>`,
    footprints: () => `<ellipse cx="-14" cy="10" rx="5" ry="8" fill="${INK}" opacity=".35" stroke="none"/><ellipse cx="2" cy="-4" rx="5" ry="8" fill="${INK}" opacity=".35" stroke="none"/><ellipse cx="16" cy="-20" rx="5" ry="8" fill="${INK}" opacity=".35" stroke="none"/>`,
    road: (o = {}) => `<path d="M-14 40C-6 20 20 10 10-10S-10-30 0-40h8C-2-30 22-12 18 8S2 30 10 40z" fill="${o.c || "#f3c64a"}"/><path d="M-12 30h20M-2 18h20M4 4h16M0-14h16M2-28h10" stroke="#c9922a" stroke-width="1.5"/>`,
    puppet: (o = {}) => `<path d="M-26 44c0-20 10-28 26-28s26 8 26 28z" fill="#c8312b"/><path d="M-8 16 0 26 8 16" fill="#f3c64a"/><rect x="-5" y="4" width="10" height="12" fill="#e0b07a"/><ellipse cx="0" cy="-16" rx="16" ry="18" fill="#e0b07a"/><path d="M6-12h${o.nose || 22}l-${o.nose || 22} 5z" fill="#d49a5e"/><circle cx="-5" cy="-18" r="2.2" fill="${INK}" stroke="none"/><circle cx="7" cy="-18" r="2.2" fill="${INK}" stroke="none"/><path d="M-6-4c3 2 6 2 9 0" fill="none" stroke-width="1.6"/><path d="M-18-24c4-20 32-20 36 0-10-6-26-6-36 0z" fill="#3a8a4a"/><path d="M14-30l8-14" stroke-width="2"/><circle cx="22" cy="-45" r="3" fill="#c8312b"/><path d="M-18-34v-20M18-34v-20" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>`,
    cricket: () => `<ellipse cx="0" cy="6" rx="22" ry="12" fill="#5d9a3c"/><circle cx="-24" cy="-2" r="10" fill="#6fae4a"/><circle cx="-27" cy="-4" r="2.4" fill="${INK}" stroke="none"/><path d="M-30-10c-8-16-2-24 6-28M-22-10c0-14 10-20 18-20" fill="none" stroke-width="1.6"/><path d="M6 14 20 34M14 10l18 4 4 20M-8 16l-6 16" fill="none" stroke-width="2.4"/><path d="M-30-14h12v-4h-12z" fill="${INK}"/><rect x="-28" y="-24" width="8" height="10" fill="${INK}"/><path d="M-4-4c8-10 20-8 26 4" fill="#8cc063" opacity=".8"/>`,
    whale: () => `<path d="M-50 10c0-26 30-38 60-30 22 6 32 22 32 34-4 8-14 12-26 12H-36c-8 0-14-8-14-16z" fill="#3f6f9a"/><path d="M-44 18c20 8 50 8 74 0" fill="none" stroke="#bcd6e8" stroke-width="3"/><path d="M40 10l22-16-4 18 6 16z" fill="#3f6f9a"/><circle cx="-26" cy="-2" r="3.5" fill="${INK}" stroke="none"/><path d="M-40 12c6 4 14 4 20 0" fill="#2b2b2b"/><path d="M-10-26c-4-10-10-14-16-14M-10-26c4-10 10-12 16-12M-10-26v-14" fill="none" stroke="#bfe3f2" stroke-width="2.5"/>`,
    fox: () => `<path d="M-26-8-30-38-10-22C-4-26 4-26 10-22L30-38 26-8c2 16-10 30-26 34C-16 22-28 8-26-8z" fill="#e0742a"/><path d="M-14 4c6 14 22 14 28 0-6 10-22 10-28 0z" fill="#fbf4e2"/><path d="M-4 16h8l-4 5z" fill="${INK}"/><ellipse cx="-11" cy="-6" rx="3" ry="4" fill="${INK}" stroke="none"/><ellipse cx="11" cy="-6" rx="3" ry="4" fill="${INK}" stroke="none"/>`,
  };

  function M_shellMini(x, y) {
    return `<g transform="translate(${x} ${y}) scale(.45)">${M.shell()}</g>`;
  }

  // ---------- backgrounds ----------
  const BG = {
    meadow: { sky: ["#bfe3f2", "#f6efd8"], ground: "#8cc063", ground2: "#6fa64a", extra: "sun" },
    forest: { sky: ["#cfe8c6", "#f2edcf"], ground: "#5d9a3c", ground2: "#3f7a32", extra: "pines" },
    night: { sky: ["#23305a", "#4a4f86"], ground: "#2f4a3a", ground2: "#1f3528", extra: "stars" },
    sea: { sky: ["#bfe3f2", "#eaf6f8"], ground: "#3f8fc4", ground2: "#2d6f9e", extra: "waves" },
    under: { sky: ["#2d7fa6", "#164a6e"], ground: "#e3cf9c", ground2: "#c9b07c", extra: "bubbles" },
    castle: { sky: ["#e9d4b8", "#f6ead2"], ground: "#a8323a", ground2: "#7d2028", extra: "drapes" },
    wonder: { sky: ["#f6c9d9", "#fbeef0"], ground: "#9fd07a", ground2: "#7ab35a", extra: "checker" },
    oz: { sky: ["#d6f0c4", "#f6f3d0"], ground: "#5fb06a", ground2: "#3f8f4c", extra: "emerald" },
    desert: { sky: ["#f6d6a0", "#fbeed2"], ground: "#e2b56a", ground2: "#c99a4a", extra: "dunes" },
    lair: { sky: ["#3a1f2e", "#6e2c3a"], ground: "#2b1a22", ground2: "#1a0f15", extra: "embers" },
    dusk: { sky: ["#f2a65a", "#f7d9a8"], ground: "#6f6a8a", ground2: "#4e4a6a", extra: "sun" },
    study: { sky: ["#c99a6a", "#e9cfa8"], ground: "#7a4a26", ground2: "#5e3618", extra: "shelves" },
    snow: { sky: ["#d6e6f2", "#f4f8fb"], ground: "#fbfdff", ground2: "#dbe7f0", extra: "flakes" },
    village: { sky: ["#bfe3f2", "#f6efd8"], ground: "#a8c46a", ground2: "#8aa84e", extra: "houses" },
  };

  function background(key, uid) {
    const b = BG[key] || BG.meadow;
    let extra = "";
    if (b.extra === "sun") extra = `<g transform="translate(168 26) scale(.7)">${M.sun()}</g>`;
    if (b.extra === "pines") extra = [[18, 88, 0.7], [44, 80, 0.85], [168, 84, 0.8], [190, 92, 0.6]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".85">${M.pine({ c: "#3f7a42" })}</g>`).join("");
    if (b.extra === "stars") extra = [[20, 20], [50, 12], [90, 26], [140, 14], [178, 30], [120, 40], [30, 50]].map(([x, y]) => sparkle(x, y, 0.5, "#fff3b0")).join("") + `<g transform="translate(166 30) scale(.6)">${M.moon()}</g>`;
    if (b.extra === "waves") extra = `<path d="M0 110c20-8 40-8 60 0s40 8 60 0 40-8 60 0 20 8 20 8v32H0z" fill="#5aa8d4" stroke="none"/>`;
    if (b.extra === "bubbles") extra = [[30, 30, 4], [42, 52, 3], [170, 40, 5], [160, 66, 3], [100, 18, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#bfe8f7" stroke-width="1.5"/>`).join("") + `<path d="M14 150c4-30-6-40 2-60M188 150c-6-24 4-36-2-56" stroke="#3f9a6a" stroke-width="5" fill="none"/>`;
    if (b.extra === "drapes") extra = `<path d="M0 0h30c-4 40 4 80-6 110H0zM200 0h-30c4 40-4 80 6 110h24z" fill="#8a2b33" stroke="none" opacity=".85"/><path d="M60 0v26M100 0v18M140 0v26" stroke="#c9922a" stroke-width="1.5"/>`;
    if (b.extra === "checker") extra = Array.from({ length: 10 }, (_, i) => `<rect x="${i * 20}" y="126" width="10" height="10" fill="#fbf4e2" opacity=".6" stroke="none"/><rect x="${i * 20 + 10}" y="136" width="10" height="14" fill="#fbf4e2" opacity=".6" stroke="none"/>`).join("");
    if (b.extra === "emerald") extra = `<g transform="translate(166 64) scale(.55)" opacity=".75"><path d="M-30 30V-10l10-30 10 30v40zM-10 30V-30l10-30 10 30v60zM10 30V-10l10-30 10 30v40z" fill="#4fbf7a"/></g>`;
    if (b.extra === "dunes") extra = `<path d="M0 104c30-16 60-16 90 0s60 10 110-6v52H0z" fill="#d9a65a" stroke="none"/>`;
    if (b.extra === "embers") extra = [[30, 40], [60, 20], [150, 30], [176, 56], [110, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#f2884a" stroke="none"/>`).join("");
    if (b.extra === "shelves") extra = `<path d="M0 34h200M0 74h200" stroke="#5e3618" stroke-width="4"/>` + [8, 20, 30, 44, 150, 162, 172, 186].map((x, i) => `<rect x="${x}" y="${i % 2 ? 14 : 18}" width="9" height="${i % 2 ? 20 : 16}" fill="${["#8a3b3b", "#2f5d8a", "#4f7a3a", "#c9922a"][i % 4]}" stroke-width="1.5"/>`).join("");
    if (b.extra === "flakes") extra = [[20, 20], [60, 40], [120, 18], [170, 44], [90, 60], [40, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#fff" stroke="none"/>`).join("");
    if (b.extra === "houses") extra = `<g transform="translate(26 92) scale(.45)">${M.cottage({ roof: "#3f6fa8" })}</g><g transform="translate(180 94) scale(.4)">${M.cottage()}</g>`;
    return `<defs><linearGradient id="sky${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.sky[0]}"/><stop offset="1" stop-color="${b.sky[1]}"/></linearGradient></defs>
      <rect width="200" height="150" fill="url(#sky${uid})" stroke="none"/>
      ${extra}
      <path d="M0 118c40-14 80-16 120-6s60 4 80-4v42H0z" fill="${b.ground}" stroke="none"/>
      <path d="M0 132c50-10 100-8 140 0s40 2 60-2v20H0z" fill="${b.ground2}" stroke="none"/>`;
  }

  // ---------- scenes ----------
  // [motif, x, y, scale, rotation, options]
  const F = (o) => ["figure", 100, 92, 1.05, 0, o];
  const S = {
    // Common characters
    "Dwarf": { bg: "forest", m: [["figure", 70, 98, 0.8, 0, { style: "beard", hair: "#a8692f", coat: "#8a5a2b" }], ["figure", 132, 98, 0.8, 0, { style: "beard", hair: "#e9e2d0", coat: "#3f6fa8" }], ["tophat", 70, 58, 0.45, -8, { c: "#c8312b", c2: "#a8262a" }], ["witchhat", 132, 62, 0.42, 6, { c: "#4f9a45", band: "#e7b43a" }], ["axe", 168, 110, 0.5, 20]] },
    "Playing Card Soldier": { bg: "wonder", m: [["cardsoldier", 70, 92, 0.9, 0], ["cardsoldier", 130, 92, 0.9, 0, { red: true }]] },
    "Pirate": { bg: "sea", m: [["ship", 150, 92, 0.6, 0], F({ style: "beard", hair: "#2b2b2b", coat: "#a8323a", collar: "#fbf4e2" }), ["tricorn", 100, 58, 0.75, 0, { skull: true }]] },
    "The Merry Men": { bg: "forest", m: [["figure", 64, 100, 0.8, 0, { coat: "#4f9a45", style: "short", hair: "#a8692f" }], ["figure", 136, 100, 0.8, 0, { coat: "#3f7a32", style: "beard", hair: "#6b3f1f" }], ["featherCap", 64, 66, 0.55, -6], ["featherCap", 136, 66, 0.55, 6], ["bow", 100, 96, 0.6, 0]] },
    "Mice": { bg: "castle", m: [["mouse", 66, 108, 0.9, 0, { hat: "#3f6fa8" }], ["mouse", 120, 112, 0.8, 0, { c: "#b8a68a", hat: "#c8312b" }], ["slipper", 160, 120, 0.5, 0, { glass: true }]] },
    "Wicked Witch of the West": { bg: "oz", m: [["broom", 142, 98, 0.8, 0], F({ skin: "#e9d9c4", style: "long", hair: "#6b5a8a", coat: "#5a3b6e" }), ["witchhat", 100, 56, 0.8, 0, { c: "#3a2a4a", band: "#c8312b" }]] },
    "Wicked Witch of the East": { bg: "oz", m: [["cottage", 160, 104, 0.45, -8], F({ skin: "#d9e4c4", style: "long", hair: "#2b2b2b", coat: "#2f4a3a" }), ["witchhat", 100, 56, 0.8, 0, { c: "#1f2a24", band: "#c2ccd4" }], ["slipper", 50, 128, 0.5, 0, { c: "#c2ccd4" }]] },
    "Wicked Witch of the North": { bg: "snow", m: [F({ style: "long", hair: "#fbfdff", coat: "#a9c9e8" }), ["tiara", 100, 66, 1, 0], ["wand", 152, 92, 0.6, 0]] },
    "Wicked Witch of the South": { bg: "dusk", m: [F({ style: "long", hair: "#c8312b", coat: "#f4f1ea" }), ["crown", 100, 64, 0.45, 0, { c: "#f3c64a", gem: "#d9467a" }], ["sparkles", 100, 70, 1.3, 0]] },
    "Scarecrow": { bg: "oz", m: [["road", 48, 120, 0.8, 0], F({ skin: "#efe1b8", style: "none", coat: "#5a7fb0" }), ["strawhat", 100, 64, 0.8, 0], ["bird", 160, 40, 1, 0]] },
    "The Tin Woodman": { bg: "oz", m: [F({ skin: "#c2ccd4", style: "none", coat: "#9aa8b4" }), ["funnel", 100, 58, 0.8, 0], ["axe", 150, 100, 0.7, 0], ["heart", 70, 110, 0.35, 0]] },
    "The Cowardly Lion": { bg: "oz", m: [["lionhead", 100, 84, 1.3, 0], ["road", 168, 124, 0.6, 0]] },
    "The Lost Boys": { bg: "forest", m: [["figure", 64, 100, 0.8, 0, { coat: "#a8692f", style: "curly", hair: "#6b3f1f" }], ["figure", 136, 100, 0.8, 0, { coat: "#8a8f96", style: "short", hair: "#e7b43a" }], ["ears", 64, 72, 0.7, 0, { c: "#fbf4e2" }], ["ears", 136, 72, 0.7, 0, { c: "#6b3f1f" }], ["star", 100, 34, 0.6, 0]] },
    "Sirens": { bg: "sea", m: [["tail", 70, 110, 0.6, -10], ["tail", 134, 112, 0.55, 12, { c: "#8f5bb5" }], ["figure", 70, 78, 0.6, 0, { style: "long", hair: "#e7b43a", coat: "#2f9f8a" }], ["figure", 134, 80, 0.6, 0, { style: "long", hair: "#3a2a1a", coat: "#8f5bb5" }], ["shell", 100, 130, 0.35, 0]] },
    "Stepsister": { bg: "castle", m: [F({ style: "bun", hair: "#c8312b", coat: "#d9a5c2", collar: "#fbf4e2" }), ["slipper", 150, 118, 0.55, -10, { glass: true }], ["mask", 56, 56, 0.45, -12]] },
    "The Invisible Servants": { bg: "castle", m: [["tray", 70, 86, 0.8, -6], ["candle", 132, 84, 0.9, 6], ["teacup", 100, 116, 0.6, 0], ["sparkles", 100, 70, 1.4, 0, { c: "#fff" }]] },
    "The Fairies": { bg: "meadow", m: [["fairy", 60, 70, 0.9, -10, { c: "#d9467a" }], ["fairy", 140, 60, 0.9, 10, { c: "#3f6fa8", light: "#d8eef6" }], ["fairy", 100, 100, 0.9, 0, { c: "#4f9a45" }], ["sparkles", 100, 80, 1.6, 0]] },
    "The Forest Animals": { bg: "forest", m: [["deer", 70, 96, 0.9, 0], ["owl", 150, 64, 0.8, 0], ["bird", 110, 36, 1, 0], ["mouse", 140, 122, 0.45, 0, { c: "#c98f4a" }]] },
    "The Munchkins": { bg: "oz", m: [["figure", 60, 106, 0.65, 0, { coat: "#3f6fa8", style: "short", hair: "#e7b43a" }], ["figure", 100, 102, 0.65, 0, { coat: "#4f9a45", style: "bun", hair: "#6b3f1f" }], ["figure", 140, 106, 0.65, 0, { coat: "#3f6fa8", style: "beard", hair: "#a8692f" }], ["witchhat", 60, 72, 0.4, 0, { c: "#3f6fa8", band: "#f3c64a" }], ["witchhat", 140, 72, 0.4, 0, { c: "#3f6fa8", band: "#f3c64a" }], ["road", 100, 136, 0.5, 90]] },

    // Legendary characters
    "The Prince": { bg: "castle", m: [F({ style: "short", hair: "#a8692f", coat: "#3f6fa8", collar: "#e7b43a" }), ["crown", 100, 62, 0.45, 0], ["sword", 156, 96, 0.7, 20]] },
    "The White Rabbit": { bg: "wonder", m: [["rabbit", 96, 96, 1.05, 0], ["watch", 150, 88, 0.6, 12]] },
    "Alice": { bg: "wonder", m: [F({ style: "long", hair: "#e7b43a", coat: "#f4b9a8", collar: "#fbf4e2" }), ["bowtie", 100, 54, 1, 0, { c: "#2b2b2b" }], ["bottle", 154, 104, 0.45, 10], ["cake", 46, 116, 0.45, 0]] },
    "Mad Hatter": { bg: "wonder", m: [F({ style: "curly", hair: "#5e3618", coat: "#8a3b3b", collar: "#e7b43a" }), ["tophat", 100, 50, 0.75, -8, { tag: true }], ["teacup", 156, 110, 0.6, 0]] },
    "Tinker Bell": { bg: "night", m: [["fairy", 100, 78, 1.7, 0, { c: "#f3c64a", glow: 30 }], ["sparkles", 100, 80, 1.8, 0]] },
    "Wendy": { bg: "night", m: [F({ style: "long", hair: "#6b3f1f", coat: "#a9c9e8", collar: "#fbf4e2" }), ["bowtie", 100, 50, 0.8, 0, { c: "#3f6fa8" }], ["star", 160, 40, 0.5, 0], ["candle", 46, 104, 0.6, 0]] },
    "Pinocchio": { bg: "village", m: [["puppet", 100, 92, 0.95, 0, { nose: 34 }], ["leaf", 152, 52, 0.45, 20]] },
    "Geppetto": { bg: "study", m: [["figure", 84, 96, 0.9, 0, { style: "whitebeard", hair: "#e8e2d4", coat: "#7a5a3a" }], ["puppet", 148, 112, 0.5, 0, { nose: 10 }], ["axe", 40, 116, 0.4, -20]] },
    "The Cat and the Fox": { bg: "dusk", m: [["fox", 70, 92, 0.8, -6], ["cathead", 134, 98, 0.65, 6, { c: "#4a4a52", s: "#2b2b2b" }], ["coins", 102, 132, 0.4, 0]] },
    "The Talking Cricket": { bg: "meadow", m: [["cricket", 104, 104, 1.1, 0], ["candle", 156, 70, 0.45, 0]] },
    "The Whale": { bg: "sea", m: [["whale", 100, 102, 1.25, 0]] },
    "Crocodile": { bg: "sea", m: [["croc", 104, 104, 1.25, 0], ["watch", 150, 52, 0.45, 18]] },
    "Grandmother": { bg: "forest", m: [["cottage", 154, 86, 0.6, 0], F({ style: "bun", hair: "#e9e2d0", coat: "#8f5bb5", collar: "#fbf4e2" }), ["basket", 46, 118, 0.45, 0]] },
    "The Hunter": { bg: "forest", m: [F({ style: "beard", hair: "#6b3f1f", coat: "#4f7a3a" }), ["featherCap", 100, 60, 0.7, 0], ["axe", 154, 100, 0.7, 0]] },
    "The Prince (Mermaid)": { bg: "sea", m: [["ship", 152, 86, 0.55, 0], F({ style: "short", hair: "#2b2b2b", coat: "#fbf4e2", collar: "#c8312b" }), ["shell", 46, 122, 0.35, 0]] },
    "Sheriff of Nottingham": { bg: "castle", m: [F({ style: "beard", hair: "#2b2b2b", coat: "#5a3b6e", collar: "#e7b43a" }), ["coins", 156, 116, 0.6, 0], ["key", 46, 110, 0.4, -30]] },
    "Stepmother": { bg: "castle", m: [F({ style: "bun", hair: "#2b2b2b", coat: "#6c2a4a", collar: "#2b2b2b" }), ["tiara", 100, 66, 1, 0], ["scroll", 156, 104, 0.45, 8]] },
    "Prince Charming": { bg: "castle", m: [F({ style: "short", hair: "#e7b43a", coat: "#f4f1ea", collar: "#3f6fa8" }), ["slipper", 154, 116, 0.5, -10, { glass: true }], ["rose", 46, 104, 0.6, 0]] },
    "Princess Jasmine": { bg: "desert", m: [["castle", 160, 70, 0.5, 0, { c: "#f4e2c4", roof: "#e7b43a" }], F({ style: "long", hair: "#2b2b2b", coat: "#2f9f8a", collar: "#e7b43a" }), ["tiara", 100, 66, 1, 0]] },
    "Evil Sorcerer": { bg: "lair", m: [F({ style: "beard", hair: "#2b2b2b", coat: "#a8323a", collar: "#2b2b2b" }), ["witchhat", 100, 52, 0.7, 0, { c: "#2b2b2b", band: "#c8312b" }], ["smoke", 154, 90, 0.8, 0, { c: "#c8312b" }]] },
    "The Evil Fairy": { bg: "lair", m: [["horns", 100, 66, 1, 0], F({ style: "none", skin: "#cfe0c0", coat: "#2b2b2b" }), ["wand", 156, 92, 0.6, 0], ["smoke", 46, 100, 0.6, 0, { c: "#7cc46a" }]] },
    "The Evil Queen": { bg: "lair", m: [["mirror", 154, 88, 0.75, 0, { frame: "#c9922a", glass: "#5a6f86", face: true }], F({ style: "none", coat: "#5a3b6e", collar: "#c8312b" }), ["crown", 100, 60, 0.45, 0, { c: "#c9922a", gem: "#c8312b" }]] },
    "Snow White": { bg: "forest", m: [["apple", 150, 108, 0.6, 0], F({ style: "short", hair: "#1e1e1e", skin: "#f7e2cf", coat: "#c8312b", collar: "#fbf4e2" }), ["bowtie", 100, 60, 0.9, 0, { c: "#c8312b" }], ["bird", 50, 50, 1, 0]] },
    "Dorothy Gale": { bg: "oz", m: [["road", 100, 124, 1, 0], F({ style: "long", hair: "#6b3f1f", coat: "#5a8fc4", collar: "#fbf4e2" }), ["basket", 152, 114, 0.4, 0], ["slipper", 50, 128, 0.45, 0, { c: "#c2ccd4" }]] },
    "The Wizard of Oz": { bg: "oz", m: [["balloon", 154, 74, 0.65, 0], F({ style: "whitebeard", coat: "#3f8f4c", collar: "#e7b43a" }), ["tophat", 100, 54, 0.6, 0, { c: "#3f8f4c", c2: "#2f6b3c" }]] },
    "Queen of Hearts": { bg: "wonder", m: [["hearthcard", 48, 96, 0.8, -12], F({ style: "bun", hair: "#2b2b2b", coat: "#c8312b", collar: "#fbf4e2" }), ["crown", 100, 62, 0.45, 0, { gem: "#c8312b" }], ["heart", 156, 104, 0.6, 10]] },
    "Cheshire Cat": { bg: "night", m: [["cathead", 100, 82, 1.2, 0], ["catgrin", 100, 92, 0.9, 0]] },
    "Peter Pan": { bg: "night", m: [F({ style: "curly", hair: "#c9922a", coat: "#7a8a3a" }), ["leaf", 70, 108, 0.6, -20, { c: "#9ab84a" }], ["leaf", 128, 108, 0.6, 20, { c: "#9ab84a" }], ["fairy", 154, 60, 0.5, 0], ["star", 46, 40, 0.5, 0]] },
    "Captain Hook": { bg: "sea", m: [["ship", 46, 92, 0.5, 0, { sail: "#e9d6a8" }], F({ style: "long", hair: "#1e1e1e", coat: "#8a2b2b", collar: "#e7b43a" }), ["tricorn", 100, 58, 0.8, 0, { c: "#8a2b2b" }], ["hook", 156, 112, 0.6, 0]] },
    "Little Red Riding Hood": { bg: "forest", m: [["hood", 100, 96, 1.05, 0], ["basket", 156, 116, 0.5, 0], ["pine", 40, 90, 0.8, 0]] },
    "The Wolf": { bg: "night", m: [["wolf", 96, 90, 1.25, 0], ["pine", 170, 92, 0.8, 0]] },
    "King Triton": { bg: "under", m: [F({ style: "whitebeard", coat: "#2f9f8a" }), ["crown", 100, 58, 0.45, 0, { gem: "#2f9f8a" }], ["trident", 156, 86, 0.75, 8]] },
    "Little Mermaid": { bg: "under", m: [["tail", 100, 116, 0.65, 0, { c: "#4fbfa0" }], ["figure", 100, 76, 0.85, 0, { style: "long", hair: "#e7b43a", coat: "#d9a5c2" }], ["shell", 156, 120, 0.35, 0], ["goldfish", 44, 60, 0.7, 0]] },
    "Robin Hood": { bg: "forest", m: [F({ style: "short", hair: "#a8692f", coat: "#4f9a45" }), ["featherCap", 100, 60, 0.75, 0], ["bow", 154, 96, 0.75, 0]] },
    "Prince John": { bg: "castle", m: [["coins", 154, 116, 0.6, 0], F({ style: "short", hair: "#c98f4a", coat: "#5a3b6e", collar: "#e7b43a" }), ["crown", 100, 62, 0.5, -10]] },
    "Cinderella": { bg: "night", m: [["coach", 156, 92, 0.6, 0], F({ style: "bun", hair: "#e7b43a", coat: "#a9c9e8", collar: "#fbf4e2" }), ["slipper", 50, 124, 0.45, 0, { glass: true }], ["watch", 40, 46, 0.35, 0]] },
    "Rumpelstiltskin": { bg: "lair", m: [["wheel", 152, 96, 0.65, 0], F({ style: "beard", hair: "#a8692f", coat: "#6b5a2a" }), ["coins", 50, 120, 0.45, 0]] },
    "Puss in Boots": { bg: "village", m: [["cathead", 100, 70, 0.75, 0, { c: "#e8a24a", s: "#b5591a" }], ["boot", 76, 118, 0.5, 0, { feather: true }], ["boot", 124, 118, 0.5, 0], ["tophat", 100, 40, 0.5, -10, { c: "#3a3a3a", c2: "#2b2b2b" }]] },
    "Fairy Godmother": { bg: "night", m: [F({ style: "bun", hair: "#e9e2d0", coat: "#8fa8e0", collar: "#fbf4e2" }), ["wand", 154, 90, 0.7, 0], ["pumpkin", 48, 120, 0.45, 0]] },
    "Aladin": { bg: "desert", m: [["carpet", 100, 120, 0.9, 0], F({ style: "short", hair: "#2b2b2b", coat: "#8f5bb5" }), ["lamp", 160, 70, 0.45, 0]] },
    "Genie": { bg: "desert", m: [["lamp", 100, 124, 0.7, 0], ["smoke", 100, 92, 1, 0], ["figure", 112, 60, 0.6, 0, { style: "whitebeard", skin: "#c9a8e8", coat: "#8f5bb5" }], ["sparkles", 112, 60, 1, 0]] },
    "Belle": { bg: "study", m: [F({ style: "long", hair: "#6b3f1f", coat: "#e7b43a" }), ["book", 154, 116, 0.5, 0], ["rose", 48, 104, 0.6, 0, { dome: true }]] },
    "Beast": { bg: "castle", m: [["mane", 100, 78, 1.1, 0], ["horns", 100, 58, 0.9, 0], F({ style: "none", skin: "#a8692f", coat: "#3f6fa8", collar: "#e7b43a" }), ["rose", 156, 106, 0.5, 0, { dome: true }]] },
    "Princess Briar Rose": { bg: "forest", m: [["rose", 44, 108, 0.6, -10], ["rose", 160, 104, 0.6, 10, { c: "#d9467a" }], F({ style: "long", hair: "#e7b43a", coat: "#d9a5c2", collar: "#fbf4e2" }), ["tiara", 100, 66, 1, 0], ["wheel", 168, 54, 0.3, 0]] },

    // Items
    "Enchanted Sword": { bg: "castle", m: [["sword", 100, 74, 1.2, 0], ["sparkles", 100, 70, 1.2, 0]] },
    "Puss’s Boots": { bg: "village", m: [["boot", 80, 82, 1, -6, { feather: true }], ["boot", 126, 86, 1, 6]] },
    "whishing ring": { bg: "night", m: [["ring", 100, 76, 1.3, 0], ["sparkles", 100, 70, 1.3, 0]] },
    "Spellbook": { bg: "study", m: [["book", 100, 84, 1.3, 0, { c: "#2f5d8a" }], ["sparkles", 100, 50, 1, 0]] },
    "The Dwarves House": { bg: "forest", m: [["cottage", 100, 82, 1.2, 0, { roof: "#4f7a3a" }]] },
    "The Magic Mirror": { bg: "castle", m: [["mirror", 100, 76, 1.3, 0, { face: true }]] },
    "Poisoned Apple": { bg: "lair", m: [["apple", 100, 80, 1.5, 0], ["smoke", 140, 50, 0.6, 0, { c: "#7cc46a" }]] },
    "The Glass Coffin": { bg: "forest", m: [["coffin", 100, 76, 1.2, 0], ["rose", 100, 80, 0.4, 0]] },
    "Hot Air Balloon": { bg: "oz", m: [["balloon", 100, 72, 1.25, 0]] },
    "Mad Hatter's Hat": { bg: "wonder", m: [["tophat", 100, 80, 1.3, -8, { tag: true }]] },
    "Rabbit's Clock": { bg: "wonder", m: [["watch", 100, 76, 1.4, 0]] },
    "Bottle \"Drink Me\"": { bg: "wonder", m: [["bottle", 100, 76, 1.3, 0]] },
    "Long Bow": { bg: "forest", m: [["bow", 100, 76, 1.4, 0]] },
    "Horn of Sherwood": { bg: "forest", m: [["horn", 100, 80, 1.4, 0]] },
    "Pumpkin Carriage": { bg: "night", m: [["coach", 100, 80, 1.4, 0]] },
    "Magic Wand": { bg: "night", m: [["wand", 100, 80, 1.5, 0]] },
    "Sand Hourglass": { bg: "desert", m: [["hourglass", 100, 76, 1.4, 0]] },
    "Magic Carpet": { bg: "desert", m: [["carpet", 100, 76, 1.5, -6], ["sparkles", 100, 66, 1, 0]] },
    "Whispering Mirror": { bg: "night", m: [["mirror", 100, 76, 1.3, 0, { frame: "#c2ccd4", glass: "#8a9ed4", face: true }], ["ghost", 150, 60, 0.5, 0]] },
    "Spinning Wheel": { bg: "castle", m: [["wheel", 100, 82, 1.3, 0]] },
    "Basket of Treats": { bg: "forest", m: [["basket", 100, 86, 1.5, 0]] },
    "Fairy Dust": { bg: "night", m: [["pouch", 100, 88, 1.4, 0]] },
    "Seashell": { bg: "sea", m: [["shell", 100, 80, 1.4, 0], ["pearl", 100, 96, 1, 0]] },
    "\"Eat Me\" Cake": { bg: "wonder", m: [["cake", 100, 84, 1.5, 0]] },
    "The Crown of England": { bg: "castle", m: [["crown", 100, 78, 1.5, 0]] },
    "Glass Slipper": { bg: "castle", m: [["slipper", 100, 84, 1.5, 0, { glass: true }], ["sparkles", 100, 70, 1, 0]] },
    "Seven-League Boots": { bg: "village", m: [["boot", 100, 82, 1.2, 0, { c: "#5e3618", c2: "#8a5a2b" }], ["footprints", 156, 112, 0.8, 0]] },
    "Trident": { bg: "under", m: [["trident", 100, 76, 1.3, 0]] },
    "Magic Lamp": { bg: "desert", m: [["lamp", 100, 92, 1.4, 0], ["smoke", 110, 54, 0.6, 0]] },
    "Enchanted Rose": { bg: "castle", m: [["rose", 100, 78, 1.4, 0, { dome: true }]] },
    "Ruby Slippers": { bg: "oz", m: [["slipper", 80, 84, 1, 0, { c: "#c8312b", bow: "#7d1a18" }], ["slipper", 124, 96, 1, 0, { c: "#c8312b", bow: "#7d1a18" }], ["sparkles", 100, 66, 1, 0]] },
    "Magic Contract": { bg: "lair", m: [["scroll", 100, 76, 1.3, 0], ["quill", 150, 82, 0.6, 0]] },
    "Pirate Ship": { bg: "sea", m: [["ship", 100, 86, 1.4, 0]] },
    "Undersea Throne": { bg: "under", m: [["throne", 100, 84, 1.25, 0]] },
    "Crocodile's Clock": { bg: "sea", m: [["croc", 100, 106, 1, 0], ["watch", 100, 52, 0.8, 0]] },

    // Quests (landscape art)
    "The Midnight Ball": { bg: "night", m: [["castle", 100, 82, 1, 0], ["watch", 160, 40, 0.5, 0]] },
    "The Duel with Hook": { bg: "sea", m: [["ship", 100, 90, 1.1, 0], ["sword", 54, 70, 0.6, -30], ["hook", 150, 74, 0.6, 20]] },
    "Down the Rabbit Hole": { bg: "wonder", m: [["watch", 70, 70, 0.6, -20], ["bottle", 120, 64, 0.5, 18], ["cathead", 160, 44, 0.4, 0], ["hearthcard", 46, 110, 0.5, -12]] },
    "The Lost Voice": { bg: "under", m: [["shell", 100, 84, 1, 0], ["sparkles", 100, 50, 1, 0], ["tail", 156, 96, 0.45, 20]] },
    "The Glass Slipper Found": { bg: "castle", m: [["slipper", 100, 96, 1.2, 0, { glass: true }], ["sparkles", 100, 80, 1, 0]] },
    "Neverland": { bg: "night", m: [["star", 140, 40, 0.8, 0], ["star", 162, 52, 0.4, 0], ["ship", 70, 96, 0.8, 0, { sail: "#e9d6a8" }], ["fairy", 120, 76, 0.5, 0]] },
    "The Apple's Bite": { bg: "lair", m: [["apple", 100, 84, 1.3, 0]] },
    "The Yellow Brick Road": { bg: "oz", m: [["road", 90, 112, 1, 0], ["figure", 66, 94, 0.5, 0, { style: "long", hair: "#6b3f1f", coat: "#3f6fa8" }], ["strawhat", 114, 70, 0.4, 0], ["slipper", 116, 124, 0.35, 0, { c: "#c8312b" }]] },
    "Grandmother's Path": { bg: "forest", m: [["basket", 62, 116, 0.5, 0], ["wolf", 114, 100, 0.5, 0], ["cottage", 88, 56, 0.45, 0]] },
    "The Fairies’ Gift": { bg: "night", m: [["wand", 96, 92, 1.1, 0], ["star", 122, 52, 0.7, 0], ["star", 62, 60, 0.4, 0], ["sparkles", 100, 80, 1, 0]] },
    "The Hundred-Year Sleep": { bg: "night", m: [["castle", 88, 92, 0.65, 0], ["rose", 58, 124, 0.4, 0], ["moon", 118, 40, 0.45, 0]] },
    "The Marquis of Carabas": { bg: "village", m: [["cathead", 76, 98, 0.5, 0, { c: "#e8a24a", s: "#b5591a" }], ["tophat", 76, 64, 0.35, -10, { c: "#3a3a3a", c2: "#2b2b2b" }], ["coins", 118, 122, 0.45, 0], ["castle", 116, 56, 0.35, 0]] },
    "The Queen's Command": { bg: "wonder", m: [["crown", 100, 70, 0.9, 0, { gem: "#c8312b" }], ["cardsoldier", 50, 104, 0.55, 0], ["cardsoldier", 150, 104, 0.55, 0, { red: true }]] },
    "The House of Seven": { bg: "forest", m: [["cottage", 100, 88, 1.1, 0, { roof: "#4f7a3a" }], ["axe", 160, 110, 0.4, 0]] },
    "The King's Trident": { bg: "under", m: [["trident", 100, 78, 1.1, 0], ["crown", 150, 104, 0.35, 0]] },
    "The Hatter's Tea Party": { bg: "wonder", m: [["teacup", 70, 96, 0.8, 0], ["teacup", 130, 100, 0.7, 0], ["tophat", 100, 56, 0.6, -10, { tag: true }]] },
    "Second Star to the Right": { bg: "night", m: [["star", 130, 50, 1.1, 0], ["star", 80, 36, 0.45, 0], ["fairy", 60, 96, 0.6, 0]] },
    "The Pact with the Beast": { bg: "castle", m: [["rose", 100, 82, 1.1, 0, { dome: true }], ["horns", 100, 30, 0.7, 0]] },
    "The Enchanted Rose": { bg: "night", m: [["rose", 100, 80, 1.2, 0], ["sparkles", 100, 70, 1.4, 0]] },
    "Rob the Rich": { bg: "forest", m: [["coins", 80, 100, 1, 0], ["bow", 140, 80, 0.8, 0], ["mask", 60, 50, 0.5, 0]] },
    "The Rubbed Lamp": { bg: "desert", m: [["lamp", 100, 100, 1.1, 0], ["smoke", 110, 58, 0.7, 0], ["sparkles", 110, 50, 1, 0]] },
    "Arrow on Target": { bg: "meadow", m: [["bow", 60, 80, 0.8, 0], ["flag", 150, 90, 0.7, 0]] },
    "The Final Wish": { bg: "night", m: [["lamp", 80, 104, 0.7, 0], ["star", 140, 50, 0.9, 0], ["sparkles", 120, 70, 1.3, 0]] },
    "A Real Boy": { bg: "village", m: [["figure", 84, 104, 0.7, 0, { style: "short", hair: "#6b3f1f", coat: "#c8312b" }], ["puppet", 126, 118, 0.42, 0, { nose: 8 }], ["heart", 128, 52, 0.4, 0]] },
    "Once Upon a Time": { bg: "study", m: [["book", 100, 90, 1.3, 0, { c: "#8a3b3b" }], ["sparkles", 100, 56, 1.3, 0], ["castle", 100, 46, 0.35, 0]] },

    // Writers (emblems only)
    "Charles Perrault": { bg: "castle", m: [["book", 90, 100, 0.8, 0, { c: "#3f6fa8" }], ["slipper", 140, 66, 0.5, 0, { glass: true }], ["quill", 50, 62, 0.6, 0]] },
    "Brothers Grimm": { bg: "forest", m: [["tome", 76, 90, 0.8, -6, { c: "#4f7a3a" }], ["tome", 126, 90, 0.8, 6, { c: "#8a3b3b" }], ["apple", 100, 46, 0.4, 0]] },
    "Hans Christian Andersen": { bg: "sea", m: [["book", 100, 96, 0.8, 0, { c: "#2f5d8a" }], ["tail", 150, 70, 0.4, 0], ["quill", 52, 62, 0.6, 0]] },
    "Carlo Collodi": { bg: "village", m: [["book", 100, 96, 0.8, 0, { c: "#a8692f" }], ["tree", 150, 70, 0.5, 0], ["quill", 52, 62, 0.6, 0]] },
    "Lewis Carroll": { bg: "wonder", m: [["book", 100, 96, 0.8, 0, { c: "#c8312b" }], ["watch", 150, 60, 0.45, 0], ["quill", 52, 62, 0.6, 0]] },
    "J. M. Barrie": { bg: "night", m: [["book", 100, 96, 0.8, 0, { c: "#4f9a45" }], ["star", 150, 50, 0.6, 0], ["quill", 52, 62, 0.6, 0]] },
    "L. Frank Baum": { bg: "oz", m: [["book", 100, 96, 0.8, 0, { c: "#3f8f4c" }], ["road", 150, 70, 0.5, 0], ["quill", 52, 62, 0.6, 0]] },
    "Le Prince de Beaumont": { bg: "castle", m: [["book", 100, 96, 0.8, 0, { c: "#5a3b6e" }], ["rose", 150, 66, 0.5, 0, { dome: true }], ["quill", 52, 62, 0.6, 0]] },
  };

  let counter = 0;
  function art(name) {
    const scene = S[name] || { bg: "meadow", m: [["book", 100, 84, 1, 0]] };
    const uid = `a${(counter += 1)}`;
    const parts = scene.m
      .map(([motif, x, y, s = 1, r = 0, o]) => {
        const fn = M[motif];
        if (!fn) return "";
        return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${fn(o)}</g>`;
      })
      .join("");
    return `<svg class="card-art-svg" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${background(scene.bg, uid)}<g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${parts}</g></svg>`;
  }

  window.CardArt = { art, has: (name) => Boolean(S[name]), scenes: S };
})();
