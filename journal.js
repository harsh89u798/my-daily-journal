/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
const entries=JSON.parse(localStorage.getItem('djEntries')||'[]');
const user=JSON.parse(localStorage.getItem('djUser')||'null');
if(!user) location='index.html';

/* ---------- state ---------- */
let currentEditIndex=null;

/* ---------- init ---------- */
window.onload=()=>{
  // wallpaper list
  for(let i=1;i<=20;i++){
    const img=document.createElement('img');
    img.src=`wallpapers/w${i}.jpg`;
    img.onclick=()=>setWallpaper(img.src);
    $('wallList').append(img);
  }
  // load wallpaper & theme
  const savedWall=localStorage.getItem('djWall')||'wallpapers/w1.jpg';
  setWallpaper(savedWall,false);
  const dark=localStorage.getItem('djTheme')==='dark';
  applyTheme(dark);
  $('themeToggle').checked=dark;

  // user info
  $('uName').textContent=user.username;
  $('uEmail').textContent=user.email;
  $('uPhone').textContent=user.phone;

  // listeners
  $('themeToggle').onchange=e=>applyTheme(e.target.checked);
  $('entry').addEventListener('input',updateCount);
  document.querySelectorAll('.tags button').forEach(b=>{
    b.onclick=()=>$('entry').value+=` #${b.dataset.tag}`;
  });

  // panels
  linkPanel('bookBtn','bookPanel');
  linkPanel('settingsBtn','settingsPanel');
  linkPanel('userBtn','userPanel');

  renderEntries();
  updateStats();
};

/* ---------- panels ---------- */
function linkPanel(btnId,panelId){
  $(btnId).onclick=()=>{
    document.querySelectorAll('.sidepanel').forEach(p=>p.classList.remove('open'));
    $(panelId).classList.toggle('open');
  };
}

/* ---------- theme & wall ---------- */
function applyTheme(dark){
  document.body.classList.toggle('dark',dark);
  localStorage.setItem('djTheme',dark?'dark':'light');
}
function setWallpaper(src,save=true){
  $('wallpaper').style.backgroundImage=`url('${src}')`;
  if(save) localStorage.setItem('djWall',src);
}

/* ---------- word counter ---------- */
function updateCount(){
  const txt=$('entry').value;
  const words=(txt.match(/\b\w+\b/g)||[]).length;
  $('liveCount').textContent=`${words} words • ${txt.length} chars`;
}

/* ---------- save / render ---------- */
function saveEntry(){
  const text=$('entry').value.trim();
  if(!text)return alert('Write something!');
  const date=new Date().toISOString().slice(0,10);
  const entry={date,text,tags:extractTags(text)};
  if(currentEditIndex!==null){
    entries[currentEditIndex]=entry;
    currentEditIndex=null;
  }else{
    entries.unshift(entry);
  }
  localStorage.setItem('djEntries',JSON.stringify(entries));
  $('entry').value='';
  updateCount();
  renderEntries();
  updateStats();
}
function extractTags(t){return[...new Set(t.match(/#\w+/g)||[])]}
function renderEntries(){
  // preview (latest 3)
  $('previewList').innerHTML=entries.slice(0,3).map(renderLi).join('');
  // full list
  $('entriesList').innerHTML=entries.map(renderLiFull).join('');
}
const renderLi=e=>`<li><strong>${e.date}</strong> – ${e.text.slice(0,40)}…</li>`;
const renderLiFull=(e,i)=>`
<li>
  <strong>${e.date}</strong><br>${e.text.replace(/\n/g,'<br>')}
  <div class="mini-btns">
    <button onclick="startEdit(${i})">✏️</button>
    <button onclick="delEntry(${i})">🗑️</button>
  </div>
</li>`;
function startEdit(i){
  currentEditIndex=i;
  $('entry').value=entries[i].text;
  $('entry').scrollIntoView();
  updateCount();
}
function delEntry(i){
  if(confirm('Delete this entry?')){
    entries.splice(i,1);
    localStorage.setItem('djEntries',JSON.stringify(entries));
    renderEntries();updateStats();
  }
}

/* ---------- search / filter ---------- */
$('searchBox').oninput=$('dateFilter').onchange=filterRender;
function filterRender(){
  const q=$('searchBox').value.toLowerCase();
  const d=$('dateFilter').value;
  $('entriesList').innerHTML=entries.filter(e=>{
    const okQ=!q||e.text.toLowerCase().includes(q)||e.tags.some(t=>t.toLowerCase().includes(q));
    const okD=!d||e.date===d;
    return okQ&&okD;
  }).map(renderLiFull).join('');
}

/* ---------- export ---------- */
function exportTXT(){
  const blob=new Blob([entries.map(e=>`${e.date}\n${e.text}\n\n`).join('')],{type:'text/plain'});
  download(blob,'journal.txt');
}
function exportPDF(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();
  let y=10;
  entries.forEach(e=>{
    doc.text(`${e.date}`,10,y);y+=6;
    e.text.split('\n').forEach(l=>{doc.text(l,10,y);y+=6;if(y>280){doc.addPage();y=10;}});
    y+=6;
  });
  doc.save('journal.pdf');
}
function download(blob,filename){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
}

/* ---------- stats ---------- */
function updateStats(){
  // streak: consecutive days with at least 1 entry
  const days=[...new Set(entries.map(e=>e.date))];
  let streak=0,cur=new Date().toISOString().slice(0,10);
  while(days.includes(cur)){streak++;cur=new Date(Date.parse(cur)-86400000).toISOString().slice(0,10);}
  $('streakCount').textContent=`${streak} 🔥 day${streak!==1?'s':''}`;

  // insights
  const counts=entries.reduce((m,e)=>(m[e.date]=(m[e.date]||0)+1,m),{});
  const mostActive=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  const avgWords=Math.round(entries.reduce((sum,e)=>sum+e.text.split(/\s+/).length,0)/ (entries.length||1));
  $('insights').innerHTML=`Most active: <b>${mostActive?mostActive[0]:'—'}</b><br>
                           Avg words: <b>${avgWords}</b>`;
}

/* ---------- logout ---------- */
function logout(){localStorage.clear();location='index.html';}

