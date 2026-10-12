const $ = (id) => document.getElementById(id);
let currentFilter = "";
 
const SAMPLES = {
  s1: "SHOCKING!!! You won't believe what this politician said. The media is hiding the truth from you. Share this before they delete it! Unbelievable lies exposed.",
  s2: "WASHINGTON - The Senate committee on Tuesday approved a budget bill after officials said the measure would fund federal agencies through the end of the fiscal year, according to a statement.",
};
 
/* ---------- Theme ---------- */
try {
  const saved = localStorage.getItem("fnd_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
} catch (e) {}
$("theme").onclick = () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("fnd_theme", next); } catch (e) {}
};
 
/* ---------- Analyze ---------- */
async function analyze() {
  const text = $("txt").value.trim();
  $("err").style.display = "none";
  $("result").style.display = "none";
  if (text.length < 20) return showError("Please enter at least 20 characters.");
 
  $("go").disabled = true;
  $("load").style.display = "flex";
  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || "Server error");
    showResult(d);
    refresh();
  } catch (e) {
    showError("Error: " + e.message);
  }
  $("load").style.display = "none";
  $("go").disabled = false;
}
 
function showError(msg) {
  $("err").textContent = msg;
  $("err").style.display = "block";
}
 
function showResult(d) {
  const real = d.prediction === "Real";
  const box = $("result");
  box.className = "result " + (real ? "real" : "fake");
  box.style.display = "block";
  $("badge").textContent = real ? "✅ REAL NEWS" : "🚨 FAKE NEWS";
  $("conf").textContent = d.confidence + "%";
  $("pRealT").textContent = d.prob_real + "%";
  $("pFakeT").textContent = d.prob_fake + "%";
  $("fill").style.width = "0";
  $("pReal").style.width = "0";
  $("pFake").style.width = "0";
  setTimeout(() => {
    $("fill").style.width = d.confidence + "%";
    $("pReal").style.width = d.prob_real + "%";
    $("pFake").style.width = d.prob_fake + "%";
  }, 50);
  $("chips").innerHTML = "";
  d.top_words.forEach((w) => {
    const c = document.createElement("span");
    c.className = "chip " + w.points_to;
    c.textContent = w.word;
    $("chips").appendChild(c);
  });
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
 
/* ---------- History + stats ---------- */
async function loadHistory() {
  const rows = await (await fetch("/history?filter=" + currentFilter)).json();
  const tb = $("hist");
  tb.innerHTML = "";
  if (!rows.length) {
    tb.innerHTML = '<tr><td colspan="6" class="empty">No checks yet.</td></tr>';
    return;
  }
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    const cells = [
      r.id,
      r.news_text.length > 80 ? r.news_text.slice(0, 80) + "..." : r.news_text,
    ];
    cells.forEach((v) => {
      const td = document.createElement("td");
      td.textContent = v;
      tr.appendChild(td);
    });
    const tdTag = document.createElement("td");
    const tag = document.createElement("span");
    tag.className = "tag " + r.prediction;
    tag.textContent = r.prediction;
    tdTag.appendChild(tag);
    tr.appendChild(tdTag);
    const tdConf = document.createElement("td");
    tdConf.textContent = r.confidence_score + "%";
    tr.appendChild(tdConf);
    const tdTime = document.createElement("td");
    tdTime.textContent = r.created_at;
    tr.appendChild(tdTime);
    const tdDel = document.createElement("td");
    const del = document.createElement("button");
    del.className = "del";
    del.title = "Delete";
    del.textContent = "🗑";
    del.onclick = async () => {
      await fetch("/delete/" + r.id, { method: "DELETE" });
      refresh();
    };
    tdDel.appendChild(del);
    tr.appendChild(tdDel);
    tb.appendChild(tr);
  });
}
 
async function loadStats() {
  const s = await (await fetch("/stats")).json();
  $("sTotal").textContent = s.total;
  $("sReal").textContent = s.real;
  $("sFake").textContent = s.fake;
  const pct = s.total ? Math.round((s.real / s.total) * 100) : 0;
  $("donutT").textContent = pct + "%";
  $("donut").style.background = s.total
    ? `conic-gradient(var(--real) 0 ${pct}%, var(--fake) ${pct}% 100%)`
    : "conic-gradient(var(--track) 0 100%)";
}
 
function refresh() {
  loadHistory();
  loadStats();
}
 
/* ---------- Events ---------- */
$("go").onclick = analyze;
$("clr").onclick = () => {
  $("txt").value = "";
  $("cnt").textContent = "0 characters";
  $("result").style.display = "none";
  $("err").style.display = "none";
};
$("txt").oninput = () => ($("cnt").textContent = $("txt").value.length + " characters");
$("s1").onclick = () => { $("txt").value = SAMPLES.s1; $("txt").oninput(); };
$("s2").onclick = () => { $("txt").value = SAMPLES.s2; $("txt").oninput(); };
$("clh").onclick = async () => {
  if (!confirm("Delete all history?")) return;
  await fetch("/clear", { method: "POST" });
  refresh();
};
document.querySelectorAll(".tab").forEach((t) => {
  t.onclick = () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    currentFilter = t.dataset.f;
    loadHistory();
  };
});
 
refresh();
 