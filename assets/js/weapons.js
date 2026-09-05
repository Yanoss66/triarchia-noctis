(() => {
  const data = Array.isArray(window.TN_WEAPONS) ? window.TN_WEAPONS : [];
  const byName = new Map(data.map(w => [w.name.toLocaleLowerCase('fr'), w]));
  const fmt = n => Number.isInteger(n) ? String(n) : Number(n).toFixed(1).replace('.', ',');
  const fmtPlus = n => `${n >= 0 ? '+' : ''}${fmt(n)}`;
  const findWeapon = value => byName.get(String(value || '').trim().toLocaleLowerCase('fr'));
  const version = (w, rarity) => {
    const ancient = rarity === 'ancient';
    const avg = ancient ? w.ancientAvg : w.epicAvg;
    const mult = ancient ? w.ancientMult : 1;
    const attacks = ancient ? w.ancientAttacks : w.epicAttacks;
    const monsterAttacks = ancient ? w.ancientMonsterAttacks : w.epicMonsterAttacks;
    const min = ancient ? w.ancientMin : w.epicMin;
    const max = ancient ? w.ancientMax : w.epicMax;
    const effectiveHit = avg * mult;
    const round = effectiveHit * attacks;
    const monsterRound = effectiveHit * (attacks + monsterAttacks);
    return {ancient, avg, mult, attacks, monsterAttacks, min, max, effectiveHit, round, monsterRound};
  };

  const inputA = document.getElementById('weaponA');
  const inputB = document.getElementById('weaponB');
  const rarityA = document.getElementById('rarityA');
  const rarityB = document.getElementById('rarityB');
  const body = document.getElementById('comparisonBody');
  const headA = document.getElementById('headA');
  const headB = document.getElementById('headB');
  const message = document.getElementById('compareMessage');
  const summary = document.getElementById('winnerSummary');

  function row(label, a, b, higher=true) {
    let ca='', cb='';
    const na=Number(a.raw), nb=Number(b.raw);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) {
      if ((na > nb) === higher) ca='best-cell'; else cb='best-cell';
    }
    return `<tr><th>${label}</th><td class="${ca}">${a.text}</td><td class="${cb}">${b.text}</td></tr>`;
  }

  function updateCompare() {
    const wa=findWeapon(inputA.value), wb=findWeapon(inputB.value);
    if (!wa || !wb) {
      body.innerHTML=''; summary.innerHTML='';
      message.textContent='Choisissez deux armes présentes dans la liste.';
      return;
    }
    message.textContent='';
    const va=version(wa,rarityA.value), vb=version(wb,rarityB.value);
    headA.textContent=`${wa.name} — ${va.ancient?'Ancienne':'Épique'}`;
    headB.textContent=`${wb.name} — ${vb.ancient?'Ancienne':'Épique'}`;
    body.innerHTML = [
      row('Catégorie',{text:wa.category},{text:wb.category}),
      row('Dégâts min / max',{text:`${fmt(va.min)} – ${fmt(va.max)}`,raw:va.avg},{text:`${fmt(vb.min)} – ${fmt(vb.max)}`,raw:vb.avg}),
      row('Moyenne affichée',{text:fmt(va.avg),raw:va.avg},{text:fmt(vb.avg),raw:vb.avg}),
      row('Multiplicateur',{text:`×${fmt(va.mult)}`,raw:va.mult},{text:`×${fmt(vb.mult)}`,raw:vb.mult}),
      row('Attaques / manche',{text:fmt(va.attacks),raw:va.attacks},{text:fmt(vb.attacks),raw:vb.attacks}),
      row('Attaques + monstres',{text:va.monsterAttacks?`+${va.monsterAttacks}`:'0',raw:va.monsterAttacks},{text:vb.monsterAttacks?`+${vb.monsterAttacks}`:'0',raw:vb.monsterAttacks}),
      row('Dégât effectif / coup',{text:fmt(va.effectiveHit),raw:va.effectiveHit},{text:fmt(vb.effectiveHit),raw:vb.effectiveHit}),
      row('Dégâts moyens / manche',{text:fmt(va.round),raw:va.round},{text:fmt(vb.round),raw:vb.round}),
      row('Dégâts moyens contre monstres',{text:fmt(va.monsterRound),raw:va.monsterRound},{text:fmt(vb.monsterRound),raw:vb.monsterRound})
    ].join('');
    const winners=[];
    const compareMetric=(label,key)=>{
      if (va[key]===vb[key]) winners.push(`${label} : égalité`);
      else winners.push(`${label} : <strong>${va[key]>vb[key]?wa.name:wb.name}</strong>`);
    };
    compareMetric('Dégâts par coup','effectiveHit'); compareMetric('Dégâts par manche','round'); compareMetric('Contre monstres','monsterRound');
    summary.innerHTML=winners.map(x=>`<span>🏆 ${x}</span>`).join('');
  }
  [inputA,inputB,rarityA,rarityB].forEach(el=>el && el.addEventListener('input',updateCompare));

  const evoInput=document.getElementById('evoWeapon');
  const evoCards=document.getElementById('evolutionCards');
  function updateEvolution(){
    const w=findWeapon(evoInput.value); if(!w){evoCards.innerHTML='<article class="card"><p>Choisissez une arme présente dans la liste.</p></article>';return;}
    evoCards.innerHTML=`
      <article class="card"><div class="card-meta">Gain par coup</div><h3>${fmtPlus(w.gainHit)}</h3><p>Ratio : <strong>${w.ratioHit.toFixed(2)}×</strong></p></article>
      <article class="card"><div class="card-meta">Gain par manche</div><h3>${fmtPlus(w.gainRound)}</h3><p>Ratio : <strong>${w.ratioRound.toFixed(2)}×</strong></p></article>
      <article class="card"><div class="card-meta">Contre monstres</div><h3>${fmtPlus(w.gainMonster)}</h3><p>Ratio : <strong>${w.ratioMonster.toFixed(2)}×</strong></p></article>`;
  }
  evoInput && evoInput.addEventListener('input',updateEvolution);

  const category=document.getElementById('categoryFilter');
  const sort=document.getElementById('sortFilter');
  const search=document.getElementById('tableSearch');
  const tableBody=document.getElementById('weaponsTableBody');
  function renderTable(){
    const q=(search.value||'').trim().toLocaleLowerCase('fr');
    let rows=data.filter(w=>(!category.value||w.category===category.value)&&(!q||w.name.toLocaleLowerCase('fr').includes(q)));
    const key=sort.value;
    if(key==='rank') rows.sort((a,b)=>a.rank-b.rank); else rows.sort((a,b)=>b[key]-a[key]||a.rank-b.rank);
    tableBody.innerHTML=rows.map(w=>`<tr><td>${w.rank}</td><th>${w.name}</th><td>${w.category}</td><td>${fmt(w.epicAvg)}</td><td>${fmt(w.ancientAvg)}</td><td>${w.epicAttacks}${w.epicMonsterAttacks?` (+${w.epicMonsterAttacks} monstre)`:''}</td><td>${w.ancientAttacks}${w.ancientMonsterAttacks?` (+${w.ancientMonsterAttacks} monstre)`:''}</td><td>${w.ratioRound.toFixed(2)}×</td><td>${fmtPlus(w.gainRound)}</td><td>${w.ratioMonster.toFixed(2)}×</td><td>${fmtPlus(w.gainMonster)}</td></tr>`).join('');
  }
  [category,sort,search].forEach(el=>el&&el.addEventListener('input',renderTable));
  updateCompare(); updateEvolution(); renderTable();
})();
