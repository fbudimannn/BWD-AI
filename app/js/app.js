/* BWD AI — App Logic v2 (Full Platform) */

// === State (localStorage backed) ===
const STORE_KEY = 'bwd_ai_data';
let state = loadState();
let capturedImage = null;
let analysisResult = null;

function defaultState() {
    return { profile: { name: 'Petani', notifications: true }, farms: [{ id: 'default', name: 'Sawah Utama', area: 1, variety: 'IR64', location: '' }], scans: [], plantings: [], selectedYield: 6, ureaPrice: 3500 };
}
function loadState() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || defaultState(); } catch { return defaultState(); } }
function saveState() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

// === Navigation ===
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    const titles = { home: 'BWD AI', scan: 'Scan Daun', calendar: 'Kalender', dashboard: 'Dashboard', profile: 'Profil' };
    document.getElementById('topbarTitle').textContent = titles[page] || 'BWD AI';
    window.scrollTo(0, 0);
    if (page === 'home') refreshHome();
    if (page === 'dashboard') refreshDashboard();
    if (page === 'profile') refreshProfile();
    if (page === 'calendar') refreshCalendar();
}

// === IRRI Tables ===
const DOSAGE = { "2-3": {5:75,6:100,7:125,8:150}, "3-4": {5:50,6:75,7:100,8:125}, "4-5": {5:0,6:25,7:50,8:50} };
const N_STATUS = {
    2: { level:'deficient', label:'Kekurangan Nitrogen', icon:'⚠️', color:'#CDDC39', desc:'Daun sangat pucat, pemupukan segera diperlukan.' },
    3: { level:'adequate', label:'Nitrogen Cukup Rendah', icon:'🌿', color:'#8BC34A', desc:'Nitrogen di bawah optimal, pemupukan moderat disarankan.' },
    4: { level:'optimum', label:'Nitrogen Optimal', icon:'✅', color:'#4CAF50', desc:'Kondisi optimal, pemupukan minimal.' },
    5: { level:'excessive', label:'Nitrogen Berlebih', icon:'🟢', color:'#2E7D32', desc:'Tidak perlu pemupukan tambahan.' }
};
const TIMING = { deficient:'Segera aplikasikan pupuk urea (25 HST/fase anakan aktif).', adequate:'Pemupukan moderat pada 25-35 HST.', optimum:'Pemupukan minimal. Monitor 7-10 hari.', excessive:'Tidak diperlukan pemupukan.' };
const NOTES = { deficient:'Pupuk disebarkan merata saat sawah macak-macak.', adequate:'Hindari pemupukan saat hujan deras.', optimum:'Fokus pengelolaan air dan hama.', excessive:'Monitor kerebahan tanaman.' };

// === Scanner ===
function triggerCapture() { document.getElementById('imageInput').click(); }

document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        document.getElementById('previewImage').src = evt.target.result;
        document.getElementById('previewImage').style.display = 'block';
        document.getElementById('capturePlaceholder').style.display = 'none';
        document.getElementById('btnReset').style.display = 'flex';
        document.getElementById('btnAnalyze').disabled = false;
        capturedImage = evt.target.result;
    };
    reader.readAsDataURL(file);
});

function resetCapture() {
    document.getElementById('previewImage').style.display = 'none';
    document.getElementById('capturePlaceholder').style.display = 'block';
    document.getElementById('btnReset').style.display = 'none';
    document.getElementById('btnAnalyze').disabled = true;
    document.getElementById('imageInput').value = '';
    document.getElementById('results').style.display = 'none';
    capturedImage = null; analysisResult = null;
}

function selectYield(v) {
    state.selectedYield = v; saveState();
    document.querySelectorAll('.yield-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.yield) === v));
    if (analysisResult) displayResults(analysisResult.bwdScore, analysisResult.colorData);
}

function analyzeLeaf() {
    if (!capturedImage) return;
    const btn = document.getElementById('btnAnalyze');
    btn.innerHTML = '<span>⏳</span> Menganalisis...'; btn.disabled = true; btn.classList.add('analyzing');
    const img = new Image();
    img.onload = function() {
        const canvas = document.getElementById('analysisCanvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const scale = Math.min(300/img.width, 300/img.height, 1);
        canvas.width = Math.round(img.width*scale); canvas.height = Math.round(img.height*scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const colorData = extractColors(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const bwdScore = classifyBWD(colorData);
        analysisResult = { bwdScore, colorData };
        // Save scan
        const field = document.getElementById('scanFieldSelect').value;
        state.scans.push({ id: Date.now(), date: new Date().toISOString(), bwd: bwdScore, field, yield: state.selectedYield, dose: getDose(bwdScore, state.selectedYield), colors: colorData });
        saveState(); checkAchievements();
        setTimeout(() => { displayResults(bwdScore, colorData); btn.innerHTML = '<span>🧠</span> Analisis Sekarang'; btn.disabled = false; btn.classList.remove('analyzing'); }, 1000);
    };
    img.src = capturedImage;
}

function extractColors(imageData) {
    const d = imageData.data; let tR=0,tG=0,tB=0,n=0;
    for (let i=0;i<d.length;i+=4) { const r=d[i],g=d[i+1],b=d[i+2]; if(d[i+3]<128) continue; if(g>40&&g>r*0.7) { tR+=r;tG+=g;tB+=b;n++; } }
    if(n<100) { n=0; for(let i=0;i<d.length;i+=4){tR+=d[i];tG+=d[i+1];tB+=d[i+2];n++;} }
    const mR=tR/n, mG=tG/n, mB=tB/n;
    const hsv = rgbToHsv(mR,mG,mB);
    return { meanR:Math.round(mR), meanG:Math.round(mG), meanB:Math.round(mB), meanH:hsv[0], greenness:Math.round(2*mG-mR-mB) };
}

function classifyBWD(c) {
    const gn = Math.max(0,Math.min(1,(c.greenness+50)/200));
    const hs = Math.max(0,Math.min(1,(c.meanH-35)/40));
    const rs = Math.max(0,Math.min(1,(c.meanG/(c.meanR+1)-0.8)/0.8));
    const bs = Math.max(0,Math.min(1,1-(c.meanR+c.meanG+c.meanB)/(3*255)));
    return Math.round((2 + (gn*0.3+hs*0.3+rs*0.2+bs*0.2)*3)*10)/10;
}

function getDose(bwd, yld) { const k=bwd<3?"2-3":bwd<4?"3-4":"4-5"; return DOSAGE[k][Math.max(5,Math.min(8,Math.round(yld)))]; }

function displayResults(bwd, colors) {
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({behavior:'smooth'});
    const r = Math.max(2,Math.min(5,Math.round(bwd))), s = N_STATUS[r];
    const progress = (bwd-2)/3, offset = 339.292 - progress*339.292;
    const sf = document.getElementById('scoreFill'); sf.style.strokeDashoffset=offset; sf.style.stroke=s.color;
    document.getElementById('scoreValue').textContent=bwd.toFixed(1); document.getElementById('scoreValue').style.color=s.color;
    document.getElementById('scoreLabel').textContent=`Skala BWD ${bwd.toFixed(1)} / 5.0`;
    document.getElementById('statusIcon').textContent=s.icon;
    const sb=document.getElementById('statusBadge'); sb.textContent=s.label; sb.style.background=s.color+'25'; sb.style.color=s.color;
    document.getElementById('statusDesc').textContent=s.desc;
    const dose = getDose(bwd, state.selectedYield);
    document.getElementById('doseValue').textContent=dose;
    document.getElementById('timingValue').textContent=TIMING[s.level];
    document.getElementById('notesValue').textContent=NOTES[s.level];
    animBar('barR','valR',colors.meanR,255); animBar('barG','valG',colors.meanG,255); animBar('barB','valB',colors.meanB,255);
    animBar('barGI','valGI',Math.max(0,colors.greenness),200);
}
function animBar(bid,vid,val,max) { setTimeout(()=>{document.getElementById(bid).style.width=Math.min(100,val/max*100)+'%';document.getElementById(vid).textContent=Math.round(val);},100); }

// === Calendar ===
function setPlantingDate() {
    const date = document.getElementById('plantingDate').value;
    const field = document.getElementById('calFieldSelect').value;
    if (!date) return alert('Pilih tanggal tanam dulu!');
    const existing = state.plantings.findIndex(p=>p.field===field);
    if (existing>=0) state.plantings[existing].date=date; else state.plantings.push({field,date});
    saveState(); refreshCalendar(); generateNotifications();
}

function refreshCalendar() {
    populateFarmSelects();
    const field = document.getElementById('calFieldSelect').value;
    const planting = state.plantings.find(p=>p.field===field);
    if (!planting) { document.getElementById('timelineCard').style.display='none'; document.getElementById('scheduleCard').style.display='none'; return; }
    document.getElementById('timelineCard').style.display='block'; document.getElementById('scheduleCard').style.display='block';
    const d0 = new Date(planting.date), today = new Date();
    const hst = Math.floor((today-d0)/(1000*60*60*24));
    const stages = [
        {name:'Tanam',hst:0,icon:'🌱',desc:'Hari penanaman'},
        {name:'Anakan Aktif',hst:25,icon:'📸',desc:'Scan BWD #1 — waktu pemupukan susulan'},
        {name:'Primordia',hst:35,icon:'📸',desc:'Scan BWD #2 — koreksi pemupukan'},
        {name:'Bunting',hst:55,icon:'🌾',desc:'Fase reproduktif dimulai'},
        {name:'Berbunga',hst:75,icon:'🌸',desc:'Fase pembungaan'},
        {name:'Pengisian',hst:90,icon:'🍚',desc:'Pengisian bulir'},
        {name:'Panen',hst:120,icon:'🎯',desc:'Waktu panen!'}
    ];
    let tlHtml = '';
    stages.forEach(s => {
        const stageDate = new Date(d0); stageDate.setDate(stageDate.getDate()+s.hst);
        const cls = hst>=s.hst+5?'past':hst>=s.hst-2?'current':'future';
        const badge = cls==='past'?'done':cls==='current'?'active':'upcoming';
        const badgeText = cls==='past'?'✅ Selesai':cls==='current'?'📍 Saat Ini':'⏳ Mendatang';
        tlHtml += `<div class="timeline-item ${cls}"><div class="tl-title">${s.icon} ${s.name} (${s.hst} HST)</div><div class="tl-date">${formatDate(stageDate)}</div><div class="tl-desc">${s.desc}</div><span class="tl-badge ${badge}">${badgeText}</span></div>`;
    });
    document.getElementById('growthTimeline').innerHTML = tlHtml;
    // Schedule
    const schedItems = [
        {icon:'📸',title:'Scan BWD #1',hst:25,type:'scan'},
        {icon:'💊',title:'Pemupukan Susulan #1',hst:26,type:'fert'},
        {icon:'📸',title:'Scan BWD #2',hst:35,type:'scan'},
        {icon:'💊',title:'Koreksi Pemupukan',hst:36,type:'fert'},
        {icon:'📸',title:'Monitoring Lanjutan',hst:50,type:'scan'},
    ];
    let schHtml = '';
    schedItems.forEach(s => {
        const dt = new Date(d0); dt.setDate(dt.getDate()+s.hst);
        const done = hst >= s.hst;
        schHtml += `<div class="sched-item"><div class="sched-icon">${s.icon}</div><div class="sched-body"><div class="sched-title">${s.title}</div><div class="sched-date">${formatDate(dt)} (${s.hst} HST)</div></div><span class="sched-status ${done?'done':'pending'}">${done?'✅ Done':'⏳ Pending'}</span></div>`;
    });
    document.getElementById('scheduleList').innerHTML = schHtml;
}

// === Dashboard ===
function refreshDashboard() {
    const filterField = document.getElementById('dashFieldSelect') ? document.getElementById('dashFieldSelect').value : 'all';
    const scans = filterField === 'all' ? state.scans : state.scans.filter(s => s.field === filterField);
    
    document.getElementById('dashTotalScans').textContent = scans.length;
    
    let avg = 0, totalUrea = 0, savings = 0;
    let prevAvg = 0, prevUrea = 0, prevSavings = 0, prevScans = 0;
    
    if (scans.length > 0) {
        avg = scans.reduce((a,s)=>a+s.bwd,0)/scans.length;
        totalUrea = scans.reduce((a,s)=>a+(s.dose||0),0);
        savings = Math.round(totalUrea * 0.25 * state.ureaPrice);
        
        // Calculate previous stats (mocking previous period by looking at all but the last scan)
        if (scans.length > 1) {
            const prev = scans.slice(0, -1);
            prevScans = prev.length;
            prevAvg = prev.reduce((a,s)=>a+s.bwd,0)/prev.length;
            prevUrea = prev.reduce((a,s)=>a+(s.dose||0),0);
            prevSavings = Math.round(prevUrea * 0.25 * state.ureaPrice);
        }
        
        document.getElementById('dashAvgBwd').textContent = avg.toFixed(1);
        document.getElementById('dashTotalUrea').textContent = totalUrea;
        document.getElementById('dashSavings').textContent = 'Rp ' + savings.toLocaleString('id');
        document.getElementById('chartEmpty').style.display = 'none';
        drawChart(scans);
    } else {
        document.getElementById('dashAvgBwd').textContent = '-';
        document.getElementById('dashTotalUrea').textContent = '0';
        document.getElementById('dashSavings').textContent = 'Rp 0';
        document.getElementById('chartEmpty').style.display = 'flex';
        drawChart([]); // clear chart
    }
    
    // Update Trends
    updateTrend('trendScans', scans.length - prevScans, scans.length > 1, '', ' scan');
    updateTrend('trendBwd', avg - prevAvg, scans.length > 1, '', '', 1);
    updateTrend('trendUrea', totalUrea - prevUrea, scans.length > 1, '', ' kg', 0, true); // true = lower is better
    updateTrend('trendSavings', savings - prevSavings, scans.length > 1, 'Rp ', '', 0);

    // History
    let hHtml = '';
    if (scans.length === 0) { hHtml = '<div class="history-empty">Belum ada riwayat scan.</div>'; }
    else { scans.slice().reverse().slice(0,20).forEach(s => {
        const r=Math.max(2,Math.min(5,Math.round(s.bwd))), c=N_STATUS[r].color;
        const farm = state.farms.find(f=>f.id===s.field);
        hHtml += `<div class="hist-item"><div class="hist-bwd" style="background:${c}">${s.bwd.toFixed(1)}</div><div class="hist-body"><div class="hist-field">${farm?farm.name:s.field}</div><div class="hist-date">${formatDate(new Date(s.date))}</div></div><div class="hist-dose">${s.dose||0} kg/ha</div></div>`;
    }); }
    document.getElementById('historyList').innerHTML = hHtml;
    recalcCost();
}

function updateTrend(id, diff, hasPrev, pre='', post='', dec=0, lowerIsBetter=false) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!hasPrev || diff === 0) {
        el.className = 'trend-indicator trend-neutral';
        el.innerHTML = `<span>➖</span> Stabil`;
        return;
    }
    const isUp = diff > 0;
    const isGood = lowerIsBetter ? !isUp : isUp;
    el.className = `trend-indicator ${isGood ? 'trend-up' : 'trend-down'}`;
    const icon = isUp ? '↗️' : '↘️';
    const sign = isUp ? '+' : '';
    el.innerHTML = `<span>${icon}</span> ${sign}${pre}${Math.abs(diff).toFixed(dec).replace(/\.0$/,'')}${post}`;
}

function drawChart(scans) {
    const canvas = document.getElementById('bwdChart');
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * 2; canvas.height = 360;
    ctx.scale(2,2);
    const w = rect.width, h = 180, pad = 40;
    ctx.clearRect(0,0,w,h);
    // Grid
    ctx.strokeStyle = 'rgba(148,163,184,0.1)'; ctx.lineWidth = 1;
    for (let i=2;i<=5;i++) { const y = pad+(5-i)/(5-2)*(h-pad*2); ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-10,y); ctx.stroke(); ctx.fillStyle='#64748b'; ctx.font='10px Inter'; ctx.fillText(i,10,y+4); }
    // Data points
    const pts = scans.slice(-15);
    if (pts.length < 2) return;
    const stepX = (w-pad-20)/(pts.length-1);
    ctx.beginPath(); ctx.strokeStyle='#22c55e'; ctx.lineWidth=2;
    pts.forEach((s,i) => { const x=pad+i*stepX, y=pad+(5-s.bwd)/(5-2)*(h-pad*2); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke();
    // Dots
    pts.forEach((s,i) => {
        const x=pad+i*stepX, y=pad+(5-s.bwd)/(5-2)*(h-pad*2);
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle='#22c55e'; ctx.fill();
        ctx.fillStyle='#64748b'; ctx.font='9px Inter'; ctx.textAlign='center';
        ctx.fillText(formatDateShort(new Date(s.date)),x,h-5);
    });
}

function recalcCost() {
    const price = parseInt(document.getElementById('ureaPrice').value)||3500;
    const area = parseFloat(document.getElementById('fieldArea').value)||1;
    state.ureaPrice = price; saveState();
    const totalDose = state.scans.length>0 ? state.scans[state.scans.length-1].dose||100 : 100;
    const withBwd = totalDose * area * price;
    const without = 150 * area * price; // assume 150 kg/ha without BWD
    const saved = without - withBwd;
    document.getElementById('costUrea').textContent = `${totalDose * area} kg`;
    document.getElementById('costWithBwd').textContent = `Rp ${withBwd.toLocaleString('id')}`;
    document.getElementById('costWithout').textContent = `Rp ${without.toLocaleString('id')}`;
    document.getElementById('costSaved').textContent = `Rp ${Math.max(0,saved).toLocaleString('id')}`;
}

// === Profile ===
function refreshProfile() {
    document.getElementById('profileName').value = state.profile.name;
    document.getElementById('notifToggle').checked = state.profile.notifications;
    // Farms
    let fHtml = '';
    state.farms.forEach(f => {
        fHtml += `<div class="farm-item"><div class="farm-icon">🌾</div><div class="farm-body"><div class="farm-name">${f.name}</div><div class="farm-detail">${f.area} ha · ${f.variety} · ${f.location||'Lokasi belum diset'}</div></div></div>`;
    });
    document.getElementById('farmList').innerHTML = fHtml;
    checkAchievements();
}

function saveProfile() {
    state.profile.name = document.getElementById('profileName').value || 'Petani';
    state.profile.notifications = document.getElementById('notifToggle').checked;
    saveState();
}

function addFarm() {
    const name = prompt('Nama sawah baru:');
    if (!name) return;
    const area = prompt('Luas (ha):', '0.5') || '0.5';
    state.farms.push({ id: 'farm_'+Date.now(), name, area: parseFloat(area), variety: 'IR64', location: '' });
    saveState(); refreshProfile(); populateFarmSelects();
}

function checkAchievements() {
    const n = state.scans.length;
    if(n>=1) document.getElementById('badge1').classList.remove('locked');
    if(n>=10) document.getElementById('badge2').classList.remove('locked');
    // streak check
    const days = new Set(state.scans.map(s=>new Date(s.date).toDateString()));
    let streak=0,d=new Date();
    while(days.has(d.toDateString())){streak++;d.setDate(d.getDate()-1);}
    if(streak>=7) document.getElementById('badge3').classList.remove('locked');
    const totalUrea = state.scans.reduce((a,s)=>a+(s.dose||0),0);
    if(totalUrea>=100) document.getElementById('badge4').classList.remove('locked');
    if(n>=50) document.getElementById('badge5').classList.remove('locked');
}

function exportData() {
    if(state.scans.length===0) return alert('Belum ada data scan.');
    let csv = 'Tanggal,Sawah,BWD Score,Urea (kg/ha),Target Yield\n';
    state.scans.forEach(s => { const f=state.farms.find(f=>f.id===s.field); csv+=`${new Date(s.date).toLocaleDateString('id')},${f?f.name:s.field},${s.bwd},${s.dose},${s.yield}\n`; });
    const blob = new Blob([csv],{type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='bwd_ai_scan_history.csv'; a.click();
}

// === Home ===
function refreshHome() {
    document.getElementById('userName').textContent = state.profile.name;
    const hour = new Date().getHours();
    const greeting = hour<11?'Selamat Pagi':hour<15?'Selamat Siang':hour<18?'Selamat Sore':'Selamat Malam';
    document.querySelector('.hero-home h2').innerHTML = `${greeting}, <span class="gradient-text">${state.profile.name}</span> 👋`;
    const scans = state.scans;
    document.getElementById('totalScans').textContent = scans.length;
    document.getElementById('avgBwd').textContent = scans.length>0?(scans.reduce((a,s)=>a+s.bwd,0)/scans.length).toFixed(1):'-';
    const saved = scans.length>0?Math.round(scans.reduce((a,s)=>a+(150-(s.dose||100)),0)*0.5):0;
    document.getElementById('ureaSaved').textContent = Math.max(0,saved);
    // Upcoming reminders
    let remHtml = '';
    state.plantings.forEach(p => {
        const d0=new Date(p.date), today=new Date(), hst=Math.floor((today-d0)/(1000*60*60*24));
        const farm = state.farms.find(f=>f.id===p.field);
        [{name:'Scan BWD #1',h:25},{name:'Pemupukan',h:26},{name:'Scan BWD #2',h:35}].forEach(ev => {
            if(ev.h > hst && ev.h <= hst+10) {
                const dt=new Date(d0); dt.setDate(dt.getDate()+ev.h); const diff=ev.h-hst;
                remHtml += `<div class="reminder-item"><div class="rem-icon">${ev.name.includes('Scan')?'📸':'💊'}</div><div class="rem-body"><div class="rem-title">${ev.name} — ${farm?farm.name:p.field}</div><div class="rem-date">${formatDate(dt)} (${diff} hari lagi)</div></div></div>`;
            }
        });
    });
    document.getElementById('upcomingReminders').innerHTML = remHtml || '<div class="reminder-empty">Tidak ada jadwal mendatang dalam 10 hari.</div>';
    // Recent scans
    let rsHtml = '';
    if(scans.length===0){ rsHtml='<div class="reminder-empty">Belum ada scan. Tap 📸 untuk mulai!</div>'; }
    else { scans.slice().reverse().slice(0,5).forEach(s => {
        const r=Math.max(2,Math.min(5,Math.round(s.bwd))),c=N_STATUS[r].color,farm=state.farms.find(f=>f.id===s.field);
        rsHtml+=`<div class="scan-item"><div class="scan-bwd" style="background:${c}">${s.bwd.toFixed(1)}</div><div class="scan-body"><div class="scan-field">${farm?farm.name:s.field}</div><div class="scan-meta">${formatDate(new Date(s.date))}</div></div><div class="scan-dose">${s.dose} kg/ha</div></div>`;
    }); }
    document.getElementById('recentScans').innerHTML = rsHtml;
}

// === Notifications ===
function toggleNotifPanel() {
    const p = document.getElementById('notifPanel');
    p.style.display = p.style.display==='block'?'none':'block';
}
function generateNotifications() {
    let items = [];
    state.plantings.forEach(p => {
        const d0=new Date(p.date),today=new Date(),hst=Math.floor((today-d0)/(1000*60*60*24));
        const farm=state.farms.find(f=>f.id===p.field);
        if(hst>=23&&hst<=27) items.push({text:`📸 Waktunya scan BWD di ${farm?farm.name:p.field}! (${hst} HST)`,time:'Hari ini'});
        if(hst>=33&&hst<=37) items.push({text:`📸 Scan BWD #2 di ${farm?farm.name:p.field} (${hst} HST)`,time:'Hari ini'});
    });
    if(items.length>0) document.getElementById('notifDot').style.display='block';
    const html = items.length>0 ? items.map(i=>`<div class="notif-item">${i.text}<div class="notif-time">${i.time}</div></div>`).join('') : '<div class="notif-item">Tidak ada notifikasi baru.</div>';
    document.getElementById('notifList').innerHTML = html;
}

// === Helpers ===
function populateFarmSelects() {
    ['scanFieldSelect','calFieldSelect','dashFieldSelect'].forEach(id => {
        const el = document.getElementById(id); if(!el) return;
        const opts = state.farms.map(f=>`<option value="${f.id}">${f.name}</option>`).join('');
        el.innerHTML = id==='dashFieldSelect' ? `<option value="all">Semua Sawah</option>${opts}` : opts;
    });
}
function updateScanField() {}
function rgbToHsv(r,g,b) { r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}return[Math.round(h*180),Math.round((mx?d/mx:0)*255),Math.round(mx*255)]; }
function formatDate(d) { return d.toLocaleDateString('id',{day:'numeric',month:'short',year:'numeric'}); }
function formatDateShort(d) { return d.toLocaleDateString('id',{day:'numeric',month:'short'}); }

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
    populateFarmSelects(); refreshHome(); generateNotifications();
    selectYield(state.selectedYield);
    // Close notif panel on click outside
    document.addEventListener('click', (e) => { if(!e.target.closest('.notif-btn')&&!e.target.closest('.notif-panel')) document.getElementById('notifPanel').style.display='none'; });
});
