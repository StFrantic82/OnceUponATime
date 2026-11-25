// Once Upon a Time — online rooms.
// The host's browser runs the game and publishes the table; guests send their moves.
// Transport: the Firebase Realtime Database of the Minikin City project (rooms "OUAT-xxxxx"),
// or, with ?local in the address, the browser's own storage (several tabs, for testing).
(function () {
  const FIREBASE = {
    apiKey: "AIzaSyBOxIm5M9ZCkU3ga4Lz-ngIstK58XorSXw",
    authDomain: "minikin-city.firebaseapp.com",
    databaseURL: "https://minikin-city-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "minikin-city",
    storageBucket: "minikin-city.firebasestorage.app",
    messagingSenderId: "174577196758",
    appId: "1:174577196758:web:4acdbe134c70a03b2db377",
  };
  const PREFIX = "OUAT-";
  const GITHUB_URL = "https://stfrantic82.github.io/OnceUponATime/";
  const FB = "10.12.2";
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`cannot load ${src}`));
      document.head.appendChild(s);
    });

  const NetFirebase = {
    async init() {
      if (this.ready) return;
      for (const m of ["app", "auth", "database"]) await loadScript(`https://www.gstatic.com/firebasejs/${FB}/firebase-${m}-compat.js`);
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE);
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
      await firebase.auth().signInAnonymously();
      this.db = firebase.database();
      this.ready = true;
    },
    set(path, value) {
      return this.db.ref(path).set(value);
    },
    async get(path) {
      return (await this.db.ref(path).get()).val();
    },
    push(path, value) {
      return this.db.ref(path).push(value);
    },
    on(path, cb) {
      const ref = this.db.ref(path);
      const handler = (snap) => cb(snap.val());
      ref.on("value", handler);
      return () => ref.off("value", handler);
    },
    remove(path) {
      return this.db.ref(path).remove();
    },
  };

  const NetLocal = {
    subs: [],
    async init() {
      if (this.ready) return;
      addEventListener("storage", (e) => {
        if (e.key && e.key.startsWith("ouat:")) this.fire(e.key.slice(5));
      });
      this.ready = true;
    },
    read(path) {
      const v = localStorage.getItem(`ouat:${path}`);
      if (v !== null) return JSON.parse(v);
      const pre = `ouat:${path}/`;
      const out = {};
      let any = false;
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k.startsWith(pre)) {
          const rest = k.slice(pre.length);
          if (!rest.includes("/")) {
            out[rest] = JSON.parse(localStorage.getItem(k));
            any = true;
          }
        }
      }
      return any ? out : null;
    },
    fire(path) {
      for (const s of this.subs) {
        if (path === s.path || path.startsWith(`${s.path}/`) || s.path.startsWith(`${path}/`)) s.cb(this.read(s.path));
      }
    },
    async set(path, value) {
      if (value === null) localStorage.removeItem(`ouat:${path}`);
      else localStorage.setItem(`ouat:${path}`, JSON.stringify(value));
      this.fire(path);
    },
    async get(path) {
      return this.read(path);
    },
    async push(path, value) {
      const key = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
      return this.set(`${path}/${key}`, value);
    },
    on(path, cb) {
      const s = { path, cb };
      this.subs.push(s);
      setTimeout(() => cb(this.read(path)), 0);
      return () => {
        this.subs = this.subs.filter((x) => x !== s);
      };
    },
    async remove(path) {
      const pre = `ouat:${path}`;
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const k = localStorage.key(i);
        if (k === pre || k.startsWith(`${pre}/`)) localStorage.removeItem(k);
      }
      this.fire(path);
    },
  };

  const localMode = /[?&]local\b/.test(location.search);
  const Net = localMode ? NetLocal : NetFirebase;

  // One player id per browser tab, kept across reloads of that tab.
  const pid = (() => {
    try {
      let p = sessionStorage.getItem("ouat-pid");
      if (!p) {
        p = `p${Math.random().toString(36).slice(2, 12)}`;
        sessionStorage.setItem("ouat-pid", p);
      }
      return p;
    } catch (e) {
      return `p${Math.random().toString(36).slice(2, 12)}`;
    }
  })();

  let room = null; // "OUAT-ABCDE"
  let unsubs = [];
  let isHost = false;
  let lastState = "";
  const seenMoves = new Set();

  const path = (sub = "") => `rooms/${room}${sub ? `/${sub}` : ""}`;
  const newCode = () => Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
  const cleanCode = (code) => String(code || "").toUpperCase().replace(/^OUAT-/, "").replace(/[^A-Z0-9]/g, "").slice(0, 5);
  const shareLink = () => `${location.origin}${location.pathname}?room=${room.slice(PREFIX.length)}${localMode ? "&local" : ""}`;

  function stopListening() {
    for (const u of unsubs) u();
    unsubs = [];
  }

  async function connect() {
    try {
      await Net.init();
      return true;
    } catch (error) {
      console.error(error);
      showError(t("errNet"), true);
      return false;
    }
  }

  function showError(message, withLink = false) {
    const box = $("#netmsg");
    if (!box) return;
    box.innerHTML = esc(message) + (withLink && !location.href.startsWith(GITHUB_URL) ? ` <a href="${GITHUB_URL}" target="_blank" rel="noopener">${esc(t("openGithub"))}</a>` : "");
  }

  // ---------- Create / join ----------
  async function create(name, settings) {
    showError(t("connecting"));
    if (!(await connect())) return;
    room = PREFIX + newCode();
    isHost = true;
    await Net.set(path("meta"), { host: pid, created: Date.now(), settings, started: false });
    await Net.set(path(`members/${pid}`), { name, joined: Date.now() });
    showError("");
    enterLobby();
  }

  async function join(code, name) {
    const c = cleanCode(code);
    if (c.length < 5) {
      showError(t("errNoRoom"));
      return;
    }
    showError(t("connecting"));
    if (!(await connect())) return;
    room = PREFIX + c;
    const meta = await Net.get(path("meta"));
    if (!meta) {
      showError(t("errNoRoom"));
      room = null;
      return;
    }
    isHost = meta.host === pid;
    const members = (await Net.get(path("members"))) || {};
    if (meta.started && !members[pid]) {
      showError(t("errStarted"));
      room = null;
      return;
    }
    if (!members[pid] && Object.keys(members).length >= 5) {
      showError(t("errFull"));
      room = null;
      return;
    }
    if (!members[pid]) await Net.set(path(`members/${pid}`), { name, joined: Date.now() });
    showError("");
    if (meta.started) startFollowing(meta);
    else enterLobby();
  }

  // ---------- Lobby ----------
  function enterLobby() {
    stopListening();
    window.Home?.showScreen("lobby");
    renderLobby({}, null);
    let meta = null;
    let members = {};
    unsubs.push(
      Net.on(path("meta"), (m) => {
        meta = m;
        if (!m) {
          leave(t("errClosed"));
          return;
        }
        if (m.started) {
          startFollowing(m);
          return;
        }
        renderLobby(members, meta);
      }),
    );
    unsubs.push(
      Net.on(path("members"), (m) => {
        members = m || {};
        renderLobby(members, meta);
      }),
    );
  }

  function renderLobby(members, meta) {
    const list = Object.entries(members).sort((a, b) => a[1].joined - b[1].joined);
    const s = meta?.settings || {};
    const total = Math.max(list.length, Number(s.players) || 2);
    const bots = Math.max(0, total - list.length);
    $("#lobbyCode").textContent = room ? room.slice(PREFIX.length) : "";
    $("#lobbyLink").value = room ? shareLink() : "";
    $("#lobbyMembers").innerHTML = list
      .map(([id, m]) => `<li>${esc(m.name)}${meta && id === meta.host ? ` <small>${esc(t("hostTag"))}</small>` : ""}${id === pid ? ` <small>${esc(t("youTag"))}</small>` : ""}</li>`)
      .join("") + Array.from({ length: bots }, () => `<li class="bot">${esc(t("computer"))}</li>`).join("");
    $("#lobbyInfo").textContent = s.players ? `${t("players")} ${total} · ${t("level")} ${t(s.level || "normal")} · ${t("roundsN", { n: s.rounds || 9 })}` : "";
    $("#lobbyStart").hidden = !isHost;
    $("#lobbyStart").disabled = list.length > 5;
    $("#lobbyWait").hidden = isHost;
  }

  async function startGame() {
    if (!isHost) return;
    const meta = await Net.get(path("meta"));
    const members = Object.entries((await Net.get(path("members"))) || {}).sort((a, b) => a[1].joined - b[1].joined);
    const players = Math.min(5, Math.max(members.length, Number(meta.settings.players) || 2));
    const botNames = t("botNames");
    const seats = members.map(([id, m]) => ({ name: m.name, kind: "human", uid: id }));
    while (seats.length < players) seats.push({ name: botNames[seats.length - members.length] || t("computer"), kind: "bot" });
    stopListening();
    becomeHost();
    Game.view.role = "host";
    Game.view.seat = seats.findIndex((s) => s.uid === pid);
    window.Home?.showScreen("game");
    Game.newGame({ ...meta.settings, players, tutorial: false }, seats);
    await Net.set(path("meta"), { ...meta, started: true });
  }

  // ---------- During the game ----------
  function becomeHost() {
    isHost = true;
    unsubs.push(
      Net.on(path("moves"), (moves) => {
        if (!moves) return;
        for (const [key, move] of Object.entries(moves)) {
          if (seenMoves.has(key)) continue;
          seenMoves.add(key);
          Net.remove(path(`moves/${key}`));
          const seat = Game.G.players.findIndex((p) => p.uid === move.pid);
          if (seat >= 0) Game.dispatch(seat, move.type, move.payload);
        }
      }),
    );
  }

  // Guests (and a host coming back after reloading) follow the published table.
  async function startFollowing(meta) {
    stopListening();
    if (meta.host === pid) {
      // The host reloaded: take the table back and carry on.
      const saved = await Net.get(path("state"));
      if (!saved) return;
      const snapshot = JSON.parse(saved);
      const seat = snapshot.players.findIndex((p) => p.uid === pid);
      becomeHost();
      Game.view.role = "host";
      window.Home?.showScreen("game");
      Game.loadSnapshot(snapshot, seat);
      if (snapshot.active !== null && snapshot.players[snapshot.active]?.kind === "bot") Bot.queueTurn(snapshot.active);
      return;
    }
    Game.view.role = "guest";
    window.Home?.showScreen("game");
    unsubs.push(
      Net.on(path("state"), (raw) => {
        if (!raw || raw === lastState) return;
        lastState = raw;
        const snapshot = JSON.parse(raw);
        const seat = snapshot.players.findIndex((p) => p.uid === pid);
        Game.loadSnapshot(snapshot, seat < 0 ? 0 : seat);
      }),
    );
  }

  let publishTimer = null;
  function publish(G) {
    if (!room || !isHost) return;
    clearTimeout(publishTimer);
    publishTimer = setTimeout(() => {
      const copy = { ...G, cur: 0, scoreShown: false, scoreShownLocal: false, recorded: {} };
      Net.set(path("state"), JSON.stringify(copy));
    }, 60);
  }

  function sendMove(type, payload) {
    if (!room) return;
    Net.push(path("moves"), { pid, type, payload: payload ?? null, ts: Date.now() });
  }

  async function leave(message) {
    stopListening();
    if (room && !isHost) await Net.remove(path(`members/${pid}`));
    if (room && isHost) {
      const meta = await Net.get(path("meta"));
      if (meta && !meta.started) await Net.remove(path());
    }
    room = null;
    isHost = false;
    Game.view.role = "solo";
    window.Home?.show();
    if (message) showError(message);
  }

  function bindLobby() {
    $("#lobbyStart").addEventListener("click", startGame);
    $("#lobbyLeave").addEventListener("click", () => leave());
    $("#lobbyCopy").addEventListener("click", async () => {
      const input = $("#lobbyLink");
      try {
        await navigator.clipboard.writeText(input.value);
      } catch (e) {
        input.select();
      }
      $("#lobbyCopy").textContent = t("copied");
      setTimeout(() => ($("#lobbyCopy").textContent = t("copyLink")), 1600);
    });
  }

  window.Online = {
    create,
    join,
    publish,
    sendMove,
    leave,
    get active() {
      return Boolean(room);
    },
    roomFromUrl() {
      const m = location.search.match(/[?&]room=([A-Za-z0-9-]+)/);
      return m ? cleanCode(m[1]) : "";
    },
  };
  bindLobby();
})();
