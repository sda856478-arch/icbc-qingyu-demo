'use strict';

// This prototype uses session-only sample data and makes no external requests.
const $ = (selector) => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money = value => new Intl.NumberFormat('zh-CN', {maximumFractionDigits:2}).format(value);
const paths = {
 archive:'<path d="M3 7h7l2 3h9v10H3z"/><path d="M3 7V4h7l2 3h9v3"/>',
 student:'<circle cx="12" cy="7" r="4"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
 loan:'<rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
 shield:'<path d="M12 3 21 7v5c0 5-6 9-9 10-3-1-9-5-9-10V7z"/><path d="m8 12 3 3 5-6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="m5 12 4 4 10-11"/>',
 trophy:'<path d="M8 3h8v6a4 4 0 0 1-8 0zM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6v3"/>',
 scholarship:'<path d="m2 9 10-5 10 5-10 5zM6 12v6c4 3 8 3 12 0v-6M22 9v8"/>',
 paper:'<path d="M5 3h9l5 5v13H5zM14 3v5h5M8 12h8M8 16h6"/>',
 patent:'<path d="M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3z"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
 upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
 edit:'<path d="m16 3 5 5-12 12-6 1 1-6zM13 6l5 5"/>',
 building:'<path d="M4 21V3h12v18M16 9h4v12M2 21h20M8 7h4M8 11h4M8 15h4"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 trash:'<path d="M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.archive}</svg>`;
const navItems = [{id:'archive',label:'荣誉档案',icon:'archive'},{id:'student',label:'学生认证',icon:'student'},{id:'loan',label:'奖金周转',icon:'loan'},{id:'share',label:'公开授权',icon:'shield'}];
const kinds = {all:'全部',scholarship:'奖学金',competition:'竞赛',paper:'论文',patent:'专利'};
const recordIcon = record => record.kind === 'competition' ? 'trophy' : record.kind;
const dossierCode = 'QY-DEMO-2026-0048';

function createState() {
 return {
  user:{verified:true,name:'陈同学',school:'中央财经大学',major:'大数据管理与应用',year:'2024级本科生'},
  records:[
   {id:'r1',kind:'scholarship',title:'校级优秀学生奖学金',description:'2025—2026学年 · 一等奖学金',institution:'学校奖学金评审部门（示例）',date:'2026-09-20',status:'verified',amount:5000,unpaid:true,personal:true,payout:'2026-11-10（示例）',version:1,source:'学校公示与机构确认（示例）',proof:'奖学金公示名单.pdf'},
   {id:'r2',kind:'competition',title:'大学生创新创业竞赛',description:'校级一等奖 · 个人奖金已确认',institution:'校级竞赛组织单位（示例）',date:'2026-06-18',status:'verified',amount:1800,unpaid:true,personal:true,payout:'2026-10-30（示例）',version:1,source:'主办方回执确认（示例）',proof:'获奖证书.jpg'},
   {id:'r3',kind:'paper',title:'数据驱动的校园服务优化研究',description:'研究论文 · 第一作者',institution:'示例刊物',date:'2026-08-12',status:'unverified',amount:0,unpaid:false,personal:true,version:1,source:'尚未独立核验',proof:'论文首页.pdf'},
   {id:'r4',kind:'patent',title:'一种学生成长档案管理方法',description:'发明专利申请 · 申请中',institution:'专利公开记录（示例）',date:'2026-07-03',status:'unverified',amount:0,unpaid:false,personal:true,version:1,source:'尚未独立核验',proof:'专利申请材料.pdf'}
  ],
  page:'archive',role:'student',filter:'all',shared:false,shareIds:['r1','r2'],shareDraft:['r1','r2'],queryAttempted:false,queryCode:'',loan:null,nextId:5
 };
}
let state = createState();
let toastTimer;
function toast(message) { const node=$('#toast'); node.textContent=message; node.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('show'),3000); }
function statusTag(record) {
 if(record.status==='verified') return `<span class="tag tag-green">${icon('check')}已认证</span>`;
 if(record.status==='pending') return `<span class="tag tag-yellow">${icon('clock')}核验中</span>`;
 return '<span class="tag tag-neutral">未认证</span>';
}
function verifiedRecords() { return state.records.filter(r=>r.status==='verified'); }
function eligibleRecords() { return state.user.verified ? state.records.filter(r=>r.status==='verified' && r.unpaid && r.personal && r.amount>0) : []; }
function title(english,chinese,description,action='') { return `<div class="page-title"><div><span class="eyebrow">${english}</span><h1>${chinese}<span class="title-dot">.</span></h1><p>${description}</p></div>${action}</div>`; }
function go(page) { if(!navItems.some(n=>n.id===page)) return; state.page=page;state.role='student';render();window.scrollTo({top:0,behavior:'instant'}); }
function setRole(role) { if(!['student','enterprise'].includes(role)) throw new Error('不支持的视角');state.role=role;render();window.scrollTo({top:0,behavior:'instant'}); }
function renderNavigation() {
 $('#desktop-nav').innerHTML=navItems.map(n=>`<button class="nav-item ${state.role==='student'&&state.page===n.id?'active':''}" data-page="${n.id}" ${state.page===n.id&&state.role==='student'?'aria-current="page"':''}>${icon(n.icon)}${n.label}${n.id==='archive'?'<span class="nav-mark">'+String(state.records.length).padStart(2,'0')+'</span>':''}</button>`).join('');
 $('#mobile-nav').innerHTML=navItems.map(n=>`<button class="${state.role==='student'&&state.page===n.id?'active':''}" data-page="${n.id}">${icon(n.icon)}${n.label}</button>`).join('');
 $('#student-view').classList.toggle('selected',state.role==='student'); $('#enterprise-view').classList.toggle('selected',state.role==='enterprise');
 $('#student-view').setAttribute('aria-pressed',String(state.role==='student'));$('#enterprise-view').setAttribute('aria-pressed',String(state.role==='enterprise'));
}
function honorCard(record,enterprise=false) {
 const certification=record.status==='verified'?'工行事实核验（演示）':record.status==='pending'?'已提交认证申请':'个人记录 · 无工行认证背书';
 return `<${enterprise?'div':'button'} class="honor-card" ${enterprise?'':`data-record="${record.id}"`}><span class="honor-icon ${record.kind}">${icon(recordIcon(record))}</span><div class="honor-info"><div class="honor-heading"><h3>${escapeHTML(record.title)}</h3>${statusTag(record)}</div><p class="honor-desc">${escapeHTML(record.description)}</p><div class="honor-footer"><span class="honor-status ${record.status==='verified'?'':record.status}">${icon(record.status==='verified'?'shield':record.status==='pending'?'clock':'paper')}${certification}</span>${!enterprise&&record.amount?`<span class="amount-tag">待发 ¥${money(record.amount)}</span>`:`<span>${escapeHTML(record.date.slice(0,7))}</span>`}</div></div></${enterprise?'div':'button'}>`;
}
function contextPanel() {
 if(state.role==='enterprise') return `<section class="context-box" style="margin-top:0"><h3>${icon('shield')}查询范围</h3><p>只展示学生当前授权的荣誉内容与对应认证状态。</p><div class="divider"></div><p>借记卡、账户余额、贷款、征信与还款信息均不在查询范围内。</p></section><section class="context-box"><h3>${icon('info')}认证含义</h3><p>“已认证”表示相应记录的事实与归属经过核验，不是对求职能力或贷款资格的保证。</p></section>`;
 return `<section class="passport"><div class="passport-top"><span class="eyebrow">YOUR HONOR PASSPORT</span>${icon('trophy')}</div><h2>让你的荣誉<br>有据可查。</h2><p class="passport-sub">保留成长记录，自主申请认证。<br>公开范围，始终由你决定。</p><div class="passport-profile"><div><strong>${escapeHTML(state.user.name)}</strong><small>${escapeHTML(state.user.school)} · 示例用户</small></div>${icon('student')}</div><div class="passport-id"><code>${dossierCode}</code><button class="copy-button" data-action="copy-code" aria-label="复制档案标识码">${icon('copy')}</button></div><div class="passport-status">${icon(state.shared?'eye':'lock')}${state.shared?'公开授权已开启 · '+state.shareIds.filter(id=>state.records.some(r=>r.id===id)).length+'项荣誉':'公开授权已关闭'}</div><button class="btn btn-dark btn-full" data-page="share">管理公开授权</button></section><section class="context-box"><h3>${icon('clock')}成长动态</h3><div class="mini-timeline"><div><strong>荣誉记录已整理</strong>共${state.records.length}项，其中${verifiedRecords().length}项已认证。</div><div><strong>${state.shared?'企业可查看授权内容':'档案默认保护隐私'}</strong>${state.shared?'关闭授权后，后续查询立即停止。':'企业持有标识码也无法查看。'}</div><div><strong>待发奖金可申请周转</strong>由银行独立审查，不自动授信。</div></div></section>`;
}
function archivePage() {
 const list=state.records.filter(r=>state.filter==='all'||r.kind===state.filter);
 return title('MY HONOR ARCHIVE','我的荣誉档案','奖项、论文、专利，在这里记录。',`<button class="btn btn-primary" data-action="add-record">${icon('plus')}添加荣誉</button>`)+
 `<section class="profile-card"><span class="avatar">陈</span><div class="profile-data"><div class="profile-name"><strong>${escapeHTML(state.user.name)}</strong>${state.user.verified?`<span class="tag tag-green">${icon('check')}学生认证通过</span>`:'<span class="tag tag-yellow">待完成学生认证</span>'}</div><p class="profile-meta">${escapeHTML(state.user.school)} · ${escapeHTML(state.user.major)}<br>${escapeHTML(state.user.year)} · 示例用户</p></div><button class="small-link" data-page="student">认证详情</button></section>`+
 `<section class="stat-grid" aria-label="荣誉概览"><div class="stat-card"><span class="stat-label">全部荣誉</span><span class="stat-watermark">${icon('archive')}</span><div class="stat-number">${String(state.records.length).padStart(2,'0')}<small>项</small></div></div><div class="stat-card"><span class="stat-label">已通过认证</span><span class="stat-watermark">${icon('shield')}</span><div class="stat-number">${String(verifiedRecords().length).padStart(2,'0')}<small>项</small></div></div><div class="stat-card"><span class="stat-label">待完善认证</span><span class="stat-watermark">${icon('edit')}</span><div class="stat-number">${String(state.records.length-verifiedRecords().length).padStart(2,'0')}<small>项</small></div></div></section>`+
 `<div class="section-head"><h2>成长记录</h2><span class="section-count">点击记录查看详情</span></div><div class="filters" role="group" aria-label="按荣誉类别筛选">${Object.entries(kinds).map(([id,label])=>`<button class="filter ${state.filter===id?'active':''}" data-filter="${id}" aria-pressed="${state.filter===id}">${label}</button>`).join('')}</div><section class="honor-list">${list.length?list.map(r=>honorCard(r)).join(''):`<div class="blank-state">${icon('archive')}<h3>还没有${kinds[state.filter]||'荣誉'}记录</h3><p>添加一份记录，让成长有迹可循。</p><button class="btn btn-primary" data-action="add-record">添加荣誉</button></div>`}</section><p class="record-note">认证由你自主申请。未认证记录保留在档案中，不带工行认证背书。</p>`;
}
function studentPage() {
 let body;
 if(state.user.verified) body=`<section class="panel"><div class="success-block"><div class="success-icon">${icon('check')}</div><h2>学生认证已通过</h2><p>现在可以建立荣誉档案，按需申请荣誉认证。</p></div><div class="divider"></div><div class="detail-table"><div class="detail-row"><span>姓名</span><strong>${escapeHTML(state.user.name)}（示例）</strong></div><div class="detail-row"><span>学校</span><strong>${escapeHTML(state.user.school)}</strong></div><div class="detail-row"><span>专业</span><strong>${escapeHTML(state.user.major)}</strong></div><div class="detail-row"><span>学籍状态</span><strong>在读 · ${escapeHTML(state.user.year)}</strong></div><div class="detail-row"><span>核验方式</span><strong>实名与学籍验证流程演示</strong></div></div><div class="divider"></div><div class="info-strip">${icon('info')}学生身份认证与荣誉认证分别处理。学生认证通过，不代表荣誉已经核验。</div><button class="btn btn-primary btn-full" data-page="archive" style="margin-top:22px">前往荣誉档案</button></section>`;
 else body=`<section class="panel"><div class="steps"><div class="step active"><span class="step-number">1</span>确认身份</div><div class="step active"><span class="step-number">2</span>核验学籍</div><div class="step"><span class="step-number">3</span>完成认证</div></div><h2>确认你的学生信息</h2><p class="panel-intro">这里使用示例信息体验认证流程，请勿填写真实证件或学籍验证凭证。</p><form id="student-form"><div class="field-grid"><label class="field"><span class="field-label">姓名</span><input value="陈同学（示例）" disabled></label><label class="field"><span class="field-label">身份核验</span><input value="实名及人脸核验 · 演示" disabled></label></div><label class="field"><span class="field-label">学校</span><input value="${escapeHTML(state.user.school)}" disabled></label><label class="field"><span class="field-label">学籍信息</span><input value="${escapeHTML(state.user.major)} · ${escapeHTML(state.user.year)}" disabled></label><label class="checkbox-line"><input type="checkbox" id="student-consent" required><span>我同意将上述信息仅用于学生身份核验。荣誉公开、贷款申请另行授权。</span></label><button class="btn btn-primary btn-full" type="submit">完成认证演示</button></form></section>`;
 return title('STUDENT VERIFICATION','学生身份认证','先完成学生认证，再建立荣誉档案。')+body;
}
function sharePage() {
 return title('SHARE ON YOUR TERMS','公开授权','哪些荣誉可以被看到，由你决定。')+
 `<section class="panel"><div class="toggle-row"><div><h3>企业查询授权</h3><p>${state.shared?'当前授权已生效，企业可查看所选荣誉。':'当前为私密状态，企业无法查询档案。'}</p></div><button class="switch ${state.shared?'on':''}" data-action="toggle-share" role="switch" aria-checked="${state.shared}" aria-label="企业查询授权"></button></div><div class="divider"></div><div class="info-strip ${state.shared?'green':''}">${icon(state.shared?'eye':'lock')}${state.shared?'关闭授权后，企业后续查询立即停止。':'即使企业持有标识码，也无法查看未获授权的档案。'}</div></section>`+
 `<section class="panel"><div class="panel-heading"><h2>选择可展示的荣誉</h2><span class="section-count">${state.shareDraft.length}项已选择</span></div><p class="panel-intro">只展示所选记录和认证状态，金融信息不向企业公开。</p>${state.records.map(r=>`<label class="selection-record"><input type="checkbox" data-share-record="${r.id}" ${state.shareDraft.includes(r.id)?'checked':''}><span class="selection-info"><strong>${escapeHTML(r.title)}</strong><small>${escapeHTML(r.description)}</small></span>${statusTag(r)}</label>`).join('')}<button class="btn btn-primary btn-full" style="margin-top:21px" data-action="save-scope">${state.shared?'保存授权范围':'保存展示范围'}</button><p class="related-note">${state.shared?'范围变更后，下次查询展示最新授权内容。':'保存范围后仍保持私密；打开上方开关才会授权企业查询。'}</p></section>`+
 `<section class="panel"><h2>档案唯一标识</h2><div class="share-link"><div><code>${dossierCode}</code><small>${state.shared?'标识码关联当前授权内容':'标识码已生成 · 查询授权未开启'}</small></div><button class="copy-button" data-action="copy-code" aria-label="复制标识码">${icon('copy')}</button></div><button class="btn btn-secondary btn-full" style="margin-top:17px" data-action="preview-enterprise">${icon('eye')}查看企业视角</button></section>`;
}
function loanPage() {
 const eligible=eligibleRecords();
 let body;
 if(state.loan) body=`<section class="panel"><div class="success-block"><div class="success-icon">${icon('check')}</div><h2>演示申请已记录</h2><p>页面已生成申请摘要。此小样不向银行提交申请，也不会放款。</p></div><div class="detail-table"><div class="detail-row"><span>对应奖金</span><strong>${escapeHTML(state.loan.title)}</strong></div><div class="detail-row"><span>申请金额</span><strong>¥${money(state.loan.amount)}</strong></div><div class="detail-row"><span>申请期限</span><strong>${state.loan.days}天</strong></div><div class="detail-row"><span>资金用途</span><strong>${escapeHTML(state.loan.purpose)}</strong></div><div class="detail-row"><span>申请状态</span><strong>待银行独立审查（演示）</strong></div></div><div class="divider"></div><div class="info-strip red">${icon('info')}荣誉认证通过不等于贷款获批。银行仍需独立审查用途、偿付能力、还款来源及适用条件。</div><button class="btn btn-secondary btn-full" style="margin-top:21px" data-action="new-loan">返回修改申请</button></section>`;
 else if(!state.user.verified) body=`<div class="blank-state">${icon('student')}<h3>先完成学生认证</h3><p>学生身份认证通过后，才可继续奖金周转申请。</p><button class="btn btn-primary" data-page="student">前往学生认证</button></div>`;
 else if(!eligible.length) body=`<div class="blank-state">${icon('loan')}<h3>暂无符合演示条件的待发奖金</h3><p>需有已认证、已确认归属本人且尚未发放的奖学金或竞赛奖金。</p><button class="btn btn-primary" data-page="archive">查看荣誉档案</button></div>`;
 else body=`<section class="panel"><div class="steps"><div class="step active"><span class="step-number">1</span>选择奖金</div><div class="step active"><span class="step-number">2</span>填写申请</div><div class="step"><span class="step-number">3</span>银行审查</div></div><form id="loan-form"><label class="field"><span class="field-label">选择已认证的待发奖金</span><select id="loan-record" name="recordId">${eligible.map(r=>`<option value="${r.id}">${escapeHTML(r.title)} · ¥${money(r.amount)}</option>`).join('')}</select></label><div class="balance-box"><div><span>本人确认的待发金额</span><b id="award-amount">¥${money(eligible[0].amount)}</b></div><div><span>本次申请金额上限</span><b class="limit" id="loan-limit">¥${money(eligible[0].amount)}</b></div></div><div class="field-grid"><label class="field"><span class="field-label">申请金额</span><div class="amount-input-wrap"><input id="loan-amount" name="amount" type="number" min="1" max="${eligible[0].amount}" step="0.01" value="${eligible[0].amount}" required></div><span class="validation-error" id="loan-error" aria-live="polite"></span></label><label class="field"><span class="field-label">申请期限</span><select id="loan-days" name="days"><option value="30">30天</option><option value="60">60天</option><option value="90">90天</option></select><span class="field-hint">演示选项，以银行审批为准。</span></label></div><label class="field"><span class="field-label">资金用途</span><select id="loan-purpose" name="purpose"><option>必要学习与生活支出</option><option>竞赛参赛与实践支出</option><option>求职交通与材料支出</option></select></label><div class="detail-table"><div class="detail-row"><span>预计奖金到账</span><strong id="loan-payout">${escapeHTML(eligible[0].payout)}</strong></div><div class="detail-row"><span>办理账户</span><strong>工行借记卡 · 尾号0048（示例）</strong></div><div class="detail-row"><span>利率与综合成本</span><strong>由银行审批并在正式合同中明示</strong></div></div><div class="loan-summary"><span>本次申请本金</span><b id="loan-summary-amount">¥${money(eligible[0].amount)}</b></div><div class="info-strip">${icon('info')}不鼓励超前消费，不提供循环额度。团队奖金须先确认本人份额，项目经费不在此作为个人待发奖金申请。</div><label class="checkbox-line"><input type="checkbox" name="consent" id="loan-consent" required><span>我了解需由工行独立授信审查，并同意仅为本次申请使用相关资料。奖金延期时应及时联系银行，按合同处理还款。</span></label><button id="loan-submit" class="btn btn-primary btn-full" type="submit">提交申请演示</button></form></section>`;
 return title('BRIDGE THE WAIT','青誉成长周转','衔接奖金到账前的必要资金安排。')+`<section class="loan-hero"><div><span class="eyebrow">FOR YOUR NEXT STEP</span><h2>等奖金，不耽误计划。</h2><p>本金不高于本人确认的待发奖金。<br>荣誉认证后申请，银行独立审批。</p></div><span class="loan-icon">${icon('loan')}</span></section>`+body;
}
function enterprisePage() {
 let result='';
 if(state.queryAttempted) {
  if(state.queryCode!==dossierCode) result=`<div class="blank-state">${icon('search')}<h3>未找到该演示档案</h3><p>请使用示例档案标识码：${dossierCode}</p></div>`;
  else if(!state.shared) result=`<div class="blank-state">${icon('lock')}<h3>该档案未授权公开</h3><p>档案持有人尚未开启查询授权，或已关闭授权。<br>当前无法查看姓名和荣誉内容。</p><button class="btn btn-secondary" data-page="share">返回学生授权页</button></div>`;
  else {
   const records=state.records.filter(r=>state.shareIds.includes(r.id));
   result=`<section class="panel"><div class="query-status">${icon('shield')}当前授权有效 · ${records.length}项可查看荣誉</div><div class="profile-card" style="padding:0;border:0;margin-bottom:21px"><span class="avatar">陈</span><div class="profile-data"><div class="profile-name"><strong>${escapeHTML(state.user.name)}（示例）</strong></div><p class="profile-meta">${escapeHTML(state.user.school)} · 学生身份${state.user.verified?'已核验':'待核验'}</p></div></div><div class="honor-list enterprise-cards">${records.map(r=>honorCard(r,true)).join('')}</div><p class="related-note">查询结果对应当前档案版本及公开授权状态。未认证内容不带工行认证背书。</p></section>`;
  }
 }
 return title('EMPLOYER VERIFICATION','企业荣誉核验','凭标识码查看学生当前授权的荣誉。')+`<section class="enterprise-top"><span class="eyebrow">VERIFIED FACTS. CLEAR PERMISSION.</span><h2>核验有依据，查询有边界。</h2><p>只有持有人主动授权的内容才会展示。<br>账户、贷款和征信信息始终不对企业公开。</p></section><section class="panel"><h2>查询荣誉档案</h2><form id="query-form"><label class="field-label" for="query-code">档案标识码</label><div class="search-line"><input id="query-code" type="text" value="${escapeHTML(state.queryCode||dossierCode)}" placeholder="输入档案唯一标识码" required autocomplete="off"><button class="btn btn-primary" type="submit">核验</button></div></form><p class="related-note">本演示仅查询示例档案，不支持检索真实学生信息。</p></section>${result}`;
}
function render() {
 renderNavigation();
 $('#main-content').innerHTML=state.role==='enterprise'?enterprisePage():({archive:archivePage,student:studentPage,share:sharePage,loan:loanPage}[state.page]||archivePage)();
 $('#context-panel').innerHTML=contextPanel();
}

function openDialog(content) { const dialog=$('#app-dialog');$('#dialog-content').innerHTML=content;dialog.showModal(); }
function closeDialog() { $('#app-dialog').close(); }
function dialogHeader(text) { return `<div class="dialog-heading"><h2 id="dialog-title">${text}</h2><button class="close-dialog" data-action="close-dialog" aria-label="关闭对话框">${icon('close')}</button></div>`; }
function recordDetail(id) {
 const r=state.records.find(record=>record.id===id); if(!r)return;
 openDialog(dialogHeader('荣誉详情')+`<div class="modal-record-head"><span class="honor-icon ${r.kind}">${icon(recordIcon(r))}</span><div><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description)}</p></div></div>${statusTag(r)}<div class="divider"></div><div class="detail-table"><div class="detail-row"><span>类别</span><strong>${kinds[r.kind]}</strong></div><div class="detail-row"><span>颁发 / 来源机构</span><strong>${escapeHTML(r.institution)}</strong></div><div class="detail-row"><span>日期</span><strong>${escapeHTML(r.date)}</strong></div><div class="detail-row"><span>核验依据</span><strong>${escapeHTML(r.source)}</strong></div><div class="detail-row"><span>附件材料</span><strong>${escapeHTML(r.proof||'暂未添加')}</strong></div><div class="detail-row"><span>记录版本</span><strong>V${r.version}</strong></div>${r.amount?`<div class="detail-row"><span>本人待发金额</span><strong>¥${money(r.amount)}（示例）</strong></div>`:''}</div><div class="info-strip honor-verify-note">${icon('info')}${r.status==='verified'?'认证确认记录事实与归属，不保证贷款获批。修改已认证内容后需要重新核验。':r.status==='pending'?'申请已进入演示核验流程，需核查来源与本人归属，并对疑点人工复核。':'未认证记录可保留与管理，但不具备工行认证背书。专利申请状态不代表获得授权。'}</div><div class="dialog-actions"><button class="btn btn-secondary" data-edit-record="${r.id}">${icon('edit')}编辑</button><span class="button-spacer"></span>${r.status==='unverified'?`<button class="btn btn-primary" data-certify-record="${r.id}">申请工行认证</button>`:`<button class="btn btn-secondary" data-action="close-dialog">关闭详情</button>`}</div>`);
}
function recordForm(id) {
 if(!state.user.verified){go('student');toast('请先完成学生认证');return;}
 const r=id?state.records.find(record=>record.id===id):null;
 openDialog(dialogHeader(r?'编辑荣誉':'添加荣誉')+`<p class="dialog-subtitle">填写成长记录。当前小样只保存本次演示内容，请使用虚构信息与示例材料。</p><form id="record-form" data-edit-id="${r?.id||''}"><label class="field"><span class="field-label">荣誉类别</span><select name="kind">${Object.entries(kinds).filter(([key])=>key!=='all').map(([key,label])=>`<option value="${key}" ${r?.kind===key?'selected':''}>${label}</option>`).join('')}</select></label><label class="field"><span class="field-label">荣誉名称</span><input name="title" maxlength="70" value="${escapeHTML(r?.title||'')}" placeholder="如：校级优秀学生奖学金" required></label><label class="field"><span class="field-label">等级、作者顺序或状态</span><input name="description" maxlength="100" value="${escapeHTML(r?.description||'')}" placeholder="如：一等奖学金 / 第一作者 / 专利申请中" required></label><div class="field-grid"><label class="field"><span class="field-label">颁发 / 来源机构</span><input name="institution" maxlength="70" value="${escapeHTML(r?.institution||'')}" placeholder="输入机构名称" required></label><label class="field"><span class="field-label">日期</span><input name="date" type="date" value="${escapeHTML(r?.date||'2026-10-08')}" required></label></div><div class="upload-zone"><label for="record-proof">${icon('upload')}添加证明材料（本地文件名预览）</label><input id="record-proof" name="proof" type="file" accept=".pdf,.jpg,.jpeg,.png"><span id="proof-note">文件不会上传至银行或服务器。</span></div>${r?.status==='verified'?'<div class="info-strip red" style="margin-top:18px">修改已认证记录后，将生成新版本并标为“未认证”，需重新申请核验。</div>':''}<div class="dialog-actions">${r?`<button type="button" class="btn btn-danger" data-delete-record="${r.id}">${icon('trash')}删除</button>`:''}<button type="button" class="btn btn-secondary" data-action="close-dialog">取消</button><button type="submit" class="btn btn-primary">保存记录</button></div></form>`);
}
function certificationDialog(id) {
 const r=state.records.find(record=>record.id===id);if(!r)return;
 openDialog(dialogHeader('申请工行认证')+`<p class="dialog-subtitle">本次申请仅针对“${escapeHTML(r.title)}”这一条荣誉记录。</p><form id="certification-form" data-record-id="${r.id}"><div class="info-strip">${icon('shield')}核验将比对官方来源或机构回执、记录内容与本人归属。AI只辅助提取字段和提示差异，疑点转人工复核。</div><label class="checkbox-line"><input type="checkbox" name="consent" required><span>我同意仅为本条荣誉认证使用必要资料；认证通过后，仍由我另外决定是否向企业公开。</span></label><div class="dialog-actions"><button type="button" class="btn btn-secondary" data-action="close-dialog">取消</button><button type="submit" class="btn btn-primary">提交认证演示</button></div></form>`);
}
function submitCertification(id) { const r=state.records.find(record=>record.id===id);if(!r||r.status!=='unverified')throw new Error('记录不存在或当前不可申请认证');if(!state.user.verified)throw new Error('需先完成学生认证');r.status='pending';r.source='待来源核查与人工复核（演示）';render();return {id:r.id,status:r.status}; }
function saveRecord(form) {
 const data=new FormData(form);const id=form.dataset.editId;const previous=state.records.find(r=>r.id===id);
 const title=String(data.get('title')).trim();const description=String(data.get('description')).trim();const institution=String(data.get('institution')).trim();
 if(!title||!description||!institution){toast('请填写完整的荣誉信息');return;}
 const proof=data.get('proof');const record={id:previous?.id||`r${state.nextId++}`,kind:String(data.get('kind')),title,description,institution,date:String(data.get('date')),status:'unverified',amount:previous?.amount||0,personal:previous?.personal||false,unpaid:previous?.unpaid||false,payout:previous?.payout||'',version:(previous?.version||0)+1,source:'尚未独立核验',proof:proof?.name||previous?.proof||''};
 if(previous)state.records[state.records.findIndex(r=>r.id===id)]=record;else state.records.unshift(record);
 if(previous){state.shareIds=state.shareIds.filter(value=>value!==id);state.shareDraft=state.shareDraft.filter(value=>value!==id);}
 closeDialog();state.filter='all';render();toast(previous?'已更新记录；认证与公开授权需重新确认':'记录已保存，可自主申请认证');
}
function confirmDelete(id) {
 const r=state.records.find(record=>record.id===id);if(!r)return;
 openDialog(dialogHeader('删除这条荣誉？')+`<p class="dialog-subtitle">删除“${escapeHTML(r.title)}”后，该记录也会从本次演示的公开授权范围中移除。</p><div class="dialog-actions"><button class="btn btn-secondary" data-edit-record="${id}">返回编辑</button><button class="btn btn-danger" data-confirm-delete="${id}">确认删除</button></div>`);
}
function toggleShare() {
 if(!state.shared){if(!state.shareDraft.length){toast('请先选择至少一项荣誉');return;}state.shareIds=[...state.shareDraft];state.shared=true;}
 else state.shared=false;
 render();toast(state.shared?'公开授权已开启，仅展示所选荣誉':'公开授权已关闭，企业无法继续查询');
}
function loanParameters() {
 const record=eligibleRecords().find(r=>r.id===$('#loan-record')?.value);
 const amount=Number($('#loan-amount')?.value);
 const days=Number($('#loan-days')?.value);
 return {record,amount,days};
}
function loanValidation() {
 const {record,amount}=loanParameters();
 const error=!record?'所选奖金当前不符合申请条件':!Number.isFinite(amount)||amount<=0?'请输入大于0的申请金额':amount>record.amount?'申请金额不得超过本人确认的待发奖金金额':'';
 $('#loan-error').textContent=error;$('#loan-amount').setCustomValidity(error);$('#loan-summary-amount').textContent=Number.isFinite(amount)&&amount>0?'¥'+money(amount):'¥0';$('#loan-submit').disabled=Boolean(error);return !error;
}
async function copyCode() {
 try {await navigator.clipboard.writeText(dossierCode);toast('档案标识码已复制');}
 catch {openDialog(dialogHeader('档案标识码')+`<p class="dialog-subtitle">可选中并复制以下标识码。</p><label class="field"><input value="${dossierCode}" readonly aria-label="档案标识码"></label><div class="dialog-actions"><button class="btn btn-primary" data-action="close-dialog">完成</button></div>`);}
}

document.addEventListener('click',event=>{
 const node=event.target.closest('button,a');if(!node)return;
 if(node.matches('.brand')){event.preventDefault();go('archive');return;}
 if(node.dataset.page){go(node.dataset.page);return;}
 if(node.dataset.filter){state.filter=node.dataset.filter;render();return;}
 if(node.dataset.record){recordDetail(node.dataset.record);return;}
 if(node.dataset.editRecord){if($('#app-dialog').open)closeDialog();recordForm(node.dataset.editRecord);return;}
 if(node.dataset.certifyRecord){closeDialog();certificationDialog(node.dataset.certifyRecord);return;}
 if(node.dataset.deleteRecord){closeDialog();confirmDelete(node.dataset.deleteRecord);return;}
 if(node.dataset.confirmDelete){const id=node.dataset.confirmDelete;state.records=state.records.filter(r=>r.id!==id);state.shareIds=state.shareIds.filter(value=>value!==id);state.shareDraft=state.shareDraft.filter(value=>value!==id);closeDialog();render();toast('记录已删除，公开范围同步更新');return;}
 const actions={
  'add-record':()=>recordForm(), 'close-dialog':closeDialog,'copy-code':copyCode,'toggle-share':toggleShare,
  'save-scope':()=>{if(state.shared&&!state.shareDraft.length){toast('公开授权至少保留一项荣誉，或关闭授权');return;}state.shareIds=[...state.shareDraft];render();toast(state.shared?'授权范围已更新':'展示范围已保存，当前仍未公开');},
  'preview-enterprise':()=>{state.queryAttempted=true;state.queryCode=dossierCode;setRole('enterprise');},
  'new-loan':()=>{state.loan=null;render();}
 };
 if(actions[node.dataset.action])actions[node.dataset.action]();
});
document.addEventListener('change',event=>{
 const node=event.target;
 if(node.dataset.shareRecord){const id=node.dataset.shareRecord;state.shareDraft=node.checked?[...new Set([...state.shareDraft,id])]:state.shareDraft.filter(value=>value!==id);const count=$('#main-content .panel-heading .section-count');if(count)count.textContent=state.shareDraft.length+'项已选择';}
 if(node.id==='loan-record') {const r=eligibleRecords().find(r=>r.id===node.value);if(!r)return;$('#award-amount').textContent='¥'+money(r.amount);$('#loan-limit').textContent='¥'+money(r.amount);$('#loan-amount').max=String(r.amount);$('#loan-amount').value=String(r.amount);$('#loan-payout').textContent=r.payout;loanValidation();}
 if(node.id==='record-proof')$('#proof-note').textContent=node.files[0]?'已选择：'+node.files[0].name+'（仅本地演示）':'文件不会上传至银行或服务器。';
});
document.addEventListener('input',event=>{if(event.target.id==='loan-amount')loanValidation();});
document.addEventListener('submit',event=>{
 if(!['record-form','student-form','certification-form','loan-form','query-form'].includes(event.target.id))return;
 event.preventDefault();const form=event.target;
 if(form.id==='record-form')saveRecord(form);
 if(form.id==='student-form'){if(!$('#student-consent').checked)return;state.user.verified=true;render();toast('学生认证流程演示完成');}
 if(form.id==='certification-form'){if(!new FormData(form).get('consent'))return;submitCertification(form.dataset.recordId);closeDialog();toast('认证申请已记录，当前状态为“核验中”');}
 if(form.id==='query-form'){state.queryAttempted=true;state.queryCode=$('#query-code').value.trim();render();}
 if(form.id==='loan-form'){
  if(!loanValidation()||!$('#loan-consent').checked)return;const {record,amount,days}=loanParameters();
  if(![30,60,90].includes(days))return;
  state.loan={recordId:record.id,title:record.title,amount,days,purpose:$('#loan-purpose').value};render();toast('演示申请已记录；没有提交至银行');
 }
});
$('#student-view').addEventListener('click',()=>setRole('student'));
$('#enterprise-view').addEventListener('click',()=>setRole('enterprise'));
$('#profile-button').addEventListener('click',()=>go('student'));
$('#reset-demo').addEventListener('click',()=>{if($('#app-dialog').open)closeDialog();state=createState();render();toast('已重置为初始示例数据');});
$('#restart-auth').addEventListener('click',()=>{if($('#app-dialog').open)closeDialog();state=createState();state.user.verified=false;go('student');toast('从学生身份认证开始体验');});
$('#app-dialog').addEventListener('click',event=>{if(event.target===$('#app-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});

// Agent actions operate on exactly the same demo state as the visible controls.
if(document.modelContext?.registerTool){
 const controller=new AbortController();
 const tools=[
  {name:'read_qingyu_demo_state',title:'读取青誉演示状态',description:'读取本页示例档案、认证状态和当前公开授权。没有真实学生数据。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(){return{studentVerified:state.user.verified,records:state.records.map(r=>({id:r.id,title:r.title,status:r.status})),disclosureEnabled:state.shared,authorizedRecordIds:[...state.shareIds]};}},
  {name:'navigate_qingyu_demo',title:'切换青誉演示页面',description:'切换到学生端档案、身份认证、奖金周转、公开授权或企业核验页面，不提交任何申请。',inputSchema:{type:'object',properties:{page:{type:'string',enum:['archive','student','loan','share','enterprise']}},required:['page'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!['archive','student','loan','share','enterprise'].includes(input.page))throw new Error('页面参数无效');if(input.page==='enterprise')setRole('enterprise');else go(input.page);return{page:input.page};}},
  {name:'disable_qingyu_demo_disclosure',title:'关闭演示档案公开授权',description:'关闭本页示例档案的企业查询授权，并立即更新可见状态。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(){state.shared=false;render();return{disclosureEnabled:false};}}
 ];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:controller.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>controller.abort(),{once:true});
}
render();
