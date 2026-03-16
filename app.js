// ═══════════════════════════════════════════════════════════════
//  IMGG · SESAU Alagoas — JavaScript Principal
//  v4.0 — obs sempre visível + ícones corrigidos
// ═══════════════════════════════════════════════════════════════

import { initializeApp }                                         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ═══════════════════════════════════════════════════════════════
//  🔥 FIREBASE
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  CONSTANTES
// ═══════════════════════════════════════════════════════════════
const ADMIN_EMAIL    = "assessoriatransparenciasesau@gmail.com";
const ADMIN_SETOR_ID = "asset";

const SETORES = [
  { id:"asset", nome:"Transparência",                 sigla:"ASSET", email:"assessoriatransparenciasesau@gmail.com" },
  { id:"gab",   nome:"Gabinete",                      sigla:"GAB",   email:"gab@sesau.al.gov.br"   },
  { id:"daf",   nome:"Diretoria Adm. e Financeira",   sigla:"DAF",   email:"daf@sesau.al.gov.br"   },
  { id:"dge",   nome:"Gestão Estratégica",            sigla:"DGE",   email:"dge@sesau.al.gov.br"   },
  { id:"das",   nome:"Atenção à Saúde",               sigla:"DAS",   email:"das@sesau.al.gov.br"   },
  { id:"dvs",   nome:"Vigilância em Saúde",           sigla:"DVS",   email:"dvs@sesau.al.gov.br"   },
  { id:"dths",  nome:"Gestão do Trabalho e Educação", sigla:"DTHS",  email:"dths@sesau.al.gov.br"  },
  { id:"dgti",  nome:"Tecnologia da Informação",      sigla:"DGTI",  email:"dgti@sesau.al.gov.br"  },
  { id:"cge",   nome:"Controle e Gestão Estadual",    sigla:"CGE",   email:"cge@sesau.al.gov.br"   },
  { id:"pge",   nome:"Planejamento e Gestão",         sigla:"PGE",   email:"pge@sesau.al.gov.br"   },
  { id:"jur",   nome:"Assessoria Jurídica",           sigla:"JUR",   email:"jur@sesau.al.gov.br"   },
];

const ESCALA = [
  { valor:1, label:"Inexistente",        descricao:"Não há evidência de implementação",          cor:"#ef4444" },
  { valor:2, label:"Inicial",            descricao:"Esforços pontuais, sem sistematização",      cor:"#f97316" },
  { valor:3, label:"Em Desenvolvimento", descricao:"Parcialmente implementado, em estruturação", cor:"#eab308" },
  { valor:4, label:"Gerenciado",         descricao:"Implementado e monitorado regularmente",     cor:"#22c55e" },
  { valor:5, label:"Otimizado",          descricao:"Excelência e melhoria contínua comprovada",  cor:"#06b6d4" },
];

// ─── Ícones ajustados ao título de cada dimensão ───────────────
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

// ═══════════════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════
let DIMENSOES     = JSON.parse(JSON.stringify(DIMENSOES_PADRAO));
let TOTAL_ALINEAS = DIMENSOES.reduce((s,d)=>s+d.alineas.length,0);
let setorConfig   = {};

let currentUser    = null;
let currentSetorId = null;
let isAdmin        = false;
let adminMode      = true;
let respostasSetor = {};
let chartInstances = {};
let adminTab       = "dashboard";

// ═══════════════════════════════════════════════════════════════
//  HELPERS DE ALÍNEAS POR SETOR
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  FIREBASE — CONFIG
//  IMPORTANTE: nas Security Rules do Firestore use:
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /{document=**} {
//          allow read, write: if request.auth != null;
//        }
//      }
//    }
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  FIREBASE — RESPOSTAS
// ═══════════════════════════════════════════════════════════════
async function loadRespostas(id) {
  try {
    const snap = await getDoc(doc(db,"respostas",id));
    respostasSetor = snap.exists() ? (snap.data().respostas||{}) : {};
  } catch(e) { respostasSetor = {}; }
}

async function saveResposta(setorId, alId, valor, obs) {
  respostasSetor[alId] = { valor, obs, ts: new Date().toISOString() };
  const total      = getTotalAlineasParaSetor(setorId);
  const respondidas = Object.keys(respostasSetor).filter(k => respostasSetor[k].valor !== null && respostasSetor[k].valor !== undefined).length;
  const pts        = Object.values(respostasSetor).reduce((a,r)=>a+(r.valor||0),0);
  const imo        = respondidas > 0 ? parseFloat(((pts/(respondidas*5))*100).toFixed(1)) : 0;
  try {
    await setDoc(doc(db,"respostas",setorId), {
      setorId, respostas:respostasSetor, respondidas, imo,
      status: respondidas===0?"nao_iniciado":respondidas<total?"em_andamento":"concluido",
      updatedAt: serverTimestamp(),
    },{merge:true});
  } catch(e) {
    toast("Erro ao salvar: " + e.message + " — Verifique as regras do Firestore.", "warn");
    console.error("saveResposta:", e);
  }
}

async function submitForm(setorId) {
  const total      = getTotalAlineasParaSetor(setorId);
  const respondidas = Object.keys(respostasSetor).filter(k => respostasSetor[k].valor !== null && respostasSetor[k].valor !== undefined).length;
  if (respondidas < total) { toast(`Responda todas as ${total} alíneas. (${respondidas}/${total})`,"warn"); return; }
  const pts = Object.values(respostasSetor).reduce((a,r)=>a+(r.valor||0),0);
  const imo = parseFloat(((pts/(total*5))*100).toFixed(1));
  try {
    await setDoc(doc(db,"respostas",setorId),{
      setorId, respostas:respostasSetor, respondidas:total, imo,
      status:"enviado", enviadoEm:serverTimestamp(), updatedAt:serverTimestamp(),
    },{merge:true});
    toast("Avaliação enviada com sucesso! ✅","success");
    renderForm();
  } catch(e) {
    toast("Erro ao enviar: " + e.message + " — Verifique as regras do Firestore.", "warn");
    console.error("submitForm:", e);
  }
}

async function loadAll() {
  const snap = await getDocs(collection(db,"respostas"));
  const result = {};
  snap.forEach(d => result[d.id] = d.data());
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
onAuthStateChanged(auth, async (user) => {
  await loadDimensoesConfig();
  await loadSetorConfig();
  if (user) {
    currentUser = user;
    if (user.email === ADMIN_EMAIL) {
      isAdmin = true; adminMode = true; adminTab = "dashboard";
      renderAdminShell();
      await renderAdminContent();
    } else {
      const setor = SETORES.find(s=>s.email===user.email);
      if (setor) {
        isAdmin = false; currentSetorId = setor.id;
        await loadRespostas(setor.id);
        renderSetorShell(setor); renderForm();
      } else { await signOut(auth); }
    }
  } else {
    currentUser=null; isAdmin=false; currentSetorId=null; adminMode=true;
    renderLogin();
  }
});

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════
function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div class="login-bg">
      <div class="orb orb1"></div><div class="orb orb2"></div>
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
  const email=document.getElementById("lEmail").value.trim();
  const senha=document.getElementById("lSenha").value;
  const btn=document.getElementById("lBtn"), err=document.getElementById("lErr");
  btn.textContent="Entrando..."; btn.disabled=true; err.textContent="";
  try { await signInWithEmailAndPassword(auth,email,senha); }
  catch(e) { err.textContent="E-mail ou senha inválidos."; btn.textContent="Acessar Sistema"; btn.disabled=false; }
}

// ═══════════════════════════════════════════════════════════════
//  SETOR — SHELL
// ═══════════════════════════════════════════════════════════════
function renderSetorShell(setor, isAdminToggled=false) {
  document.getElementById("app").innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-l">
          <div class="tb-seal">AL</div>
          <div><span class="tb-sys">IMGG · SESAU Alagoas</span>
          <span class="tb-sub">Instrumento de Maturidade, Governança e Gestão</span></div>
        </div>
        <div class="topbar-r">
          <div class="tb-chip">${setor.sigla} — ${setor.nome}</div>
          ${isAdminToggled ? `<button class="btn-toggle-admin" id="btnVoltarAdmin">🔐 Voltar ao Painel Admin</button>` : ""}
          <button class="btn-sair" id="btnSair">Sair</button>
        </div>
      </header>
      <div class="prog-strip"><div class="prog-fill" id="progFill"></div></div>
      <div class="prog-info" id="progInfo"></div>
      <main class="setor-main" id="sMain"></main>
    </div>`;
  document.getElementById("btnSair").addEventListener("click",()=>signOut(auth));
  if (isAdminToggled) {
    document.getElementById("btnVoltarAdmin").addEventListener("click",()=>{
      adminMode=true; renderAdminShell(); renderAdminContent();
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  SETOR — FORMULÁRIO
//  FIX: campo de observação sempre visível desde o início
// ═══════════════════════════════════════════════════════════════
function renderForm() {
  const setorId    = currentSetorId;
  const dimsSetor  = getDimensoesParaSetor(setorId);
  const totalSetor = dimsSetor.reduce((s,d)=>s+d.alineas.length,0);

  // Conta apenas alíneas que têm nota selecionada
  const respondidas = Object.values(respostasSetor).filter(r => r.valor !== null && r.valor !== undefined).length;
  const pct = totalSetor>0 ? Math.round((respondidas/totalSetor)*100) : 0;

  document.getElementById("progFill").style.width = pct+"%";
  document.getElementById("progInfo").innerHTML = `
    <span class="pi-num">${respondidas}<span class="pi-of">/${totalSetor}</span></span>
    <span class="pi-lbl">alíneas respondidas</span>
    <span class="pi-pct">${pct}%</span>`;

  let html = `<div class="form-wrap">
    <div class="form-head">
      <h1 class="fh-title">Avaliação IMGG 2025</h1>
      <p class="fh-desc">Avalie cada alínea na escala de <strong>1 a 5</strong> e descreva a evidência ou justificativa no campo de texto. As respostas são salvas automaticamente.</p>
      <div class="esc-legend">
        ${ESCALA.map(e=>`
          <div class="eld"><span class="eld-dot" style="background:${e.cor}">${e.valor}</span>
          <div><span class="eld-lbl">${e.label}</span><span class="eld-desc">${e.descricao}</span></div></div>`).join("")}
      </div>
    </div>`;

  dimsSetor.forEach((dim,di) => {
    const respDim  = dim.alineas.filter(a => respostasSetor[a.id]?.valor !== undefined && respostasSetor[a.id]?.valor !== null).length;
    const completa = respDim===dim.alineas.length;

    html += `
    <div class="dim-bloco${completa?" dim-ok":""}">
      <div class="dim-hdr">
        <span class="dim-ico">${dim.icone}</span>
        <div class="dim-hdr-t">
          <span class="dim-cod">Dimensão ${di+1}</span>
          <span class="dim-nome">${dim.titulo}</span>
        </div>
        <span class="dim-ct${completa?" dc-ok":""}">${respDim}/${dim.alineas.length}</span>
      </div>
      <div class="alineas">`;

    dim.alineas.forEach((al,ai) => {
      const r   = respostasSetor[al.id];
      const val = r?.valor ?? null;
      const obs = r?.obs ?? "";

      html += `
        <div class="alinea${val!==null?" al-ok":""}" id="al-${al.id}">
          <div class="al-idx">${String.fromCharCode(65+ai)}</div>
          <div class="al-body">
            <p class="al-txt">${al.texto}</p>
            <div class="al-esc">
              ${ESCALA.map(op=>`
                <button class="eb${val===op.valor?" eb-sel":""}"
                  style="${val===op.valor?`background:${op.cor};border-color:${op.cor};color:#fff;`:""}"
                  title="${op.descricao}" data-alinea="${al.id}" data-valor="${op.valor}">
                  <span class="eb-n">${op.valor}</span><span class="eb-l">${op.label}</span>
                </button>`).join("")}
            </div>
            <div class="al-obs-wrap">
              <label class="al-obs-label" for="obs-${al.id}">
                📝 Descrição / Evidência
                <span class="al-obs-hint">${val===null ? "(preencha após selecionar nota)" : "(opcional)"}</span>
              </label>
              <textarea class="al-obs"
                id="obs-${al.id}"
                data-alinea="${al.id}"
                placeholder="Descreva a evidência, justificativa ou contexto desta resposta..."
                rows="3">${obs}</textarea>
            </div>
          </div>
        </div>`;
    });
    html += `</div></div>`;
  });

  const faltam = totalSetor - respondidas;
  html += `<div class="submit-zone">
    <button class="btn-submit${faltam>0?" btn-sd":""}" id="btnSubmit" ${faltam>0?"disabled":""}>
      ${faltam>0?`Faltam ${faltam} alínea${faltam>1?"s":""} para enviar`:"📤 Enviar Avaliação IMGG"}
    </button>
  </div></div>`;

  document.getElementById("sMain").innerHTML = html;

  // Salva nota ao clicar
  document.querySelectorAll(".eb").forEach(btn => {
    btn.addEventListener("click", async () => {
      const alId  = btn.dataset.alinea;
      const valor = parseInt(btn.dataset.valor);
      const obs   = document.getElementById("obs-"+alId)?.value || "";
      const top   = (document.getElementById("al-"+alId)?.getBoundingClientRect().top||0)+window.scrollY-100;
      await saveResposta(currentSetorId, alId, valor, obs);
      renderForm();
      requestAnimationFrame(()=>window.scrollTo({top,behavior:"smooth"}));
    });
  });

  // Salva obs ao sair do campo (blur)
  document.querySelectorAll(".al-obs").forEach(input => {
    input.addEventListener("blur", async () => {
      const alId = input.dataset.alinea;
      const r    = respostasSetor[alId];
      if (r && r.valor !== null && r.valor !== undefined) {
        await saveResposta(currentSetorId, alId, r.valor, input.value);
      } else if (input.value.trim()) {
        // Tem texto mas sem nota ainda — salva o texto temporariamente sem nota
        respostasSetor[alId] = { valor: null, obs: input.value, ts: new Date().toISOString() };
      }
    });
  });

  document.getElementById("btnSubmit")?.addEventListener("click",()=>submitForm(currentSetorId));
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — SHELL
// ═══════════════════════════════════════════════════════════════
function renderAdminShell() {
  const setorAsset = SETORES.find(s=>s.id===ADMIN_SETOR_ID);
  document.getElementById("app").innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-l">
          <div class="tb-seal">AL</div>
          <div><span class="tb-sys">IMGG · SESAU Alagoas</span>
          <span class="tb-sub">Painel Administrativo</span></div>
        </div>
        <div class="topbar-r">
          <div class="tb-chip adm-chip">🔐 Administrador</div>
          <button class="btn-toggle-admin" id="btnResponder">
            📝 Responder como ${setorAsset?.sigla||"ASSET"}
          </button>
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
      </nav>
      <main class="admin-main" id="aMain">
        <div class="loading">⏳ Carregando dados do Firebase...</div>
      </main>
    </div>`;

  document.getElementById("btnResponder").addEventListener("click", async () => {
    adminMode=false; currentSetorId=ADMIN_SETOR_ID;
    await loadRespostas(ADMIN_SETOR_ID);
    renderSetorShell(SETORES.find(s=>s.id===ADMIN_SETOR_ID), true);
    renderForm();
  });
  document.getElementById("btnSair").addEventListener("click",()=>signOut(auth));
  document.querySelectorAll(".adm-tab").forEach(btn => {
    btn.addEventListener("click", async () => {
      adminTab=btn.dataset.tab;
      document.querySelectorAll(".adm-tab").forEach(b=>b.classList.toggle("at-active",b.dataset.tab===adminTab));
      document.getElementById("aMain").innerHTML=`<div class="loading">⏳ Carregando...</div>`;
      destroyCharts();
      if (adminTab==="editor")  { renderEditorAlineas(); return; }
      if (adminTab==="setores") { renderEditorSetores(); return; }
      const all=await loadAll(), data=buildSetoresData(all);
      window._adminData=data;
      if (adminTab==="dashboard") renderDashboardTab(data);
      if (adminTab==="metricas")  renderMetricasTab(data);
      if (adminTab==="respostas") renderRespostasTab(data);
    });
  });
}

async function renderAdminContent() {
  const all=await loadAll(), data=buildSetoresData(all);
  window._adminData=data;
  renderDashboardTab(data);
  document.getElementById("btnXls").addEventListener("click",()=>exportXLS(window._adminData||data));
  document.getElementById("btnPdf").addEventListener("click",()=>exportPDF(window._adminData||data));
}

// ═══════════════════════════════════════════════════════════════
//  ABA: DASHBOARD
// ═══════════════════════════════════════════════════════════════
function renderDashboardTab(data) {
  const enviados=data.filter(s=>s.status==="enviado").length;
  const emAnd=data.filter(s=>["em_andamento","concluido"].includes(s.status)).length;
  const naoIn=data.filter(s=>s.status==="nao_iniciado").length;
  const mediaIMO=parseFloat((data.reduce((a,s)=>a+s.imo,0)/data.length).toFixed(1));

  document.getElementById("aMain").innerHTML=`<div class="adm-wrap">
    <div class="kpi-row">
      <div class="kpi k-blue">  <div class="kv">${data.length}</div><div class="kl">Setores</div></div>
      <div class="kpi k-green"> <div class="kv">${enviados}</div>  <div class="kl">Enviados</div></div>
      <div class="kpi k-yellow"><div class="kv">${emAnd}</div>     <div class="kl">Em Andamento</div></div>
      <div class="kpi k-red">   <div class="kv">${naoIn}</div>     <div class="kl">Não Iniciados</div></div>
      <div class="kpi k-cyan">  <div class="kv">${mediaIMO}%</div> <div class="kl">IMO Médio</div></div>
    </div>
    <div class="charts-row">
      <div class="cc cc-bar">   <div class="cc-h">IMO por Setor (%)</div>     <canvas id="cBar"></canvas></div>
      <div class="cc cc-radar"> <div class="cc-h">Média por Dimensão</div>    <canvas id="cRadar"></canvas></div>
      <div class="cc cc-donut"> <div class="cc-h">Status das Avaliações</div> <canvas id="cDonut"></canvas></div>
    </div>
    <div class="sec-hdr">
      <h2 class="sec-t">Setores</h2>
      <input class="s-search" id="sSearch" placeholder="🔍 Filtrar setor...">
    </div>
    <div class="setores-grid" id="setGrid">${data.map(s=>setorCardHtml(s)).join("")}</div>
  </div>`;

  requestAnimationFrame(()=>{ destroyCharts(); renderChartBar(data); renderChartRadar(data); renderChartDonut(enviados,emAnd,naoIn); });
  document.getElementById("sSearch").addEventListener("input",e=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll(".setor-card").forEach(c=>{ c.style.display=c.dataset.n.toLowerCase().includes(q)?"":'none'; });
  });
  document.querySelectorAll(".setor-card").forEach(card=>{
    card.addEventListener("click",()=>{ const s=data.find(x=>x.id===card.dataset.id); if(s) renderDetalheSetor(s); });
  });
}

// ═══════════════════════════════════════════════════════════════
//  ABA: MÉTRICAS
// ═══════════════════════════════════════════════════════════════
function renderMetricasTab(data) {
  const total=data.length;
  const mediaIMO=parseFloat((data.reduce((a,s)=>a+s.imo,0)/total).toFixed(1));
  const dimMedias=DIMENSOES.map((dim,di)=>{
    const vals=data.map(s=>s.dimScores[di]??0);
    return {dim,di,med:parseFloat((vals.reduce((a,v)=>a+v,0)/total).toFixed(1)),min:Math.min(...vals),max:Math.max(...vals)};
  });
  const ranking=[...data].sort((a,b)=>b.imo-a.imo);
  const faixas=[
    {label:"Crítico (0–20%)",    min:0, max:20,  cor:"#ef4444",count:0},
    {label:"Baixo (20–40%)",     min:20,max:40,  cor:"#f97316",count:0},
    {label:"Moderado (40–60%)",  min:40,max:60,  cor:"#eab308",count:0},
    {label:"Bom (60–80%)",       min:60,max:80,  cor:"#22c55e",count:0},
    {label:"Excelente (80–100%)",min:80,max:101, cor:"#06b6d4",count:0},
  ];
  data.forEach(s=>{ const f=faixas.find(f=>s.imo>=f.min&&s.imo<f.max); if(f) f.count++; });

  document.getElementById("aMain").innerHTML=`<div class="adm-wrap">
    <h2 class="sec-t" style="margin-bottom:20px">📈 Métricas e Indicadores — IMGG 2025</h2>
    <div class="met-hero">
      <div class="mh-left">
        <div class="mh-label">Índice de Maturidade Organizacional Médio</div>
        <div class="mh-value" style="color:${imoColor(mediaIMO)}">${mediaIMO}%</div>
        <div class="mh-sub">${imoNivel(mediaIMO)}</div>
      </div>
      <div class="mh-right"><canvas id="cMetDonut" width="160" height="160"></canvas></div>
    </div>
    <div class="met-section">
      <h3 class="met-sh">Distribuição por Faixa de Maturidade</h3>
      <div class="faixas-grid">
        ${faixas.map(f=>`
          <div class="faixa-card" style="border-left:4px solid ${f.cor}">
            <div class="fc-count" style="color:${f.cor}">${f.count}</div>
            <div class="fc-pct">${total>0?Math.round((f.count/total)*100):0}% dos setores</div>
            <div class="fc-label">${f.label}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="met-section">
      <h3 class="met-sh">Ranking de Setores por IMO</h3>
      <div class="ranking-list">
        ${ranking.map((s,i)=>`
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
      ${dimMedias.map(({dim,di,med,min,max})=>`
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
            ${data.map(s=>{ const v=s.dimScores[di]??0; return `<div class="dmc-s">
              <span class="dmc-ssig">${s.sigla}</span>
              <div class="dmc-sbar"><div style="width:${v}%;background:${imoColor(v)};height:100%;border-radius:2px"></div></div>
              <span class="dmc-sv" style="color:${imoColor(v)}">${v}%</span>
            </div>`; }).join("")}
          </div>
        </div>`).join("")}
    </div>
    <div class="met-section">
      <h3 class="met-sh">Mapa de Calor — Média por Alínea</h3>
      <div class="heatmap-wrap">
        ${DIMENSOES.map(dim=>`
          <div class="hm-dim">
            <div class="hm-dtit">${dim.icone} ${dim.titulo}</div>
            <div class="hm-alineas">
              ${dim.alineas.map(al=>{
                const medAl=data.length>0?parseFloat((data.reduce((a,s)=>a+(s.resp[al.id]?.valor||0),0)/data.length).toFixed(1)):0;
                const pct=(medAl/5)*100;
                return `<div class="hm-cel" style="background:${imoColorA(pct,.85)}" title="${al.texto} — Média: ${medAl}/5">
                  <div class="hm-code">${al.id}</div><div class="hm-val">${medAl}</div>
                </div>`;
              }).join("")}
            </div>
          </div>`).join("")}
      </div>
    </div>
  </div>`;

  requestAnimationFrame(()=>{
    destroyCharts();
    chartInstances.metDonut=new Chart(document.getElementById("cMetDonut"),{
      type:"doughnut",
      data:{datasets:[{data:[mediaIMO,100-mediaIMO],backgroundColor:[imoColor(mediaIMO),"#f1f5f9"],borderWidth:0}]},
      options:{cutout:"72%",plugins:{legend:{display:false},tooltip:{enabled:false}}},
      plugins:[{id:"ct",afterDraw(c){const{ctx,chartArea:{top,bottom,left,right}}=c;const cx=(left+right)/2,cy=(top+bottom)/2;ctx.save();ctx.font="bold 22px Sora,sans-serif";ctx.fillStyle=imoColor(mediaIMO);ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(mediaIMO+"%",cx,cy);ctx.restore();}}]
    });
    const dimLabels=DIMENSOES.map(d=>d.titulo.split(" ").slice(0,2).join(" "));
    const dimVals=DIMENSOES.map((_,di)=>parseFloat((data.reduce((a,s)=>a+(s.dimScores[di]??0),0)/data.length).toFixed(1)));
    chartInstances.dimBar=new Chart(document.getElementById("cDimBar"),{
      type:"bar",data:{labels:dimLabels,datasets:[{label:"%",data:dimVals,backgroundColor:dimVals.map(v=>imoColorA(v,.75)),borderColor:dimVals.map(v=>imoColor(v)),borderWidth:2,borderRadius:8}]},
      options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100,ticks:{callback:v=>v+"%"}}}}
    });
    chartInstances.dimRadar=new Chart(document.getElementById("cDimRadar"),{
      type:"radar",data:{labels:dimLabels,datasets:[{label:"Média",data:dimVals,backgroundColor:"rgba(6,182,212,.12)",borderColor:"#06b6d4",borderWidth:2,pointBackgroundColor:"#06b6d4",pointRadius:4}]},
      options:{responsive:true,scales:{r:{beginAtZero:true,max:100,ticks:{display:false}}},plugins:{legend:{display:false}}}
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  ABA: RESPOSTAS
// ═══════════════════════════════════════════════════════════════
function renderRespostasTab(data) {
  document.getElementById("aMain").innerHTML=`<div class="adm-wrap">
    <div class="sec-hdr">
      <h2 class="sec-t">Listagem Completa de Respostas</h2>
      <input class="s-search" id="sSearchResp" placeholder="🔍 Filtrar setor...">
    </div>
    <div style="margin-bottom:28px">
      <h3 class="met-sh">Desempenho Médio por Dimensão</h3>
      <div class="dim-analysis">
        ${DIMENSOES.map((dim,di)=>{
          const med=parseFloat((data.reduce((a,s)=>a+(s.dimScores[di]??0),0)/data.length).toFixed(1));
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
      ${data.filter(s=>s.respondidas>0).map(s=>listItemHtml(s)).join("")}
    </div>
  </div>`;
  document.getElementById("sSearchResp").addEventListener("input",e=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll(".ls-det").forEach(c=>{ c.style.display=(c.dataset.n||"").toLowerCase().includes(q)?"":'none'; });
  });
  document.querySelectorAll(".ls-det").forEach((el,i)=>{
    const s=data.filter(s=>s.respondidas>0)[i]; if(s) el.dataset.n=s.nome;
  });
}

// ═══════════════════════════════════════════════════════════════
//  ABA: EDITOR GLOBAL DE ALÍNEAS
// ═══════════════════════════════════════════════════════════════
function renderEditorAlineas() {
  let editDims=JSON.parse(JSON.stringify(DIMENSOES));

  function buildDimHtml(dim,di) {
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
        ${dim.alineas.map((al,ai)=>`
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
    document.querySelectorAll(".ed-ico-inp,.ed-titulo-inp").forEach(inp=>{
      inp.addEventListener("change",()=>{ editDims[+inp.dataset.di][inp.dataset.f]=inp.value; });
    });
    document.querySelectorAll(".eda-inp").forEach(inp=>{
      inp.addEventListener("change",()=>{ editDims[+inp.dataset.di].alineas[+inp.dataset.ai].texto=inp.value; });
    });
    document.querySelectorAll(".eda-del").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const di=+btn.dataset.di,ai=+btn.dataset.ai;
        if (editDims[di].alineas.length<=1){toast("A dimensão precisa de pelo menos 1 alínea.","warn");return;}
        editDims[di].alineas.splice(ai,1); reindexAlineas(editDims[di]); rerender();
      });
    });
    document.querySelectorAll(".btn-add-al").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const di=+btn.dataset.di,dim=editDims[di];
        dim.alineas.push({id:`${dim.id}${String.fromCharCode(97+dim.alineas.length)}`,texto:""});
        rerender();
        setTimeout(()=>{ const ins=document.querySelectorAll(`.eda-inp[data-di="${di}"]`); ins[ins.length-1]?.focus(); },50);
      });
    });
    document.querySelectorAll(".edc-up").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const di=+btn.dataset.di; if(di===0)return;
        [editDims[di-1],editDims[di]]=[editDims[di],editDims[di-1]]; reindexDims(); rerender();
      });
    });
    document.querySelectorAll(".edc-dn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const di=+btn.dataset.di; if(di===editDims.length-1)return;
        [editDims[di],editDims[di+1]]=[editDims[di+1],editDims[di]]; reindexDims(); rerender();
      });
    });
    document.querySelectorAll(".edc-del").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const di=+btn.dataset.di;
        if(editDims.length<=1){toast("O instrumento precisa de pelo menos 1 dimensão.","warn");return;}
        if(!confirm(`Remover a dimensão "${editDims[di].titulo}"?`))return;
        editDims.splice(di,1); reindexDims(); rerender();
      });
    });
    document.getElementById("btnAddDim").addEventListener("click",()=>{
      const next=editDims.length+1;
      editDims.push({id:`D${next}`,titulo:`Nova Dimensão ${next}`,icone:"📌",alineas:[{id:`D${next}a`,texto:""}]});
      rerender();
      setTimeout(()=>{ const ins=document.querySelectorAll(".ed-titulo-inp"); ins[ins.length-1]?.focus(); ins[ins.length-1]?.select(); },50);
    });
    document.getElementById("btnEdSave").addEventListener("click",async()=>{
      document.querySelectorAll(".ed-ico-inp,.ed-titulo-inp").forEach(inp=>{ editDims[+inp.dataset.di][inp.dataset.f]=inp.value; });
      document.querySelectorAll(".eda-inp").forEach(inp=>{ editDims[+inp.dataset.di].alineas[+inp.dataset.ai].texto=inp.value; });
      for(const dim of editDims){
        if(!dim.titulo.trim()){toast("Todas as dimensões precisam ter título.","warn");return;}
        for(const al of dim.alineas){if(!al.texto.trim()){toast(`Preencha todas as alíneas. (${dim.titulo})`,"warn");return;}}
      }
      const btn=document.getElementById("btnEdSave");
      btn.textContent="Salvando..."; btn.disabled=true;
      try {
        await saveDimensoesConfig(editDims);
        toast("Alíneas salvas e publicadas! ✅","success");
        btn.textContent="💾 Salvar e Publicar"; btn.disabled=false; rerender();
      } catch(e){
        toast("Erro ao salvar — verifique as regras do Firestore. ("+e.code+")","warn");
        console.error(e);
        btn.textContent="💾 Salvar e Publicar"; btn.disabled=false;
      }
    });
    document.getElementById("btnEdReset").addEventListener("click",()=>{
      if(!confirm("Restaurar alíneas padrão?"))return;
      editDims=JSON.parse(JSON.stringify(DIMENSOES_PADRAO)); rerender();
    });
  }

  function reindexDims(){ editDims.forEach((dim,i)=>{ dim.id=`D${i+1}`; reindexAlineas(dim); }); }
  function reindexAlineas(dim){ dim.alineas.forEach((al,ai)=>{ al.id=`${dim.id}${String.fromCharCode(97+ai)}`; }); }
  function rerender(){ document.getElementById("edDims").innerHTML=editDims.map((dim,di)=>buildDimHtml(dim,di)).join(""); rebind(); }

  document.getElementById("aMain").innerHTML=`<div class="adm-wrap">
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

// ═══════════════════════════════════════════════════════════════
//  ABA: ALÍNEAS POR SETOR
// ═══════════════════════════════════════════════════════════════
function renderEditorSetores() {
  let setorSel = SETORES[0].id;

  function getAtivas(sid) {
    const cfg=setorConfig[sid];
    if (!cfg||!cfg.alineasAtivas||cfg.alineasAtivas.length===0)
      return new Set(DIMENSOES.flatMap(d=>d.alineas.map(a=>a.id)));
    return new Set(cfg.alineasAtivas);
  }

  function buildSetorBtns() {
    return SETORES.map(s=>{
      const cfg=setorConfig[s.id];
      const temCfg=cfg&&cfg.alineasAtivas&&cfg.alineasAtivas.length>0;
      return `<button class="setor-sel-btn${s.id===setorSel?" ss-active":""}" data-sid="${s.id}">
        <span class="ss-sig">${s.sigla}</span>
        ${temCfg?`<span class="ss-badge">${cfg.alineasAtivas.length} al.</span>`:`<span class="ss-badge ss-all">todas</span>`}
      </button>`;
    }).join("");
  }

  function buildPanel(sid, ativas) {
    const setor=SETORES.find(s=>s.id===sid);
    const totalG=DIMENSOES.reduce((a,d)=>a+d.alineas.length,0);
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
          <button class="btn-sel-all" id="btnSelAll">Selecionar todas</button>
          <button class="btn-sel-none" id="btnSelNone">Limpar seleção</button>
        </div>
      </div>
      <div class="scp-dims">
        ${DIMENSOES.map((dim,di)=>{
          const qAtivas=dim.alineas.filter(al=>ativas.has(al.id)).length;
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
              ${dim.alineas.map((al,ai)=>`
                <label class="scp-al-row${ativas.has(al.id)?" scp-al-on":""}">
                  <input type="checkbox" class="ck-al" data-alid="${al.id}" data-di="${di}"
                    ${ativas.has(al.id)?"checked":""}/>
                  <span class="scp-al-idx">${String.fromCharCode(65+ai)}</span>
                  <span class="scp-al-txt">${al.texto}</span>
                </label>`).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>`;
  }

  function rebindPanel(ativas) {
    document.querySelectorAll(".ck-dim[data-ind]").forEach(ck=>{ ck.indeterminate=true; });
    document.querySelectorAll(".ck-al").forEach(ck=>{
      ck.addEventListener("change",()=>{
        if(ck.checked) ativas.add(ck.dataset.alid); else ativas.delete(ck.dataset.alid);
        ck.closest(".scp-al-row").classList.toggle("scp-al-on",ck.checked);
        updateDimCk(+ck.dataset.di,ativas); updateCount(ativas);
      });
    });
    document.querySelectorAll(".ck-dim").forEach(ck=>{
      ck.addEventListener("change",()=>{
        const di=+ck.dataset.di, dim=DIMENSOES[di];
        dim.alineas.forEach(al=>{
          if(ck.checked) ativas.add(al.id); else ativas.delete(al.id);
          const c=document.querySelector(`.ck-al[data-alid="${al.id}"]`);
          if(c){c.checked=ck.checked;c.closest(".scp-al-row").classList.toggle("scp-al-on",ck.checked);}
        });
        ck.indeterminate=false; updateCount(ativas); updateDimCount(di,ativas);
      });
    });
    document.getElementById("btnSelAll").addEventListener("click",()=>{
      DIMENSOES.forEach(d=>d.alineas.forEach(al=>ativas.add(al.id))); refreshPanel(ativas);
    });
    document.getElementById("btnSelNone").addEventListener("click",()=>{ ativas.clear(); refreshPanel(ativas); });
    document.getElementById("btnSalvarSetor").addEventListener("click",async()=>{
      const totalG=DIMENSOES.reduce((a,d)=>a+d.alineas.length,0);
      if(ativas.size===totalG) delete setorConfig[setorSel];
      else setorConfig[setorSel]={alineasAtivas:[...ativas]};
      const btn=document.getElementById("btnSalvarSetor");
      btn.textContent="Salvando..."; btn.disabled=true;
      try {
        await saveSetorConfig();
        toast("Configuração do setor salva! ✅","success");
        btn.textContent="💾 Salvar Configuração"; btn.disabled=false;
        document.getElementById("setorBtns").innerHTML=buildSetorBtns();
        bindSetorBtns();
      } catch(e){
        toast("Erro ao salvar — verifique as regras do Firestore. ("+e.code+")","warn");
        console.error(e);
        btn.textContent="💾 Salvar Configuração"; btn.disabled=false;
      }
    });
  }

  function updateDimCk(di,ativas){
    const dim=DIMENSOES[di],ck=document.querySelector(`.ck-dim[data-di="${di}"]`);
    if(!ck)return;
    const q=dim.alineas.filter(al=>ativas.has(al.id)).length;
    ck.checked=q===dim.alineas.length; ck.indeterminate=q>0&&q<dim.alineas.length;
    updateDimCount(di,ativas);
  }
  function updateDimCount(di,ativas){
    const dim=DIMENSOES[di],el=document.getElementById(`dimct-${di}`);
    if(el) el.textContent=`${dim.alineas.filter(al=>ativas.has(al.id)).length}/${dim.alineas.length}`;
  }
  function updateCount(ativas){
    const el=document.getElementById("ativasCount");
    const total=DIMENSOES.reduce((a,d)=>a+d.alineas.length,0);
    if(el) el.textContent=`${ativas.size} de ${total} alíneas selecionadas`;
  }
  function refreshPanel(ativas){
    document.getElementById("setorPanel").innerHTML=buildPanel(setorSel,ativas);
    rebindPanel(ativas);
  }
  function bindSetorBtns(){
    document.querySelectorAll(".setor-sel-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        setorSel=btn.dataset.sid;
        document.querySelectorAll(".setor-sel-btn").forEach(b=>b.classList.toggle("ss-active",b.dataset.sid===setorSel));
        const a=getAtivas(setorSel);
        document.getElementById("setorPanel").innerHTML=buildPanel(setorSel,a);
        rebindPanel(a);
      });
    });
  }

  document.getElementById("aMain").innerHTML=`<div class="adm-wrap">
    <div class="ed-header">
      <div>
        <h2 class="sec-t" style="margin:0">🎯 Alíneas por Setor</h2>
        <p class="ed-sub">Defina quais alíneas cada setor deve responder. Sem configuração, o setor vê todas.</p>
      </div>
      <button class="btn-ed-save" id="btnSalvarSetor">💾 Salvar Configuração</button>
    </div>
    <div class="setor-sel-row" id="setorBtns">${buildSetorBtns()}</div>
    <div class="setor-config-panel" id="setorPanel">${buildPanel(setorSel,getAtivas(setorSel))}</div>
  </div>`;

  rebindPanel(getAtivas(setorSel));
  bindSetorBtns();
}

// ═══════════════════════════════════════════════════════════════
//  DETALHE SETOR
// ═══════════════════════════════════════════════════════════════
function renderDetalheSetor(s) {
  document.getElementById("aMain").innerHTML=`<div class="adm-wrap">
    <button class="btn-back" id="btnBack">← Voltar ao Painel</button>
    <div class="det-hd">
      <div class="det-sig">${s.sigla}</div>
      <div>
        <h1 class="det-nome">${s.nome}</h1>
        <p class="det-sub">IMO: <strong style="color:${imoColor(s.imo)}">${s.imo}%</strong> ·
          ${s.respondidas}/${getTotalAlineasParaSetor(s.id)} alíneas ·
          <span class="${stCls(s.status)}">${stLbl(s.status)}</span></p>
      </div>
    </div>
    <div class="charts-row" style="grid-template-columns:1.5fr 1fr">
      <div class="cc"><div class="cc-h">Desempenho por Dimensão (%)</div><canvas id="dBar"></canvas></div>
      <div class="cc"><div class="cc-h">Radar IMGG</div><canvas id="dRadar"></canvas></div>
    </div>
    ${DIMENSOES.map((dim,di)=>{
      const med=s.dimScores[di]??0;
      return `<div class="dim-det-card">
        <div class="ddc-hdr">
          <span>${dim.icone}</span><span class="ddc-t">${dim.titulo}</span>
          <span class="ddc-m" style="color:${imoColor(med)}">${med}%</span>
        </div>
        <table class="rt">
          <thead><tr><th>Alínea</th><th>Nota</th><th>Nível</th><th>Evidência / Observação</th></tr></thead>
          <tbody>
            ${dim.alineas.map(al=>{
              const r=s.resp[al.id],op=r?ESCALA.find(e=>e.valor===r.valor):null;
              return `<tr>
                <td class="rt-t">${al.texto}</td>
                <td class="rt-n">${op?`<span class="nota-b" style="background:${op.cor}">${op.valor}</span>`:"—"}</td>
                <td>${op?`<span style="color:${op.cor};font-weight:600;font-size:12px">${op.label}</span>`:'<span class="nr">Não resp.</span>'}</td>
                <td class="rt-o">${r?.obs ? `<span class="obs-text">${r.obs}</span>` : "—"}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
    }).join("")}
  </div>`;

  document.getElementById("btnBack").addEventListener("click",async()=>{ renderAdminShell(); await renderAdminContent(); });
  requestAnimationFrame(()=>{
    destroyCharts();
    const dp=s.dimScores;
    const labels=DIMENSOES.map(d=>d.titulo.split(" ").slice(0,2).join(" "));
    chartInstances.dBar=new Chart(document.getElementById("dBar"),{
      type:"bar",data:{labels,datasets:[{label:"(%)",data:dp,backgroundColor:dp.map(v=>imoColorA(v,.75)),borderColor:dp.map(v=>imoColor(v)),borderWidth:2,borderRadius:8}]},
      options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100,ticks:{callback:v=>v+"%"}}}}
    });
    chartInstances.dRadar=new Chart(document.getElementById("dRadar"),{
      type:"radar",data:{labels,datasets:[{label:s.sigla,data:dp,backgroundColor:"rgba(6,182,212,.12)",borderColor:"#06b6d4",borderWidth:2,pointBackgroundColor:"#06b6d4",pointRadius:4}]},
      options:{responsive:true,scales:{r:{beginAtZero:true,max:100,ticks:{display:false}}},plugins:{legend:{display:false}}}
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  GRÁFICOS
// ═══════════════════════════════════════════════════════════════
function renderChartBar(data) {
  chartInstances.bar=new Chart(document.getElementById("cBar"),{
    type:"bar",data:{labels:data.map(s=>s.sigla),datasets:[{label:"IMO (%)",data:data.map(s=>s.imo),backgroundColor:data.map(s=>imoColorA(s.imo,.75)),borderColor:data.map(s=>imoColor(s.imo)),borderWidth:2,borderRadius:8}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100,ticks:{callback:v=>v+"%"}}}}
  });
}
function renderChartRadar(data) {
  const dm=DIMENSOES.map((_,di)=>parseFloat((data.reduce((a,s)=>a+(s.dimScores[di]??0),0)/data.length).toFixed(1)));
  chartInstances.radar=new Chart(document.getElementById("cRadar"),{
    type:"radar",data:{labels:DIMENSOES.map(d=>d.titulo.split(" ").slice(0,2).join(" ")),datasets:[{label:"Média",data:dm,backgroundColor:"rgba(6,182,212,.12)",borderColor:"#06b6d4",borderWidth:2,pointBackgroundColor:"#06b6d4",pointRadius:4}]},
    options:{responsive:true,scales:{r:{beginAtZero:true,max:100,ticks:{display:false}}},plugins:{legend:{display:false}}}
  });
}
function renderChartDonut(enviados,emAnd,naoIn) {
  chartInstances.donut=new Chart(document.getElementById("cDonut"),{
    type:"doughnut",data:{labels:["Enviado","Em Andamento","Não Iniciado"],datasets:[{data:[enviados,emAnd,naoIn],backgroundColor:["#22c55e","#eab308","#ef4444"],borderWidth:3,borderColor:"#fff"}]},
    options:{responsive:true,cutout:"62%",plugins:{legend:{position:"bottom",labels:{boxWidth:12,font:{size:11},padding:12}}}}
  });
}
function destroyCharts() {
  Object.values(chartInstances).forEach(c=>{try{c.destroy();}catch(e){}});
  chartInstances={};
}

// ═══════════════════════════════════════════════════════════════
//  HTML HELPERS
// ═══════════════════════════════════════════════════════════════
function setorCardHtml(s) {
  const total=getTotalAlineasParaSetor(s.id);
  const pct=total>0?Math.round((s.respondidas/total)*100):0;
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
      ${DIMENSOES.map(dim=>`
        <div class="ls-dim">
          <div class="ls-dh">${dim.icone} ${dim.titulo}</div>
          <table class="rt">
            <thead><tr><th>Alínea</th><th>Nota</th><th>Nível</th><th>Evidência / Observação</th></tr></thead>
            <tbody>
              ${dim.alineas.map(al=>{
                const r=s.resp[al.id],op=r?ESCALA.find(e=>e.valor===r.valor):null;
                return `<tr>
                  <td class="rt-t">${al.texto}</td>
                  <td class="rt-n">${op?`<span class="nota-b" style="background:${op.cor}">${op.valor}</span>`:"—"}</td>
                  <td>${op?`<span style="color:${op.cor};font-weight:600;font-size:12px">${op.label}</span>`:'<span class="nr">—</span>'}</td>
                  <td class="rt-o">${r?.obs ? `<span class="obs-text">${r.obs}</span>` : "—"}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`).join("")}
    </div>
  </details>`;
}

// ═══════════════════════════════════════════════════════════════
//  DADOS
// ═══════════════════════════════════════════════════════════════
function buildSetoresData(all) {
  return SETORES.map(s=>{
    const d=all[s.id]||{}, resp=d.respostas||{};
    // Conta apenas respostas com nota válida
    const respondidas=Object.values(resp).filter(r=>r.valor!==null&&r.valor!==undefined).length;
    const pts=Object.values(resp).reduce((a,r)=>a+(r.valor||0),0);
    const imo=respondidas>0?parseFloat(((pts/(respondidas*5))*100).toFixed(1)):0;
    const status=d.status||"nao_iniciado";
    const dimScores=DIMENSOES.map(dim=>{
      const sum=dim.alineas.reduce((a,al)=>a+(resp[al.id]?.valor||0),0);
      return respondidas>0?parseFloat(((sum/(dim.alineas.length*5))*100).toFixed(1)):0;
    });
    return {...s,resp,respondidas,pts,imo,status,dimScores};
  });
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════════════════════════════
function exportXLS(data) {
  let csv="Setor;Sigla;Status;IMO (%)";
  DIMENSOES.forEach(dim=>dim.alineas.forEach(al=>{ csv+=`;${al.id};${al.id}_obs`; }));
  csv+="\n";
  data.forEach(s=>{
    csv+=`"${s.nome}";${s.sigla};"${stLbl(s.status)}";${s.imo}`;
    DIMENSOES.forEach(dim=>dim.alineas.forEach(al=>{
      const r=s.resp[al.id];
      csv+=`;${r?.valor||""};"${(r?.obs||"").replace(/"/g,"'")}"`;
    }));
    csv+="\n";
  });
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download="IMGG_SESAU_AL_"+new Date().toISOString().slice(0,10)+".csv"; a.click();
  toast("Arquivo CSV/Excel exportado! ✅","success");
}

function exportPDF(data) {
  const w=window.open("","_blank");
  const linhas=data.map(s=>`<tr><td>${s.nome}</td><td>${s.sigla}</td><td>${s.respondidas}/${getTotalAlineasParaSetor(s.id)}</td><td class="nota">${s.imo}%</td><td><span class="badge ${s.status==="enviado"?"env":["em_andamento","concluido"].includes(s.status)?"and":"nao"}">${stLbl(s.status)}</span></td></tr>`).join("");
  const det=data.filter(s=>s.respondidas>0).map(s=>`<h2>${s.sigla} — ${s.nome} | IMO: ${s.imo}%</h2>${DIMENSOES.map(dim=>`<h3>${dim.icone} ${dim.titulo}</h3><table><thead><tr><th style="width:40%">Alínea</th><th>Nota</th><th>Nível</th><th>Evidência / Observação</th></tr></thead><tbody>${dim.alineas.map(al=>{const r=s.resp[al.id],op=r?ESCALA.find(e=>e.valor===r.valor):null;return`<tr><td>${al.texto}</td><td style="text-align:center;font-weight:700">${r?.valor||"—"}</td><td>${op?op.label:"Não respondida"}</td><td>${r?.obs||"—"}</td></tr>`;}).join("")}</tbody></table>`).join("")}`).join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IMGG SESAU-AL</title><style>body{font-family:Arial,sans-serif;font-size:11px;color:#1a202c;padding:20px}h1{color:#003d7a;font-size:18px}h2{color:#003d7a;font-size:13px;margin:24px 0 6px;border-bottom:2px solid #003d7a;padding-bottom:4px}h3{font-size:11px;color:#374151;margin:14px 0 4px;padding:4px 8px;background:#f8fafc}table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:10px}th{background:#003d7a;color:white;padding:5px 8px;text-align:left}td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}tr:nth-child(even) td{background:#f8fafc}.nota{font-weight:700;font-size:12px}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700}.env{background:#d1fae5;color:#065f46}.and{background:#fef3c7;color:#92400e}.nao{background:#fee2e2;color:#991b1b}@page{margin:1.5cm}</style></head><body><h1>IMGG — Instrumento de Maturidade, Governança e Gestão</h1><p>SESAU · Alagoas · Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p><h2>Resumo Geral por Setor</h2><table><thead><tr><th>Setor</th><th>Sigla</th><th>Respondidas</th><th>IMO (%)</th><th>Status</th></tr></thead><tbody>${linhas}</tbody></table>${det}</body></html>`);
  w.document.close(); setTimeout(()=>w.print(),700);
  toast("Janela de impressão/PDF aberta! 🖨","success");
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
function imoColor(p){ if(p>=80)return"#06b6d4";if(p>=60)return"#22c55e";if(p>=40)return"#eab308";if(p>=20)return"#f97316";return"#ef4444"; }
function imoColorA(p,a){ const c=imoColor(p),r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);return`rgba(${r},${g},${b},${a})`; }
function imoNivel(p){ if(p>=80)return"Nível Otimizado — Excelência comprovada";if(p>=60)return"Nível Gerenciado — Bem implementado";if(p>=40)return"Nível em Desenvolvimento — Em estruturação";if(p>=20)return"Nível Inicial — Esforços pontuais";return"Nível Inexistente — Sem implementação"; }
function stCls(s){ if(s==="enviado")return"b-green";if(["em_andamento","concluido"].includes(s))return"b-yellow";return"b-red"; }
function stLbl(s){ return{enviado:"Enviado",em_andamento:"Em Andamento",concluido:"Concluído",nao_iniciado:"Não Iniciado"}[s]||"Não Iniciado"; }
function toast(msg,type="info"){ let t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t);}t.textContent=msg;t.className=`toast t-${type} show`;clearTimeout(window._tt);window._tt=setTimeout(()=>t.className="toast",3500); }

document.addEventListener("DOMContentLoaded",()=>renderLogin());