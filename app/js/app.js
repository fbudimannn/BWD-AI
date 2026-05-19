/* BWD AI — App Logic v2 (Full Platform) */

// === State (localStorage backed) ===
const STORE_KEY = 'bwd_ai_data';
let state = loadState();
let capturedImage = null;
let analysisResult = null;

function defaultState() {
    return { isFirstTime: true, profile: { name: 'Petani', notifications: true }, farms: [{ id: 'default', name: 'Sawah Utama', area: 1, variety: 'IR64', location: '' }], scans: [], plantings: [], fertLogs: [], seasons: [], selectedYield: 6, ureaPrice: 3500 };
}
function loadState() { try { const s = JSON.parse(localStorage.getItem(STORE_KEY)) || defaultState(); if(!s.fertLogs) s.fertLogs=[]; if(!s.seasons) s.seasons=[]; if(s.isFirstTime===undefined) s.isFirstTime=true; return s; } catch { return defaultState(); } }
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

// === Walkthrough Tour ===
let tourStep = 0;
let currentHighlight = null;

const tourSteps = [
    { target: '[data-page="profile"]', title: '1. Atur Profil Anda', text: 'Selamat datang! Langkah pertama, pergi ke halaman Profil untuk memasukkan nama Anda agar aplikasi bisa menyapa.', page: 'home', align: 'top' },
    { target: '#profileName', title: 'Ketikan Nama Anda', text: 'Di sinilah Anda bisa mengubah nama dan preferensi notifikasi Anda.', page: 'profile', align: 'bottom' },
    { target: '#btnAddFarmHome', title: '2. Daftarkan Sawah', text: 'Kembali ke Beranda. Gunakan tombol ini untuk mendaftarkan lahan sawah Anda (Nama & Luas Hektar). Anda bisa mendaftarkan lebih dari satu sawah!', page: 'home', align: 'top' },
    { target: '#calFieldSelect', title: '3. Atur Jadwal Tanam', text: 'Setelah sawah terdaftar, buka Kalender dan atur Tanggal Tanam. Kami akan langsung membuatkan jadwal panen & pemupukan.', page: 'calendar', align: 'bottom' },
    { target: '.capture-area', title: '4. Waktunya Scan Daun!', text: 'Saat jadwal pemupukan tiba, buka halaman ini di sawah. Tap area ini untuk memfoto daun padi Anda secara langsung.', page: 'scan', align: 'bottom' },
    { target: '#dashBwdCard', title: '5. Pantau Penghematan', text: 'Terakhir, semua riwayat foto dan anjuran dosis Urea akan dikalkulasi di Dashboard ini. Anda siap bertani cerdas!', page: 'dashboard', align: 'bottom' }
];

function checkOnboarding() {
    if (state.isFirstTime) {
        document.getElementById('tourStartModal').style.display = 'flex';
    }
}

function skipTour() {
    state.isFirstTime = false; saveState();
    document.getElementById('tourStartModal').style.display = 'none';
    endTour();
    showToast('Tur dilewati. Selamat mencoba!');
}

function startTour() {
    document.getElementById('tourStartModal').style.display = 'none';
    document.getElementById('tourOverlay').style.display = 'block';
    tourStep = 0;
    showTourStep();
}

function showTourStep() {
    if (tourStep >= tourSteps.length) { endTour(); return; }
    
    // Clear previous highlight
    if (currentHighlight) {
        currentHighlight.style.zIndex = '';
        currentHighlight.style.position = '';
        currentHighlight.style.background = '';
    }

    const step = tourSteps[tourStep];
    
    // Switch page if needed
    if (step.page) showPage(step.page);
    
    setTimeout(() => {
        const el = document.querySelector(step.target);
        if (!el) { nextTourStep(); return; }
        
        currentHighlight = el;
        // Ensure element pops above overlay
        const computedPos = window.getComputedStyle(el).position;
        if (computedPos === 'static') el.style.position = 'relative';
        el.style.zIndex = '9999';
        if (el.tagName === 'BUTTON' && !el.style.background) el.style.background = 'white';
        
        // Setup Tooltip
        const tt = document.getElementById('tourTooltip');
        document.getElementById('tourTitle').innerHTML = step.title;
        document.getElementById('tourText').innerHTML = step.text;
        document.getElementById('tourProgress').innerHTML = `${tourStep + 1} dari ${tourSteps.length}`;
        document.getElementById('tourNextBtn').innerHTML = tourStep === tourSteps.length - 1 ? 'Selesai' : 'Lanjut';
        
        // Positioning
        tt.style.display = 'block';
        const rect = el.getBoundingClientRect();
        const ttRect = tt.getBoundingClientRect();
        const arrow = document.getElementById('tourArrow');
        
        let top, left;
        if (step.align === 'bottom') {
            top = rect.top - ttRect.height - 15;
            left = rect.left + (rect.width/2) - (ttRect.width/2);
            arrow.style.bottom = '-8px'; arrow.style.top = 'auto';
            arrow.style.left = 'calc(50% - 8px)';
        } else {
            top = rect.bottom + 15;
            left = rect.left + (rect.width/2) - (ttRect.width/2);
            arrow.style.top = '-8px'; arrow.style.bottom = 'auto';
            arrow.style.left = 'calc(50% - 8px)';
        }
        
        // Screen bounds check
        if (left < 10) left = 10;
        if (left + ttRect.width > window.innerWidth - 10) left = window.innerWidth - ttRect.width - 10;
        
        tt.style.top = `${top}px`;
        tt.style.left = `${left}px`;
        
    }, 100); // Wait for transition
}

function nextTourStep() {
    tourStep++;
    showTourStep();
}

function endTour() {
    document.getElementById('tourOverlay').style.display = 'none';
    document.getElementById('tourTooltip').style.display = 'none';
    if (currentHighlight) {
        currentHighlight.style.zIndex = '';
        currentHighlight.style.position = '';
        currentHighlight.style.background = '';
    }
    if (state.isFirstTime) {
        state.isFirstTime = false;
        saveState();
        showToast('Tur selesai! Anda siap bertani.');
    }
}

// === IRRI Tables ===
const DOSAGE = { "2-3": {5:75,6:100,7:125,8:150}, "3-4": {5:50,6:75,7:100,8:125}, "4-5": {5:0,6:25,7:50,8:50} };
const N_STATUS = {
    2: { level:'deficient', label:'Kekurangan Nitrogen', icon:'<i class="ph-fill ph-warning"></i>', color:'#CDDC39', desc:'Daun sangat pucat, pemupukan segera diperlukan.' },
    3: { level:'adequate', label:'Nitrogen Cukup Rendah', icon:'🌿', color:'#8BC34A', desc:'Nitrogen di bawah optimal, pemupukan moderat disarankan.' },
    4: { level:'optimum', label:'Nitrogen Optimal', icon:'<i class="ph-fill ph-check-circle"></i>', color:'#4CAF50', desc:'Kondisi optimal, pemupukan minimal.' },
    5: { level:'excessive', label:'Nitrogen Berlebih', icon:'🟢', color:'#2E7D32', desc:'Tidak perlu pemupukan tambahan.' }
};
const TIMING = { deficient:'Segera aplikasikan pupuk urea (25 HST/fase anakan aktif).', adequate:'Pemupukan moderat pada 25-35 HST.', optimum:'Pemupukan minimal. Monitor 7-10 hari.', excessive:'Tidak diperlukan pemupukan.' };
const NOTES = { deficient:'Pupuk disebarkan merata saat sawah macak-macak.', adequate:'Hindari pemupukan saat hujan deras.', optimum:'Fokus pengelolaan air dan hama.', excessive:'Monitor kerebahan tanaman.' };

// === Scanner ===
function triggerCapture() {
    document.getElementById('imageInput').click();
}

function handleImageInput(e) {
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
}

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
    btn.innerHTML = '<span><i class="ph-fill ph-hourglass"></i></span> Menganalisis...'; btn.disabled = true; btn.classList.add('analyzing');
    const img = new Image();
    img.onload = function() {
        try {
            const canvas = document.getElementById('analysisCanvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const scale = Math.min(300/img.width, 300/img.height, 1);
            canvas.width = Math.max(1, Math.round(img.width*scale)); 
            canvas.height = Math.max(1, Math.round(img.height*scale));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const colorData = extractColors(ctx.getImageData(0, 0, canvas.width, canvas.height));
            const bwdScore = classifyBWD(colorData) || 2; // ensure not NaN
            analysisResult = { bwdScore, colorData };
            
            // Generate Thumbnail (64x64)
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = 64; thumbCanvas.height = 64;
            const thumbCtx = thumbCanvas.getContext('2d');
            const size = Math.max(1, Math.min(img.width, img.height));
            const sx = Math.max(0, (img.width - size) / 2);
            const sy = Math.max(0, (img.height - size) / 2);
            thumbCtx.drawImage(img, sx, sy, size, size, 0, 0, 64, 64);
            const thumbData = thumbCanvas.toDataURL('image/jpeg', 0.5);

            // Save scan
            const field = document.getElementById('scanFieldSelect').value;
            state.scans.push({ id: Date.now(), date: new Date().toISOString(), bwd: bwdScore, field, yield: state.selectedYield, dose: getDose(bwdScore, state.selectedYield), colors: colorData, thumb: thumbData });
            saveState(); checkAchievements();
            
            setTimeout(() => { 
                try {
                    displayResults(bwdScore, colorData); 
                } catch(e) {
                    console.error("Display error:", e);
                }
                btn.innerHTML = '<span><i class="ph-fill ph-brain"></i></span> Analisis Sekarang'; 
                btn.disabled = false; btn.classList.remove('analyzing'); 
            }, 1000);
        } catch (err) {
            console.error(err);
            if (err.message === "NOT_A_LEAF") {
                alert('Warna daun hijau tidak terdeteksi. Mohon pastikan memfoto daun padi dari jarak dekat.');
            } else {
                alert('Gagal memproses gambar. Pastikan gambar valid.');
            }
            btn.innerHTML = '<span><i class="ph-fill ph-brain"></i></span> Analisis Sekarang'; 
            btn.disabled = false; btn.classList.remove('analyzing');
        }
    };
    img.onerror = function() {
        alert('Gagal memuat gambar. Format mungkin tidak didukung (misal HEIC).');
        btn.innerHTML = '<span><i class="ph-fill ph-brain"></i></span> Analisis Sekarang'; 
        btn.disabled = false; btn.classList.remove('analyzing');
    };
    img.src = capturedImage;
}

function extractColors(imageData) {
    const d = imageData.data; let tR=0,tG=0,tB=0,n=0;
    const totalPixels = d.length / 4;
    for (let i=0;i<d.length;i+=4) { const r=d[i],g=d[i+1],b=d[i+2]; if(d[i+3]<128) continue; if(g>40&&g>r*0.7&&g>=b) { tR+=r;tG+=g;tB+=b;n++; } }
    
    // Validasi Daun (Leaf Detection): minimal 10% area foto harus berwarna dominan hijau
    if (n / totalPixels < 0.10) {
        throw new Error("NOT_A_LEAF");
    }
    
    const mR=n?tR/n:0, mG=n?tG/n:0, mB=n?tB/n:0;
    const hsv = rgbToHsv(mR,mG,mB);
    
    // Validasi HSV: Hue harus di rentang kuning-hijau (25°-95°) dan Saturation > 15%
    const hue = hsv[0]; // 0-180 scale
    const sat = hsv[1]; // 0-255 scale
    if (hue < 25 || hue > 95 || sat < 38) { // sat 38/255 ≈ 15%
        throw new Error("NOT_A_LEAF");
    }
    
    return { meanR:Math.round(mR)||0, meanG:Math.round(mG)||0, meanB:Math.round(mB)||0, meanH:hue, greenness:Math.round(2*mG-mR-mB)||0 };
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
    document.getElementById('statusIcon').innerHTML=s.icon;
    const sb=document.getElementById('statusBadge'); sb.textContent=s.label; sb.style.background=s.color+'25'; sb.style.color=s.color;
    document.getElementById('statusDesc').textContent=s.desc;
    const dose = getDose(bwd, state.selectedYield);
    document.getElementById('doseValue').textContent=dose;
    document.getElementById('timingValue').textContent=TIMING[s.level];
    
    animBar('barR','valR',colors.meanR,255); 
    animBar('barG','valG',colors.meanG,255); 
    animBar('barB','valB',colors.meanB,255);
    animBar('barGI','valGI',Math.max(0,colors.greenness),200);
}
function quickLogFertilizer() {
    const fieldId = document.getElementById('scanFieldSelect').value;
    const bwdStr = document.getElementById('scoreValue').textContent;
    const recDose = parseFloat(document.getElementById('doseValue').textContent) || 0;
    
    // Find planting date to calculate HST
    const planting = state.plantings.find(p => p.field === fieldId);
    let hstStr = '?';
    let hst = 0;
    if (planting) {
        const d0 = new Date(planting.date);
        hst = Math.floor((new Date() - d0) / (1000*60*60*24));
        hstStr = hst + ' HST';
    } else {
        alert('Perhatian: Anda belum mengatur jadwal Kalender untuk sawah ini. Catatan tetap akan disimpan.');
    }

    let actualDoseStr = prompt(`Catat Pemupukan Hari Ini (${hstStr})\nSawah: ${fieldId}\nSkor BWD: ${bwdStr}\n\nBerapa kg Urea/ha yang Anda tabur?`, recDose);
    if (actualDoseStr === null) return;
    
    let actualDose = parseFloat(actualDoseStr);
    if (isNaN(actualDose)) actualDose = recDose;
    
    if (!state.fertLogs) state.fertLogs = [];
    const logId = `${fieldId}_quick_${Date.now()}`;
    state.fertLogs.push({ id: logId, field: fieldId, hst: hst, dose: actualDose, date: new Date().toISOString() });
    saveState();
    
    alert('✅ Pemupukan berhasil dicatat ke Kalender riwayat!');
    showPage('calendar');
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

function resetPlantingDate() {
    const field = document.getElementById('calFieldSelect').value;
    if (confirm('Anda yakin ingin mereset/menghapus jadwal tanam untuk sawah ini?')) {
        state.plantings = state.plantings.filter(p => p.field !== field);
        saveState(); refreshCalendar(); generateNotifications(); showToast('Jadwal berhasil di-reset');
    }
}

function refreshCalendar() {
    populateFarmSelects();
    const field = document.getElementById('calFieldSelect').value;
    const planting = state.plantings.find(p=>p.field===field);
    if (!planting) { document.getElementById('timelineCard').style.display='none'; document.getElementById('scheduleCard').style.display='none'; document.getElementById('seasonActionCard').style.display='none'; renderSeasonHistory(); return; }
    document.getElementById('timelineCard').style.display='block'; document.getElementById('scheduleCard').style.display='block';
    document.getElementById('seasonActionCard').style.display='block';
    const d0 = new Date(planting.date), today = new Date();
    const hst = Math.floor((today-d0)/(1000*60*60*24));
    if (!planting.overrides) planting.overrides = {};
    if (!planting.notes) planting.notes = [];
    const stages = [
        {name:'Tanam',hst:0,icon:'<i class="ph-fill ph-seedling"></i>',desc:'Hari penanaman'},
        {name:'Anakan Aktif',hst:25,icon:'<i class="ph-fill ph-camera"></i>',desc:'Scan BWD #1 — waktu pemupukan susulan'},
        {name:'Primordia',hst:35,icon:'<i class="ph-fill ph-camera"></i>',desc:'Scan BWD #2 — koreksi pemupukan'},
        {name:'Bunting',hst:55,icon:'<i class="ph-fill ph-plant"></i>',desc:'Fase reproduktif dimulai'},
        {name:'Berbunga',hst:75,icon:'<i class="ph-fill ph-flower-lotus"></i>',desc:'Fase pembungaan'},
        {name:'Pengisian',hst:90,icon:'<i class="ph-fill ph-bowl-food"></i>',desc:'Pengisian bulir'},
        {name:'Panen',hst:120,icon:'<i class="ph-fill ph-target"></i>',desc:'Waktu panen!'}
    ];
    let tlHtml = '';
    stages.forEach(s => {
        const overrideHst = planting.overrides[s.hst];
        const stageDate = new Date(d0);
        if (overrideHst) { stageDate.setTime(new Date(overrideHst).getTime()); } else { stageDate.setDate(stageDate.getDate()+s.hst); }
        const cls = hst>=s.hst+5?'past':hst>=s.hst-2?'current':'future';
        const badge = cls==='past'?'done':cls==='current'?'active':'upcoming';
        const badgeText = cls==='past'?'<i class="ph-fill ph-check-circle"></i> Selesai':cls==='current'?'<i class="ph-fill ph-map-pin"></i> Saat Ini':'<i class="ph-fill ph-hourglass"></i> Mendatang';
        const phaseNotes = planting.notes.filter(n => n.hst === s.hst);
        let notesHtml = '';
        if (phaseNotes.length > 0) {
            notesHtml = '<div style="margin-top:8px;">';
            phaseNotes.forEach(n => {
                notesHtml += `<div style="background:#f0fdf4; border-radius:8px; padding:6px 10px; margin-top:4px; font-size:12px; color:#166534;">`;
                if (n.photo) notesHtml += `<img src="${n.photo}" style="width:100%; border-radius:6px; margin-bottom:4px; max-height:80px; object-fit:cover;">`;
                notesHtml += `<div>${n.text || ''}</div><div style="font-size:10px; color:#94a3b8; margin-top:2px;">${formatDate(new Date(n.date))}</div></div>`;
            });
            notesHtml += '</div>';
        }
        const editBtn = `<button onclick="openTimelineNote('${field}', ${s.hst}, '${s.name}')" style="background:none;border:none;color:var(--primary);font-size:14px;cursor:pointer;padding:2px 6px;border-radius:8px;margin-left:6px;" title="Edit / Catatan"><i class="ph-fill ph-pencil-simple"></i></button>`;
        const overrideTag = overrideHst ? ' <span style="font-size:10px;color:#f59e0b;font-weight:600;">(diubah)</span>' : '';
        tlHtml += `<div class="timeline-item ${cls}"><div class="tl-title">${s.icon} ${s.name} (${s.hst} HST)${editBtn}</div><div class="tl-date">${formatDate(stageDate)}${overrideTag}</div><div class="tl-desc">${s.desc}</div><span class="tl-badge ${badge}">${badgeText}</span>${notesHtml}</div>`;
    });
    document.getElementById('growthTimeline').innerHTML = tlHtml;
    // Schedule
    const schedItems = [
        {icon:'<i class="ph-fill ph-camera"></i>',title:'Scan BWD #1',hst:25,type:'scan'},
        {icon:'<i class="ph-fill ph-pill"></i>',title:'Pemupukan Susulan #1',hst:26,type:'fert'},
        {icon:'<i class="ph-fill ph-camera"></i>',title:'Scan BWD #2',hst:35,type:'scan'},
        {icon:'<i class="ph-fill ph-pill"></i>',title:'Koreksi Pemupukan',hst:36,type:'fert'},
        {icon:'<i class="ph-fill ph-camera"></i>',title:'Monitoring Lanjutan',hst:50,type:'scan'},
    ];
    let schHtml = '';
    schedItems.forEach(s => {
        const dt = new Date(d0); dt.setDate(dt.getDate()+s.hst);
        const logId = `${field}_${s.hst}`;
        const isLogged = state.fertLogs && state.fertLogs.some(l => (typeof l === 'string' ? l === logId : l.id === logId));
        
        let statusHtml = '';
        if (isLogged) {
            const logEntry = state.fertLogs.find(l => typeof l === 'object' && l.id === logId);
            const doseText = logEntry ? ` (${logEntry.dose}kg)` : '';
            statusHtml = `<span class="sched-status done" style="cursor:pointer; transition:transform 0.2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="openHistoryModal('fert', '${logEntry ? logEntry.id : logId}')"><i class="ph-fill ph-check-circle"></i> Selesai${doseText}</span>`;
        } else if (hst >= s.hst) {
            if (s.type === 'fert') {
                statusHtml = `<button class="btn btn-primary" style="padding:4px 10px; font-size:11px; border-radius:12px; margin-left:auto; flex:none" onclick="markFertilized('${logId}', '${field}', ${s.hst})">Tandai Dipupuk</button>`;
            } else {
                statusHtml = `<span class="sched-status pending"><i class="ph-fill ph-warning"></i> Terlewat</span>`;
            }
        } else {
            statusHtml = `<span class="sched-status pending"><i class="ph-fill ph-hourglass"></i> Mendatang</span>`;
        }
        
        schHtml += `<div class="sched-item"><div class="sched-icon">${s.icon}</div><div class="sched-body"><div class="sched-title">${s.title}</div><div class="sched-date">${formatDate(dt)} (${s.hst} HST)</div></div>${statusHtml}</div>`;
    });
    document.getElementById('scheduleList').innerHTML = schHtml;
    renderSeasonHistory();
}

// === Timeline Notes ===
let _tlNotePhotoData = null;

function openTimelineNote(field, hst, phaseName) {
    const planting = state.plantings.find(p => p.field === field);
    if (!planting) return;
    if (!planting.overrides) planting.overrides = {};
    if (!planting.notes) planting.notes = [];
    
    document.getElementById('tlNoteField').value = field;
    document.getElementById('tlNoteHst').value = hst;
    document.getElementById('tlNoteTitle').innerHTML = `<i class="ph-fill ph-note-pencil" style="color:var(--primary); margin-right:8px;"></i> ${phaseName} (${hst} HST)`;
    
    // Set date
    const d0 = new Date(planting.date);
    if (planting.overrides[hst]) {
        document.getElementById('tlNoteDate').value = planting.overrides[hst].split('T')[0];
    } else {
        const stageDate = new Date(d0); stageDate.setDate(stageDate.getDate() + hst);
        document.getElementById('tlNoteDate').value = stageDate.toISOString().split('T')[0];
    }
    
    document.getElementById('tlNoteText').value = '';
    _tlNotePhotoData = null;
    document.getElementById('tlNotePhotoPreview').innerHTML = '<span style="font-size:13px; color:#94a3b8;"><i class="ph-fill ph-image" style="margin-right:4px;"></i> Tap untuk upload foto</span>';
    document.getElementById('tlNotePhoto').value = '';
    
    // Show existing notes
    const existing = planting.notes.filter(n => n.hst === hst);
    const exDiv = document.getElementById('tlNoteExisting');
    if (existing.length > 0) {
        exDiv.style.display = 'block';
        let eHtml = '';
        existing.forEach((n, i) => {
            eHtml += `<div style="background:#f8fafc; border-radius:8px; padding:8px; margin-bottom:6px; font-size:12px; border:1px solid #e2e8f0;">`;
            if (n.photo) eHtml += `<img src="${n.photo}" style="width:100%; border-radius:6px; margin-bottom:4px; max-height:60px; object-fit:cover;">`;
            eHtml += `<div>${n.text || '<i>Tanpa teks</i>'}</div>`;
            eHtml += `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;"><span style="font-size:10px;color:#94a3b8;">${formatDate(new Date(n.date))}</span>`;
            eHtml += `<button onclick="deleteTimelineNote('${field}',${hst},${i})" style="background:none;border:none;color:#ef4444;font-size:12px;cursor:pointer;"><i class="ph-fill ph-trash"></i></button></div></div>`;
        });
        document.getElementById('tlNoteExistingList').innerHTML = eHtml;
    } else { exDiv.style.display = 'none'; }
    
    document.getElementById('timelineNoteModal').style.display = 'flex';
}

function handleTlNotePhoto(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const max = 300; let w=img.width, h=img.height;
            if(w>h){if(w>max){h*=max/w;w=max;}}else{if(h>max){w*=max/h;h=max;}}
            canvas.width=w; canvas.height=h;
            canvas.getContext('2d').drawImage(img,0,0,w,h);
            _tlNotePhotoData = canvas.toDataURL('image/jpeg', 0.6);
            document.getElementById('tlNotePhotoPreview').innerHTML = `<img src="${_tlNotePhotoData}" style="width:100%;height:100%;object-fit:cover;">`;
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function saveTimelineNote() {
    const field = document.getElementById('tlNoteField').value;
    const hst = parseInt(document.getElementById('tlNoteHst').value);
    const newDate = document.getElementById('tlNoteDate').value;
    const text = document.getElementById('tlNoteText').value.trim();
    
    const planting = state.plantings.find(p => p.field === field);
    if (!planting) return;
    if (!planting.overrides) planting.overrides = {};
    if (!planting.notes) planting.notes = [];
    
    // Save date override
    const d0 = new Date(planting.date);
    const originalDate = new Date(d0); originalDate.setDate(originalDate.getDate() + hst);
    if (newDate && newDate !== originalDate.toISOString().split('T')[0]) {
        planting.overrides[hst] = newDate;
    }
    
    // Save note if text or photo provided
    if (text || _tlNotePhotoData) {
        planting.notes.push({ hst, text, photo: _tlNotePhotoData || null, date: new Date().toISOString() });
    }
    
    saveState(); refreshCalendar();
    document.getElementById('timelineNoteModal').style.display = 'none';
    showToast('Catatan tersimpan!');
}

function deleteTimelineNote(field, hst, idx) {
    const planting = state.plantings.find(p => p.field === field);
    if (!planting || !planting.notes) return;
    const phaseNotes = planting.notes.filter(n => n.hst === hst);
    if (idx >= 0 && idx < phaseNotes.length) {
        const globalIdx = planting.notes.indexOf(phaseNotes[idx]);
        if (globalIdx >= 0) planting.notes.splice(globalIdx, 1);
        saveState(); refreshCalendar();
        openTimelineNote(field, hst, '');
        showToast('Catatan dihapus');
    }
}

// === Season Archive ===
function archiveSeason() {
    const field = document.getElementById('calFieldSelect').value;
    const planting = state.plantings.find(p => p.field === field);
    if (!planting) return alert('Tidak ada musim aktif untuk sawah ini.');
    const farm = state.farms.find(f => f.id === field);
    
    if (!confirm(`Arsipkan musim tanam untuk "${farm ? farm.name : field}"?\n\nSemua data scan & pemupukan musim ini akan diarsipkan, dan Dashboard akan direset untuk musim baru.`)) return;
    
    const fieldScans = state.scans.filter(s => s.field === field);
    const fieldFerts = (state.fertLogs || []).filter(l => typeof l === 'object' && l.field === field);
    
    const season = {
        id: Date.now(),
        field: field,
        farmName: farm ? farm.name : field,
        plantingDate: planting.date,
        archivedDate: new Date().toISOString(),
        scans: fieldScans,
        fertLogs: fieldFerts,
        notes: planting.notes || [],
        overrides: planting.overrides || {},
        totalScans: fieldScans.length,
        avgBwd: fieldScans.length > 0 ? (fieldScans.reduce((a,s) => a+s.bwd, 0) / fieldScans.length).toFixed(1) : '-',
        totalUrea: fieldFerts.reduce((a,l) => a + (l.dose || 0), 0)
    };
    
    state.seasons.push(season);
    state.scans = state.scans.filter(s => s.field !== field);
    state.fertLogs = (state.fertLogs || []).filter(l => !(typeof l === 'object' && l.field === field));
    state.plantings = state.plantings.filter(p => p.field !== field);
    
    saveState(); refreshCalendar(); generateNotifications();
    showToast('Musim berhasil diarsipkan! Dashboard direset.');
}

function renderSeasonHistory() {
    const seasons = state.seasons || [];
    if (seasons.length === 0) {
        document.getElementById('seasonHistoryList').innerHTML = '<div class="reminder-empty">Belum ada arsip musim tanam.</div>';
        return;
    }
    let html = '';
    seasons.slice().reverse().forEach(s => {
        html += `<div style="background:#fffbeb; border-radius:12px; padding:12px; margin-bottom:8px; border:1px solid #fde68a; cursor:pointer; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="openSeasonDetail(${s.id})">`;
        html += `<div style="display:flex; justify-content:space-between; align-items:center;">`;
        html += `<div><div style="font-weight:700; color:#92400e; font-size:14px;"><i class="ph-fill ph-archive"></i> ${s.farmName}</div>`;
        html += `<div style="font-size:11px; color:#a16207;">Tanam: ${formatDate(new Date(s.plantingDate))} → Arsip: ${formatDate(new Date(s.archivedDate))}</div></div>`;
        html += `<div style="text-align:right;"><div style="font-size:18px; font-weight:800; color:#d97706;">${s.avgBwd}</div><div style="font-size:10px; color:#a16207;">${s.totalScans} scan</div></div>`;
        html += `</div></div>`;
    });
    document.getElementById('seasonHistoryList').innerHTML = html;
}

function openSeasonDetail(seasonId) {
    const s = state.seasons.find(x => x.id === seasonId);
    if (!s) return;
    let html = '';
    html += `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:16px;">`;
    html += `<div style="background:#f0fdf4; padding:10px; border-radius:12px; text-align:center;"><div style="font-size:10px; color:#166534;">Rata-rata BWD</div><div style="font-size:20px; font-weight:800; color:#15803d;">${s.avgBwd}</div></div>`;
    html += `<div style="background:#eff6ff; padding:10px; border-radius:12px; text-align:center;"><div style="font-size:10px; color:#1e40af;">Total Scan</div><div style="font-size:20px; font-weight:800; color:#2563eb;">${s.totalScans}</div></div>`;
    html += `<div style="background:#fefce8; padding:10px; border-radius:12px; text-align:center;"><div style="font-size:10px; color:#854d0e;">Total Urea</div><div style="font-size:20px; font-weight:800; color:#ca8a04;">${s.totalUrea}kg</div></div>`;
    html += `</div>`;
    html += `<div style="font-size:12px; color:var(--text-light); margin-bottom:8px;"><strong>Sawah:</strong> ${s.farmName}<br><strong>Tanam:</strong> ${formatDate(new Date(s.plantingDate))}<br><strong>Diarsipkan:</strong> ${formatDate(new Date(s.archivedDate))}</div>`;
    
    if (s.notes && s.notes.length > 0) {
        html += `<div style="margin-top:12px;"><div style="font-size:12px; font-weight:700; color:var(--text); margin-bottom:6px;"><i class="ph-fill ph-note-pencil"></i> Catatan (${s.notes.length})</div>`;
        s.notes.forEach(n => {
            html += `<div style="background:#f8fafc; border-radius:8px; padding:6px 10px; margin-bottom:4px; font-size:11px; border:1px solid #e2e8f0;">`;
            if (n.photo) html += `<img src="${n.photo}" style="width:100%; border-radius:6px; margin-bottom:4px; max-height:60px; object-fit:cover;">`;
            html += `<div>${n.text || ''}</div><div style="font-size:10px; color:#94a3b8;">${n.hst} HST — ${formatDate(new Date(n.date))}</div></div>`;
        });
        html += `</div>`;
    }
    
    document.getElementById('seasonDetailContent').innerHTML = html;
    document.getElementById('seasonDetailModal').style.display = 'flex';
}

function markFertilized(logId, fieldId, hst) {
    if(!state.fertLogs) state.fertLogs=[];
    
    const fieldScans = state.scans.filter(s => s.field === fieldId);
    let recDose = 75;
    if (fieldScans.length > 0) recDose = fieldScans[fieldScans.length - 1].dose;
    
    let actualDoseStr = prompt(`Berapa kg Urea/ha yang Anda tabur di lahan ini?\n(Rekomendasi Scan BWD terakhir: ${recDose} kg/ha)`, recDose);
    if (actualDoseStr === null) return;
    
    let actualDose = parseFloat(actualDoseStr);
    if (isNaN(actualDose)) actualDose = recDose;
    
    state.fertLogs.push({ id: logId, field: fieldId, hst: hst, dose: actualDose, date: new Date().toISOString() });
    saveState();
    refreshCalendar();
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
        if (scans.length > 1) {
            const prev = scans.slice(0, -1);
            prevScans = prev.length;
            prevAvg = prev.reduce((a,s)=>a+s.bwd,0)/prev.length;
        }
    }

    const fertLogs = state.fertLogs || [];
    const ferts = filterField === 'all' ? fertLogs : fertLogs.filter(l => typeof l === 'object' && l.field === filterField);
    const validFerts = ferts.filter(l => typeof l === 'object');
    
    if (validFerts.length > 0) {
        validFerts.forEach(l => {
            const area = state.farms.find(f => f.id === l.field)?.area || 1;
            totalUrea += (l.dose * area);
            savings += Math.max(0, (150 - l.dose) * area * state.ureaPrice);
        });
        
        if (validFerts.length > 1) {
            const prevF = validFerts.slice(0, -1);
            prevF.forEach(l => {
                const area = state.farms.find(f => f.id === l.field)?.area || 1;
                prevUrea += (l.dose * area);
                prevSavings += Math.max(0, (150 - l.dose) * area * state.ureaPrice);
            });
        }
    }
    
    if (scans.length > 0 || validFerts.length > 0) {
        document.getElementById('dashAvgBwd').textContent = scans.length > 0 ? avg.toFixed(1) : '-';
        document.getElementById('dashTotalUrea').textContent = Math.round(totalUrea);
        document.getElementById('dashSavings').textContent = 'Rp ' + Math.round(savings).toLocaleString('id');
        document.getElementById('chartEmpty').style.display = scans.length > 0 ? 'none' : 'flex';
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
    updateTrend('trendUrea', totalUrea - prevUrea, validFerts.length > 1, '', ' kg', 0, true); // true = lower is better
    updateTrend('trendSavings', savings - prevSavings, validFerts.length > 1, 'Rp ', '', 0);

    // History
    let hHtml = '';
    if (scans.length === 0) { hHtml = '<div class="history-empty">Belum ada riwayat scan.</div>'; }
    else { scans.slice().reverse().slice(0,20).forEach(s => {
        const r=Math.max(2,Math.min(5,Math.round(s.bwd))), c=N_STATUS[r].color;
        const farm = state.farms.find(f=>f.id===s.field);
        const thumbHtml = s.thumb ? `<img src="${s.thumb}" class="scan-thumb" style="border:2px solid ${c}">` : `<div class="hist-bwd" style="background:${c}">${s.bwd.toFixed(1)}</div>`;
        hHtml += `<div class="hist-item">${thumbHtml}<div class="hist-body"><div class="hist-field">${farm?farm.name:s.field} <span style="font-size:11px;color:${c};font-weight:700">· BWD ${s.bwd.toFixed(1)}</span></div><div class="hist-date">${formatDate(new Date(s.date))}</div></div><div class="hist-dose">${s.dose||0} kg/ha</div></div>`;
    }); }
    document.getElementById('historyList').innerHTML = hHtml;
    recalcCost();
}

function updateTrend(id, diff, hasPrev, pre='', post='', dec=0, lowerIsBetter=false) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!hasPrev || diff === 0) {
        el.className = 'trend-indicator trend-neutral';
        el.innerHTML = `<span><i class="ph-bold ph-minus"></i></span> Stabil`;
        return;
    }
    const isUp = diff > 0;
    const isGood = lowerIsBetter ? !isUp : isUp;
    el.className = `trend-indicator ${isGood ? 'trend-up' : 'trend-down'}`;
    const icon = isUp ? '<i class="ph-bold ph-arrow-up-right"></i>' : '<i class="ph-bold ph-arrow-down-right"></i>';
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
    
    // Avatar
    const avatarImg = document.getElementById('profileAvatarImg');
    const avatarIcon = document.getElementById('profileAvatarIcon');
    if (state.profile.avatar) {
        avatarImg.src = state.profile.avatar;
        avatarImg.style.display = 'block';
        avatarIcon.style.display = 'none';
    }
    
    // Farms
    let fHtml = '';
    state.farms.forEach(f => {
        const thumbHtml = f.photo ? `<img src="${f.photo}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="ph-fill ph-plant"></i>`;
        fHtml += `<div class="farm-item"><div class="farm-icon">${thumbHtml}</div><div class="farm-body"><div class="farm-name">${f.name}</div><div class="farm-detail">${f.area} ha · ${f.variety} · ${f.location||'Lokasi belum diset'}</div></div><button onclick="openFarmModal('${f.id}')" style="background:none;border:none;color:var(--text-muted);font-size:20px;cursor:pointer"><i class="ph-fill ph-pencil-simple"></i></button></div>`;
    });
    document.getElementById('farmList').innerHTML = fHtml;
    checkAchievements();
}

function saveProfile() {
    state.profile.name = document.getElementById('profileName').value || 'Petani';
    state.profile.notifications = document.getElementById('notifToggle').checked;
    saveState();
}

function handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const max = 200;
            let w = img.width, h = img.height;
            if(w>h){if(w>max){h*=max/w;w=max;}}else{if(h>max){w*=max/h;h=max;}}
            canvas.width = w; canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            state.profile.avatar = canvas.toDataURL('image/jpeg', 0.8);
            saveState(); refreshProfile(); showToast('Foto profil diperbarui');
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function openFarmModal(id) {
    const isNew = id === 'new';
    document.getElementById('farmModalTitle').innerHTML = isNew ? `<i class="ph-fill ph-plant" style="color:var(--accent); margin-right:8px;"></i> Sawah Baru` : `<i class="ph-fill ph-pencil-simple" style="color:var(--accent); margin-right:8px;"></i> Edit Sawah`;
    
    const farm = isNew ? { id: '', name: '', area: '', variety: '', location: '', photo: '' } : state.farms.find(f => f.id === id);
    if (!farm) return;
    
    document.getElementById('farmInputId').value = isNew ? '' : farm.id;
    document.getElementById('farmInputName').value = farm.name;
    document.getElementById('farmInputArea').value = farm.area;
    document.getElementById('farmInputVariety').value = farm.variety || 'IR64';
    document.getElementById('farmInputLocation').value = farm.location || '';
    
    const imgEl = document.getElementById('farmPhotoImg');
    const iconEl = document.getElementById('farmPhotoIcon');
    if (farm.photo) {
        imgEl.src = farm.photo; imgEl.style.display = 'block'; iconEl.style.display = 'none';
    } else {
        imgEl.src = ''; imgEl.style.display = 'none'; iconEl.style.display = 'block';
    }
    
    const btnDel = document.getElementById('btnDeleteFarm');
    if (isNew || id === 'default') {
        btnDel.style.display = 'none';
    } else {
        btnDel.style.display = 'block';
    }
    
    document.getElementById('farmModal').style.display = 'flex';
}

function handleFarmPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('farmPhotoCanvas');
            const ctx = canvas.getContext('2d');
            const maxW = 300, maxH = 300;
            let w = img.width, h = img.height;
            if(w>h){if(w>maxW){h*=maxW/w;w=maxW;}}else{if(h>maxH){w*=maxH/h;h=maxH;}}
            canvas.width = w; canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            const imgEl = document.getElementById('farmPhotoImg');
            const iconEl = document.getElementById('farmPhotoIcon');
            imgEl.src = dataUrl; imgEl.style.display = 'block'; iconEl.style.display = 'none';
            // We store the dataUrl temporarily in the img src, saveFarmData will pick it up
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function saveFarmData() {
    const id = document.getElementById('farmInputId').value;
    const name = document.getElementById('farmInputName').value.trim();
    const area = parseFloat(document.getElementById('farmInputArea').value);
    const variety = document.getElementById('farmInputVariety').value.trim();
    const location = document.getElementById('farmInputLocation').value.trim();
    
    const imgEl = document.getElementById('farmPhotoImg');
    const photo = imgEl.style.display === 'block' ? imgEl.src : '';
    
    if (!name) return alert('Nama sawah harus diisi!');
    if (isNaN(area) || area <= 0) return alert('Luas lahan tidak valid!');
    
    if (id) {
        const idx = state.farms.findIndex(f => f.id === id);
        if (idx >= 0) {
            state.farms[idx] = { ...state.farms[idx], name, area, variety, location, photo };
            showToast('Sawah berhasil diperbarui');
        }
    } else {
        const newId = 'farm_' + Date.now();
        state.farms.push({ id: newId, name, area, variety, location, photo });
        showToast('Sawah baru berhasil ditambah');
    }
    
    document.getElementById('farmModal').style.display = 'none';
    saveState(); refreshProfile(); populateFarmSelects();
}

function deleteFarmData() {
    const id = document.getElementById('farmInputId').value;
    if (id === 'default' || !id) return;
    
    const farm = state.farms.find(f => f.id === id);
    if (!farm) return;
    
    if (confirm(`Yakin ingin menghapus sawah "${farm.name}"? Ini tidak akan menghapus riwayat scan masa lalu.`)) {
        state.farms = state.farms.filter(f => f.id !== id);
        document.getElementById('farmModal').style.display = 'none';
        showToast('Sawah dihapus');
        saveState(); refreshProfile(); populateFarmSelects();
    }
}

function checkAchievements() {
    const unlock = (id, msg) => {
        const el = document.getElementById(id);
        if (el && el.classList.contains('locked')) {
            el.classList.remove('locked');
            showToast(msg);
        }
    };
    const n = state.scans.length;
    if(n>=1) unlock('badge1', 'Petani Modern (Scan Pertama)');
    if(n>=10) unlock('badge2', 'Pengamat Rutin (10x Scan)');
    const days = new Set(state.scans.map(s=>new Date(s.date).toDateString()));
    let streak=0,d=new Date();
    while(days.has(d.toDateString())){streak++;d.setDate(d.getDate()-1);}
    if(streak>=7) unlock('badge3', 'Konsisten 7 Hari');
    const totalUrea = state.scans.reduce((a,s)=>a+(s.dose||0),0);
    if(totalUrea>=100) unlock('badge4', 'Master Pupuk (100kg)');
    if(n>=50) unlock('badge5', 'Pakar BWD AI');
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
    const hour = new Date().getHours();
    const greeting = hour<11?'Selamat Pagi':hour<15?'Selamat Siang':hour<18?'Selamat Sore':'Selamat Malam';
    document.querySelector('.hero-home h2').innerHTML = `${greeting}, <span class="gradient-text" id="userName">${state.profile.name}</span> <i class="ph-fill ph-hand-waving"></i>`;
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
                remHtml += `<div class="reminder-item"><div class="rem-icon">${ev.name.includes('Scan')?'<i class="ph-fill ph-camera"></i>':'<i class="ph-fill ph-pill"></i>'}</div><div class="rem-body"><div class="rem-title">${ev.name} — ${farm?farm.name:p.field}</div><div class="rem-date">${formatDate(dt)} (${diff} hari lagi)</div></div></div>`;
            }
        });
    });
    document.getElementById('upcomingReminders').innerHTML = remHtml || '<div class="reminder-empty">Tidak ada jadwal mendatang dalam 10 hari.</div>';
    // Recent scans
    let rsHtml = '';
    if(scans.length===0){ rsHtml='<div class="reminder-empty">Belum ada scan. Tap <i class="ph-fill ph-camera"></i> untuk mulai!</div>'; }
    else { scans.slice().reverse().slice(0,5).forEach(s => {
        const r=Math.max(2,Math.min(5,Math.round(s.bwd))),c=N_STATUS[r].color,farm=state.farms.find(f=>f.id===s.field);
        const thumbHtml = s.thumb ? `<img src="${s.thumb}" class="scan-thumb" style="border:2px solid ${c}">` : `<div class="scan-bwd" style="background:${c}">${s.bwd.toFixed(1)}</div>`;
        rsHtml+=`<div class="scan-item" style="cursor:pointer; transition:transform 0.2s" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="openHistoryModal('scan', '${s.id}')">${thumbHtml}<div class="scan-body"><div class="scan-field">${farm?farm.name:s.field} <span style="font-size:11px;color:${c};font-weight:700">· BWD ${s.bwd.toFixed(1)}</span></div><div class="scan-meta">${formatDate(new Date(s.date))}</div></div><div class="scan-dose">${s.dose} kg/ha</div></div>`;
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
        if(hst>=23&&hst<=27) items.push({text:`<i class="ph-fill ph-camera"></i> Waktunya scan BWD di ${farm?farm.name:p.field}! (${hst} HST)`,time:'Hari ini'});
        if(hst>=33&&hst<=37) items.push({text:`<i class="ph-fill ph-camera"></i> Scan BWD #2 di ${farm?farm.name:p.field} (${hst} HST)`,time:'Hari ini'});
    });
    if(items.length>0) document.getElementById('notifDot').style.display='block';
    const html = items.length>0 ? items.map(i=>`<div class="notif-item">${i.text}<div class="notif-time">${i.time}</div></div>`).join('') : '<div class="notif-item">Tidak ada notifikasi baru.</div>';
    document.getElementById('notifList').innerHTML = html;
}

// === Modal & Toast ===
function openHistoryModal(type, id) {
    let data = null, title = '', bwd = '-', dose = '-', fieldName = '', dateStr = '', info = '', thumb = null;
    
    if (type === 'scan') {
        data = state.scans.find(s => s.id == id);
        if(!data) return;
        const farm = state.farms.find(f => f.id === data.field);
        title = 'Hasil Scan Daun'; fieldName = farm ? farm.name : data.field;
        dateStr = formatDate(new Date(data.date));
        bwd = data.bwd.toFixed(1); dose = (data.dose || 0) + ' kg';
        info = `Target panen: ${data.yield || '-'} ton/ha`;
        thumb = data.thumb;
    } else if (type === 'fert') {
        data = state.fertLogs.find(f => f.id === id || f === id);
        if(!data) return;
        const logObj = typeof data === 'string' ? {field: data.split('_')[0], date: new Date().toISOString(), dose: '-'} : data;
        const farm = state.farms.find(f => f.id === logObj.field);
        title = 'Riwayat Pemupukan'; fieldName = farm ? farm.name : logObj.field;
        dateStr = formatDate(new Date(logObj.date));
        bwd = 'N/A'; dose = logObj.dose + ' kg';
        info = `Pemupukan pada usia ${logObj.hst || '-'} HST.`;
    }
    
    document.querySelector('#historyModal h3').innerHTML = `<i class="ph-fill ph-file-text" style="color:var(--primary); margin-right:8px;"></i> ${title}`;
    document.getElementById('modalField').textContent = fieldName;
    document.getElementById('modalDate').textContent = dateStr;
    document.getElementById('modalBwd').textContent = bwd;
    document.getElementById('modalDose').textContent = dose;
    document.getElementById('modalInfo').textContent = info;
    
    const btnDel = document.getElementById('btnDeleteHistory');
    if(btnDel) { btnDel.dataset.id = id; btnDel.dataset.type = type; }
    
    const imgEl = document.getElementById('modalThumb');
    const iconEl = document.getElementById('modalThumbIcon');
    if (thumb) { imgEl.src = thumb; imgEl.style.display = 'block'; iconEl.style.display = 'none'; }
    else { imgEl.style.display = 'none'; iconEl.style.display = 'block'; }
    
    document.getElementById('historyModal').style.display = 'flex';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastText').textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(-100px)'; }, 3500);
}

function deleteHistoryData() {
    const btnDel = document.getElementById('btnDeleteHistory');
    if(!btnDel) return;
    const id = btnDel.dataset.id;
    const type = btnDel.dataset.type;
    
    if(confirm('Yakin ingin menghapus laporan/data ini? Penghapusan akan mempengaruhi perhitungan total di Dashboard.')) {
        if(type === 'scan') {
            state.scans = state.scans.filter(s => s.id != id);
        } else if(type === 'fert') {
            state.fertLogs = state.fertLogs.filter(f => (f.id || f) !== id);
        }
        saveState();
        document.getElementById('historyModal').style.display = 'none';
        showToast('Data berhasil dihapus');
        
        // Refresh relevant views
        refreshHome();
        refreshCalendar();
        refreshDashboard();
        recalcCost();
    }
}

// === Helpers ===
function resetApp() {
    if(confirm('Peringatan: Semua data sawah, foto, kalender, dan laporan panen akan dihapus secara permanen. Anda yakin ingin mereset aplikasi?')) {
        localStorage.removeItem(STORE_KEY);
        window.location.reload();
    }
}
function populateFarmSelects() {
    ['scanFieldSelect','calFieldSelect','dashFieldSelect'].forEach(id => {
        const el = document.getElementById(id); if(!el) return;
        const currentVal = el.value; // simpan nilai saat ini
        const opts = state.farms.map(f=>`<option value="${f.id}">${f.name}</option>`).join('');
        el.innerHTML = id==='dashFieldSelect' ? `<option value="all">Semua Sawah</option>${opts}` : opts;
        if (currentVal && Array.from(el.options).some(o => o.value === currentVal)) el.value = currentVal; // kembalikan nilai
    });
}
function updateScanField() {}
function rgbToHsv(r,g,b) { r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}return[Math.round(h*180),Math.round((mx?d/mx:0)*255),Math.round(mx*255)]; }
function formatDate(d) { return d.toLocaleDateString('id',{day:'numeric',month:'short',year:'numeric'}); }
function formatDateShort(d) { return d.toLocaleDateString('id',{day:'numeric',month:'short'}); }

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen Logic
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.remove();
                checkOnboarding(); // Trigger onboarding after splash
            }, 500);
        } else {
            checkOnboarding();
        }
    }, 1500);

    populateFarmSelects(); refreshHome(); generateNotifications();
    selectYield(state.selectedYield);
    // Close notif panel on click outside
    document.addEventListener('click', (e) => { if(!e.target.closest('.notif-btn')&&!e.target.closest('.notif-panel')) document.getElementById('notifPanel').style.display='none'; });
});
