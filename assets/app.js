// Static viewer for the Tianyige dataset: hash routes #/ (records), #/v/<tianyige_id> (one record), #/about.
// Loads volumes.json and pages/<id>.jsonl from the repo, so it runs on GitHub Pages or any static server.
const app = document.getElementById("app");
let volumes = null;
const state = { q: "", level: "", province: "", from: "", to: "", sort: "western_year", dir: 1 };

const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return n;
};

async function loadVolumes() {
  if (!volumes) volumes = await (await fetch("volumes.json")).json();
  return volumes;
}

function levelShort(l) { return l.split(" ")[0]; }

async function renderList() {
  const vols = await loadVolumes();
  const provinces = [...new Set(vols.map(v => v.province_en).filter(Boolean))].sort();
  const totalPages = vols.reduce((s, v) => s + +v.nonblank, 0), totalTr = vols.reduce((s, v) => s + v.translated, 0);
  const tbody = el("tbody");
  const count = el("span", { class: "muted" });
  const cols = [["western_year", "Year"], ["title", "Title"], ["exam_level", "Level"], ["province_en", "Province"],
                ["pages", "Pages"], ["comment_pages", "Pages with comments"], ["translated", "Translated"]];
  const draw = () => {
    const q = state.q.trim().toLowerCase();
    let rows = vols.filter(v =>
      (!q || [v.title, v.province, v.province_en, v.reign_era, v.reign_era_pinyin, v.tianyige_id].join(" ").toLowerCase().includes(q)) &&
      (!state.level || v.exam_level.startsWith(state.level)) && (!state.province || v.province_en === state.province) &&
      (!state.from || +v.western_year >= +state.from) && (!state.to || +v.western_year <= +state.to));
    const key = state.sort, num = ["western_year", "pages", "comment_pages", "translated"].includes(key);
    rows.sort((a, b) => state.dir * (num ? (+a[key] - +b[key]) : String(a[key]).localeCompare(String(b[key]))));
    tbody.replaceChildren(...rows.map(v => {
      const pct = v.nonblank ? v.translated / v.nonblank : 0;
      return el("tr", {},
        el("td", {}, v.western_year), el("td", { class: "title" }, el("a", { href: `#/v/${v.tianyige_id}` }, v.title)),
        el("td", {}, levelShort(v.exam_level) + (v.military === "yes" ? " (military)" : "")), el("td", {}, v.province_en || "—"),
        el("td", {}, v.pages), el("td", {}, v.comment_pages),
        el("td", { title: `${v.translated}/${v.nonblank} pages` }, el("span", { class: "bar" }, el("i", { style: `width:${Math.round(pct * 100)}%` })), ` ${Math.round(pct * 100)}%`));
    }));
    count.textContent = `${rows.length} of ${vols.length} records`;
  };
  const input = (type, key, attrs = {}) => el("input", { type, value: state[key], oninput: e => { state[key] = e.target.value; draw(); }, ...attrs });
  const select = (key, label, options) => el("select", { onchange: e => { state[key] = e.target.value; draw(); } },
    el("option", { value: "" }, label), ...options.map(([v, t]) => { const o = el("option", { value: v }, t); if (state[key] === v) o.selected = true; return o; }));
  app.replaceChildren(
    el("p", {}, `312 printed records of Ming civil-service examinations (1371–1684): ${totalPages.toLocaleString()} pages of text, `,
      totalTr >= totalPages ? "all punctuated and translated into English. " : `${totalTr.toLocaleString()} translated into English so far. `,
      "Choose a record to read it page by page alongside the scans."),
    el("div", { class: "filters" },
      input("search", "q", { placeholder: "Search title, province, reign…" }),
      select("level", "All levels", [["provincial", "Provincial (鄉試)"], ["metropolitan", "Metropolitan (會試)"], ["palace", "Palace (殿試)"]]),
      select("province", "All provinces", provinces.map(p => [p, p])),
      input("number", "from", { placeholder: "From", min: 1368, max: 1700 }), input("number", "to", { placeholder: "To", min: 1368, max: 1700 }),
      count),
    el("div", { class: "table-wrap" }, el("table", {},
      el("thead", {}, el("tr", {}, ...cols.map(([k, t]) => el("th", { onclick: () => { state.dir = state.sort === k ? -state.dir : 1; state.sort = k; draw(); } }, t)))),
      tbody)));
  draw();
}

async function renderVolume(id) {
  const vols = await loadVolumes();
  const v = vols.find(x => x.tianyige_id === id);
  if (!v) { app.replaceChildren(el("p", {}, "Record not found. ", el("a", { href: "#/" }, "Back to records"))); return; }
  app.replaceChildren(el("p", { class: "muted" }, "Loading pages…"));
  const text = await (await fetch(`pages/${id}.jsonl`)).text();
  const pages = text.trim().split("\n").map(l => JSON.parse(l));
  const opts = { vertical: localStorage.getItem("vertical") === "1", showRaw: true, showPunct: true, showEn: true };
  try { Object.assign(opts, JSON.parse(localStorage.getItem("viewOpts") || "{}")); } catch (e) {}
  const list = el("div");
  const draw = () => {
    try { localStorage.setItem("viewOpts", JSON.stringify(opts)); } catch (e) {}
    list.replaceChildren(...pages.map(p => {
      const head = el("h3", {}, `Page ${p.page}`, p.banxin.length ? el("span", { class: "leaf" }, p.banxin.join(" · ")) : null,
        el("a", { href: p.scan_url, target: "_blank", rel: "noopener" }, "View scan ↗"));
      if (p.blank) return el("div", { class: "page", id: `p${p.page}` }, head, el("p", { class: "blank" }, "Blank page or cover."));
      const cols = [];
      if (opts.showRaw) cols.push(el("div", { class: "col" }, el("h4", {}, "Transcription"), el("pre", { class: "zh" + (opts.vertical ? " vertical" : "") }, p.text)));
      if (opts.showPunct) cols.push(el("div", { class: "col" }, el("h4", {}, "Punctuated"), p.punctuated ? el("pre", { class: "zh" }, p.punctuated) : el("p", { class: "blank" }, "Not yet processed.")));
      if (opts.showEn) cols.push(el("div", { class: "col" }, el("h4", {}, "English"), p.translation_en ? el("pre", { class: "en" }, p.translation_en) : el("p", { class: "blank" }, "Not yet translated.")));
      const alt = p.alt_text ? el("details", {}, el("summary", {}, `Second reading by ${p.alt_ocr_model}` + (p.agreement != null ? ` — ${Math.round(p.agreement * 1000) / 10}% agreement` : "")),
        el("pre", { class: "zh" + (opts.vertical ? " vertical" : "") }, p.alt_text)) : null;
      return el("div", { class: "page", id: `p${p.page}` }, head, el("div", { class: "cols" }, cols), alt,
        el("p", { class: "muted", style: "font-size:12px;margin:6px 0 0" }, `OCR: ${p.ocr_model}` + (p.translation_model ? ` · translation: ${p.translation_model}` : "")));
    }));
  };
  const docsView = el("div");
  let docs = null;
  const TYPE_NAMES = { title: "Title", heading: "Heading", preface: "Preface 序", postface: "Postface 後序", edict: "Edict",
    officials: "Officials", procedure: "Procedure", question: "Question", graduate_entry: "Graduate", model_answer: "Model answer",
    other: "Other" };
  const showDocs = async () => {
    if (!docs) {
      const r = await fetch(`documents/${id}.jsonl`);
      docs = r.ok ? (await r.text()).trim().split("\n").map(l => JSON.parse(l)) : [];
    }
    if (!docs.length) { docsView.replaceChildren(el("p", { class: "blank" }, "This record hasn't been split into documents yet.")); return; }
    const byId = Object.fromEntries(docs.map(d => [d.id, d]));
    const pageLinks = d => el("span", { class: "muted" }, ` pp. ${d.pages[0]}${d.pages.length > 1 ? "–" + d.pages[d.pages.length - 1] : ""} `,
      el("a", { href: d.scan_url, target: "_blank", rel: "noopener" }, "scan ↗"));
    const grads = docs.filter(d => d.type === "graduate_entry");
    const rest = docs.filter(d => d.type !== "graduate_entry");
    const card = d => {
      const tag = [d.subject, d.number != null ? `#${d.number}` : null, d.session ? `session ${d.session}` : null].filter(Boolean).join(" · ");
      const head = el("h3", {}, TYPE_NAMES[d.type] || d.type, tag ? el("span", { class: "leaf" }, tag) : null,
        d.label ? el("span", { class: "leaf" }, d.label) : null, pageLinks(d));
      if (d.type !== "model_answer") return el("div", { class: "page", id: d.id }, head, el("pre", { class: "zh" }, d.text));
      const q = d.question_id && byId[d.question_id];
      return el("div", { class: "page", id: d.id }, head,
        el("p", {}, d.candidate ? `Candidate: ${d.candidate}` : "Candidate not named", d.rank ? ` (rank ${d.rank})` : "",
          q ? el("span", {}, " · answers ", el("a", { href: `#/v/${id}`, onclick: e => { e.preventDefault(); document.getElementById(q.id)?.scrollIntoView(); } }, q.text.slice(0, 24) + "…")) : null),
        d.comments.length ? el("div", {}, el("h4", {}, "Examiners' comments"),
          ...d.comments.map(c => el("p", { class: "zh", style: "margin:2px 0" }, el("b", {}, `${c.role || ""} ${c.name || ""} ${c.office || ""}　`), c.text))) : null,
        el("h4", {}, "Essay"), el("pre", { class: "zh" }, d.text || "(no essay text)"));
    };
    docsView.replaceChildren(
      el("p", { class: "muted" }, `${docs.length} documents: ${rest.filter(d => d.type === "question").length} questions, ` +
        `${rest.filter(d => d.type === "model_answer").length} model answers, ${grads.length} graduates.`),
      ...rest.map(card),
      grads.length ? el("details", {}, el("summary", {}, `Graduates (${grads.length})`),
        el("div", { class: "table-wrap" }, el("table", {}, el("thead", {}, el("tr", {}, ...["Tier", "Rank", "Name", "Entry"].map(h => el("th", {}, h)))),
          el("tbody", {}, ...grads.map(g => el("tr", {}, el("td", {}, g.label || ""), el("td", {}, g.rank ?? ""), el("td", { class: "title" }, g.name || ""),
            el("td", { class: "title" }, g.text))))))) : null);
  };
  const mode = el("select", { onchange: e => { const docsMode = e.target.value === "docs"; list.hidden = docsMode; docsView.hidden = !docsMode;
      pageOpts.style.display = docsMode ? "none" : "flex"; if (docsMode) showDocs(); } },
    el("option", { value: "pages" }, "View: pages"), el("option", { value: "docs" }, "View: documents"));
  docsView.hidden = true;
  const toggle = (key, label) => { const c = el("input", { type: "checkbox", onchange: e => { opts[key] = e.target.checked; draw(); } }); c.checked = opts[key]; return el("label", {}, c, ` ${label}`); };
  const jump = el("input", { type: "number", min: 1, max: pages.length, placeholder: "Go to page", style: "width:110px",
    onchange: e => document.getElementById(`p${e.target.value}`)?.scrollIntoView() });
  const pageOpts = el("span", { style: "display:flex;flex-wrap:wrap;gap:12px;align-items:center" },
    toggle("showRaw", "Transcription"), toggle("showPunct", "Punctuated"), toggle("showEn", "English"),
    toggle("vertical", "Vertical columns, as printed"), jump);
  app.replaceChildren(
    el("div", { class: "vol-head" }, el("p", {}, el("a", { href: "#/" }, "← All records")), el("h1", {}, v.title),
      el("p", { class: "meta" }, `${v.western_year} · ${v.reign_era_pinyin} ${v.reign_year} · ${v.exam_level}` + (v.province_en ? ` · ${v.province_en}` : "") +
        ` · ${v.pages} pages · Tianyige ${v.tianyige_id} · ${v.edition_notes} · `, el("a", { href: v.commons_page, target: "_blank", rel: "noopener" }, "Scans on Wikimedia Commons ↗"))),
    el("div", { class: "toolbar" }, mode, pageOpts),
    list, docsView);
  draw();
}

async function renderAbout() {
  const md = await (await fetch("README.md")).text();
  const body = md.replace(/^---[\s\S]*?---\s*/, "");  // drop the Hugging Face front matter
  const div = el("div", { class: "about" });
  div.innerHTML = window.marked ? marked.parse(body) : `<pre>${body.replace(/[&<]/g, c => ({ "&": "&amp;", "<": "&lt;" })[c])}</pre>`;
  // In-page links like [中文](#中文說明) would collide with the hash router, so scroll to the heading instead.
  div.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").startsWith("#/")) return;
    e.preventDefault();
    const target = decodeURIComponent(a.getAttribute("href").slice(1)).toLowerCase();
    [...div.querySelectorAll("h1,h2,h3")].find(h => h.textContent.trim().toLowerCase() === target)?.scrollIntoView();
  });
  app.replaceChildren(div);
}

function route() {
  const h = location.hash.replace(/^#/, "") || "/";
  const m = h.match(/^\/v\/(\d+)/);
  window.scrollTo(0, 0);
  (m ? renderVolume(m[1]) : h.startsWith("/about") ? renderAbout() : renderList()).catch(err => {
    app.replaceChildren(el("p", {}, `Could not load data (${err.message}). If you opened this file directly, serve the folder instead: `),
      el("pre", {}, "python3 -m http.server 8000   # then open http://localhost:8000"));
  });
}
window.addEventListener("hashchange", route);
route();
