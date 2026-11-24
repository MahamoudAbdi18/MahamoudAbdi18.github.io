
const theme=document.getElementById('theme');
try{document.body.classList.toggle('dark',localStorage.getItem('theme')==='dark')}catch(e){}theme.onclick=()=>{const dark=document.body.classList.toggle('dark');
try{localStorage.setItem('theme',dark?'dark':'light')}catch(e){}};
const menu=document.getElementById('menu'),links=document.getElementById('links');
menu.onclick=()=>menu.setAttribute('aria-expanded',String(links.classList.toggle('open')));
links.querySelectorAll('a').forEach(a=>a.onclick=()=>{links.classList.remove('open');
menu.setAttribute('aria-expanded','false')});
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
document.querySelectorAll('[data-category]').forEach(c=>c.hidden=b.dataset.filter!=='all'&&!c.dataset.category.split(' ').includes(b.dataset.filter))});



async function loadProfile(){
 try {
 const response=await fetch('profile.json'); if(!response.ok) throw Error('Profile unavailable'); const p=await response.json();
 document.querySelectorAll('[data-profile]').forEach(e=>{e.textContent=p[e.dataset.profile]??e.textContent});
 document.title=p.name+' | '+p.title;
 document.querySelector('footer .wrap').textContent='© '+new Date().getFullYear()+' '+p.name+' · '+p.title;
 const make=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e};
 const skills=document.querySelector('#about .card');skills.querySelectorAll('.tag').forEach(e=>e.remove());p.skills.forEach(x=>skills.append(make('span',x,'tag')));
 const research=document.querySelector('#research .grid');research.replaceChildren();p.research.forEach((x,i)=>{const a=make('article','','card');a.append(make('div',String(i+1).padStart(2,'0'),'eyebrow'),make('h3',x.title),make('p',x.description));research.append(a)});
 const projects=document.querySelector('#project-grid');projects.replaceChildren();p.projects.forEach(x=>{const a=make('article','','card');a.dataset.category=x.category;a.append(make('span',x.tag,'tag'),make('h3',x.title),make('p',x.description));const detail=make('details','');detail.append(make('summary','Research focus'),make('p',x.details));a.append(detail);projects.append(a)});
 const safeLink=(url)=>{try{const u=new URL(url,location.href);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:null}catch{return null}};
 const pub=document.querySelector('#publications');if(p.publications.length){pub.querySelector('p')?.remove();p.publications.forEach(x=>{const a=make('article','','card');a.append(make('h3',x.title),make('p',x.description||''));const url=safeLink(x.url);if(x.url&&url){const l=make('a','Read publication');l.href=url;a.append(l)}pub.append(a)})}
 const contact=document.querySelector('#contact .card');contact.querySelector('p')?.remove();Object.entries(p.links).forEach(([label,url])=>{if(!url)return;const href=safeLink(label==='Email'&&!url.startsWith('mailto:')?'mailto:'+url:url);if(href){const l=make('a',label,'tag');l.href=href;contact.append(l)}});
 }catch(e){console.warn('Using default portfolio content:',e)}
}
loadProfile();
