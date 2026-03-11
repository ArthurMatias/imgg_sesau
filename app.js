// ═══════════════════════════════════════════════════════════════
//  IMGG · SESAU Alagoas — JavaScript Principal
//  Inclui: Firebase, dados, lógica, renderização, gráficos, export
// ═══════════════════════════════════════════════════════════════

import { initializeApp }                                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ═══════════════════════════════════════════════════════════════
//  🔥 CONFIGURAÇÃO FIREBASE
//     Substitua pelos dados do seu projeto no Firebase Console
//     https://console.firebase.google.com → Configurações → Seus apps → Web
// ═══════════════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "SUA_API_KEY",
  authDomain:        "SEU_PROJETO.firebaseapp.com",
  projectId:         "SEU_PROJETO_ID",
  storageBucket:     "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ═══════════════════════════════════════════════════════════════
//  USUÁRIOS / SETORES
//  Crie esses e-mails no Firebase Authentication → Users
//  admin@sesau.al.gov.br tem acesso total ao painel ADM
// ═══════════════════════════════════════════════════════════════
const SETORES = [
  { id:"gab",  nome:"Gabinete",                     sigla:"GAB",  email:"gab@sesau.al.gov.br"  },
  { id:"daf",  nome:"Diretoria Adm. e Financeira",  sigla:"DAF",  email:"daf@sesau.al.gov.br"  },
  { id:"dge",  nome:"Gestão Estratégica",            sigla:"DGE",  email:"dge@sesau.al.gov.br"  },
  { id:"das",  nome:"Atenção à Saúde",               sigla:"DAS",  email:"das@sesau.al.gov.br"  },
  { id:"dvs",  nome:"Vigilância em Saúde",           sigla:"DVS",  email:"dvs@sesau.al.gov.br"  },
  { id:"dths", nome:"Gestão do Trabalho e Educação", sigla:"DTHS", email:"dths@sesau.al.gov.br" },
  { id:"dgti", nome:"Tecnologia da Informação",      sigla:"DGTI", email:"dgti@sesau.al.gov.br" },
  { id:"cge",  nome:"Controle e Gestão Estadual",    sigla:"CGE",  email:"cge@sesau.al.gov.br"  },
  { id:"pge",  nome:"Planejamento e Gestão",         sigla:"PGE",  email:"pge@sesau.al.gov.br"  },
  { id:"jur",  nome:"Assessoria Jurídica",           sigla:"JUR",  email:"jur@sesau.al.gov.br"  },
];

// ═══════════════════════════════════════════════════════════════
//  ESCALA 1–5
// ═══════════════════════════════════════════════════════════════
const ESCALA = [
  { valor:1, label:"Inexistente",        descricao:"Não há evidência de implementação",           cor:"#ef4444" },
  { valor:2, label:"Inicial",            descricao:"Esforços pontuais, sem sistematização",       cor:"#f97316" },
  { valor:3, label:"Em Desenvolvimento", descricao:"Parcialmente implementado, em estruturação",  cor:"#eab308" },
  { valor:4, label:"Gerenciado",         descricao:"Implementado e monitorado regularmente",      cor:"#22c55e" },
  { valor:5, label:"Otimizado",          descricao:"Excelência e melhoria contínua comprovada",   cor:"#06b6d4" },
];

// ═══════════════════════════════════════════════════════════════
//  DIMENSÕES E ALÍNEAS DO IMGG
// ═══════════════════════════════════════════════════════════════
const DIMENSOES = [
  { id:"D1", titulo:"Governança Institucional", icone:"⚖️", alineas:[
    { id:"D1a", texto:"O setor possui planejamento estratégico formal, documentado e atualizado?" },
    { id:"D1b", texto:"Existem metas e indicadores de desempenho definidos e monitorados regularmente?" },
    { id:"D1c", texto:"Os processos de tomada de decisão são formalizados e transparentes?" },
    { id:"D1d", texto:"Há mecanismos de prestação de contas e accountability implementados?" },
    { id:"D1e", texto:"O setor possui regimento interno ou normativa institucional atualizada?" },
  ]},
  { id:"D2", titulo:"Gestão de Processos", icone:"🔄", alineas:[
    { id:"D2a", texto:"Os processos de trabalho estão mapeados e documentados (fluxogramas, POPs)?" },
    { id:"D2b", texto:"Existem procedimentos para revisão e melhoria contínua dos processos?" },
    { id:"D2c", texto:"Os fluxos de informação entre setores são formalizados e eficientes?" },
    { id:"D2d", texto:"Há controle de versões e atualização periódica dos documentos normativos?" },
    { id:"D2e", texto:"Os processos críticos possuem planos de contingência definidos?" },
  ]},
  { id:"D3", titulo:"Gestão de Pessoas", icone:"👥", alineas:[
    { id:"D3a", texto:"Existe plano de capacitação alinhado às necessidades estratégicas do setor?" },
    { id:"D3b", texto:"São realizadas avaliações de desempenho dos servidores de forma sistemática?" },
    { id:"D3c", texto:"O dimensionamento da força de trabalho é monitorado e atualizado?" },
    { id:"D3d", texto:"Há programas de qualidade de vida e saúde do trabalhador implementados?" },
    { id:"D3e", texto:"Existe política de gestão do conhecimento e sucessão de funções críticas?" },
  ]},
  { id:"D4", titulo:"Gestão da Informação e TI", icone:"💻", alineas:[
    { id:"D4a", texto:"Os sistemas de informação utilizados são adequados às necessidades operacionais?" },
    { id:"D4b", texto:"Existem políticas de segurança da informação implementadas e disseminadas?" },
    { id:"D4c", texto:"Os dados produzidos são sistematizados e utilizados para tomada de decisão?" },
    { id:"D4d", texto:"Há rotinas de backup e plano de continuidade dos sistemas críticos?" },
    { id:"D4e", texto:"Os sistemas do setor são integrados entre si e com demais áreas da SESAU?" },
  ]},
  { id:"D5", titulo:"Gestão Financeira e Orçamentária", icone:"💰", alineas:[
    { id:"D5a", texto:"O planejamento orçamentário é alinhado ao planejamento estratégico?" },
    { id:"D5b", texto:"A execução orçamentária é monitorada com relatórios periódicos?" },
    { id:"D5c", texto:"Existem controles internos efetivos para prevenção de irregularidades?" },
    { id:"D5d", texto:"As prestações de contas são realizadas dentro dos prazos estabelecidos?" },
    { id:"D5e", texto:"Há análise de eficiência no uso dos recursos públicos disponíveis?" },
  ]},
  { id:"D6", titulo:"Maturidade Organizacional", icone:"🎯", alineas:[
    { id:"D6a", texto:"O setor possui cultura organizacional orientada a resultados e inovação?" },
    { id:"D6b", texto:"Há integração e comunicação efetiva com os demais setores da SESAU?" },
    { id:"D6c", texto:"São realizadas reuniões de alinhamento estratégico com periodicidade definida?" },
    { id:"D6d", texto:"O setor participa ativamente de processos de modernização institucional?" },
    { id:"D6e", texto:"Existe gestão de riscos formalizada e aplicada às atividades do setor?" },
  ]},
];

const TOTAL_ALINEAS = DIMENSOES.reduce((s, d) => s + d.alineas.length, 0);

// ═══════════════════════════════════════════════════════════════
//  ESTADO DA APLICAÇÃO
// ═══════════════════════════════════════════════════════════════
let currentUser     = null;
let currentSetorId  = null;
let isAdmin         = false;
let respostasSetor  = {};
let chartInstances  = {};

// ═══════════════════════════════════════════════════════════════
//  AUTH LISTENER
// ═══════════════════════════════════════════════════════════════
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    if (user.email === "admin@sesau.al.gov.br") {
      isAdmin = true;
      renderAdminShell();
      await renderAdminContent();
    } else {
      const setor = SETORES.find(s => s.email === user.email);
      if (setor) {
        isAdmin = false;
        currentSetorId = setor.id;
        await loadRespostas(setor.id);
        renderSetorShell(setor);
        renderForm();
      } else {
        await signOut(auth);
      }
    }
  } else {
    currentUser    = null;
    isAdmin        = false;
    currentSetorId = null;
    renderLogin();
  }
});

// ═══════════════════════════════════════════════════════════════
//  FIREBASE — CRUD
// ═══════════════════════════════════════════════════════════════
async function loadRespostas(id) {
  try {
    const snap = await getDoc(doc(db, "respostas", id));
    respostasSetor = snap.exists() ? (snap.data().respostas || {}) : {};
  } catch (e) {
    respostasSetor = {};
  }
}

async function saveResposta(setorId, alId, valor, obs) {
  respostasSetor[alId] = { valor, obs, ts: new Date().toISOString() };
  const valores = Object.values(respostasSetor);
  const total   = valores.length;
  const pts     = valores.reduce((a, r) => a + (r.valor || 0), 0);
  const imo     = total > 0 ? parseFloat(((pts / (total * 5)) * 100).toFixed(1)) : 0;
  await setDoc(doc(db, "respostas", setorId), {
    setorId,
    respostas:   respostasSetor,
    respondidas: total,
    imo,
    status: total === 0 ? "nao_iniciado" : total < TOTAL_ALINEAS ? "em_andamento" : "concluido",
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

async function submitForm(setorId) {
  const respondidas = Object.keys(respostasSetor).length;
  if (respondidas < TOTAL_ALINEAS) {
    toast(`Responda todas as ${TOTAL_ALINEAS} alíneas. (${respondidas}/${TOTAL_ALINEAS})`, "warn");
    return;
  }
  const pts = Object.values(respostasSetor).reduce((a, r) => a + (r.valor || 0), 0);
  const imo = parseFloat(((pts / (TOTAL_ALINEAS * 5)) * 100).toFixed(1));
  await setDoc(doc(db, "respostas", setorId), {
    setorId,
    respostas:   respostasSetor,
    respondidas: TOTAL_ALINEAS,
    imo,
    status:    "enviado",
    enviadoEm: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  toast("Avaliação enviada com sucesso! ✅", "success");
  renderForm();
}

async function loadAll() {
  const snap = await getDocs(collection(db, "respostas"));
  const result = {};
  snap.forEach(d => result[d.id] = d.data());
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════
function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div class="login-bg">
      <div class="orb orb1"></div>
      <div class="orb orb2"></div>
      <div class="login-card">
        <div class="login-brand">
          <div class="brand-seal">AL</div>
          <div class="brand-text">
            <span class="brand-org">Secretaria de Estado da Saúde · Alagoas</span>
            <span class="brand-name">IMGG</span>
            <span class="brand-full">Instrumento de Maturidade, Governança e Gestão</span>
          </div>
        </div>
        <div class="l-sep"></div>
        <div class="lf-group">
          <label>E-mail institucional</label>
          <input id="lEmail" type="email" placeholder="setor@sesau.al.gov.br" autocomplete="username"/>
        </div>
        <div class="lf-group">
          <label>Senha</label>
          <input id="lSenha" type="password" placeholder="••••••••" autocomplete="current-password"/>
        </div>
        <div id="lErr" class="l-err"></div>
        <button id="lBtn" class="btn-entrar">Acessar Sistema</button>
        <p class="l-footer">Sistema IMGG · SESAU/AL · 2025</p>
      </div>
    </div>`;

  document.getElementById("lBtn").addEventListener("click", doLogin);
  document.getElementById("lSenha").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
}

async function doLogin() {
  const email = document.getElementById("lEmail").value.trim();
  const senha = document.getElementById("lSenha").value;
  const btn   = document.getElementById("lBtn");
  const err   = document.getElementById("lErr");
  btn.textContent = "Entrando...";
  btn.disabled    = true;
  err.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    err.textContent  = "E-mail ou senha inválidos.";
    btn.textContent  = "Acessar Sistema";
    btn.disabled     = false;
  }
}

// ═══════════════════════════════════════════════════════════════
//  SETOR — SHELL
// ═══════════════════════════════════════════════════════════════
function renderSetorShell(setor) {
  document.getElementById("app").innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-l">
          <div class="tb-seal">AL</div>
          <div>
            <span class="tb-sys">IMGG · SESAU Alagoas</span>
            <span class="tb-sub">Instrumento de Maturidade, Governança e Gestão</span>
          </div>
        </div>
        <div class="topbar-r">
          <div class="tb-chip">${setor.sigla} — ${setor.nome}</div>
          <button class="btn-sair" id="btnSair">Sair</button>
        </div>
      </header>
      <div class="prog-strip"><div class="prog-fill" id="progFill"></div></div>
      <div class="prog-info" id="progInfo"></div>
      <main class="setor-main" id="sMain"></main>
    </div>`;

  document.getElementById("btnSair").addEventListener("click", () => signOut(auth));
}

// ═══════════════════════════════════════════════════════════════
//  SETOR — FORMULÁRIO
// ═══════════════════════════════════════════════════════════════
function renderForm() {
  const respondidas = Object.keys(respostasSetor).length;
  const pct         = Math.round((respondidas / TOTAL_ALINEAS) * 100);

  document.getElementById("progFill").style.width = pct + "%";
  document.getElementById("progInfo").innerHTML = `
    <span class="pi-num">${respondidas}<span class="pi-of">/${TOTAL_ALINEAS}</span></span>
    <span class="pi-lbl">alíneas respondidas</span>
    <span class="pi-pct">${pct}%</span>`;

  let html = `<div class="form-wrap">
    <div class="form-head">
      <h1 class="fh-title">Avaliação IMGG 2025</h1>
      <p class="fh-desc">Avalie cada alínea na escala de <strong>1 a 5</strong>. As respostas são salvas automaticamente após cada seleção.</p>
      <div class="esc-legend">
        ${ESCALA.map(e => `
          <div class="eld">
            <span class="eld-dot" style="background:${e.cor}">${e.valor}</span>
            <div>
              <span class="eld-lbl">${e.label}</span>
              <span class="eld-desc">${e.descricao}</span>
            </div>
          </div>`).join("")}
      </div>
    </div>`;

  DIMENSOES.forEach((dim, di) => {
    const respDim  = dim.alineas.filter(a => respostasSetor[a.id] !== undefined).length;
    const completa = respDim === dim.alineas.length;

    html += `
    <div class="dim-bloco${completa ? " dim-ok" : ""}">
      <div class="dim-hdr">
        <span class="dim-ico">${dim.icone}</span>
        <div class="dim-hdr-t">
          <span class="dim-cod">Dimensão ${di + 1}</span>
          <span class="dim-nome">${dim.titulo}</span>
        </div>
        <span class="dim-ct${completa ? " dc-ok" : ""}">${respDim}/${dim.alineas.length}</span>
      </div>
      <div class="alineas">`;

    dim.alineas.forEach((al, ai) => {
      const r   = respostasSetor[al.id];
      const val = r ? r.valor : null;
      const obs = r ? r.obs || "" : "";

      html += `
        <div class="alinea${val !== null ? " al-ok" : ""}" id="al-${al.id}">
          <div class="al-idx">${String.fromCharCode(65 + ai)}</div>
          <div class="al-body">
            <p class="al-txt">${al.texto}</p>
            <div class="al-esc">
              ${ESCALA.map(op => `
                <button class="eb${val === op.valor ? " eb-sel" : ""}"
                  style="${val === op.valor ? `background:${op.cor};border-color:${op.cor};color:#fff;` : ""}"
                  title="${op.descricao}"
                  data-alinea="${al.id}"
                  data-valor="${op.valor}">
                  <span class="eb-n">${op.valor}</span>
                  <span class="eb-l">${op.label}</span>
                </button>`).join("")}
            </div>
            ${val !== null ? `
            <input class="al-obs" type="text"
              placeholder="Observação ou evidência (opcional)"
              value="${obs}"
              id="obs-${al.id}"
              data-alinea="${al.id}" />` : ""}
          </div>
        </div>`;
    });

    html += `</div></div>`;
  });

  const faltam = TOTAL_ALINEAS - respondidas;
  html += `
    <div class="submit-zone">
      <button class="btn-submit${faltam > 0 ? " btn-sd" : ""}" id="btnSubmit" ${faltam > 0 ? "disabled" : ""}>
        ${faltam > 0 ? `Faltam ${faltam} alínea${faltam > 1 ? "s" : ""} para enviar` : "📤 Enviar Avaliação IMGG"}
      </button>
    </div>
  </div>`;

  document.getElementById("sMain").innerHTML = html;

  // Eventos — botões de escala
  document.querySelectorAll(".eb").forEach(btn => {
    btn.addEventListener("click", async () => {
      const alId  = btn.dataset.alinea;
      const valor = parseInt(btn.dataset.valor);
      const obs   = document.getElementById("obs-" + alId)?.value || "";
      const top   = (document.getElementById("al-" + alId)?.getBoundingClientRect().top || 0) + window.scrollY - 100;
      await saveResposta(currentSetorId, alId, valor, obs);
      renderForm();
      requestAnimationFrame(() => window.scrollTo({ top, behavior: "smooth" }));
    });
  });

  // Eventos — observações
  document.querySelectorAll(".al-obs").forEach(input => {
    input.addEventListener("blur", async () => {
      const alId = input.dataset.alinea;
      if (respostasSetor[alId]) {
        await saveResposta(currentSetorId, alId, respostasSetor[alId].valor, input.value);
      }
    });
  });

  // Evento — enviar
  document.getElementById("btnSubmit")?.addEventListener("click", () => submitForm(currentSetorId));
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — SHELL
// ═══════════════════════════════════════════════════════════════
function renderAdminShell() {
  document.getElementById("app").innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-l">
          <div class="tb-seal">AL</div>
          <div>
            <span class="tb-sys">IMGG · SESAU Alagoas</span>
            <span class="tb-sub">Painel Administrativo</span>
          </div>
        </div>
        <div class="topbar-r">
          <div class="tb-chip adm-chip">🔐 Administrador</div>
          <button class="btn-exp" id="btnXls">⬇ Excel</button>
          <button class="btn-exp" id="btnPdf">🖨 PDF</button>
          <button class="btn-sair" id="btnSair">Sair</button>
        </div>
      </header>
      <main class="admin-main" id="aMain">
        <div class="loading">⏳ Carregando dados do Firebase...</div>
      </main>
    </div>`;

  document.getElementById("btnSair").addEventListener("click", () => signOut(auth));
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — DASHBOARD
// ═══════════════════════════════════════════════════════════════
async function renderAdminContent() {
  const all  = await loadAll();
  const data = buildSetoresData(all);

  const enviados  = data.filter(s => s.status === "enviado").length;
  const emAnd     = data.filter(s => ["em_andamento","concluido"].includes(s.status)).length;
  const naoIn     = data.filter(s => s.status === "nao_iniciado").length;
  const mediaIMO  = parseFloat((data.reduce((a, s) => a + s.imo, 0) / data.length).toFixed(1));

  window._adminData = data;

  const html = `<div class="adm-wrap">
    <!-- KPIs -->
    <div class="kpi-row">
      <div class="kpi k-blue">  <div class="kv">${data.length}</div><div class="kl">Setores</div></div>
      <div class="kpi k-green"> <div class="kv">${enviados}</div>   <div class="kl">Enviados</div></div>
      <div class="kpi k-yellow"><div class="kv">${emAnd}</div>      <div class="kl">Em Andamento</div></div>
      <div class="kpi k-red">   <div class="kv">${naoIn}</div>      <div class="kl">Não Iniciados</div></div>
      <div class="kpi k-cyan">  <div class="kv">${mediaIMO}%</div>  <div class="kl">IMO Médio</div></div>
    </div>

    <!-- Gráficos -->
    <div class="charts-row">
      <div class="cc cc-bar">   <div class="cc-h">IMO por Setor (%)</div>          <canvas id="cBar"></canvas></div>
      <div class="cc cc-radar"> <div class="cc-h">Média por Dimensão</div>         <canvas id="cRadar"></canvas></div>
      <div class="cc cc-donut"> <div class="cc-h">Status das Avaliações</div>      <canvas id="cDonut"></canvas></div>
    </div>

    <!-- Grid de setores -->
    <div class="sec-hdr">
      <h2 class="sec-t">Setores</h2>
      <input class="s-search" id="sSearch" placeholder="🔍 Filtrar setor...">
    </div>
    <div class="setores-grid" id="setGrid">
      ${data.map(s => setorCardHtml(s)).join("")}
    </div>

    <!-- Análise por dimensão -->
    <h2 class="sec-t" style="margin:36px 0 14px">Desempenho Médio por Dimensão</h2>
    <div class="dim-analysis">
      ${DIMENSOES.map((dim, di) => {
        const med = parseFloat((data.reduce((a, s) => a + s.dimScores[di], 0) / data.length).toFixed(1));
        return `<div class="da-r">
          <span class="da-ico">${dim.icone}</span>
          <span class="da-nome">${dim.titulo}</span>
          <div class="da-bar"><div class="da-fill" style="width:${med}%;background:${imoColor(med)}"></div></div>
          <span class="da-pct" style="color:${imoColor(med)}">${med}%</span>
        </div>`;
      }).join("")}
    </div>

    <!-- Listagem completa -->
    <h2 class="sec-t" style="margin:36px 0 14px">Listagem Completa de Respostas</h2>
    <div class="listagem">
      ${data.filter(s => s.respondidas > 0).map(s => listItemHtml(s)).join("")}
    </div>
  </div>`;

  document.getElementById("aMain").innerHTML = html;

  // Gráficos
  requestAnimationFrame(() => {
    destroyCharts();
    renderChartBar(data);
    renderChartRadar(data);
    renderChartDonut(enviados, emAnd, naoIn);
  });

  // Eventos
  document.getElementById("sSearch").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".setor-card").forEach(c => {
      c.style.display = c.dataset.n.toLowerCase().includes(q) ? "" : "none";
    });
  });

  document.querySelectorAll(".setor-card").forEach(card => {
    card.addEventListener("click", () => {
      const s = data.find(x => x.id === card.dataset.id);
      if (s) renderDetalheSetor(s);
    });
  });

  document.getElementById("btnXls").addEventListener("click", () => exportXLS(data));
  document.getElementById("btnPdf").addEventListener("click", () => exportPDF(data));
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — DETALHE DE SETOR
// ═══════════════════════════════════════════════════════════════
function renderDetalheSetor(s) {
  const html = `<div class="adm-wrap">
    <button class="btn-back" id="btnBack">← Voltar ao Painel</button>
    <div class="det-hd">
      <div class="det-sig">${s.sigla}</div>
      <div>
        <h1 class="det-nome">${s.nome}</h1>
        <p class="det-sub">
          IMO: <strong style="color:${imoColor(s.imo)}">${s.imo}%</strong> ·
          ${s.respondidas}/${TOTAL_ALINEAS} alíneas ·
          <span class="${stCls(s.status)}">${stLbl(s.status)}</span>
        </p>
      </div>
    </div>

    <div class="charts-row" style="grid-template-columns:1.5fr 1fr">
      <div class="cc"><div class="cc-h">Desempenho por Dimensão (%)</div><canvas id="dBar"></canvas></div>
      <div class="cc"><div class="cc-h">Radar IMGG</div><canvas id="dRadar"></canvas></div>
    </div>

    ${DIMENSOES.map((dim, di) => {
      const med = s.dimScores[di];
      return `<div class="dim-det-card">
        <div class="ddc-hdr">
          <span>${dim.icone}</span>
          <span class="ddc-t">${dim.titulo}</span>
          <span class="ddc-m" style="color:${imoColor(med)}">${med}%</span>
        </div>
        <table class="rt">
          <thead><tr><th>Alínea</th><th>Nota</th><th>Nível</th><th>Observação</th></tr></thead>
          <tbody>
            ${dim.alineas.map(al => {
              const r  = s.resp[al.id];
              const op = r ? ESCALA.find(e => e.valor === r.valor) : null;
              return `<tr>
                <td class="rt-t">${al.texto}</td>
                <td class="rt-n">${op ? `<span class="nota-b" style="background:${op.cor}">${op.valor}</span>` : "—"}</td>
                <td>${op ? `<span style="color:${op.cor};font-weight:600;font-size:12px">${op.label}</span>` : '<span class="nr">Não resp.</span>'}</td>
                <td class="rt-o">${r?.obs || "—"}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
    }).join("")}
  </div>`;

  document.getElementById("aMain").innerHTML = html;

  document.getElementById("btnBack").addEventListener("click", () => {
    renderAdminShell();
    renderAdminContent();
  });

  requestAnimationFrame(() => {
    destroyCharts();
    const dp = s.dimScores;
    const labels = DIMENSOES.map(d => d.titulo.split(" ").slice(0, 2).join(" "));

    chartInstances.dBar = new Chart(document.getElementById("dBar"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ label:"(%)", data: dp,
          backgroundColor: dp.map(v => imoColorA(v, .75)),
          borderColor:     dp.map(v => imoColor(v)),
          borderWidth: 2, borderRadius: 8 }]
      },
      options: { responsive:true, plugins:{ legend:{ display:false } },
        scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback: v => v+"%" }, grid:{ color:"#f1f5f9" } } } }
    });

    chartInstances.dRadar = new Chart(document.getElementById("dRadar"), {
      type: "radar",
      data: {
        labels,
        datasets: [{ label: s.sigla, data: dp,
          backgroundColor: "rgba(6,182,212,.12)", borderColor: "#06b6d4",
          borderWidth: 2, pointBackgroundColor: "#06b6d4", pointRadius: 4 }]
      },
      options: { responsive:true,
        scales:{ r:{ beginAtZero:true, max:100, ticks:{ display:false }, grid:{ color:"#e2e8f0" } } },
        plugins:{ legend:{ display:false } } }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  GRÁFICOS
// ═══════════════════════════════════════════════════════════════
function renderChartBar(data) {
  chartInstances.bar = new Chart(document.getElementById("cBar"), {
    type: "bar",
    data: {
      labels: data.map(s => s.sigla),
      datasets: [{
        label: "IMO (%)",
        data:  data.map(s => s.imo),
        backgroundColor: data.map(s => imoColorA(s.imo, .75)),
        borderColor:     data.map(s => imoColor(s.imo)),
        borderWidth: 2, borderRadius: 8,
      }]
    },
    options: { responsive:true, plugins:{ legend:{ display:false } },
      scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback: v => v+"%" }, grid:{ color:"#f1f5f9" } } } }
  });
}

function renderChartRadar(data) {
  const dm = DIMENSOES.map((_, di) =>
    parseFloat((data.reduce((a, s) => a + s.dimScores[di], 0) / data.length).toFixed(1))
  );
  chartInstances.radar = new Chart(document.getElementById("cRadar"), {
    type: "radar",
    data: {
      labels: DIMENSOES.map(d => d.titulo.split(" ").slice(0, 2).join(" ")),
      datasets: [{
        label: "Média",
        data: dm,
        backgroundColor: "rgba(6,182,212,.12)",
        borderColor: "#06b6d4",
        borderWidth: 2,
        pointBackgroundColor: "#06b6d4",
        pointRadius: 4,
      }]
    },
    options: { responsive:true,
      scales:{ r:{ beginAtZero:true, max:100, ticks:{ display:false }, grid:{ color:"#e2e8f0" } } },
      plugins:{ legend:{ display:false } } }
  });
}

function renderChartDonut(enviados, emAnd, naoIn) {
  chartInstances.donut = new Chart(document.getElementById("cDonut"), {
    type: "doughnut",
    data: {
      labels: ["Enviado", "Em Andamento", "Não Iniciado"],
      datasets: [{
        data: [enviados, emAnd, naoIn],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderWidth: 3, borderColor: "#fff",
      }]
    },
    options: { responsive:true, cutout:"62%",
      plugins:{ legend:{ position:"bottom", labels:{ boxWidth:12, font:{ size:11 }, padding:12 } } } }
  });
}

function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
  chartInstances = {};
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS DE HTML
// ═══════════════════════════════════════════════════════════════
function setorCardHtml(s) {
  const pct = Math.round((s.respondidas / TOTAL_ALINEAS) * 100);
  return `<div class="setor-card" data-id="${s.id}" data-n="${s.nome}">
    <div class="sc-top">
      <span class="sc-sig">${s.sigla}</span>
      <span class="${stCls(s.status)}">${stLbl(s.status)}</span>
    </div>
    <div class="sc-nome">${s.nome}</div>
    <div class="sc-prog">
      <div class="sc-bar"><div class="sc-fill" style="width:${pct}%"></div></div>
      <span>${s.respondidas}/${TOTAL_ALINEAS} · ${pct}%</span>
    </div>
    <div class="sc-imo">
      <span class="sc-iml">Índice de Maturidade Org.</span>
      <span class="sc-imv" style="color:${imoColor(s.imo)}">${s.imo}%</span>
    </div>
  </div>`;
}

function listItemHtml(s) {
  return `<details class="ls-det">
    <summary class="ls-sum">
      <span class="ls-sig">${s.sigla}</span>
      <span class="ls-nome">${s.nome}</span>
      <span class="ls-imo" style="color:${imoColor(s.imo)}">${s.imo}% IMO</span>
      <span class="${stCls(s.status)}">${stLbl(s.status)}</span>
    </summary>
    <div class="ls-body">
      ${DIMENSOES.map(dim => `
        <div class="ls-dim">
          <div class="ls-dh">${dim.icone} ${dim.titulo}</div>
          <table class="rt">
            <thead><tr><th>Alínea</th><th>Nota</th><th>Nível</th><th>Observação</th></tr></thead>
            <tbody>
              ${dim.alineas.map(al => {
                const r  = s.resp[al.id];
                const op = r ? ESCALA.find(e => e.valor === r.valor) : null;
                return `<tr>
                  <td class="rt-t">${al.texto}</td>
                  <td class="rt-n">${op ? `<span class="nota-b" style="background:${op.cor}">${op.valor}</span>` : "—"}</td>
                  <td>${op ? `<span style="color:${op.cor};font-weight:600;font-size:12px">${op.label}</span>` : '<span class="nr">—</span>'}</td>
                  <td class="rt-o">${r?.obs || "—"}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`).join("")}
    </div>
  </details>`;
}

// ═══════════════════════════════════════════════════════════════
//  DADOS CALCULADOS DOS SETORES
// ═══════════════════════════════════════════════════════════════
function buildSetoresData(all) {
  return SETORES.map(s => {
    const d          = all[s.id] || {};
    const resp       = d.respostas || {};
    const respondidas= Object.keys(resp).length;
    const pts        = Object.values(resp).reduce((a, r) => a + (r.valor || 0), 0);
    const imo        = respondidas > 0 ? parseFloat(((pts / (respondidas * 5)) * 100).toFixed(1)) : 0;
    const status     = d.status || "nao_iniciado";
    const dimScores  = DIMENSOES.map(dim => {
      const sum = dim.alineas.reduce((a, al) => a + (resp[al.id]?.valor || 0), 0);
      return respondidas > 0 ? parseFloat(((sum / (dim.alineas.length * 5)) * 100).toFixed(1)) : 0;
    });
    return { ...s, resp, respondidas, pts, imo, status, dimScores };
  });
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT EXCEL (CSV com BOM UTF-8)
// ═══════════════════════════════════════════════════════════════
function exportXLS(data) {
  // Cabeçalho
  let csv = "Setor;Sigla;Status;IMO (%)";
  DIMENSOES.forEach(dim => dim.alineas.forEach(al => { csv += `;${al.id}`; }));
  csv += "\n";

  // Linhas
  data.forEach(s => {
    csv += `"${s.nome}";${s.sigla};"${stLbl(s.status)}";${s.imo}`;
    DIMENSOES.forEach(dim => dim.alineas.forEach(al => {
      csv += `;${s.resp[al.id] ? s.resp[al.id].valor : ""}`;
    }));
    csv += "\n";
  });

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = "IMGG_SESAU_AL_" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
  toast("Arquivo CSV/Excel exportado! ✅", "success");
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT PDF (janela de impressão do browser)
// ═══════════════════════════════════════════════════════════════
function exportPDF(data) {
  const w = window.open("", "_blank");

  const linhasResumo = data.map(s => `
    <tr>
      <td>${s.nome}</td>
      <td>${s.sigla}</td>
      <td>${s.respondidas}/${TOTAL_ALINEAS}</td>
      <td class="nota">${s.imo}%</td>
      <td><span class="badge ${s.status === "enviado" ? "env" : ["em_andamento","concluido"].includes(s.status) ? "and" : "nao"}">
        ${stLbl(s.status)}
      </span></td>
    </tr>`).join("");

  const detalheSetores = data.filter(s => s.respondidas > 0).map(s => `
    <h2>${s.sigla} — ${s.nome} &nbsp;|&nbsp; IMO: ${s.imo}%</h2>
    ${DIMENSOES.map(dim => `
      <h3>${dim.icone} ${dim.titulo}</h3>
      <table>
        <thead><tr><th style="width:52%">Alínea</th><th>Nota</th><th>Nível</th><th>Observação</th></tr></thead>
        <tbody>
          ${dim.alineas.map(al => {
            const r  = s.resp[al.id];
            const op = r ? ESCALA.find(e => e.valor === r.valor) : null;
            return `<tr>
              <td>${al.texto}</td>
              <td style="text-align:center;font-weight:700">${r ? r.valor : "—"}</td>
              <td>${op ? op.label : "Não respondida"}</td>
              <td>${r?.obs || "—"}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`).join("")}
  `).join("");

  w.document.write(`<!DOCTYPE html>
  <html><head><meta charset="UTF-8"><title>IMGG SESAU-AL</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1a202c; padding: 20px; }
    h1   { color: #003d7a; font-size: 18px; margin-bottom: 4px; }
    h2   { color: #003d7a; font-size: 13px; margin: 24px 0 6px; border-bottom: 2px solid #003d7a; padding-bottom: 4px; }
    h3   { font-size: 11px; color: #374151; margin: 14px 0 4px; padding: 4px 8px; background: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
    th    { background: #003d7a; color: white; padding: 5px 8px; text-align: left; }
    td    { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .nota  { font-weight: 700; font-size: 12px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; }
    .env   { background: #d1fae5; color: #065f46; }
    .and   { background: #fef3c7; color: #92400e; }
    .nao   { background: #fee2e2; color: #991b1b; }
    @page  { margin: 1.5cm; }
  </style></head>
  <body>
    <h1>IMGG — Instrumento de Maturidade, Governança e Gestão</h1>
    <p>SESAU · Alagoas · Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
    <h2>Resumo Geral por Setor</h2>
    <table>
      <thead><tr><th>Setor</th><th>Sigla</th><th>Respondidas</th><th>IMO (%)</th><th>Status</th></tr></thead>
      <tbody>${linhasResumo}</tbody>
    </table>
    ${detalheSetores}
  </body></html>`);

  w.document.close();
  setTimeout(() => w.print(), 700);
  toast("Janela de impressão/PDF aberta! 🖨", "success");
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS GERAIS
// ═══════════════════════════════════════════════════════════════
function imoColor(p) {
  if (p >= 80) return "#06b6d4";
  if (p >= 60) return "#22c55e";
  if (p >= 40) return "#eab308";
  if (p >= 20) return "#f97316";
  return "#ef4444";
}

function imoColorA(p, a) {
  const c = imoColor(p);
  const r = parseInt(c.slice(1,3), 16);
  const g = parseInt(c.slice(3,5), 16);
  const b = parseInt(c.slice(5,7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function stCls(s) {
  if (s === "enviado") return "b-green";
  if (["em_andamento","concluido"].includes(s)) return "b-yellow";
  return "b-red";
}

function stLbl(s) {
  return { enviado:"Enviado", em_andamento:"Em Andamento", concluido:"Concluído", nao_iniciado:"Não Iniciado" }[s] || "Não Iniciado";
}

function toast(msg, type = "info") {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className   = `toast t-${type} show`;
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.className = "toast", 3500);
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => renderLogin());
