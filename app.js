/* 互動功能：年代篩選、歌曲搜尋、專輯內頁與返回。原生 JavaScript，無須安裝套件。 */
'use strict';
const albums = window.ALBUMS || [];
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const external = 'target="_blank" rel="noopener noreferrer"';
const number = value => String(value).padStart(2,'0');
const youtubeSearch = title => 'https://www.youtube.com/results?search_query=' + encodeURIComponent('周杰倫 '+title+' 官方 MV');
const spotifySearch = title => 'https://open.spotify.com/search/' + encodeURIComponent('周杰倫 '+title);
const albumURL = a => '#album/'+a.id;
let era = 'all';
let previousAlbum = null;
const normalize = text => String(text).toLocaleLowerCase().replace(/\s+/g,'');
const featuredSongs = ['星晴','簡單愛','半島鐵盒','晴天','七里香','夜曲','千里之外','青花瓷','稻香','煙花易冷','Mine Mine','紅塵客棧','聽見下雨的聲音','告白氣球','最偉大的作品','太陽之子'];

function renderGrid() {
  const query = normalize($('#search').value);
  const filtered = albums.filter(a => (era === 'all' || Math.floor(a.year / 10) * 10 === Number(era)) && (!query || normalize(a.title+' '+a.english+' '+a.year).includes(query) || a.tracks.some(t => normalize(t.title).includes(query))));
  if ($('#sort').value === 'desc') filtered.reverse();
  $('#album-grid').innerHTML = filtered.map(a => {
    const matching = query ? a.tracks.filter(t => normalize(t.title).includes(query)).map(t=>t.title) : [];
    return `<a class="album-card" href="${albumURL(a)}" aria-label="開啟 ${escapeHTML(a.title)}，${a.year}，${a.tracks.length} 首歌曲"><div class="cover-wrap"><img src="${escapeHTML(a.localCover || a.cover)}" alt="${escapeHTML(a.title)}專輯封面" loading="lazy" width="500" height="500"><span class="cover-shade"></span><span class="cover-number">${number(a.number)}</span><span class="cover-arrow" aria-hidden="true">↗</span></div><div class="album-topline"><h3>${escapeHTML(a.title)}</h3><span class="album-year">${a.year}</span></div><div class="album-subline"><span class="album-tags">${a.tags.map(escapeHTML).join(' · ')}</span><span>${a.tracks.length} 首歌曲</span></div>${matching.length?`<p class="search-match">找到：${escapeHTML(matching.join('、'))}</p>`:''}</a>`;
  }).join('');
  $('#empty-state').hidden = filtered.length !== 0;
  $('#result-count').textContent = query ? `「${$('#search').value}」· 找到 ${filtered.length} 張專輯` : era === 'all' ? `全部 ${filtered.length} 張專輯` : `${era} 年代 · ${filtered.length} 張專輯`;
}

function renderHome() {
  const feature = albums.find(a => a.id === 'orange') || albums[0];
  if (feature) $('#hero-art').innerHTML = `<span class="scribble-star" aria-hidden="true">✳</span><div class="hero-vinyl" aria-hidden="true"></div><a href="${albumURL(feature)}" aria-label="開啟七里香專輯介紹"><img class="hero-cover" src="${escapeHTML(feature.localCover || feature.cover)}" alt="七里香專輯封面" width="330" height="330" fetchpriority="high"></a><div class="hero-sticker"><b>16</b>ALBUMS</div><a class="polaroid-caption" href="${albumURL(feature)}">本日重聽：七里香<span>2004 · 那年夏天的聲音 ↗</span></a>`;
  $('#timeline-body').innerHTML = albums.map((a,i) => `<tr><td>${number(a.number)}</td><td>${a.year}</td><td><a href="${albumURL(a)}">${escapeHTML(a.title)}</a></td><td>${a.tracks.length} 首</td><td>${escapeHTML(featuredSongs[i])}</td><td><a href="${albumURL(a)}" aria-label="閱讀${escapeHTML(a.title)}專輯介紹">閱讀 <span aria-hidden="true">↗</span></a></td></tr>`).join('');
  renderGrid();
}

function renderAlbum(a) {
  const i = albums.indexOf(a);
  $('#detail-view').innerHTML = `<article class="detail-container container"><div class="breadcrumb"><a href="#albums">← 返回專輯收藏</a><span>/</span><span>${escapeHTML(a.title)}</span></div><section class="album-hero" aria-labelledby="album-title"><img class="detail-cover" src="${escapeHTML(a.localCover || a.cover)}" alt="${escapeHTML(a.title)}專輯封面" width="500"><div class="album-info"><p class="eyebrow">ALBUM ${number(a.number)} / ${a.year} · ${a.tracks.length} TRACKS</p><h1 id="album-title" tabindex="-1">${escapeHTML(a.title)}</h1><p class="album-english">${escapeHTML(a.english)}</p><div class="tag-row">${a.tags.map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div><p class="album-background">${escapeHTML(a.background)}</p><div class="listen-buttons"><a class="button button-primary" href="${escapeHTML(a.spotify || spotifySearch(a.title))}" ${external}>♫ ${a.spotify?.includes('/album/')?'Spotify 聆聽專輯':'Spotify 搜尋專輯'} ↗</a><a class="button button-outline" href="${escapeHTML(a.youtube || youtubeSearch(a.title))}" ${external}>▷ ${a.youtube?'YouTube 專輯歌單':'YouTube 搜尋專輯'} ↗</a></div><a class="source-link" href="${escapeHTML(a.source)}" ${external}>專輯背景與曲序來源：杰威爾音樂 ↗</a></div></section><section class="track-section" aria-labelledby="tracks-title"><div class="track-heading"><div><p class="eyebrow">THE TRACKLIST</p><h2 id="tracks-title">把每一首，慢慢聽完。</h2></div><p>點開歌曲，閱讀介紹與背景。</p></div><div class="track-list">${a.tracks.map((t,j)=>`<details class="track-row" id="track-${j+1}"><summary><span class="track-no">${number(j+1)}</span><span class="track-title">${escapeHTML(t.title)}</span><span class="track-hint">歌曲介紹</span><span class="track-plus" aria-hidden="true">+</span></summary><div class="track-body"><p><strong>導聆筆記</strong>${escapeHTML(t.note)}</p>${t.background?`<p class="track-background"><strong>創作背景</strong>${escapeHTML(t.background)} <a class="source-link" href="${escapeHTML(t.source || a.source)}" ${external}>資料來源 ↗</a></p>`:`<p><strong>收錄背景</strong>收錄於 ${a.year} 年《${escapeHTML(a.title)}》，為專輯第 ${j+1} 首。可搭配上方專輯故事，理解這首歌在整張作品中的位置。</p>`}<div class="listen-buttons"><a class="button button-primary" href="${escapeHTML(youtubeSearch(t.title))}" ${external} aria-label="在YouTube搜尋${escapeHTML(t.title)}">▷ YouTube 搜尋 ↗</a><a class="button button-outline" href="${escapeHTML(spotifySearch(t.title))}" ${external} aria-label="在Spotify搜尋${escapeHTML(t.title)}">♫ Spotify 搜尋 ↗</a></div><p class="platform-note">連結將在新分頁開啟平台搜尋，選擇周杰倫的官方歌曲或 MV 即可聆聽。</p></div></details>`).join('')}</div><p class="detail-credits">導聆筆記為本站整理的欣賞角度；有可靠來源的創作背景另行標示。未查證的創作故事不予補寫。專輯封面與音樂權利屬原權利人所有。</p></section><nav class="album-pagination" aria-label="前後專輯">${i>0?`<a href="${albumURL(albums[i-1])}"><span>← PREVIOUS ALBUM</span>${escapeHTML(albums[i-1].title)}</a>`:'<div></div>'}${i<albums.length-1?`<a href="${albumURL(albums[i+1])}"><span>NEXT ALBUM →</span>${escapeHTML(albums[i+1].title)}</a>`:'<div></div>'}</nav></article>`;
  // 若從歌曲搜尋進入，自動展開符合的曲目。
  const query = normalize($('#search').value);
  if (query) a.tracks.forEach((t,j) => { if(normalize(t.title).includes(query)) $('#track-'+(j+1)).open = true; });
  document.title = a.title + '｜杰作收藏室';
}

function route() {
  let hash;
  try { hash=decodeURIComponent(location.hash.slice(1)); } catch { hash=''; }
  const isAlbum = hash.startsWith('album/');
  $('#home-view').hidden = isAlbum;
  $('#detail-view').hidden = !isAlbum;
  if (isAlbum) {
    const a = albums.find(a=>a.id===hash.slice(6));
    if (a) { renderAlbum(a); previousAlbum = a.id; }
    else { $('#detail-view').innerHTML='<div class="container error-detail"><h1>這張唱片還不在收藏裡</h1><a class="button button-primary" href="#albums">返回專輯收藏</a></div>'; document.title='找不到專輯｜杰作收藏室'; }
    window.scrollTo({top:0,behavior:'instant'});
  } else {
    $('#detail-view').innerHTML=''; // 移除內頁，避免隱藏內容殘留。
    document.title='杰作收藏室｜周杰倫專輯導覽';
    const target=document.getElementById(hash || 'home');
    requestAnimationFrame(()=>{
      if(target) target.scrollIntoView({behavior:'instant',block:'start'});
      if(hash==='albums' && previousAlbum){const card=document.querySelector(`.album-card[href="#album/${previousAlbum}"]`);if(card)card.focus({preventScroll:true});}
    });
  }
}

document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
  era=button.dataset.era;
  document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  renderGrid();
}));
$('#search').addEventListener('input',renderGrid);
$('#sort').addEventListener('change',renderGrid);
$('#clear-filters').addEventListener('click',()=>{$('#search').value='';document.querySelector('[data-era="all"]').click();$('#search').focus();});
document.addEventListener('keydown',event=>{
  if(event.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable){event.preventDefault();if($('#home-view').hidden)location.hash='albums';$('#search').focus();}
});
window.addEventListener('hashchange',route);
renderHome();
route();
