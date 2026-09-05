(() => {
  const root = document.getElementById('zonesApp');
  if (!root) return;
  const BUILDING_ICON = {
    "Agence d'emploi":"⌂","Maison close":"◆","Boucherie":"♜","Poste de police":"▣","Maison de refuge":"⌁","Agence de protection":"⬟","Garnison":"♞","Trafiquant d'armes":"⚒","Urgences":"✚","Mont de piété":"♛","Quotidien local":"▤","Hôpital":"✚","Armurerie":"⚔","Marché noir":"◈","Arrêt taxi":"▰"
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtNum = n => Number.isFinite(Number(n)) ? new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(Number(n)) : '—';
  const zoneLabel = z => z || '—';

  try {
    const data = window.ZONES_DATA;
    if (!data || !Array.isArray(data.zones)) throw new Error('Données indisponibles');
    const zones = data.zones;
    const buildings = data.buildings;
    const counts = zones.reduce((a,z)=>{a[z.zone]=(a[z.zone]||0)+1; return a;},{});
    const avgCombat = data.sourceSummary?.moyenneCombatZ3;
    let state = { query:'', filter:'Tous', sort:'membre', selected: zones[0] || null, metric:'valeurCombatZ3', limit:10 };

    root.innerHTML = `
      <div class="zones-notice"><div><strong>Données importées du fichier « Zones Clan TS.xlsx »</strong><span>${zones.length} zones de membres sont actuellement présentes dans l'onglet principal.</span></div><span class="privacy-note">Le classeur Excel complet n'est pas publié : seules les valeurs utiles à cette page sont exportées.</span></div>
      <div class="zones-kpis">
        <div><strong>${zones.length}</strong><span>zones suivies</span></div>
        <div><strong>${counts.Z3||0}</strong><span>zones Z3</span></div>
        <div><strong>${counts.Z4||0}</strong><span>zones Z4</span></div>
        <div><strong>${fmtNum(avgCombat)}</strong><span>Valeur Combat Z3 moyenne</span></div>
      </div>
      <div class="zones-tabs" role="tablist" aria-label="Vues des zones"><button type="button" class="zones-tab active" data-view="zones">Zones & membres</button><button type="button" class="zones-tab" data-view="ranking">Classements</button></div>
      <section id="zonesView" class="zones-view">
        <div class="zones-toolbar">
          <label class="zones-search"><span>Rechercher un membre ou une zone</span><input id="zoneSearch" type="search" placeholder="Ex. filou, 3/6/3, Z4…" autocomplete="off"></label>
          <label><span>Type de zone</span><select id="zoneFilter"><option>Tous</option><option>Z1</option><option>Z2</option><option>Z3</option><option>Z4</option></select></label>
          <label><span>Trier par</span><select id="zoneSort"><option value="membre">Membre</option><option value="quartier">Zone</option><option value="valeurCombatZ3">Valeur Combat Z3</option><option value="moyenneCombat">Moyenne Combat</option><option value="valeurTotal">Valeur TOTAL</option></select></label>
        </div>
        <div class="zones-layout"><div><div id="zonesResultMeta" class="zones-result-meta"></div><div id="zonesList" class="zones-list"></div></div><aside id="zoneDetail" class="zone-detail"></aside></div>
      </section>
      <section id="rankingView" class="zones-view" hidden>
        <div class="ranking-toolbar"><label><span>Classer selon</span><select id="rankingMetric"></select></label><label><span>Afficher</span><select id="rankingLimit"><option value="10">Top 10</option><option value="20">Top 20</option><option value="999">Tous</option></select></label></div>
        <div id="rankingHeadline" class="ranking-headline"></div><div class="ranking-table-wrap"><table class="ranking-table"><thead><tr><th>#</th><th>Membre</th><th>Zone</th><th id="rankingValueHead">Valeur</th></tr></thead><tbody id="rankingBody"></tbody></table></div>
      </section>`;

    const metricOptions = [
      ['valeurCombatZ3','Valeur Combat Z3'],['moyenneCombat','Moyenne Combat'],['valeurTotal','Valeur TOTAL'],...buildings.map(b=>[`bat:${b}`,b])
    ];
    const metricSel = document.getElementById('rankingMetric');
    metricSel.innerHTML = metricOptions.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');
    const valFor = (z,metric) => metric.startsWith('bat:') ? z.batiments[metric.slice(4)] : z[metric];
    const metricLabel = metric => (metricOptions.find(x=>x[0]===metric)||[])[1] || metric;
    const rankFor = (z,metric) => {
      const eligible = zones.filter(x=>valFor(x,metric)!==null && valFor(x,metric)!=='').sort((a,b)=>(Number(valFor(b,metric))||-Infinity)-(Number(valFor(a,metric))||-Infinity));
      const idx = eligible.indexOf(z); return idx>=0 ? `${idx+1}/${eligible.length}` : '—';
    };

    function filtered(){
      const q=state.query.trim().toLocaleLowerCase('fr');
      let arr=zones.filter(z=> state.filter==='Tous' || z.zone===state.filter).filter(z=>!q || `${z.membre||''} ${z.quartier} ${z.zone}`.toLocaleLowerCase('fr').includes(q));
      arr.sort((a,b)=>{
        if(state.sort==='membre') return (a.membre||'zzzz').localeCompare(b.membre||'zzzz','fr',{sensitivity:'base'});
        if(state.sort==='quartier') return a.quartier.localeCompare(b.quartier,'fr',{numeric:true});
        return (Number(b[state.sort])||-Infinity)-(Number(a[state.sort])||-Infinity);
      });
      return arr;
    }
    function renderList(){
      const arr=filtered();
      document.getElementById('zonesResultMeta').textContent = `${arr.length} zone${arr.length>1?'s':''} affichée${arr.length>1?'s':''}`;
      const list=document.getElementById('zonesList');
      list.innerHTML = arr.map(z=>`<button type="button" class="zone-row ${state.selected===z?'selected':''}" data-zone-index="${zones.indexOf(z)}"><span class="zone-badge ${esc(z.zone.toLowerCase())}">${esc(zoneLabel(z.zone))}</span><span class="zone-row-main"><strong>${esc(z.membre||'Sans propriétaire')}</strong><small>${esc(z.quartier)}</small></span><span class="zone-row-score"><small>Combat Z3</small><strong>${fmtNum(z.valeurCombatZ3)}</strong></span><span class="zone-row-score"><small>Total</small><strong>${fmtNum(z.valeurTotal)}</strong></span><span class="zone-row-arrow">›</span></button>`).join('') || '<div class="zones-empty">Aucune zone ne correspond à cette recherche.</div>';
      list.querySelectorAll('[data-zone-index]').forEach(btn=>btn.addEventListener('click',()=>{state.selected=zones[Number(btn.dataset.zoneIndex)]; renderList(); renderDetail();}));
      if(arr.length && !arr.includes(state.selected)){state.selected=arr[0]; renderDetail();}
    }
    function renderDetail(){
      const z=state.selected; const panel=document.getElementById('zoneDetail'); if(!z){panel.innerHTML=''; return;}
      const bs=buildings.map(name=>`<div class="building-card"><div class="building-icon" aria-hidden="true">${esc(BUILDING_ICON[name]||'▦')}</div><div><span>${esc(name)}</span><strong>Niv. ${fmtNum(z.batiments[name])}</strong></div></div>`).join('');
      panel.innerHTML=`<div class="zone-detail-head"><div><div class="card-meta">${esc(z.zone)} · ${esc(z.quartier)}</div><h2>${esc(z.membre||'Sans propriétaire')}</h2></div><span class="zone-badge ${esc(z.zone.toLowerCase())}">${esc(z.zone)}</span></div>
        <div class="zone-stats"><div><span>Valeur Combat Z3</span><strong>${fmtNum(z.valeurCombatZ3)}</strong></div><div><span>Moyenne Combat</span><strong>${fmtNum(z.moyenneCombat)}</strong></div><div><span>Valeur TOTAL</span><strong>${fmtNum(z.valeurTotal)}</strong></div><div><span>Rang Combat Z3</span><strong>${rankFor(z,'valeurCombatZ3')}</strong></div></div>
        <h3 class="building-title">Niveaux des bâtiments</h3><div class="building-grid">${bs}</div>`;
    }
    function renderRanking(){
      const metric=state.metric; let arr=zones.filter(z=>valFor(z,metric)!==null && valFor(z,metric)!=='');
      arr.sort((a,b)=>(Number(valFor(b,metric))||-Infinity)-(Number(valFor(a,metric))||-Infinity)); arr=arr.slice(0,state.limit);
      const label=metricLabel(metric); document.getElementById('rankingValueHead').textContent=label;
      const top=arr[0]; document.getElementById('rankingHeadline').innerHTML=top?`<span>Meilleur ${esc(label)}</span><strong>${esc(top.membre)} — ${fmtNum(valFor(top,metric))}</strong><small>${esc(top.quartier)}</small>`:'';
      document.getElementById('rankingBody').innerHTML=arr.map((z,i)=>`<tr><td class="rank-num">${i+1}</td><td><button type="button" class="ranking-member" data-open-member="${zones.indexOf(z)}">${esc(z.membre)}</button></td><td>${esc(z.quartier)}</td><td><strong>${fmtNum(valFor(z,metric))}</strong></td></tr>`).join('');
      document.querySelectorAll('[data-open-member]').forEach(btn=>btn.addEventListener('click',()=>{state.selected=zones[Number(btn.dataset.openMember)]; document.querySelector('[data-view="zones"]').click(); renderList(); renderDetail(); setTimeout(()=>document.getElementById('zoneDetail').scrollIntoView({behavior:'smooth',block:'start'}),50);}));
    }
    document.getElementById('zoneSearch').addEventListener('input',e=>{state.query=e.target.value; renderList();});
    document.getElementById('zoneFilter').addEventListener('change',e=>{state.filter=e.target.value; renderList();});
    document.getElementById('zoneSort').addEventListener('change',e=>{state.sort=e.target.value; renderList();});
    metricSel.addEventListener('change',e=>{state.metric=e.target.value; renderRanking();});
    document.getElementById('rankingLimit').addEventListener('change',e=>{state.limit=Number(e.target.value); renderRanking();});
    document.querySelectorAll('.zones-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.zones-tab').forEach(t=>t.classList.toggle('active',t===tab)); const rankings=tab.dataset.view==='ranking'; document.getElementById('zonesView').hidden=rankings; document.getElementById('rankingView').hidden=!rankings; if(rankings) renderRanking();}));
    renderList(); renderDetail(); renderRanking();
  } catch (err) { root.innerHTML = `<div class="zones-error"><strong>Impossible de charger les données.</strong><span>${esc(err.message)}</span></div>`; }
})();
