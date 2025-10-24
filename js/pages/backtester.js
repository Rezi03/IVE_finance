
const fmtPct = x => (x*100).toFixed(2)+'%';
const fmtNum = x => Intl.NumberFormat('en-US', {maximumFractionDigits:2}).format(x);
const mean = a => a.reduce((m,x)=>m+x,0)/Math.max(1,a.length);
const stdev = a => { const m=mean(a); return Math.sqrt(mean(a.map(x=> (x-m)**2))); };
const downsideDev = (a, floor=0) => { const d = a.filter(x=>x<floor); if(!d.length) return 0; const m=mean(d); return Math.sqrt(mean(d.map(x=> (x-m)**2))); };
const fmtDate = d => d.toISOString().slice(0,10);

function gridCanvas(canvas){
    const ctx = canvas.getContext('2d');
    const W = canvas.clientWidth, H = canvas.clientHeight; const dpr = devicePixelRatio||1; canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle = '#e5eeff'; ctx.lineWidth=1;
    for(let i=0;i<=5;i++){ const y = 12 + (H-40)*i/5; ctx.beginPath(); ctx.moveTo(48,y); ctx.lineTo(W-12,y); ctx.stroke(); }
    ctx.fillStyle = '#6b7ea6'; ctx.font = '12px Inter, system-ui';
    return {ctx, W, H};
}

function drawLine(canvas, series, color){
    const {ctx, W, H} = gridCanvas(canvas);
    const area = {x0:48, y0:12, x1:W-12, y1:H-28};
    const vals = series.map(p=>p.v); const min = Math.min(...vals), max = Math.max(...vals);
    ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.beginPath();
    series.forEach((pt, i)=>{
    const x = area.x0 + (area.x1-area.x0) * (i/(series.length-1));
    const y = area.y1 - ((pt.v-min)/(max-min||1)) * (area.y1-area.y0);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
}

function drawScatter(canvas, points){
    const {ctx, W, H} = gridCanvas(canvas);
    const area = {x0:48, y0:12, x1:W-12, y1:H-28};
    const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
    const xmin=Math.min(...xs), xmax=Math.max(...xs), ymin=Math.min(...ys), ymax=Math.max(...ys);
    ctx.fillStyle = '#0d5bd7';
    points.forEach(p=>{
    const x = area.x0 + (area.x1-area.x0) * ((p.x-xmin)/(xmax-xmin||1));
    const y = area.y1 - (area.y1-area.y0) * ((p.y-ymin)/(ymax-ymin||1));
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    });
}

function demoEqBd(range='3y'){
    const months = range==='1y'?12:range==='5y'?60:range==='max'?120:36;
    const outEq=[], outBd=[], outBm=[]; let d = new Date(); d.setDate(28); d.setMonth(d.getMonth()-months);
    let eq=100, bd=100, bm=100;
    for(let i=0;i<months;i++){
    const rEq = (Math.random()*0.06-0.03)+0.008; 
    const rBd = (Math.random()*0.03-0.015)+0.0025;
    const rBm = (Math.random()*0.035-0.02)+0.004; 
    eq *= (1+rEq); bd *= (1+rBd); bm *= (1+rBm);
    outEq.push({t:new Date(d), v:eq}); outBd.push({t:new Date(d), v:bd}); outBm.push({t:new Date(d), v:bm});
    d.setMonth(d.getMonth()+1); d.setDate(28);
    }
    return {eq:outEq, bd:outBd, bm:outBm};
}

function demoCurve(){
    const tenors=["1M","3M","6M","1Y","2Y","3Y","5Y","7Y","10Y","20Y","30Y"]; 
    const base=[5.3,5.35,5.4,5.25,4.9,4.7,4.4,4.2,4.0,4.1,4.2];
    return tenors.map((tenor,i)=>({tenor, y: base[i] + (Math.random()*0.1-0.05)}));
}

function demoBonds(){
    const sectors=["Tech","Energy","Financials","Utilities","Healthcare","Consumer"], ratings=["AAA","AA","A","BBB","BB","B"];
    const rows=[]; for(let i=0;i<80;i++){
    const sec = sectors[Math.floor(Math.random()*sectors.length)];
    const rat = ratings[Math.floor(Math.random()*ratings.length)];
    const dur = +(Math.random()*9+1).toFixed(1); const spr = +(Math.random()*350+50).toFixed(0); 
    const yld = +(3 + spr/100 + (Math.random()*0.6-0.3)).toFixed(2);
    rows.push({issuer:`Corp ${String.fromCharCode(65+(i%26))}${i}`, sector:sec, rating:rat, duration:dur, spread:spr, yield:yld, coupon:(Math.random()*4+2).toFixed(1)+"%", maturity:`20${25+Math.floor(Math.random()*10)}-0${1+Math.floor(Math.random()*9)}-15`});
    }
    return rows;
}

function rebalanceFlag(freq, date){
    if(freq==='none') return false; const m=date.getMonth();
    if(freq==='monthly') return true; if(freq==='quarterly') return [2,5,8,11].includes(m); if(freq==='yearly') return m===11; return false;
}

function backtestFromSeries(eqSeries, bdSeries, wEq=0.4, wBd=0.6, rebal='monthly'){
    const n = Math.min(eqSeries.length, bdSeries.length); if(n===0) return null;
    let valEq = 100*wEq, valBd = 100*wBd; let pv = valEq+valBd; let last=pv;
    const equity=[], rets=[], dd=[]; let peak=100;
    for(let i=0;i<n;i++){
    const d = eqSeries[i].t; 
    const rEq = i===0?0:(eqSeries[i].v/eqSeries[i-1].v - 1);
    const rBd = i===0?0:(bdSeries[i].v/bdSeries[i-1].v - 1);
    valEq *= (1+rEq); valBd *= (1+rBd); pv = valEq+valBd;
    if(rebalanceFlag(rebal,d)) { const tot = pv; valEq = tot*wEq; valBd = tot*wBd; }
    const pr = (pv/last)-1; last=pv; rets.push(pr);
    equity.push({t:d, v:pv}); peak=Math.max(peak,pv); dd.push({t:d, v: pv/peak-1});
    }
    const days=(eqSeries[n-1].t - eqSeries[0].t)/(1000*3600*24); const perY=Math.max(1,Math.round(365/days*n));
    const totalRet = pv/ (100) - 1; const CAGR = Math.pow(1+totalRet, perY/n)-1;
    const volAnn = stdev(rets) * Math.sqrt(perY);
    let mdd = Math.min(...dd.map(x=>x.v));
    const sharpe = (mean(rets)*Math.sqrt(perY)) / (stdev(rets)||1e-9);
    const sortino = (mean(rets)*Math.sqrt(perY)) / (downsideDev(rets)||1e-9);
    return {equity, dd, CAGR, volAnn, mdd, sharpe, sortino};
}

async function fetchFMPPrices(ticker, apikey, range){
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${encodeURIComponent(ticker)}?serietype=line&apikey=${apikey}`;
    const r = await fetch(url); if(!r.ok) throw new Error('HTTP '+r.status);
    const data = await r.json();
    if(!data || !data.historical) throw new Error('Malformed response');
    let hist = data.historical.map(d=>({t:new Date(d.date), v: d.close ?? d.adjClose ?? d.price})).sort((a,b)=>a.t-b.t);
    const monthly=[]; let lastM=-1; hist.forEach(p=>{ const m=p.t.getMonth(), y=p.t.getFullYear(); const key=`${y}-${m}`; if(lastM!==key){ monthly.push(p); lastM=key; } else { monthly[monthly.length-1]=p; } });
    let months = range==='1y'?12:range==='5y'?60:range==='max'?9999:36; if(monthly.length>months) monthly.splice(0, monthly.length-months);
    return monthly;
}

async function tryLoadAPI(){
    const key = document.getElementById('apiKey').value.trim();
    const eqT = document.getElementById('eqTicker').value.trim();
    const bdT = document.getElementById('bdTicker').value.trim();
    const bmT = document.getElementById('bmTicker').value.trim();
    const range = document.getElementById('range').value;
    const diag = document.getElementById('diag');
    diag.textContent = 'Loading from API…';
    try{
    const [eq, bd, bm] = await Promise.all([
        fetchFMPPrices(eqT, key, range),
        fetchFMPPrices(bdT, key, range),
        fetchFMPPrices(bmT, key, range)
    ]);
    diag.textContent = 'API loaded.';
    return {eq, bd, bm};
    }catch(e){
    diag.textContent = 'API error → using demo data ('+e.message+').';
    return demoEqBd(range);
    }
}

function applyCurveShift(curve, bps){
    const add = bps/100; 
    return curve.map(pt=>({tenor:pt.tenor, y: +(pt.y + add).toFixed(2)}));
}

function bondPriceChangeApprox(durationYears, deltaYieldPct){
    return -durationYears * (deltaYieldPct/100);
}

function renderEquity(eq, bm){
    const base = eq[0]?.v || 100; const s1 = eq.map(p=>({t:p.t, v: (p.v/base)*100}));
    drawLine(document.getElementById('chartEq'), s1, '#0d5bd7');
    if(bm && bm.length){
    const baseB = bm[0].v; const s2 = bm.map(p=>({t:p.t, v:(p.v/baseB)*100}));
    const c = document.getElementById('chartEq');
    const ctx = c.getContext('2d'); const W=c.clientWidth,H=c.clientHeight; const dpr=devicePixelRatio||1; ctx.setTransform(dpr,0,0,dpr,0,0);
    const area={x0:48, y0:12, x1:W-12, y1:H-28};
    const vals = s1.map(x=>x.v).concat(s2.map(x=>x.v)); const min=Math.min(...vals), max=Math.max(...vals);
    ctx.lineWidth=2; ctx.strokeStyle='#17a6ff'; ctx.beginPath();
    s2.forEach((pt,i)=>{ const x=area.x0+(area.x1-area.x0)*(i/(s2.length-1)); const y=area.y1-((pt.v-min)/(max-min||1))*(area.y1-area.y0); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke();
    }
}

function renderDD(dd){ drawLine(document.getElementById('chartDD'), dd.map(x=>({v:x.v})), '#e14b64'); }

function renderCurve(curve){
    const c = document.getElementById('chartCurve'); const {ctx,W,H} = gridCanvas(c); const area={x0:48,y0:12,x1:W-12,y1:H-28};
    const xs = curve.map((_,i)=>i), ys = curve.map(p=>p.y); const min=Math.min(...ys), max=Math.max(...ys);
    ctx.lineWidth=2; ctx.strokeStyle='#d68a00'; ctx.beginPath();
    curve.forEach((pt,i)=>{ const x=area.x0+(area.x1-area.x0)*(i/(curve.length-1)); const y=area.y1-((pt.y-min)/(max-min||1))*(area.y1-area.y0); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke();
    // labels
    ctx.fillStyle='#6b7ea6'; ctx.font='12px Inter, system-ui';
    curve.forEach((pt,i)=>{ const x=area.x0+(area.x1-area.x0)*(i/(curve.length-1)); const y=area.y1-((pt.y-min)/(max-min||1))*(area.y1-area.y0); ctx.fillText(pt.tenor, x-8, area.y1+16); });
}

function renderScreener(rows){
    const wrap=document.getElementById('tableWrap');
    const head = `<table><thead><tr><th>Issuer</th><th>Sector</th><th>Rating</th><th>Duration</th><th>Spread (bps)</th><th>Yield %</th><th>Coupon</th><th>Maturity</th></tr></thead><tbody>`;
    const body = rows.slice(0,120).map(r=>`<tr><td>${r.issuer}</td><td>${r.sector}</td><td>${r.rating}</td><td>${r.duration}</td><td>${r.spread}</td><td>${r.yield}</td><td>${r.coupon}</td><td>${r.maturity}</td></tr>`).join('');
    wrap.innerHTML = head + body + '</tbody></table>';
}

function updateKPIs(res){
    document.getElementById('kCAGR').textContent = isFinite(res.CAGR)? fmtPct(res.CAGR):'—';
    document.getElementById('kDD').textContent   = isFinite(res.mdd)? fmtPct(res.mdd):'—';
    document.getElementById('kVol').textContent  = isFinite(res.volAnn)? fmtPct(res.volAnn):'—';
    document.getElementById('kSharpe').textContent = isFinite(res.sharpe)? res.sharpe.toFixed(2):'—';
    document.getElementById('kSortino').textContent= isFinite(res.sortino)? res.sortino.toFixed(2):'—';
}

let seriesEq=[], seriesBd=[], seriesBm=[], curve=[], bonds=[];

async function loadAPIThenRender(){
    const {eq, bd, bm} = await tryLoadAPI();
    seriesEq = eq; seriesBd = bd; seriesBm = bm;
    curve = applyCurveShift(demoCurve(), +document.getElementById('shiftBps').value);
    bonds = demoBonds();
    runAll();
}

function useDemo(){
    const range = document.getElementById('range').value;
    const demo = demoEqBd(range); seriesEq=demo.eq; seriesBd=demo.bd; seriesBm=demo.bm; curve = demoCurve(); bonds = demoBonds();
    runAll();
}

function runAll(){
    const wEq=(+document.getElementById('wEq').value||40)/100; const wBd=(+document.getElementById('wBd').value||60)/100; const rebal=document.getElementById('rebal').value;
    const res = backtestFromSeries(seriesEq, seriesBd, wEq, wBd, rebal); if(!res){ document.getElementById('diag').textContent='No data'; return; }
    updateKPIs(res);
    renderEquity(res.equity, seriesBm);
    renderDD(res.dd);
    const shift=+document.getElementById('shiftBps').value||0; curve = applyCurveShift(demoCurve(), shift); renderCurve(curve);
    const map = {AAA:1,AA:2,A:3,BBB:4,BB:5,B:6};
    const points = bonds.map(b=>({x: map[b.rating]||4, y: b.spread}));
    drawScatter(document.getElementById('chartScatter'), points);
    renderScreener(bonds);
    document.getElementById('diag').textContent='OK';
    window.__last = {res, curve, bonds};
}

document.getElementById('exportCSV').addEventListener('click', ()=>{
    const rows = (window.__last?.bonds)||[]; if(!rows.length) return alert('Nothing to export');
    const out = ['issuer,sector,rating,duration,spread,yield,coupon,maturity'];
    rows.forEach(r=> out.push([r.issuer,r.sector,r.rating,r.duration,r.spread,r.yield,r.coupon,r.maturity].join(',')));
    const blob = new Blob([out.join('\n')], {type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='bond_screener.csv'; a.click(); URL.revokeObjectURL(url);
});

document.getElementById('exportPNG').addEventListener('click', async ()=>{
    const ids=['chartEq','chartDD','chartCurve','chartScatter'];
    for(const id of ids){
    const c=document.getElementById(id);
    if(!c) continue;
    await new Promise(r=>setTimeout(r,60));
    const url=c.toDataURL('image/png');
    const a=document.createElement('a');
    a.href=url; a.download=`${id}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    }
});

document.getElementById('loadData').addEventListener('click', loadAPIThenRender);
document.getElementById('useDemo').addEventListener('click', useDemo);
document.getElementById('run').addEventListener('click', runAll);

function assert(name, cond){ if(!cond) throw new Error('Test failed: '+name); }
function runQuickTests(){
    const out=[];
    const pc = bondPriceChangeApprox(5, 100); 
    assert('duration approx negative', pc < 0); out.push('duration ✓');
    const s = Array.from({length:12}, (_,i)=>({t:new Date(2024, i, 28), v:100*(1+i*0.01)}));
    const res = backtestFromSeries(s, s, 0.5, 0.5, 'monthly');
    assert('equity len', res.equity.length===12); out.push('backtest ✓');
    const c = demoCurve(); const c2 = applyCurveShift(c,100); assert('shift +1%', Math.abs(c2[0].y - (c[0].y + 1)) < 0.11); out.push('curve ✓');
    document.getElementById('diag').textContent = out.join(' | ');
}
document.getElementById('runTests').addEventListener('click', ()=>{ try{ runQuickTests(); } catch(e){ document.getElementById('diag').textContent = e.message; console.error(e); } });

loadAPIThenRender();
