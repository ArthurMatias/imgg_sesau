// ═══════════════════════════════════════════════════════════════
//  IMGG · SESAU Alagoas — JavaScript Principal
//  v6.0 — Avaliação por Ano · Sim/Não · Anexo Base64
// ═══════════════════════════════════════════════════════════════

import { initializeApp }                                          from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyD3PY7HHBf5dg4x4zjisdPGYxkEHjrWo5Y",
  authDomain:        "imgg-sesau-al.firebaseapp.com",
  projectId:         "imgg-sesau-al",
  storageBucket:     "imgg-sesau-al.firebasestorage.app",
  messagingSenderId: "81348552662",
  appId:             "1:81348552662:web:d9489832435c39bb12e677",
  measurementId:     "G-53NXG9J5CN"
};
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const ADMIN_EMAIL    = "assessoriatransparenciasesau@gmail.com";
const ADMIN_SETOR_ID = "asset";

const SETORES = [
  { id:"asset",   nome:"Assessoria Executiva da Transparência",                  sigla:"ASSET",   email:"assessoriatransparenciasesau@gmail.com" },
  { id:"ascom",   nome:"Assessoria de Comunicação",                              sigla:"ASCOM",   email:"ascom@sesau.al.gov.br"    },
  { id:"getin",   nome:"Gerência Executiva de Tecnologia da Informação",         sigla:"GETIN",   email:"getin@sesau.al.gov.br"    },
  { id:"suaf",    nome:"Superintendência de Assistência Farmacêutica",           sigla:"SUAF",    email:"suaf@sesau.al.gov.br"     },
  { id:"ces",     nome:"Conselho Estadual de Saúde",                             sigla:"CES",     email:"ces@sesau.al.gov.br"      },
  { id:"suapae",  nome:"Secretaria Executiva de Ações Estratégicas",             sigla:"SUAPAE",  email:"suapae@sesau.al.gov.br"   },
  { id:"suplag",  nome:"SUPLAG",                                                 sigla:"SUPLAG",  email:"suplag@sesau.al.gov.br"   },
  { id:"suah",    nome:"Atenção Especializada Ambulatorial e Hospitalar",        sigla:"SUAH",    email:"suah@sesau.al.gov.br"     },
  { id:"supad",   nome:"Superintendência Administrativa",                        sigla:"SUPAD",   email:"supad@sesau.al.gov.br"    },
  { id:"gov",     nome:"Governança",                                             sigla:"GOV",     email:"gov@sesau.al.gov.br"      },
  { id:"sevisa",  nome:"Secretaria Executiva de Vigilância em Saúde",            sigla:"SEVISA",  email:"sevisa@sesau.al.gov.br"   },
  { id:"gaest",   nome:"Gerência de Ações Estratégicas",                         sigla:"GAEST",   email:"gaest@sesau.al.gov.br"    },
  { id:"supofc",  nome:"Superintendência de Planejamento, Orçamento, Finanças e Contabilidade", sigla:"SUPOFC", email:"supofc@sesau.al.gov.br" },
  { id:"supvp",   nome:"Superintendência de Valorização de Pessoas",             sigla:"SUPVP",   email:"supvp@sesau.al.gov.br"    },
  { id:"tft",     nome:"Tratamento Fora de Domicílio",                           sigla:"TFT",     email:"tft@sesau.al.gov.br"      },
];

// ─── Chave Firestore: respostas são isoladas por ano
//     Coleção: "respostas_YYYY" → documento: setorId
//     Config de anos: doc(db, "config", "anos") → { anos: [{ano, ativo, label}] }

const DIMENSOES_PADRAO = [
  { id:"D1", titulo:"Governança", icone:"🏛️", alineas:[
    { id:"D1a", texto:"1. Promover a avaliação das prioridades considerando as competências regimentais ou a missão da instituição." },
    { id:"D1b", texto:"2. Promover a avaliação dos resultados alcançados considerando as competências regimentais ou a missão da instituição." },
    { id:"D1c", texto:"3. Assegurar a tomada de decisão com base em informações alinhadas às diretrizes de governo." },
    { id:"D1d", texto:"4. Assegurar a tomada de decisão com base em informações alinhadas ao interesse público." },
    { id:"D1e", texto:"5. Promover o monitoramento do desempenho institucional com foco nos resultados estratégicos ou nas prioridades estabelecidas." },
    { id:"D1f", texto:"6. Promover a divulgação do desempenho institucional com foco nos resultados estratégicos ou nas prioridades estabelecidas." },
    { id:"D1g", texto:"7. Disponibilizar dados e informações para subsidiar o processo decisório." },
    { id:"D1h", texto:"8. Assegurar a realização periódica de cópias de segurança (backups), senhas de acesso, entre outras práticas de segurança dos sistemas de informação." },
    { id:"D1i", texto:"9. Promover a edição ou atualização da Carta de Serviços ao Cidadão." },
    { id:"D1j", texto:"10. Promover o comportamento ético em relação aos compromissos assumidos." },
    { id:"D1k", texto:"11. Promover a identificação dos principais riscos." },
    { id:"D1l", texto:"12. Promover a divulgação dos principais riscos." },
  ]},
  { id:"D2", titulo:"Estratégias e Planos", icone:"🗺️", alineas:[
    { id:"D2a", texto:"Os processos de trabalho estão mapeados e documentados (fluxogramas, POPs)?" },
    { id:"D2b", texto:"Existem procedimentos para revisão e melhoria contínua dos processos?" },
    { id:"D2c", texto:"Os fluxos de informação entre setores são formalizados e eficientes?" },
    { id:"D2d", texto:"Há controle de versões e atualização periódica dos documentos normativos?" },
    { id:"D2e", texto:"Os processos críticos possuem planos de contingência definidos?" },
  ]},
  { id:"D3", titulo:"Público Alvo", icone:"🎯", alineas:[
    { id:"D3a", texto:"Existe plano de capacitação alinhado às necessidades estratégicas do setor?" },
    { id:"D3b", texto:"São realizadas avaliações de desempenho dos servidores de forma sistemática?" },
    { id:"D3c", texto:"O dimensionamento da força de trabalho é monitorado e atualizado?" },
    { id:"D3d", texto:"Há programas de qualidade de vida e saúde do trabalhador implementados?" },
    { id:"D3e", texto:"Existe política de gestão do conhecimento e sucessão de funções críticas?" },
  ]},
  { id:"D4", titulo:"Sustentabilidade", icone:"♻️", alineas:[
    { id:"D4a", texto:"Os sistemas de informação utilizados são adequados às necessidades operacionais?" },
    { id:"D4b", texto:"Existem políticas de segurança da informação implementadas e disseminadas?" },
    { id:"D4c", texto:"Os dados produzidos são sistematizados e utilizados para tomada de decisão?" },
    { id:"D4d", texto:"Há rotinas de backup e plano de continuidade dos sistemas críticos?" },
    { id:"D4e", texto:"Os sistemas do setor são integrados entre si e com demais áreas da SESAU?" },
  ]},
  { id:"D5", titulo:"Capital Intelectual", icone:"🧠", alineas:[
    { id:"D5a", texto:"O planejamento orçamentário é alinhado ao planejamento estratégico?" },
    { id:"D5b", texto:"A execução orçamentária é monitorada com relatórios periódicos?" },
    { id:"D5c", texto:"Existem controles internos efetivos para prevenção de irregularidades?" },
    { id:"D5d", texto:"As prestações de contas são realizadas dentro dos prazos estabelecidos?" },
    { id:"D5e", texto:"Há análise de eficiência no uso dos recursos públicos disponíveis?" },
  ]},
  { id:"D6", titulo:"Processos", icone:"⚙️", alineas:[
    { id:"D6a", texto:"O setor possui cultura organizacional orientada a resultados e inovação?" },
    { id:"D6b", texto:"Há integração e comunicação efetiva com os demais setores da SESAU?" },
    { id:"D6c", texto:"São realizadas reuniões de alinhamento estratégico com periodicidade definida?" },
    { id:"D6d", texto:"O setor participa ativamente de processos de modernização institucional?" },
    { id:"D6e", texto:"Existe gestão de riscos formalizada e aplicada às atividades do setor?" },
  ]},
  { id:"D7", titulo:"Valor Público", icone:"⭐", alineas:[
    { id:"D7a", texto:"O setor possui cultura organizacional orientada a resultados e inovação?" },
    { id:"D7b", texto:"Há integração e comunicação efetiva com os demais setores da SESAU?" },
    { id:"D7c", texto:"São realizadas reuniões de alinhamento estratégico com periodicidade definida?" },
    { id:"D7d", texto:"O setor participa ativamente de processos de modernização institucional?" },
    { id:"D7e", texto:"Existe gestão de riscos formalizada e aplicada às atividades do setor?" },
  ]},
];

// ─── Estado global ──────────────────────────────────────────────
let DIMENSOES      = JSON.parse(JSON.stringify(DIMENSOES_PADRAO));
let TOTAL_ALINEAS  = DIMENSOES.reduce((s,d)=>s+d.alineas.length,0);
let setorConfig    = {};
let currentUser    = null;
let currentSetorId = null;
let isAdmin        = false;
let adminMode      = true;
let respostasSetor = {};
let pmggSetor      = [];  // array de planos de melhoria do setor no ano
let chartInstances = {};
let adminTab       = "dashboard";

// ─── ANOS ───────────────────────────────────────────────────────
let anosDisponiveis = [];   // [{ ano: "2025", ativo: true }, ...]
let anoSelecionado  = "";   // ano em uso no momento (setor e admin)

// Coleção Firestore por ano: "respostas_2025", "respostas_2026", etc.
function colRespostas(ano) { return `respostas_${ano}`; }

// ─── Helpers ────────────────────────────────────────────────────
function isRespondida(r) {
  return r && r.continuidade !== null && r.continuidade !== undefined
           && r.adequacao    !== null && r.adequacao    !== undefined;
}

function calcIMO(respostas, total) {
  const maxPts = total * 2;
  if (maxPts === 0) return 0;
  let pts = 0;
  Object.values(respostas).forEach(r => {
    if (r.continuidade === "sim") pts++;
    if (r.adequacao    === "sim") pts++;
  });
  return parseFloat(((pts / maxPts) * 100).toFixed(1));
}

// ─── Anos — Firebase ────────────────────────────────────────────
async function loadAnos() {
  try {
    const snap = await getDoc(doc(db, "config", "anos"));
    if (snap.exists() && snap.data().anos?.length) {
      anosDisponiveis = snap.data().anos;
    } else {
      // Primeira vez: cria o ano corrente como padrão
      const anoAtual = String(new Date().getFullYear());
      anosDisponiveis = [{ ano: anoAtual, ativo: true }];
      await saveAnos();
    }
  } catch(e) {
    const anoAtual = String(new Date().getFullYear());
    anosDisponiveis = [{ ano: anoAtual, ativo: true }];
    console.warn("loadAnos:", e.message);
  }
  // Define o ano selecionado: último ano ativo, ou o mais recente
  const ativos = anosDisponiveis.filter(a => a.ativo);
  anoSelecionado = ativos.length
    ? ativos[ativos.length - 1].ano
    : anosDisponiveis[anosDisponiveis.length - 1].ano;
}

async function saveAnos() {
  await setDoc(doc(db, "config", "anos"), { anos: anosDisponiveis, updatedAt: serverTimestamp() });
}

// ─── Dimensões / Config ─────────────────────────────────────────
function getDimensoesParaSetor(setorId) {
  const cfg = setorConfig[setorId];
  if (!cfg || !cfg.alineasAtivas || cfg.alineasAtivas.length === 0) return DIMENSOES;
  const ativas = new Set(cfg.alineasAtivas);
  return DIMENSOES
    .map(dim => ({ ...dim, alineas: dim.alineas.filter(al => ativas.has(al.id)) }))
    .filter(dim => dim.alineas.length > 0);
}

function getTotalAlineasParaSetor(setorId) {
  return getDimensoesParaSetor(setorId).reduce((s,d)=>s+d.alineas.length,0);
}

async function loadDimensoesConfig() {
  try {
    const snap = await getDoc(doc(db,"config","dimensoes"));
    if (snap.exists() && snap.data().dimensoes) {
      DIMENSOES = snap.data().dimensoes;
      TOTAL_ALINEAS = DIMENSOES.reduce((s,d)=>s+d.alineas.length,0);
    }
  } catch(e) { console.warn("loadDimensoesConfig:", e.message); }
}

async function saveDimensoesConfig(dims) {
  await setDoc(doc(db,"config","dimensoes"),{dimensoes:dims,updatedAt:serverTimestamp()});
  DIMENSOES = dims;
  TOTAL_ALINEAS = DIMENSOES.reduce((s,d)=>s+d.alineas.length,0);
}

async function loadSetorConfig() {
  try {
    const snap = await getDoc(doc(db,"config","setorAlineas"));
    if (snap.exists()) setorConfig = snap.data().setores || {};
  } catch(e) { setorConfig = {}; console.warn("loadSetorConfig:", e.message); }
}

async function saveSetorConfig() {
  await setDoc(doc(db,"config","setorAlineas"),{setores:setorConfig,updatedAt:serverTimestamp()});
}

// ─── Respostas (por ano) ─────────────────────────────────────────
async function loadRespostas(setorId) {
  try {
    const snap = await getDoc(doc(db, colRespostas(anoSelecionado), setorId));
    respostasSetor = snap.exists() ? (snap.data().respostas || {}) : {};
  } catch(e) { respostasSetor = {}; }
}


// ─── PMGG — Plano de Melhoria (por ano, por setor) ───────────────
function colPMGG(ano) { return `pmgg_${ano}`; }

async function loadPMGG(setorId) {
  try {
    const snap = await getDoc(doc(db, colPMGG(anoSelecionado), setorId));
    pmggSetor = snap.exists() ? (snap.data().planos || []) : [];
  } catch(e) { pmggSetor = []; }
}

async function savePMGG(setorId) {
  try {
    await setDoc(doc(db, colPMGG(anoSelecionado), setorId), {
      setorId, ano: anoSelecionado,
      planos: pmggSetor,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch(e) {
    toast("Erro ao salvar PMGG: " + e.message, "warn");
    console.error("savePMGG:", e);
  }
}

async function saveResposta(setorId, alId, campo, valor) {
  if (!respostasSetor[alId]) respostasSetor[alId] = { continuidade:null, adequacao:null, obs:"", anexos:[], ts: new Date().toISOString() };
  respostasSetor[alId][campo] = valor;
  respostasSetor[alId].ts = new Date().toISOString();

  const total      = getTotalAlineasParaSetor(setorId);
  const respondidas = Object.values(respostasSetor).filter(r => isRespondida(r)).length;
  const imo        = calcIMO(respostasSetor, total);

  try {
    await setDoc(doc(db, colRespostas(anoSelecionado), setorId), {
      setorId, ano: anoSelecionado, respostas: respostasSetor, respondidas, imo,
      status: respondidas===0 ? "nao_iniciado" : respondidas < total ? "em_andamento" : "concluido",
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch(e) {
    toast("Erro ao salvar: " + e.message + " — Verifique as regras do Firestore.", "warn");
    console.error("saveResposta:", e);
  }
}

async function submitForm(setorId) {
  const total      = getTotalAlineasParaSetor(setorId);
  const respondidas = Object.values(respostasSetor).filter(r => isRespondida(r)).length;
  if (respondidas < total) { toast(`Responda todas as ${total} alíneas. (${respondidas}/${total})`,"warn"); return; }
  const imo = calcIMO(respostasSetor, total);
  // Verifica se o ano está ativo
  const anoObj = anosDisponiveis.find(a => a.ano === anoSelecionado);
  if (!anoObj?.ativo) { toast("Este ano está encerrado e não aceita mais respostas.","warn"); return; }
  try {
    await setDoc(doc(db, colRespostas(anoSelecionado), setorId), {
      setorId, ano: anoSelecionado, respostas: respostasSetor, respondidas: total, imo,
      status: "enviado", enviadoEm: serverTimestamp(), updatedAt: serverTimestamp(),
    }, { merge: true });
    toast("Avaliação enviada com sucesso! ✅","success");
    renderForm();
  } catch(e) {
    toast("Erro ao enviar: " + e.message + " — Verifique as regras do Firestore.", "warn");
    console.error("submitForm:", e);
  }
}

async function loadAll() {
  const snap = await getDocs(collection(db, colRespostas(anoSelecionado)));
  const result = {};
  snap.forEach(d => result[d.id] = d.data());
  return result;
}

// ─── Auth ───────────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  await loadDimensoesConfig();
  await loadSetorConfig();
  await loadAnos();
  if (user) {
    currentUser = user;
    if (user.email === ADMIN_EMAIL) {
      isAdmin = true; adminMode = true; adminTab = "dashboard";
      renderAdminShell();
      await renderAdminContent();
    } else {
      const setor = SETORES.find(s => s.email === user.email);
      if (setor) {
        isAdmin = false; currentSetorId = setor.id;
        await loadRespostas(setor.id);
        await loadPMGG(setor.id);
        renderSetorShell(setor);
        renderForm();
      } else { await signOut(auth); }
    }
  } else {
    currentUser=null; isAdmin=false; currentSetorId=null; adminMode=true;
    renderLogin();
  }
});

// ─── Login ──────────────────────────────────────────────────────
function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div class="login-bg">
      <div class="orb orb1"></div><div class="orb orb2"></div>
      <div class="login-card">
        <div class="login-brand">
          <img src="governo-de-alagoas-sem-fundo.png" alt="Governo de Alagoas" class="brand-logo"/>
          <div class="brand-text">
            <span class="brand-org">Secretaria de Estado da Saúde · Alagoas</span>
            <span class="brand-name">IMGG</span>
            <span class="brand-full">Instrumento de Maturidade, Governança e Gestão</span>
          </div>
        </div>
        <div class="l-sep"></div>
        <div class="lf-group"><label>E-mail institucional</label>
          <input id="lEmail" type="email" placeholder="setor@sesau.al.gov.br" autocomplete="username"/></div>
        <div class="lf-group"><label>Senha</label>
          <input id="lSenha" type="password" placeholder="••••••••" autocomplete="current-password"/></div>
        <div id="lErr" class="l-err"></div>
        <button id="lBtn" class="btn-entrar">Acessar Sistema</button>
        <p class="l-footer">Sistema IMGG · SESAU/AL · 2025</p>
      </div>
    </div>`;
  document.getElementById("lBtn").addEventListener("click", doLogin);
  document.getElementById("lSenha").addEventListener("keydown", e=>{ if(e.key==="Enter") doLogin(); });
}

async function doLogin() {
  const email = document.getElementById("lEmail").value.trim();
  const senha = document.getElementById("lSenha").value;
  const btn   = document.getElementById("lBtn"), err = document.getElementById("lErr");
  btn.textContent="Entrando..."; btn.disabled=true; err.textContent="";
  try { await signInWithEmailAndPassword(auth, email, senha); }
  catch(e) { err.textContent="E-mail ou senha inválidos."; btn.textContent="Acessar Sistema"; btn.disabled=false; }
}

// ─── Seletor de ano (HTML reutilizável) ─────────────────────────
function anoSeletorHtml(somenteLeitura = false) {
  const ativos = anosDisponiveis.filter(a => a.ativo);
  const lista  = somenteLeitura ? anosDisponiveis : ativos;
  if (lista.length <= 1 && somenteLeitura) {
    // admin com 1 ano: mostra mesmo assim para poder gerenciar
  }
  return `<div class="ano-selector">
    <span class="ano-label">📅 Ano</span>
    <div class="ano-btns" id="anoBtns">
      ${lista.map(a => `
        <button class="ano-btn${a.ano === anoSelecionado ? " ano-ativo" : ""}${!a.ativo ? " ano-encerrado" : ""}"
          data-ano="${a.ano}">
          ${a.ano}${!a.ativo ? " 🔒" : ""}
        </button>`).join("")}
    </div>
  </div>`;
}

function bindAnoSeletor(onMudanca) {
  document.querySelectorAll(".ano-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (btn.dataset.ano === anoSelecionado) return;
      anoSelecionado = btn.dataset.ano;
      document.querySelectorAll(".ano-btn").forEach(b => {
        b.classList.toggle("ano-ativo", b.dataset.ano === anoSelecionado);
      });
      await onMudanca();
    });
  });
}

// ─── Shell Setor ─────────────────────────────────────────────────
function renderSetorShell(setor, isAdminToggled = false) {
  const anoAtual = anosDisponiveis.find(a => a.ano === anoSelecionado);
  const soLeitura = anoAtual && !anoAtual.ativo;
  // Setor só vê anos ativos
  const anosVisiveis = anosDisponiveis.filter(a => a.ativo);

  document.getElementById("app").innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-l">
          <img src="governo-de-alagoas-sem-fundo.png" alt="Governo de Alagoas" class="tb-logo"/>
          <div><span class="tb-sys">IMGG · SESAU Alagoas</span>
          <span class="tb-sub">Instrumento de Maturidade, Governança e Gestão</span></div>
        </div>
        <div class="topbar-r">
          ${anosVisiveis.length > 1 ? `
          <div class="ano-selector-topbar">
            <span class="ano-label">📅</span>
            <div class="ano-btns" id="anoBtns">
              ${anosVisiveis.map(a=>`
                <button class="ano-btn${a.ano===anoSelecionado?" ano-ativo":""}" data-ano="${a.ano}">${a.ano}</button>
              `).join("")}
            </div>
          </div>` : `<span class="tb-ano-chip">📅 ${anoSelecionado}</span>`}
          <div class="tb-chip">${setor.sigla} — ${setor.nome}</div>
          ${isAdminToggled ? `<button class="btn-toggle-admin" id="btnVoltarAdmin">🔐 Voltar ao Admin</button>` : ""}
          <button class="btn-sair" id="btnSair">Sair</button>
        </div>
      </header>
      ${soLeitura ? `<div class="ano-readonly-banner">🔒 A avaliação de <strong>${anoSelecionado}</strong> está encerrada. Visualização somente leitura.</div>` : ""}
      <nav class="setor-nav">
        <button class="setor-tab at-active" id="tabAvaliacao">📋 Avaliação</button>
        <button class="setor-tab" id="tabPMGG">🎯 Plano de Melhoria (PMGG)</button>
      </nav>
      <div class="prog-strip"><div class="prog-fill" id="progFill"></div></div>
      <div class="prog-info" id="progInfo"></div>
      <main class="setor-main" id="sMain"></main>
    </div>`;

  document.getElementById("btnSair").addEventListener("click", () => signOut(auth));
  if (isAdminToggled) {
    document.getElementById("btnVoltarAdmin").addEventListener("click", () => {
      adminMode = true; renderAdminShell(); renderAdminContent();
    });
  }
  if (anosVisiveis.length > 1) {
    bindAnoSeletor(async () => {
      await loadRespostas(setor.id);
      await loadPMGG(setor.id);
      renderForm();
    });
  }

  // Navegação entre abas do setor
  document.getElementById("tabAvaliacao").addEventListener("click", () => {
    document.getElementById("tabAvaliacao").classList.add("at-active");
    document.getElementById("tabPMGG").classList.remove("at-active");
    // Esconde prog strip apenas no PMGG
    document.querySelector(".prog-strip").style.display = "";
    document.getElementById("progInfo").style.display = "";
    renderForm();
  });
  document.getElementById("tabPMGG").addEventListener("click", () => {
    document.getElementById("tabPMGG").classList.add("at-active");
    document.getElementById("tabAvaliacao").classList.remove("at-active");
    document.querySelector(".prog-strip").style.display = "none";
    document.getElementById("progInfo").style.display = "none";
    renderPMGG(setor);
  });
}

// ═══════════════════════════════════════════════════════════════
//  SETOR — FORMULÁRIO
// ═══════════════════════════════════════════════════════════════
function renderForm() {
  const setorId     = currentSetorId;
  const anoAtual    = anosDisponiveis.find(a => a.ano === anoSelecionado);
  const soLeitura   = anoAtual && !anoAtual.ativo;
  const dimsSetor   = getDimensoesParaSetor(setorId);
  const totalSetor  = dimsSetor.reduce((s,d) => s+d.alineas.length, 0);
  const respondidas = Object.values(respostasSetor).filter(r => isRespondida(r)).length;
  const pct = totalSetor > 0 ? Math.round((respondidas / totalSetor) * 100) : 0;

  document.getElementById("progFill").style.width = pct + "%";
  document.getElementById("progInfo").innerHTML = `
    <span class="pi-num">${respondidas}<span class="pi-of">/${totalSetor}</span></span>
    <span class="pi-lbl">alíneas respondidas — ${anoSelecionado}</span>
    <span class="pi-pct">${pct}%</span>`;

  let html = `<div class="form-wrap">
    <div class="form-head">
      <h1 class="fh-title">Avaliação IMGG ${anoSelecionado}</h1>
      <p class="fh-desc">Para cada alínea, indique se há <strong>Continuidade</strong> e <strong>Adequação</strong> da prática. Você também pode adicionar uma observação e anexar documentos comprobatórios.${soLeitura ? " <strong style='color:#b91c1c'>Avaliação encerrada — somente leitura.</strong>" : " As respostas são salvas automaticamente."}</p>
    </div>`;

  dimsSetor.forEach((dim, di) => {
    const respDim  = dim.alineas.filter(a => isRespondida(respostasSetor[a.id])).length;
    const completa = respDim === dim.alineas.length;

    html += `
    <div class="dim-bloco${completa ? " dim-ok" : ""}">
      <div class="dim-hdr">
        <span class="dim-ico">${dim.icone}</span>
        <div class="dim-hdr-t">
          <span class="dim-cod">Dimensão ${di+1}</span>
          <span class="dim-nome">${dim.titulo}</span>
        </div>
        <span class="dim-ct${completa ? " dc-ok" : ""}">${respDim}/${dim.alineas.length}</span>
      </div>
      <div class="alineas">`;

    dim.alineas.forEach((al, ai) => {
      const r        = respostasSetor[al.id] || {};
      const cont     = r.continuidade ?? null;
      const adeq     = r.adequacao    ?? null;
      const obs      = r.obs          ?? "";
      const anexos   = r.anexos       || [];
      const respondida = isRespondida(r);
      const dis      = soLeitura ? "disabled" : "";

      html += `
        <div class="alinea${respondida ? " al-ok" : ""}" id="al-${al.id}">
          <div class="al-idx">${String.fromCharCode(65+ai)}</div>
          <div class="al-body">
            <p class="al-txt">${al.texto}</p>

            <div class="al-campo">
              <span class="al-campo-label">Continuidade</span>
              <div class="sn-group">
                <button class="sn-btn${cont==="sim"?" sn-sim":""}" ${dis} data-alinea="${al.id}" data-campo="continuidade" data-valor="sim">✔ Sim</button>
                <button class="sn-btn${cont==="nao"?" sn-nao":""}" ${dis} data-alinea="${al.id}" data-campo="continuidade" data-valor="nao">✘ Não</button>
              </div>
            </div>

            <div class="al-campo">
              <span class="al-campo-label">Adequação</span>
              <div class="sn-group">
                <button class="sn-btn${adeq==="sim"?" sn-sim":""}" ${dis} data-alinea="${al.id}" data-campo="adequacao" data-valor="sim">✔ Sim</button>
                <button class="sn-btn${adeq==="nao"?" sn-nao":""}" ${dis} data-alinea="${al.id}" data-campo="adequacao" data-valor="nao">✘ Não</button>
              </div>
            </div>

            <div class="al-obs-wrap">
              <label class="al-obs-label" for="obs-${al.id}">📝 Observação / Evidência</label>
              <textarea class="al-obs" id="obs-${al.id}" data-alinea="${al.id}"
                placeholder="Descreva a evidência, justificativa ou contexto desta resposta..."
                rows="3" ${soLeitura ? "readonly" : ""}>${obs}</textarea>
            </div>

            <div class="al-anexo-wrap">
              <div class="anexo-label">📎 Documentos Comprobatórios</div>
              <div class="anexos-lista" id="anexos-${al.id}">
                ${renderAnexosHtml(al.id, anexos, soLeitura)}
              </div>
              ${!soLeitura ? `
              <label class="btn-anexo-add" for="file-${al.id}">
                ＋ Anexar Documento
                <input type="file" id="file-${al.id}" data-alinea="${al.id}"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" multiple style="display:none"/>
              </label>
              <span class="anexo-hint">PDF, DOC, DOCX, PNG, JPG · máx. 500 KB por arquivo</span>` : ""}
            </div>

          </div>
        </div>`;
    });
    html += `</div></div>`;
  });

  const faltam = totalSetor - respondidas;
  if (!soLeitura) {
    html += `<div class="submit-zone">
      <button class="btn-submit${faltam>0?" btn-sd":""}" id="btnSubmit" ${faltam>0?"disabled":""}>
        ${faltam>0 ? `Faltam ${faltam} alínea${faltam>1?"s":""} para enviar` : "📤 Enviar Avaliação IMGG"}
      </button>
    </div>`;
  }
  html += `</div>`;

  document.getElementById("sMain").innerHTML = html;

  if (soLeitura) return; // sem eventos em modo leitura

  document.querySelectorAll(".sn-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const alId  = btn.dataset.alinea;
      const campo = btn.dataset.campo;
      const valor = btn.dataset.valor;
      const top   = (document.getElementById("al-"+alId)?.getBoundingClientRect().top||0)+window.scrollY-100;
      await saveResposta(currentSetorId, alId, campo, valor);
      renderForm();
      requestAnimationFrame(() => window.scrollTo({ top, behavior:"smooth" }));
    });
  });

  document.querySelectorAll(".al-obs").forEach(input => {
    input.addEventListener("blur", async () => {
      const alId = input.dataset.alinea;
      if (!respostasSetor[alId]) respostasSetor[alId] = { continuidade:null, adequacao:null, obs:"", anexos:[], ts: new Date().toISOString() };
      respostasSetor[alId].obs = input.value;
      await saveResposta(currentSetorId, alId, "obs", input.value);
    });
  });

  document.querySelectorAll("input[type=file][data-alinea]").forEach(input => {
    input.addEventListener("change", async () => {
      const alId  = input.dataset.alinea;
      const files = Array.from(input.files);
      if (!files.length) return;
      const MAX = 500 * 1024;
      for (const file of files) {
        if (file.size > MAX) { toast(`"${file.name}" excede 500 KB. Ignorado.`, "warn"); continue; }
        const base64 = await fileToBase64(file);
        if (!respostasSetor[alId]) respostasSetor[alId] = { continuidade:null, adequacao:null, obs:"", anexos:[], ts: new Date().toISOString() };
        if (!respostasSetor[alId].anexos) respostasSetor[alId].anexos = [];
        respostasSetor[alId].anexos.push({ nome: file.name, tipo: file.type, base64 });
        const lista = document.getElementById("anexos-"+alId);
        if (lista) lista.innerHTML = renderAnexosHtml(alId, respostasSetor[alId].anexos, false);
        bindAnexoRemove(alId);
        await saveResposta(currentSetorId, alId, "anexos", respostasSetor[alId].anexos);
        toast(`"${file.name}" anexado! ✅`, "success");
      }
      input.value = "";
    });
  });

  dimsSetor.forEach(dim => dim.alineas.forEach(al => bindAnexoRemove(al.id)));
  document.getElementById("btnSubmit")?.addEventListener("click", () => submitForm(currentSetorId));
}


// ═══════════════════════════════════════════════════════════════
//  SETOR — PLANO DE MELHORIA DE GOVERNANÇA E GESTÃO (PMGG)
//  GUT: Gravidade × Urgência × Tendência (1–5 cada, máx 125)
// ═══════════════════════════════════════════════════════════════
const GUT_ESCALA = [
  { valor:5, label:"5", title:"Extremamente grave / Ação imediata / Agravamento imediato" },
  { valor:4, label:"4", title:"Muito grave / Alguma urgência / Piora em curto prazo" },
  { valor:3, label:"3", title:"Grave / Ação o mais rápido possível / Piora em médio prazo" },
  { valor:2, label:"2", title:"Pouco grave / Pode esperar / Piora em longo prazo" },
  { valor:1, label:"1", title:"Não grave / Sem pressa / Pode até melhorar" },
];

function gutCor(res) {
  if (res >= 100) return "#ef4444";
  if (res >= 60)  return "#f97316";
  if (res >= 27)  return "#eab308";
  if (res >= 8)   return "#22c55e";
  return "#06b6d4";
}

// Alíneas com "Não" em continuidade OU adequação — base para o PMGG
function getAlineasNao() {
  const resultado = [];
  getDimensoesParaSetor(currentSetorId).forEach(dim => {
    dim.alineas.forEach(al => {
      const r = respostasSetor[al.id] || {};
      if (r.continuidade === "nao" || r.adequacao === "nao") {
        resultado.push({ al, dim, r });
      }
    });
  });
  return resultado;
}

function renderPMGG(setor) {
  const soLeitura = (() => { const a = anosDisponiveis.find(x => x.ano === anoSelecionado); return a && !a.ativo; })();
  const alineasNao = getAlineasNao();

  let html = `<div class="pmgg-wrap">
    <div class="pmgg-head">
      <h1 class="pmgg-title">🎯 Plano de Melhoria de Governança e Gestão</h1>
      <p class="pmgg-desc">Para cada alínea respondida como <strong>"Não"</strong>, descreva a oportunidade de melhoria, avalie pelo método <strong>GUT</strong> (Gravidade × Urgência × Tendência) e preencha o Plano de Melhoria correspondente.</p>
      ${soLeitura ? `<div class="ano-readonly-banner" style="margin-top:12px;border-radius:8px">🔒 Ano encerrado — somente leitura.</div>` : ""}
    </div>`;

  if (alineasNao.length === 0) {
    html += `<div class="pmgg-empty">
      <span class="pmgg-empty-ico">✅</span>
      <p>Nenhuma alínea respondida como "Não" ainda.<br>Complete a avaliação para liberar os planos de melhoria.</p>
    </div>`;
  } else {
    alineasNao.forEach(({ al, dim }) => {
      const plano = pmggSetor.find(p => p.alId === al.id) || {
        alId: al.id,
        oportunidade: "",
        gravidade: null, urgencia: null, tendencia: null,
        nomePmgg: "", indicador: "", meta: "", ano: anoSelecionado,
        dataInicio: "", recurso: "", local: setor.nome, quem: "", como: "",
      };
      const G = plano.gravidade, U = plano.urgencia, T = plano.tendencia;
      const resultado = (G && U && T) ? G * U * T : null;

      html += `
      <div class="pmgg-card" id="pmgg-${al.id}">

        <!-- Cabeçalho da dimensão + alínea -->
        <div class="pmgg-card-hdr">
          <span class="pmgg-dim-badge">${dim.icone} ${dim.titulo}</span>
          <span class="pmgg-al-id">${al.id}</span>
        </div>
        <div class="pmgg-al-txt">${al.texto}</div>

        <!-- Seção GUT -->
        <div class="pmgg-section-title">Oportunidade de Melhoria</div>
        <div class="pmgg-field">
          <label>Descrição da oportunidade de melhoria</label>
          <textarea class="pmgg-textarea" id="op-${al.id}" data-alid="${al.id}" data-campo="oportunidade"
            placeholder="Descreva qual melhoria deve ser realizada para esta alínea..." rows="3"
            ${soLeitura?"readonly":""}>${plano.oportunidade}</textarea>
        </div>

        <!-- Pontuação GUT -->
        <div class="gut-row">
          ${["gravidade","urgencia","tendencia"].map(campo => {
            const labels = { gravidade:"Gravidade", urgencia:"Urgência", tendencia:"Tendência" };
            const val = plano[campo];
            return `<div class="gut-col">
              <div class="gut-col-label">${labels[campo]}</div>
              <div class="gut-btns">
                ${GUT_ESCALA.map(op => `
                  <button class="gut-btn${val===op.valor?" gut-sel":""}" ${soLeitura?"disabled":""}
                    data-alid="${al.id}" data-campo="${campo}" data-valor="${op.valor}"
                    title="${op.title}">${op.label}</button>`).join("")}
              </div>
            </div>`;
          }).join("")}
          <div class="gut-resultado">
            <div class="gut-res-label">Resultado</div>
            <div class="gut-res-val" id="gut-res-${al.id}" style="color:${resultado?gutCor(resultado):"#94a3b8"}">
              ${resultado ?? "—"}
            </div>
            ${resultado ? `<div class="gut-res-nivel" style="color:${gutCor(resultado)}">${resultado>=100?"Crítico":resultado>=60?"Alto":resultado>=27?"Médio":resultado>=8?"Baixo":"Mínimo"}</div>` : ""}
          </div>
        </div>

        <!-- PMGG -->
        <div class="pmgg-section-title">Plano de Melhoria de Governança e Gestão (PMGG)</div>
        <div class="pmgg-grid">
          <div class="pmgg-field pmgg-col-2">
            <label>Nome do PMGG</label>
            <input class="pmgg-input" id="nomePmgg-${al.id}" data-alid="${al.id}" data-campo="nomePmgg"
              placeholder="Título do plano de melhoria" value="${plano.nomePmgg}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field pmgg-col-2">
            <label>Indicador</label>
            <input class="pmgg-input" id="indicador-${al.id}" data-alid="${al.id}" data-campo="indicador"
              placeholder="Como será medido o resultado" value="${plano.indicador}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field">
            <label>Meta (%)</label>
            <input class="pmgg-input" id="meta-${al.id}" data-alid="${al.id}" data-campo="meta"
              type="number" min="0" max="100" placeholder="Ex: 80"
              value="${plano.meta}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field">
            <label>Ano de Finalização</label>
            <input class="pmgg-input" id="ano-${al.id}" data-alid="${al.id}" data-campo="ano"
              type="number" min="2020" max="2099" placeholder="${anoSelecionado}"
              value="${plano.ano}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field">
            <label>Data de Início (mês/ano)</label>
            <input class="pmgg-input" id="dataInicio-${al.id}" data-alid="${al.id}" data-campo="dataInicio"
              placeholder="Ex: Janeiro/2025" value="${plano.dataInicio}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field">
            <label>Recursos Financeiros</label>
            <input class="pmgg-input" id="recurso-${al.id}" data-alid="${al.id}" data-campo="recurso"
              placeholder="Ex: R$ 50.000,00" value="${plano.recurso}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field">
            <label>Local</label>
            <input class="pmgg-input" id="local-${al.id}" data-alid="${al.id}" data-campo="local"
              placeholder="Setor responsável" value="${plano.local||setor.nome}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field">
            <label>Quem (cargo)</label>
            <input class="pmgg-input" id="quem-${al.id}" data-alid="${al.id}" data-campo="quem"
              placeholder="Ex: Gerente" value="${plano.quem}" ${soLeitura?"readonly":""}/>
          </div>
          <div class="pmgg-field pmgg-col-2">
            <label>Como (ações estratégicas)</label>
            <textarea class="pmgg-textarea" id="como-${al.id}" data-alid="${al.id}" data-campo="como"
              placeholder="Descreva as ações que serão realizadas para atingir a melhoria..." rows="4"
              ${soLeitura?"readonly":""}>${plano.como}</textarea>
          </div>
        </div>

        ${!soLeitura ? `<div class="pmgg-save-row">
          <button class="btn-pmgg-save" data-alid="${al.id}">💾 Salvar Plano</button>
        </div>` : ""}

      </div>`;
    });
  }

  html += `</div>`;
  document.getElementById("sMain").innerHTML = html;

  if (soLeitura) return;

  // ── Botões GUT
  document.querySelectorAll(".gut-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const alId  = btn.dataset.alid;
      const campo = btn.dataset.campo;
      const valor = +btn.dataset.valor;
      // Atualiza visualmente
      document.querySelectorAll(`.gut-btn[data-alid="${alId}"][data-campo="${campo}"]`)
        .forEach(b => b.classList.toggle("gut-sel", +b.dataset.valor === valor));
      // Garante plano no array
      let plano = pmggSetor.find(p => p.alId === alId);
      if (!plano) {
        const s = SETORES.find(x => x.id === currentSetorId);
        plano = { alId, oportunidade:"", gravidade:null, urgencia:null, tendencia:null,
          nomePmgg:"", indicador:"", meta:"", ano:anoSelecionado,
          dataInicio:"", recurso:"", local:s?.nome||"", quem:"", como:"" };
        pmggSetor.push(plano);
      }
      plano[campo] = valor;
      // Atualiza resultado
      const G = plano.gravidade, U = plano.urgencia, T = plano.tendencia;
      const res = (G && U && T) ? G * U * T : null;
      const el  = document.getElementById("gut-res-"+alId);
      if (el) {
        el.textContent = res ?? "—";
        el.style.color = res ? gutCor(res) : "#94a3b8";
        // Nível
        let nv = el.nextElementSibling;
        if (res) {
          const nivel = res>=100?"Crítico":res>=60?"Alto":res>=27?"Médio":res>=8?"Baixo":"Mínimo";
          if (!nv || !nv.classList.contains("gut-res-nivel")) {
            nv = document.createElement("div");
            nv.className = "gut-res-nivel";
            el.after(nv);
          }
          nv.textContent = nivel;
          nv.style.color = gutCor(res);
        } else if (nv?.classList.contains("gut-res-nivel")) {
          nv.remove();
        }
      }
    });
  });

  // ── Salvar plano individual
  document.querySelectorAll(".btn-pmgg-save").forEach(btn => {
    btn.addEventListener("click", async () => {
      const alId = btn.dataset.alid;
      let plano  = pmggSetor.find(p => p.alId === alId);
      if (!plano) {
        const s = SETORES.find(x => x.id === currentSetorId);
        plano = { alId, oportunidade:"", gravidade:null, urgencia:null, tendencia:null,
          nomePmgg:"", indicador:"", meta:"", ano:anoSelecionado,
          dataInicio:"", recurso:"", local:s?.nome||"", quem:"", como:"" };
        pmggSetor.push(plano);
      }
      // Lê todos os campos do card
      ["oportunidade","nomePmgg","indicador","meta","ano","dataInicio","recurso","local","quem","como"].forEach(campo => {
        const el = document.getElementById(`${campo}-${alId}`);
        if (el) plano[campo] = el.value;
      });
      btn.textContent = "Salvando..."; btn.disabled = true;
      await savePMGG(currentSetorId);
      btn.textContent = "💾 Salvar Plano"; btn.disabled = false;
      toast("Plano salvo! ✅", "success");
    });
  });
}

function renderAnexosHtml(alId, anexos, soLeitura=false) {
  if (!anexos || !anexos.length) return `<span class="anexo-empty">Nenhum documento anexado.</span>`;
  return anexos.map((a, i) => `
    <div class="anexo-item" data-i="${i}">
      <span class="anexo-ico">${anexoIco(a.tipo)}</span>
      <a class="anexo-nome" href="${a.base64}" download="${a.nome}" title="Baixar ${a.nome}">${a.nome}</a>
      ${!soLeitura ? `<button class="anexo-rm" data-alinea="${alId}" data-i="${i}" title="Remover">✕</button>` : ""}
    </div>`).join("");
}

function bindAnexoRemove(alId) {
  const lista = document.getElementById("anexos-"+alId);
  if (!lista) return;
  lista.querySelectorAll(".anexo-rm").forEach(btn => {
    btn.addEventListener("click", async () => {
      const i = +btn.dataset.i;
      if (!respostasSetor[alId]?.anexos) return;
      const nome = respostasSetor[alId].anexos[i]?.nome;
      respostasSetor[alId].anexos.splice(i, 1);
      lista.innerHTML = renderAnexosHtml(alId, respostasSetor[alId].anexos, false);
      bindAnexoRemove(alId);
      await saveResposta(currentSetorId, alId, "anexos", respostasSetor[alId].anexos);
      if (nome) toast(`"${nome}" removido.`, "info");
    });
  });
}

function anexoIco(tipo) {
  if (!tipo) return "📄";
  if (tipo.includes("pdf"))   return "📕";
  if (tipo.includes("word") || tipo.includes("document")) return "📘";
  if (tipo.includes("image")) return "🖼️";
  return "📄";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

// ─── Admin Shell ─────────────────────────────────────────────────
function renderAdminShell() {
  const setorAsset = SETORES.find(s => s.id === ADMIN_SETOR_ID);
  document.getElementById("app").innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-l">
          <img src="governo-de-alagoas-sem-fundo.png" alt="Governo de Alagoas" class="tb-logo"/>
          <div><span class="tb-sys">IMGG · SESAU Alagoas</span>
          <span class="tb-sub">Painel Administrativo</span></div>
        </div>
        <div class="topbar-r">
          <div class="ano-selector-topbar">
            <span class="ano-label">📅 Ano</span>
            <div class="ano-btns" id="anoBtns">
              ${anosDisponiveis.map(a=>`
                <button class="ano-btn${a.ano===anoSelecionado?" ano-ativo":""}${!a.ativo?" ano-encerrado":""}"
                  data-ano="${a.ano}" title="${!a.ativo?"Encerrado":"Ativo"}">
                  ${a.ano}${!a.ativo?" 🔒":""}
                </button>`).join("")}
            </div>
          </div>
          <div class="tb-chip adm-chip">🔐 Administrador</div>
          <button class="btn-toggle-admin" id="btnResponder">📝 Responder como ${setorAsset?.sigla||"ASSET"}</button>
          <button class="btn-exp" id="btnXls">⬇ Excel</button>
          <button class="btn-exp" id="btnPdf">🖨 PDF</button>
          <button class="btn-sair" id="btnSair">Sair</button>
        </div>
      </header>
      <nav class="adm-nav">
        <button class="adm-tab${adminTab==="dashboard"?" at-active":""}" data-tab="dashboard">📊 Dashboard</button>
        <button class="adm-tab${adminTab==="metricas"?" at-active":""}"  data-tab="metricas">📈 Métricas</button>
        <button class="adm-tab${adminTab==="respostas"?" at-active":""}" data-tab="respostas">📋 Respostas</button>
        <button class="adm-tab${adminTab==="editor"?" at-active":""}"    data-tab="editor">✏️ Alíneas Globais</button>
        <button class="adm-tab${adminTab==="setores"?" at-active":""}"   data-tab="setores">🎯 Alíneas por Setor</button>
        <button class="adm-tab${adminTab==="anos"?" at-active":""}"      data-tab="anos">📅 Gerenciar Anos</button>
      </nav>
      <main class="admin-main" id="aMain">
        <div class="loading">⏳ Carregando dados do Firebase...</div>
      </main>
    </div>`;

  // Seletor de ano no header admin
  bindAnoSeletor(async () => {
    // Ao trocar de ano no admin, recarrega o conteúdo da aba atual
    document.getElementById("aMain").innerHTML = `<div class="loading">⏳ Carregando ${anoSelecionado}...</div>`;
    destroyCharts();
    if (adminTab === "editor")  { renderEditorAlineas(); return; }
    if (adminTab === "setores") { renderEditorSetores(); return; }
    if (adminTab === "anos")    { renderEditorAnos(); return; }
    const all  = await loadAll(), data = buildSetoresData(all);
    window._adminData = data;
    if (adminTab === "dashboard") renderDashboardTab(data);
    if (adminTab === "metricas")  renderMetricasTab(data);
    if (adminTab === "respostas") renderRespostasTab(data);
  });

  document.getElementById("btnResponder").addEventListener("click", async () => {
    adminMode = false; currentSetorId = ADMIN_SETOR_ID;
    await loadRespostas(ADMIN_SETOR_ID);
    renderSetorShell(SETORES.find(s => s.id === ADMIN_SETOR_ID), true);
    renderForm();
  });

  document.getElementById("btnSair").addEventListener("click", () => signOut(auth));

  document.querySelectorAll(".adm-tab").forEach(btn => {
    btn.addEventListener("click", async () => {
      adminTab = btn.dataset.tab;
      document.querySelectorAll(".adm-tab").forEach(b => b.classList.toggle("at-active", b.dataset.tab === adminTab));
      document.getElementById("aMain").innerHTML = `<div class="loading">⏳ Carregando...</div>`;
      destroyCharts();
      if (adminTab === "editor")  { renderEditorAlineas(); return; }
      if (adminTab === "setores") { renderEditorSetores(); return; }
      if (adminTab === "anos")    { renderEditorAnos(); return; }
      const all = await loadAll(), data = buildSetoresData(all);
      window._adminData = data;
      if (adminTab === "dashboard") renderDashboardTab(data);
      if (adminTab === "metricas")  renderMetricasTab(data);
      if (adminTab === "respostas") renderRespostasTab(data);
    });
  });
}

async function renderAdminContent() {
  const all = await loadAll(), data = buildSetoresData(all);
  window._adminData = data;
  renderDashboardTab(data);
  document.getElementById("btnXls").addEventListener("click", () => exportXLS(window._adminData || data));
  document.getElementById("btnPdf").addEventListener("click", () => exportPDF(window._adminData || data));
}

// ─── Gerenciar Anos (nova aba admin) ─────────────────────────────
function renderEditorAnos() {
  function buildHtml() {
    return `<div class="adm-wrap">
      <div class="ed-header">
        <div>
          <h2 class="sec-t" style="margin:0">📅 Gerenciar Anos de Avaliação</h2>
          <p class="ed-sub">Crie e gerencie os anos disponíveis para avaliação. Apenas anos <strong>ativos</strong> aceitam novas respostas dos setores. Anos encerrados ficam em modo somente leitura.</p>
        </div>
      </div>

      <div class="anos-lista">
        ${anosDisponiveis.sort((a,b)=>b.ano-a.ano).map(a => `
          <div class="ano-card${a.ativo ? " ano-card-ativo" : " ano-card-enc"}">
            <div class="ano-card-l">
              <span class="ano-card-num">${a.ano}</span>
              <span class="ano-card-st ${a.ativo ? "acs-ativo" : "acs-enc"}">${a.ativo ? "✅ Ativo" : "🔒 Encerrado"}</span>
            </div>
            <div class="ano-card-r">
              ${a.ativo
                ? `<button class="btn-ano-enc" data-ano="${a.ano}">Encerrar Ano</button>`
                : `<button class="btn-ano-reab" data-ano="${a.ano}">Reabrir Ano</button>`}
              <button class="btn-ano-del" data-ano="${a.ano}" title="Remover ano (não apaga respostas do Firebase)">🗑</button>
            </div>
          </div>`).join("")}
      </div>

      <div class="ano-novo-wrap">
        <h3 class="met-sh" style="margin-bottom:12px">Adicionar Novo Ano</h3>
        <div class="ano-novo-row">
          <input class="ano-inp" id="novoAnoInput" type="number" min="2020" max="2099"
            placeholder="${new Date().getFullYear() + 1}" value="${new Date().getFullYear() + 1}"/>
          <button class="btn-ed-save" id="btnAddAno">＋ Adicionar Ano</button>
        </div>
        <p class="ed-sub" style="margin-top:8px">O novo ano será criado como <strong>ativo</strong>. Respostas são totalmente independentes por ano.</p>
      </div>
    </div>`;
  }

  function rebind() {
    document.querySelectorAll(".btn-ano-enc").forEach(btn => {
      btn.addEventListener("click", async () => {
        const a = anosDisponiveis.find(x => x.ano === btn.dataset.ano);
        if (!a) return;
        if (!confirm(`Encerrar o ano ${a.ano}? Os setores não poderão mais editar as respostas.`)) return;
        a.ativo = false;
        await saveAnos();
        toast(`Ano ${a.ano} encerrado. 🔒`, "info");
        // Atualiza seletor no header
        document.querySelectorAll(".ano-btn").forEach(b => {
          if (b.dataset.ano === a.ano) { b.classList.add("ano-encerrado"); b.textContent = a.ano + " 🔒"; }
        });
        renderEditorAnos();
      });
    });

    document.querySelectorAll(".btn-ano-reab").forEach(btn => {
      btn.addEventListener("click", async () => {
        const a = anosDisponiveis.find(x => x.ano === btn.dataset.ano);
        if (!a) return;
        a.ativo = true;
        await saveAnos();
        toast(`Ano ${a.ano} reaberto. ✅`, "success");
        renderEditorAnos();
        renderAdminShell();
        renderAdminContent();
      });
    });

    document.querySelectorAll(".btn-ano-del").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (anosDisponiveis.length <= 1) { toast("É necessário ter pelo menos 1 ano.", "warn"); return; }
        if (!confirm(`Remover o ano ${btn.dataset.ano} da lista? As respostas salvas no Firebase NÃO serão apagadas.`)) return;
        anosDisponiveis = anosDisponiveis.filter(x => x.ano !== btn.dataset.ano);
        if (anoSelecionado === btn.dataset.ano) {
          anoSelecionado = anosDisponiveis[anosDisponiveis.length - 1].ano;
        }
        await saveAnos();
        toast(`Ano ${btn.dataset.ano} removido da lista.`, "info");
        renderAdminShell();
        renderAdminContent();
      });
    });

    document.getElementById("btnAddAno")?.addEventListener("click", async () => {
      const val = document.getElementById("novoAnoInput")?.value?.trim();
      if (!val || isNaN(val) || val < 2020 || val > 2099) { toast("Digite um ano válido (2020–2099).", "warn"); return; }
      if (anosDisponiveis.find(a => a.ano === val)) { toast(`O ano ${val} já existe.`, "warn"); return; }
      anosDisponiveis.push({ ano: val, ativo: true });
      anosDisponiveis.sort((a,b) => a.ano - b.ano);
      await saveAnos();
      toast(`Ano ${val} adicionado! ✅`, "success");
      renderAdminShell();
      renderAdminContent();
    });
  }

  document.getElementById("aMain").innerHTML = buildHtml();
  rebind();
}

// ─── Dashboard ───────────────────────────────────────────────────
function renderDashboardTab(data) {
  const enviados  = data.filter(s => s.status === "enviado").length;
  const emAnd     = data.filter(s => ["em_andamento","concluido"].includes(s.status)).length;
  const naoIn     = data.filter(s => s.status === "nao_iniciado").length;
  const mediaIMO  = parseFloat((data.reduce((a,s) => a+s.imo, 0) / data.length).toFixed(1));
  const anoAtual  = anosDisponiveis.find(a => a.ano === anoSelecionado);

  document.getElementById("aMain").innerHTML = `<div class="adm-wrap">
    ${!anoAtual?.ativo ? `<div class="ano-readonly-banner">🔒 Ano <strong>${anoSelecionado}</strong> encerrado — visualização somente leitura.</div>` : ""}
    <div class="kpi-row">
      <div class="kpi k-blue">  <div class="kv">${data.length}</div><div class="kl">Setores</div></div>
      <div class="kpi k-green"> <div class="kv">${enviados}</div>  <div class="kl">Enviados</div></div>
      <div class="kpi k-yellow"><div class="kv">${emAnd}</div>     <div class="kl">Em Andamento</div></div>
      <div class="kpi k-red">   <div class="kv">${naoIn}</div>     <div class="kl">Não Iniciados</div></div>
      <div class="kpi k-cyan">  <div class="kv">${mediaIMO}%</div> <div class="kl">IMO Médio</div></div>
    </div>
    <div class="charts-row">
      <div class="cc cc-bar">   <div class="cc-h">IMO por Setor (%) — ${anoSelecionado}</div><canvas id="cBar"></canvas></div>
      <div class="cc cc-radar"> <div class="cc-h">Média por Dimensão</div>                   <canvas id="cRadar"></canvas></div>
      <div class="cc cc-donut"> <div class="cc-h">Status das Avaliações</div>                <canvas id="cDonut"></canvas></div>
    </div>
    <div class="sec-hdr">
      <h2 class="sec-t">Setores — ${anoSelecionado}</h2>
      <input class="s-search" id="sSearch" placeholder="🔍 Filtrar setor...">
    </div>
    <div class="setores-grid" id="setGrid">${data.map(s => setorCardHtml(s)).join("")}</div>
  </div>`;

  requestAnimationFrame(() => { destroyCharts(); renderChartBar(data); renderChartRadar(data); renderChartDonut(enviados, emAnd, naoIn); });
  document.getElementById("sSearch").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".setor-card").forEach(c => { c.style.display = c.dataset.n.toLowerCase().includes(q) ? "" : "none"; });
  });
  document.querySelectorAll(".setor-card").forEach(card => {
    card.addEventListener("click", () => { const s = data.find(x => x.id === card.dataset.id); if(s) renderDetalheSetor(s); });
  });
}

// ─── Métricas ─────────────────────────────────────────────────────
function renderMetricasTab(data) {
  const total    = data.length;
  const mediaIMO = parseFloat((data.reduce((a,s) => a+s.imo, 0) / total).toFixed(1));
  const dimMedias = DIMENSOES.map((dim, di) => {
    const vals = data.map(s => s.dimScores[di] ?? 0);
    return { dim, di, med: parseFloat((vals.reduce((a,v) => a+v, 0) / total).toFixed(1)), min: Math.min(...vals), max: Math.max(...vals) };
  });
  const ranking = [...data].sort((a,b) => b.imo - a.imo);
  const faixas = [
    { label:"Crítico (0–20%)",    min:0,  max:20,  cor:"#ef4444", count:0 },
    { label:"Baixo (20–40%)",     min:20, max:40,  cor:"#f97316", count:0 },
    { label:"Moderado (40–60%)",  min:40, max:60,  cor:"#eab308", count:0 },
    { label:"Bom (60–80%)",       min:60, max:80,  cor:"#22c55e", count:0 },
    { label:"Excelente (80–100%)",min:80, max:101, cor:"#06b6d4", count:0 },
  ];
  data.forEach(s => { const f = faixas.find(f => s.imo >= f.min && s.imo < f.max); if(f) f.count++; });

  document.getElementById("aMain").innerHTML = `<div class="adm-wrap">
    <h2 class="sec-t" style="margin-bottom:20px">📈 Métricas e Indicadores — IMGG ${anoSelecionado}</h2>
    <div class="met-hero">
      <div class="mh-left">
        <div class="mh-label">Índice de Maturidade Organizacional Médio — ${anoSelecionado}</div>
        <div class="mh-value" style="color:${imoColor(mediaIMO)}">${mediaIMO}%</div>
        <div class="mh-sub">${imoNivel(mediaIMO)}</div>
      </div>
      <div class="mh-right"><canvas id="cMetDonut" width="160" height="160"></canvas></div>
    </div>
    <div class="met-section">
      <h3 class="met-sh">Distribuição por Faixa de Maturidade</h3>
      <div class="faixas-grid">
        ${faixas.map(f => `
          <div class="faixa-card" style="border-left:4px solid ${f.cor}">
            <div class="fc-count" style="color:${f.cor}">${f.count}</div>
            <div class="fc-pct">${total > 0 ? Math.round((f.count/total)*100) : 0}% dos setores</div>
            <div class="fc-label">${f.label}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="met-section">
      <h3 class="met-sh">Ranking de Setores por IMO</h3>
      <div class="ranking-list">
        ${ranking.map((s,i) => `
          <div class="rank-row">
            <div class="rank-pos ${i<3?"rp-top":""}">${i+1}º</div>
            <div class="rank-sig">${s.sigla}</div>
            <div class="rank-nome">${s.nome}</div>
            <div class="rank-bar-wrap"><div class="rank-bar" style="width:${s.imo}%;background:${imoColor(s.imo)}"></div></div>
            <div class="rank-val" style="color:${imoColor(s.imo)}">${s.imo}%</div>
            <span class="${stCls(s.status)} rank-st">${stLbl(s.status)}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="met-section">
      <h3 class="met-sh">Desempenho por Dimensão</h3>
      <div class="charts-row" style="grid-template-columns:1.5fr 1fr;gap:20px">
        <div class="cc"><div class="cc-h">Médias por Dimensão (%)</div><canvas id="cDimBar"></canvas></div>
        <div class="cc"><div class="cc-h">Radar IMGG Consolidado</div><canvas id="cDimRadar"></canvas></div>
      </div>
    </div>
    <div class="met-section">
      <h3 class="met-sh">Detalhamento por Dimensão</h3>
      ${dimMedias.map(({dim,di,med,min,max}) => `
        <div class="dim-met-card">
          <div class="dmc-head">
            <span class="dmc-ico">${dim.icone}</span>
            <div class="dmc-info">
              <span class="dmc-nome">${dim.titulo}</span>
              <span class="dmc-sub">Dimensão ${di+1} · ${dim.alineas.length} alíneas</span>
            </div>
            <div class="dmc-kpis">
              <div class="dmc-kpi"><div class="dk-v" style="color:${imoColor(med)}">${med}%</div><div class="dk-l">Média</div></div>
              <div class="dmc-kpi"><div class="dk-v" style="color:${imoColor(min)}">${min}%</div><div class="dk-l">Mínimo</div></div>
              <div class="dmc-kpi"><div class="dk-v" style="color:${imoColor(max)}">${max}%</div><div class="dk-l">Máximo</div></div>
            </div>
          </div>
          <div class="dmc-bar-wrap"><div class="dmc-bar" style="width:${med}%;background:${imoColor(med)}"></div></div>
          <div class="dmc-setores">
            ${data.map(s => { const v = s.dimScores[di]??0; return `<div class="dmc-s">
              <span class="dmc-ssig">${s.sigla}</span>
              <div class="dmc-sbar"><div style="width:${v}%;background:${imoColor(v)};height:100%;border-radius:2px"></div></div>
              <span class="dmc-sv" style="color:${imoColor(v)}">${v}%</span>
            </div>`; }).join("")}
          </div>
        </div>`).join("")}
    </div>
    <div class="met-section">
      <h3 class="met-sh">Mapa de Calor — % "Sim" por Alínea</h3>
      <div class="heatmap-wrap">
        ${DIMENSOES.map(dim => `
          <div class="hm-dim">
            <div class="hm-dtit">${dim.icone} ${dim.titulo}</div>
            <div class="hm-alineas">
              ${dim.alineas.map(al => {
                let simCount = 0, total2 = data.length * 2;
                data.forEach(s => {
                  const r = s.resp[al.id];
                  if (r?.continuidade === "sim") simCount++;
                  if (r?.adequacao    === "sim") simCount++;
                });
                const pct = total2 > 0 ? parseFloat(((simCount/total2)*100).toFixed(1)) : 0;
                return `<div class="hm-cel" style="background:${imoColorA(pct,.85)}" title="${al.texto} — Sim: ${pct}%">
                  <div class="hm-code">${al.id}</div><div class="hm-val">${pct}%</div>
                </div>`;
              }).join("")}
            </div>
          </div>`).join("")}
      </div>
    </div>
  </div>`;

  requestAnimationFrame(() => {
    destroyCharts();
    chartInstances.metDonut = new Chart(document.getElementById("cMetDonut"), {
      type:"doughnut",
      data:{ datasets:[{ data:[mediaIMO, 100-mediaIMO], backgroundColor:[imoColor(mediaIMO),"#f1f5f9"], borderWidth:0 }] },
      options:{ cutout:"72%", plugins:{ legend:{display:false}, tooltip:{enabled:false} } },
      plugins:[{ id:"ct", afterDraw(c) { const{ctx,chartArea:{top,bottom,left,right}}=c; const cx=(left+right)/2,cy=(top+bottom)/2; ctx.save(); ctx.font="bold 22px Sora,sans-serif"; ctx.fillStyle=imoColor(mediaIMO); ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(mediaIMO+"%",cx,cy); ctx.restore(); } }]
    });
    const dimLabels = DIMENSOES.map(d => d.titulo.split(" ").slice(0,2).join(" "));
    const dimVals   = DIMENSOES.map((_,di) => parseFloat((data.reduce((a,s) => a+(s.dimScores[di]??0), 0) / data.length).toFixed(1)));
    chartInstances.dimBar = new Chart(document.getElementById("cDimBar"), {
      type:"bar", data:{ labels:dimLabels, datasets:[{ label:"%", data:dimVals, backgroundColor:dimVals.map(v=>imoColorA(v,.75)), borderColor:dimVals.map(v=>imoColor(v)), borderWidth:2, borderRadius:8 }] },
      options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,max:100,ticks:{callback:v=>v+"%"}}} }
    });
    chartInstances.dimRadar = new Chart(document.getElementById("cDimRadar"), {
      type:"radar", data:{ labels:dimLabels, datasets:[{ label:"Média", data:dimVals, backgroundColor:"rgba(6,182,212,.12)", borderColor:"#06b6d4", borderWidth:2, pointBackgroundColor:"#06b6d4", pointRadius:4 }] },
      options:{ responsive:true, scales:{r:{beginAtZero:true,max:100,ticks:{display:false}}}, plugins:{legend:{display:false}} }
    });
  });
}

// ─── Respostas ────────────────────────────────────────────────────
function renderRespostasTab(data) {
  document.getElementById("aMain").innerHTML = `<div class="adm-wrap">
    <div class="sec-hdr">
      <h2 class="sec-t">Respostas — ${anoSelecionado}</h2>
      <input class="s-search" id="sSearchResp" placeholder="🔍 Filtrar setor...">
    </div>
    <div style="margin-bottom:28px">
      <h3 class="met-sh">Desempenho Médio por Dimensão</h3>
      <div class="dim-analysis">
        ${DIMENSOES.map((dim, di) => {
          const med = parseFloat((data.reduce((a,s) => a+(s.dimScores[di]??0), 0) / data.length).toFixed(1));
          return `<div class="da-r">
            <span class="da-ico">${dim.icone}</span>
            <span class="da-nome">${dim.titulo}</span>
            <div class="da-bar"><div class="da-fill" style="width:${med}%;background:${imoColor(med)}"></div></div>
            <span class="da-pct" style="color:${imoColor(med)}">${med}%</span>
          </div>`;
        }).join("")}
      </div>
    </div>
    <div class="listagem" id="listaResp">
      ${data.filter(s => s.respondidas > 0).map(s => listItemHtml(s)).join("")}
    </div>
  </div>`;
  document.getElementById("sSearchResp").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".ls-det").forEach(c => { c.style.display = (c.dataset.n||"").toLowerCase().includes(q) ? "" : "none"; });
  });
  document.querySelectorAll(".ls-det").forEach((el, i) => {
    const s = data.filter(s => s.respondidas > 0)[i]; if(s) el.dataset.n = s.nome;
  });
}

// ─── Editor Alíneas Globais ────────────────────────────────────────
function renderEditorAlineas() {
  let editDims = JSON.parse(JSON.stringify(DIMENSOES));

  function buildDimHtml(dim, di) {
    return `<div class="ed-dim-card" data-di="${di}">
      <div class="edc-head">
        <div class="edc-hrow">
          <input class="ed-ico-inp" value="${dim.icone}" maxlength="4" data-di="${di}" data-f="icone"/>
          <input class="ed-titulo-inp" value="${dim.titulo}" data-di="${di}" data-f="titulo" placeholder="Título da dimensão"/>
          <div class="edc-btns">
            <button class="edc-up" data-di="${di}">↑</button>
            <button class="edc-dn" data-di="${di}">↓</button>
            <button class="edc-del" data-di="${di}">🗑</button>
          </div>
        </div>
        <div class="edc-badge">${dim.id} · ${dim.alineas.length} alínea${dim.alineas.length!==1?"s":""}</div>
      </div>
      <div class="ed-alineas">
        ${dim.alineas.map((al,ai) => `
          <div class="eda-row" data-di="${di}" data-ai="${ai}">
            <span class="eda-idx">${String.fromCharCode(65+ai)}</span>
            <div class="eda-mid">
              <input class="eda-inp" value="${al.texto.replace(/"/g,"&quot;")}" data-di="${di}" data-ai="${ai}" placeholder="Texto da alínea"/>
              <span class="eda-id">${al.id}</span>
            </div>
            <button class="eda-del" data-di="${di}" data-ai="${ai}">✕</button>
          </div>`).join("")}
        <button class="btn-add-al" data-di="${di}">＋ Adicionar alínea</button>
      </div>
    </div>`;
  }

  function rebind() {
    document.querySelectorAll(".ed-ico-inp,.ed-titulo-inp").forEach(inp => {
      inp.addEventListener("change", () => { editDims[+inp.dataset.di][inp.dataset.f] = inp.value; });
    });
    document.querySelectorAll(".eda-inp").forEach(inp => {
      inp.addEventListener("change", () => { editDims[+inp.dataset.di].alineas[+inp.dataset.ai].texto = inp.value; });
    });
    document.querySelectorAll(".eda-del").forEach(btn => {
      btn.addEventListener("click", () => {
        const di=+btn.dataset.di, ai=+btn.dataset.ai;
        if (editDims[di].alineas.length<=1){toast("A dimensão precisa de pelo menos 1 alínea.","warn");return;}
        editDims[di].alineas.splice(ai,1); reindexAlineas(editDims[di]); rerender();
      });
    });
    document.querySelectorAll(".btn-add-al").forEach(btn => {
      btn.addEventListener("click", () => {
        const di=+btn.dataset.di, dim=editDims[di];
        dim.alineas.push({ id:`${dim.id}${String.fromCharCode(97+dim.alineas.length)}`, texto:"" });
        rerender();
        setTimeout(() => { const ins=document.querySelectorAll(`.eda-inp[data-di="${di}"]`); ins[ins.length-1]?.focus(); }, 50);
      });
    });
    document.querySelectorAll(".edc-up").forEach(btn => {
      btn.addEventListener("click", () => {
        const di=+btn.dataset.di; if(di===0)return;
        [editDims[di-1],editDims[di]]=[editDims[di],editDims[di-1]]; reindexDims(); rerender();
      });
    });
    document.querySelectorAll(".edc-dn").forEach(btn => {
      btn.addEventListener("click", () => {
        const di=+btn.dataset.di; if(di===editDims.length-1)return;
        [editDims[di],editDims[di+1]]=[editDims[di+1],editDims[di]]; reindexDims(); rerender();
      });
    });
    document.querySelectorAll(".edc-del").forEach(btn => {
      btn.addEventListener("click", () => {
        const di=+btn.dataset.di;
        if(editDims.length<=1){toast("O instrumento precisa de pelo menos 1 dimensão.","warn");return;}
        if(!confirm(`Remover a dimensão "${editDims[di].titulo}"?`))return;
        editDims.splice(di,1); reindexDims(); rerender();
      });
    });
    document.getElementById("btnAddDim").addEventListener("click", () => {
      const next=editDims.length+1;
      editDims.push({ id:`D${next}`, titulo:`Nova Dimensão ${next}`, icone:"📌", alineas:[{id:`D${next}a`,texto:""}] });
      rerender();
      setTimeout(() => { const ins=document.querySelectorAll(".ed-titulo-inp"); ins[ins.length-1]?.focus(); ins[ins.length-1]?.select(); }, 50);
    });
    document.getElementById("btnEdSave").addEventListener("click", async () => {
      document.querySelectorAll(".ed-ico-inp,.ed-titulo-inp").forEach(inp => { editDims[+inp.dataset.di][inp.dataset.f]=inp.value; });
      document.querySelectorAll(".eda-inp").forEach(inp => { editDims[+inp.dataset.di].alineas[+inp.dataset.ai].texto=inp.value; });
      for (const dim of editDims) {
        if (!dim.titulo.trim()) { toast("Todas as dimensões precisam ter título.","warn"); return; }
        for (const al of dim.alineas) { if (!al.texto.trim()) { toast(`Preencha todas as alíneas. (${dim.titulo})`,"warn"); return; } }
      }
      const btn=document.getElementById("btnEdSave");
      btn.textContent="Salvando..."; btn.disabled=true;
      try {
        await saveDimensoesConfig(editDims);
        toast("Alíneas salvas e publicadas! ✅","success");
        btn.textContent="💾 Salvar e Publicar"; btn.disabled=false; rerender();
      } catch(e) {
        toast("Erro ao salvar. ("+e.code+")","warn"); console.error(e);
        btn.textContent="💾 Salvar e Publicar"; btn.disabled=false;
      }
    });
    document.getElementById("btnEdReset").addEventListener("click", () => {
      if (!confirm("Restaurar alíneas padrão?")) return;
      editDims = JSON.parse(JSON.stringify(DIMENSOES_PADRAO)); rerender();
    });
  }

  function reindexDims() { editDims.forEach((dim,i) => { dim.id=`D${i+1}`; reindexAlineas(dim); }); }
  function reindexAlineas(dim) { dim.alineas.forEach((al,ai) => { al.id=`${dim.id}${String.fromCharCode(97+ai)}`; }); }
  function rerender() { document.getElementById("edDims").innerHTML=editDims.map((dim,di)=>buildDimHtml(dim,di)).join(""); rebind(); }

  document.getElementById("aMain").innerHTML = `<div class="adm-wrap">
    <div class="ed-header">
      <div>
        <h2 class="sec-t" style="margin:0">✏️ Alíneas Globais</h2>
        <p class="ed-sub">Estas são as alíneas base. Use a aba <strong>Alíneas por Setor</strong> para filtrar por setor.</p>
      </div>
      <div class="ed-actions">
        <button class="btn-ed-reset" id="btnEdReset">↩ Restaurar Padrão</button>
        <button class="btn-ed-save"  id="btnEdSave">💾 Salvar e Publicar</button>
      </div>
    </div>
    <div class="ed-dims" id="edDims">${editDims.map((dim,di)=>buildDimHtml(dim,di)).join("")}</div>
    <button class="btn-add-dim" id="btnAddDim">＋ Adicionar Dimensão</button>
  </div>`;
  rebind();
}

// ─── Editor Setores ───────────────────────────────────────────────
function renderEditorSetores() {
  let setorSel = SETORES[0].id;

  function getAtivas(sid) {
    const cfg = setorConfig[sid];
    if (!cfg || !cfg.alineasAtivas || cfg.alineasAtivas.length === 0)
      return new Set(DIMENSOES.flatMap(d => d.alineas.map(a => a.id)));
    return new Set(cfg.alineasAtivas);
  }

  function buildSetorBtns() {
    return SETORES.map(s => {
      const cfg = setorConfig[s.id];
      const temCfg = cfg && cfg.alineasAtivas && cfg.alineasAtivas.length > 0;
      return `<button class="setor-sel-btn${s.id===setorSel?" ss-active":""}" data-sid="${s.id}">
        <span class="ss-sig">${s.sigla}</span>
        ${temCfg ? `<span class="ss-badge">${cfg.alineasAtivas.length} al.</span>` : `<span class="ss-badge ss-all">todas</span>`}
      </button>`;
    }).join("");
  }

  function buildPanel(sid, ativas) {
    const setor  = SETORES.find(s => s.id === sid);
    const totalG = DIMENSOES.reduce((a,d) => a+d.alineas.length, 0);
    return `
      <div class="scp-head">
        <div class="scp-info">
          <span class="scp-sig">${setor.sigla}</span>
          <div>
            <div class="scp-nome">${setor.nome}</div>
            <div class="scp-ct" id="ativasCount">${ativas.size} de ${totalG} alíneas selecionadas</div>
          </div>
        </div>
        <div class="scp-actions">
          <button class="btn-sel-all"  id="btnSelAll">Selecionar todas</button>
          <button class="btn-sel-none" id="btnSelNone">Limpar seleção</button>
        </div>
      </div>
      <div class="scp-dims">
        ${DIMENSOES.map((dim, di) => {
          const qAtivas = dim.alineas.filter(al => ativas.has(al.id)).length;
          return `<div class="scp-dim">
            <div class="scp-dim-hdr">
              <label class="scp-dim-check">
                <input type="checkbox" class="ck-dim" data-di="${di}"
                  ${qAtivas===dim.alineas.length?"checked":""} ${qAtivas>0&&qAtivas<dim.alineas.length?'data-ind="1"':""} />
                <span class="scp-dim-ico">${dim.icone}</span>
                <span class="scp-dim-nome">${dim.titulo}</span>
              </label>
              <span class="scp-dim-ct" id="dimct-${di}">${qAtivas}/${dim.alineas.length}</span>
            </div>
            <div class="scp-alineas">
              ${dim.alineas.map((al, ai) => `
                <label class="scp-al-row${ativas.has(al.id)?" scp-al-on":""}">
                  <input type="checkbox" class="ck-al" data-alid="${al.id}" data-di="${di}" ${ativas.has(al.id)?"checked":""}/>
                  <span class="scp-al-idx">${String.fromCharCode(65+ai)}</span>
                  <span class="scp-al-txt">${al.texto}</span>
                </label>`).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>`;
  }

  function rebindPanel(ativas) {
    document.querySelectorAll(".ck-dim[data-ind]").forEach(ck => { ck.indeterminate = true; });
    document.querySelectorAll(".ck-al").forEach(ck => {
      ck.addEventListener("change", () => {
        if (ck.checked) ativas.add(ck.dataset.alid); else ativas.delete(ck.dataset.alid);
        ck.closest(".scp-al-row").classList.toggle("scp-al-on", ck.checked);
        updateDimCk(+ck.dataset.di, ativas); updateCount(ativas);
      });
    });
    document.querySelectorAll(".ck-dim").forEach(ck => {
      ck.addEventListener("change", () => {
        const di=+ck.dataset.di, dim=DIMENSOES[di];
        dim.alineas.forEach(al => {
          if (ck.checked) ativas.add(al.id); else ativas.delete(al.id);
          const c = document.querySelector(`.ck-al[data-alid="${al.id}"]`);
          if (c) { c.checked=ck.checked; c.closest(".scp-al-row").classList.toggle("scp-al-on",ck.checked); }
        });
        ck.indeterminate=false; updateCount(ativas); updateDimCount(di,ativas);
      });
    });
    document.getElementById("btnSelAll").addEventListener("click", () => {
      DIMENSOES.forEach(d => d.alineas.forEach(al => ativas.add(al.id))); refreshPanel(ativas);
    });
    document.getElementById("btnSelNone").addEventListener("click", () => { ativas.clear(); refreshPanel(ativas); });
    document.getElementById("btnSalvarSetor").addEventListener("click", async () => {
      const totalG = DIMENSOES.reduce((a,d) => a+d.alineas.length, 0);
      if (ativas.size === totalG) delete setorConfig[setorSel];
      else setorConfig[setorSel] = { alineasAtivas: [...ativas] };
      const btn=document.getElementById("btnSalvarSetor");
      btn.textContent="Salvando..."; btn.disabled=true;
      try {
        await saveSetorConfig();
        toast("Configuração do setor salva! ✅","success");
        btn.textContent="💾 Salvar Configuração"; btn.disabled=false;
        document.getElementById("setorBtns").innerHTML = buildSetorBtns();
        bindSetorBtns();
      } catch(e) {
        toast("Erro ao salvar. ("+e.code+")","warn"); console.error(e);
        btn.textContent="💾 Salvar Configuração"; btn.disabled=false;
      }
    });
  }

  function updateDimCk(di, ativas) {
    const dim=DIMENSOES[di], ck=document.querySelector(`.ck-dim[data-di="${di}"]`);
    if (!ck) return;
    const q = dim.alineas.filter(al => ativas.has(al.id)).length;
    ck.checked=q===dim.alineas.length; ck.indeterminate=q>0&&q<dim.alineas.length;
    updateDimCount(di, ativas);
  }
  function updateDimCount(di, ativas) {
    const dim=DIMENSOES[di], el=document.getElementById(`dimct-${di}`);
    if (el) el.textContent = `${dim.alineas.filter(al=>ativas.has(al.id)).length}/${dim.alineas.length}`;
  }
  function updateCount(ativas) {
    const el=document.getElementById("ativasCount");
    const total=DIMENSOES.reduce((a,d)=>a+d.alineas.length,0);
    if (el) el.textContent = `${ativas.size} de ${total} alíneas selecionadas`;
  }
  function refreshPanel(ativas) {
    document.getElementById("setorPanel").innerHTML = buildPanel(setorSel, ativas);
    rebindPanel(ativas);
  }
  function bindSetorBtns() {
    document.querySelectorAll(".setor-sel-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        setorSel = btn.dataset.sid;
        document.querySelectorAll(".setor-sel-btn").forEach(b => b.classList.toggle("ss-active", b.dataset.sid === setorSel));
        const a = getAtivas(setorSel);
        document.getElementById("setorPanel").innerHTML = buildPanel(setorSel, a);
        rebindPanel(a);
      });
    });
  }

  document.getElementById("aMain").innerHTML = `<div class="adm-wrap">
    <div class="ed-header">
      <div>
        <h2 class="sec-t" style="margin:0">🎯 Alíneas por Setor</h2>
        <p class="ed-sub">Defina quais alíneas cada setor deve responder. Sem configuração, o setor vê todas.</p>
      </div>
      <button class="btn-ed-save" id="btnSalvarSetor">💾 Salvar Configuração</button>
    </div>
    <div class="setor-sel-row" id="setorBtns">${buildSetorBtns()}</div>
    <div class="setor-config-panel" id="setorPanel">${buildPanel(setorSel, getAtivas(setorSel))}</div>
  </div>`;

  rebindPanel(getAtivas(setorSel));
  bindSetorBtns();
}

// ─── Detalhe Setor (Admin) ────────────────────────────────────────
function renderDetalheSetor(s) {
  document.getElementById("aMain").innerHTML = `<div class="adm-wrap">
    <div class="det-nav">
      <button class="btn-back" id="btnBack">← Voltar ao Painel</button>
      <button class="btn-exp btn-pdf-setor" id="btnPdfSetor">🖨 PDF do Setor</button>
    </div>
    <div class="det-hd">
      <div class="det-sig">${s.sigla}</div>
      <div>
        <h1 class="det-nome">${s.nome}</h1>
        <p class="det-sub">IMO: <strong style="color:${imoColor(s.imo)}">${s.imo}%</strong> ·
          ${s.respondidas}/${getTotalAlineasParaSetor(s.id)} alíneas ·
          <span class="${stCls(s.status)}">${stLbl(s.status)}</span> ·
          <span class="tb-ano-chip">📅 ${anoSelecionado}</span></p>
      </div>
    </div>
    <div class="charts-row" style="grid-template-columns:1.5fr 1fr">
      <div class="cc"><div class="cc-h">Desempenho por Dimensão (%)</div><canvas id="dBar"></canvas></div>
      <div class="cc"><div class="cc-h">Radar IMGG</div><canvas id="dRadar"></canvas></div>
    </div>
    ${DIMENSOES.map((dim, di) => {
      const med = s.dimScores[di] ?? 0;
      return `<div class="dim-det-card">
        <div class="ddc-hdr">
          <span>${dim.icone}</span><span class="ddc-t">${dim.titulo}</span>
          <span class="ddc-m" style="color:${imoColor(med)}">${med}%</span>
        </div>
        <table class="rt">
          <thead><tr><th>Alínea</th><th>Continuidade</th><th>Adequação</th><th>Observação</th><th>Anexos</th></tr></thead>
          <tbody>
            ${dim.alineas.map(al => {
              const r = s.resp[al.id] || {};
              return `<tr>
                <td class="rt-t">${al.texto}</td>
                <td class="rt-sn">${snBadge(r.continuidade)}</td>
                <td class="rt-sn">${snBadge(r.adequacao)}</td>
                <td class="rt-o">${r.obs ? `<span class="obs-text">${r.obs}</span>` : "—"}</td>
                <td class="rt-anx">${(r.anexos||[]).length > 0
                  ? (r.anexos||[]).map(a=>`<a href="${a.base64}" download="${a.nome}" class="anexo-link-adm">${anexoIco(a.tipo)} ${a.nome}</a>`).join("")
                  : "—"}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
    }).join("")}
  </div>`;

  document.getElementById("btnBack").addEventListener("click", async () => { renderAdminShell(); await renderAdminContent(); });
  document.getElementById("btnPdfSetor").addEventListener("click", () => exportPDFSetor(s));
  requestAnimationFrame(() => {
    destroyCharts();
    const dp     = s.dimScores;
    const labels = DIMENSOES.map(d => d.titulo.split(" ").slice(0,2).join(" "));
    chartInstances.dBar = new Chart(document.getElementById("dBar"), {
      type:"bar", data:{ labels, datasets:[{ label:"(%)", data:dp, backgroundColor:dp.map(v=>imoColorA(v,.75)), borderColor:dp.map(v=>imoColor(v)), borderWidth:2, borderRadius:8 }] },
      options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,max:100,ticks:{callback:v=>v+"%"}}} }
    });
    chartInstances.dRadar = new Chart(document.getElementById("dRadar"), {
      type:"radar", data:{ labels, datasets:[{ label:s.sigla, data:dp, backgroundColor:"rgba(6,182,212,.12)", borderColor:"#06b6d4", borderWidth:2, pointBackgroundColor:"#06b6d4", pointRadius:4 }] },
      options:{ responsive:true, scales:{r:{beginAtZero:true,max:100,ticks:{display:false}}}, plugins:{legend:{display:false}} }
    });
  });
}

// ─── Charts ───────────────────────────────────────────────────────
function renderChartBar(data) {
  chartInstances.bar = new Chart(document.getElementById("cBar"), {
    type:"bar", data:{ labels:data.map(s=>s.sigla), datasets:[{ label:"IMO (%)", data:data.map(s=>s.imo), backgroundColor:data.map(s=>imoColorA(s.imo,.75)), borderColor:data.map(s=>imoColor(s.imo)), borderWidth:2, borderRadius:8 }] },
    options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,max:100,ticks:{callback:v=>v+"%"}}} }
  });
}
function renderChartRadar(data) {
  const dm = DIMENSOES.map((_,di) => parseFloat((data.reduce((a,s) => a+(s.dimScores[di]??0), 0) / data.length).toFixed(1)));
  chartInstances.radar = new Chart(document.getElementById("cRadar"), {
    type:"radar", data:{ labels:DIMENSOES.map(d=>d.titulo.split(" ").slice(0,2).join(" ")), datasets:[{ label:"Média", data:dm, backgroundColor:"rgba(6,182,212,.12)", borderColor:"#06b6d4", borderWidth:2, pointBackgroundColor:"#06b6d4", pointRadius:4 }] },
    options:{ responsive:true, scales:{r:{beginAtZero:true,max:100,ticks:{display:false}}}, plugins:{legend:{display:false}} }
  });
}
function renderChartDonut(enviados, emAnd, naoIn) {
  chartInstances.donut = new Chart(document.getElementById("cDonut"), {
    type:"doughnut", data:{ labels:["Enviado","Em Andamento","Não Iniciado"], datasets:[{ data:[enviados,emAnd,naoIn], backgroundColor:["#22c55e","#eab308","#ef4444"], borderWidth:3, borderColor:"#fff" }] },
    options:{ responsive:true, cutout:"62%", plugins:{ legend:{ position:"bottom", labels:{ boxWidth:12, font:{size:11}, padding:12 } } } }
  });
}
function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
  chartInstances = {};
}

// ─── Card / List helpers ──────────────────────────────────────────
function setorCardHtml(s) {
  const total = getTotalAlineasParaSetor(s.id);
  const pct   = total > 0 ? Math.round((s.respondidas / total) * 100) : 0;
  return `<div class="setor-card" data-id="${s.id}" data-n="${s.nome}">
    <div class="sc-top"><span class="sc-sig">${s.sigla}</span><span class="${stCls(s.status)}">${stLbl(s.status)}</span></div>
    <div class="sc-nome">${s.nome}</div>
    <div class="sc-prog">
      <div class="sc-bar"><div class="sc-fill" style="width:${pct}%"></div></div>
      <span>${s.respondidas}/${total} · ${pct}%</span>
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
      <span class="ls-sig">${s.sigla}</span><span class="ls-nome">${s.nome}</span>
      <span class="ls-imo" style="color:${imoColor(s.imo)}">${s.imo}% IMO</span>
      <span class="${stCls(s.status)}">${stLbl(s.status)}</span>
    </summary>
    <div class="ls-body">
      ${DIMENSOES.map(dim => `
        <div class="ls-dim">
          <div class="ls-dh">${dim.icone} ${dim.titulo}</div>
          <table class="rt">
            <thead><tr><th>Alínea</th><th>Continuidade</th><th>Adequação</th><th>Observação</th><th>Anexos</th></tr></thead>
            <tbody>
              ${dim.alineas.map(al => {
                const r = s.resp[al.id] || {};
                return `<tr>
                  <td class="rt-t">${al.texto}</td>
                  <td class="rt-sn">${snBadge(r.continuidade)}</td>
                  <td class="rt-sn">${snBadge(r.adequacao)}</td>
                  <td class="rt-o">${r.obs ? `<span class="obs-text">${r.obs}</span>` : "—"}</td>
                  <td class="rt-anx">${(r.anexos||[]).length > 0
                    ? (r.anexos||[]).map(a=>`<a href="${a.base64}" download="${a.nome}" class="anexo-link-adm">${anexoIco(a.tipo)} ${a.nome}</a>`).join("")
                    : "—"}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`).join("")}
    </div>
  </details>`;
}

// ─── buildSetoresData ─────────────────────────────────────────────
function buildSetoresData(all) {
  return SETORES.map(s => {
    const d    = all[s.id] || {}, resp = d.respostas || {};
    const respondidas = Object.values(resp).filter(r => isRespondida(r)).length;
    const total = getTotalAlineasParaSetor(s.id);
    const imo   = calcIMO(resp, total);
    const status = d.status || "nao_iniciado";
    const dimScores = DIMENSOES.map(dim => {
      const maxPts = dim.alineas.length * 2;
      if (maxPts === 0) return 0;
      let pts = 0;
      dim.alineas.forEach(al => {
        const r = resp[al.id];
        if (r?.continuidade === "sim") pts++;
        if (r?.adequacao    === "sim") pts++;
      });
      return parseFloat(((pts / maxPts) * 100).toFixed(1));
    });
    return { ...s, resp, respondidas, imo, status, dimScores };
  });
}

// ─── Export ───────────────────────────────────────────────────────
function exportXLS(data) {
  let csv = `Ano;Setor;Sigla;Status;IMO (%)`;
  DIMENSOES.forEach(dim => dim.alineas.forEach(al => { csv += `;${al.id}_cont;${al.id}_adeq;${al.id}_obs`; }));
  csv += "\n";
  data.forEach(s => {
    csv += `${anoSelecionado};"${s.nome}";${s.sigla};"${stLbl(s.status)}";${s.imo}`;
    DIMENSOES.forEach(dim => dim.alineas.forEach(al => {
      const r = s.resp[al.id] || {};
      csv += `;${r.continuidade||""};${r.adequacao||""};\"${(r.obs||"").replace(/"/g,"'")}\"`;
    }));
    csv += "\n";
  });
  const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
  const a    = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `IMGG_SESAU_AL_${anoSelecionado}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  toast("Arquivo CSV/Excel exportado! ✅","success");
}

function exportPDFSetor(s) {
  const w      = window.open("", "_blank");
  const total  = getTotalAlineasParaSetor(s.id);
  const gerado = `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`;

  // ── Métricas de continuidade e adequação por dimensão
  const dimRows = DIMENSOES.map((dim, di) => {
    const maxPts = dim.alineas.length;
    let contSim=0, adeqSim=0;
    dim.alineas.forEach(al => {
      const r = s.resp[al.id] || {};
      if (r.continuidade === "sim") contSim++;
      if (r.adequacao    === "sim") adeqSim++;
    });
    const pctCont = maxPts > 0 ? Math.round((contSim/maxPts)*100) : 0;
    const pctAdeq = maxPts > 0 ? Math.round((adeqSim/maxPts)*100) : 0;
    const med     = s.dimScores[di] ?? 0;
    const cor     = med >= 80 ? "#06b6d4" : med >= 60 ? "#22c55e" : med >= 40 ? "#eab308" : med >= 20 ? "#f97316" : "#ef4444";
    return `<tr>
      <td>${dim.icone} ${dim.titulo}</td>
      <td style="text-align:center">${contSim}/${maxPts} (${pctCont}%)</td>
      <td style="text-align:center">${adeqSim}/${maxPts} (${pctAdeq}%)</td>
      <td style="text-align:center;font-weight:800;color:${cor}">${med}%</td>
    </tr>`;
  }).join("");

  // ── Respostas detalhadas por dimensão
  const detDims = DIMENSOES.map(dim => `
    <h3>${dim.icone} ${dim.titulo}</h3>
    <table>
      <thead><tr><th style="width:40%">Alínea</th><th>Continuidade</th><th>Adequação</th><th>Observação</th></tr></thead>
      <tbody>
        ${dim.alineas.map(al => {
          const r = s.resp[al.id] || {};
          const corC = r.continuidade==="sim"?"#16a34a":r.continuidade==="nao"?"#dc2626":"#6b7280";
          const corA = r.adequacao==="sim"?"#16a34a":r.adequacao==="nao"?"#dc2626":"#6b7280";
          return `<tr>
            <td>${al.texto}</td>
            <td style="text-align:center;font-weight:700;color:${corC}">${r.continuidade==="sim"?"✔ Sim":r.continuidade==="nao"?"✘ Não":"—"}</td>
            <td style="text-align:center;font-weight:700;color:${corA}">${r.adequacao==="sim"?"✔ Sim":r.adequacao==="nao"?"✘ Não":"—"}</td>
            <td>${r.obs ? `<em>${r.obs}</em>` : "—"}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`).join("");

  const imoNv = s.imo >= 80 ? "Otimizado" : s.imo >= 60 ? "Gerenciado" : s.imo >= 40 ? "Em Desenvolvimento" : s.imo >= 20 ? "Inicial" : "Inexistente";
  const imoC  = s.imo >= 80 ? "#06b6d4"   : s.imo >= 60 ? "#22c55e"    : s.imo >= 40 ? "#eab308"            : s.imo >= 20 ? "#f97316"  : "#ef4444";

  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>IMGG ${s.sigla} — ${anoSelecionado}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1a202c; padding: 24px; }
    .cover { text-align:center; padding: 40px 0 32px; border-bottom: 3px solid #003d7a; margin-bottom: 28px; }
    .cover-title { font-size: 22px; font-weight: 800; color: #003d7a; margin-bottom: 4px; }
    .cover-sub   { font-size: 13px; color: #64748b; margin-bottom: 20px; }
    .imo-box { display:inline-block; padding: 14px 32px; border-radius: 12px; border: 3px solid ${imoC}; background: #f8fafc; }
    .imo-val { font-size: 42px; font-weight: 900; color: ${imoC}; line-height:1; }
    .imo-lbl { font-size: 12px; color: #64748b; margin-top: 4px; }
    .imo-nv  { font-size: 13px; font-weight: 700; color: ${imoC}; margin-top: 2px; }
    .info-row { display:flex; justify-content:center; gap: 28px; margin-top: 20px; font-size: 12px; color: #374151; }
    .info-item span { font-weight: 700; color: #003d7a; }
    h2 { color: #003d7a; font-size: 14px; margin: 28px 0 8px; border-bottom: 2px solid #003d7a; padding-bottom: 5px; }
    h3 { font-size: 11px; color: #374151; margin: 16px 0 4px; padding: 4px 10px; background: #f1f5f9; border-left: 3px solid #003d7a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10px; }
    th { background: #003d7a; color: white; padding: 6px 8px; text-align: left; }
    td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .badge { display:inline-block; padding:2px 9px; border-radius:10px; font-size:9px; font-weight:700; }
    .env { background:#d1fae5; color:#065f46; }
    .and { background:#fef3c7; color:#92400e; }
    .nao { background:#fee2e2; color:#991b1b; }
    @page { margin: 1.5cm; }
  </style>
  </head><body>

  <div class="cover">
    <div class="cover-title">IMGG — ${s.sigla} · ${s.nome}</div>
    <div class="cover-sub">Instrumento de Maturidade, Governança e Gestão · SESAU Alagoas · Ano ${anoSelecionado}</div>
    <div class="imo-box">
      <div class="imo-val">${s.imo}%</div>
      <div class="imo-lbl">Índice de Maturidade Organizacional</div>
      <div class="imo-nv">${imoNv}</div>
    </div>
    <div class="info-row">
      <div class="info-item">Alíneas respondidas: <span>${s.respondidas}/${total}</span></div>
      <div class="info-item">Status: <span>${stLbl(s.status)}</span></div>
      <div class="info-item">Gerado em: <span>${gerado}</span></div>
    </div>
  </div>

  <h2>Resumo por Dimensão</h2>
  <table>
    <thead><tr><th>Dimensão</th><th>Continuidade (Sim)</th><th>Adequação (Sim)</th><th>IMO</th></tr></thead>
    <tbody>${dimRows}</tbody>
  </table>

  <h2>Respostas Detalhadas</h2>
  ${detDims}

  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 700);
  toast("PDF do setor gerado! 🖨", "success");
}

function exportPDF(data) {
  const w = window.open("","_blank");
  const linhas = data.map(s => `<tr><td>${s.nome}</td><td>${s.sigla}</td><td>${s.respondidas}/${getTotalAlineasParaSetor(s.id)}</td><td class="nota">${s.imo}%</td><td><span class="badge ${s.status==="enviado"?"env":["em_andamento","concluido"].includes(s.status)?"and":"nao"}">${stLbl(s.status)}</span></td></tr>`).join("");
  const det = data.filter(s => s.respondidas > 0).map(s => `
    <h2>${s.sigla} — ${s.nome} | IMO: ${s.imo}% | ${anoSelecionado}</h2>
    ${DIMENSOES.map(dim => `
      <h3>${dim.icone} ${dim.titulo}</h3>
      <table>
        <thead><tr><th style="width:38%">Alínea</th><th>Continuidade</th><th>Adequação</th><th>Observação</th></tr></thead>
        <tbody>
          ${dim.alineas.map(al => {
            const r = s.resp[al.id] || {};
            return `<tr>
              <td>${al.texto}</td>
              <td style="text-align:center;font-weight:700;color:${r.continuidade==="sim"?"#16a34a":r.continuidade==="nao"?"#dc2626":"#6b7280"}">${r.continuidade==="sim"?"✔ Sim":r.continuidade==="nao"?"✘ Não":"—"}</td>
              <td style="text-align:center;font-weight:700;color:${r.adequacao==="sim"?"#16a34a":r.adequacao==="nao"?"#dc2626":"#6b7280"}">${r.adequacao==="sim"?"✔ Sim":r.adequacao==="nao"?"✘ Não":"—"}</td>
              <td>${r.obs||"—"}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`).join("")}`).join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IMGG SESAU-AL ${anoSelecionado}</title><style>body{font-family:Arial,sans-serif;font-size:11px;color:#1a202c;padding:20px}h1{color:#003d7a;font-size:18px}h2{color:#003d7a;font-size:13px;margin:24px 0 6px;border-bottom:2px solid #003d7a;padding-bottom:4px}h3{font-size:11px;color:#374151;margin:14px 0 4px;padding:4px 8px;background:#f8fafc}table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:10px}th{background:#003d7a;color:white;padding:5px 8px;text-align:left}td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}tr:nth-child(even) td{background:#f8fafc}.nota{font-weight:700;font-size:12px}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700}.env{background:#d1fae5;color:#065f46}.and{background:#fef3c7;color:#92400e}.nao{background:#fee2e2;color:#991b1b}@page{margin:1.5cm}</style></head><body><h1>IMGG — Instrumento de Maturidade, Governança e Gestão</h1><p>SESAU · Alagoas · Ano: <strong>${anoSelecionado}</strong> · Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p><h2>Resumo Geral — ${anoSelecionado}</h2><table><thead><tr><th>Setor</th><th>Sigla</th><th>Respondidas</th><th>IMO (%)</th><th>Status</th></tr></thead><tbody>${linhas}</tbody></table>${det}</body></html>`);
  w.document.close(); setTimeout(() => w.print(), 700);
  toast("Janela de impressão/PDF aberta! 🖨","success");
}

// ─── Utils ────────────────────────────────────────────────────────
function snBadge(val) {
  if (val === "sim") return `<span class="sn-badge sn-badge-sim">✔ Sim</span>`;
  if (val === "nao") return `<span class="sn-badge sn-badge-nao">✘ Não</span>`;
  return `<span class="sn-badge sn-badge-nd">—</span>`;
}

function imoColor(p)  { if(p>=80)return"#06b6d4";if(p>=60)return"#22c55e";if(p>=40)return"#eab308";if(p>=20)return"#f97316";return"#ef4444"; }
function imoColorA(p,a){ const c=imoColor(p),r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);return`rgba(${r},${g},${b},${a})`; }
function imoNivel(p)  { if(p>=80)return"Nível Otimizado — Excelência comprovada";if(p>=60)return"Nível Gerenciado — Bem implementado";if(p>=40)return"Nível em Desenvolvimento — Em estruturação";if(p>=20)return"Nível Inicial — Esforços pontuais";return"Nível Inexistente — Sem implementação"; }
function stCls(s)     { if(s==="enviado")return"b-green";if(["em_andamento","concluido"].includes(s))return"b-yellow";return"b-red"; }
function stLbl(s)     { return{enviado:"Enviado",em_andamento:"Em Andamento",concluido:"Concluído",nao_iniciado:"Não Iniciado"}[s]||"Não Iniciado"; }
function toast(msg, type="info") { let t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t);}t.textContent=msg;t.className=`toast t-${type} show`;clearTimeout(window._tt);window._tt=setTimeout(()=>t.className="toast",3500); }

document.addEventListener("DOMContentLoaded", () => renderLogin());