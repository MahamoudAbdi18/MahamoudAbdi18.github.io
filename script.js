// Website behavior and profile rendering. Edit profile.json for personal content.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const make = (tag, text = '', cls = '') => {
  const e = document.createElement(tag);
  e.textContent = text ?? '';
  if (cls) e.className = cls;
  return e;
};
const theme = $('#theme');
try { document.body.classList.toggle('dark', localStorage.getItem('theme') === 'dark'); } catch {}
if (theme) theme.onclick = () => {
  const dark = document.body.classList.toggle('dark');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
};
const menu = $('#menu'), links = $('#links');
if (menu && links) {
  menu.onclick = () => menu.setAttribute('aria-expanded', String(links.classList.toggle('open')));
  links.addEventListener('click', e => {
    if (e.target.closest('a')) {
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    }
  });
  links.style.flexWrap = 'wrap';
  links.style.gap = '12px';
}
function applyFilter() {
  const filter = $('.filter[aria-pressed="true"]')?.dataset.filter || 'all';
  $$('[data-category]').forEach(c => c.hidden = filter !== 'all' && !c.dataset.category.split(' ').includes(filter));
}
$$('.filter').forEach(b => b.onclick = () => {
  $$('.filter').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  applyFilter();
});
function safeLink(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value.startsWith('www.') ? 'https://' + value : value, location.href);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function addLink(parent, label, value, cls = '') {
  const href = safeLink(value);
  if (!href) return;
  const a = make('a', label, cls); a.href = href; parent.append(a);
}
function section(id, label, heading, before) {
  let s = document.getElementById(id);
  if (!s) {
    s = make('section'); s.id = id;
    s.append(make('div', label, 'eyebrow'), make('h2', heading));
    const anchor = document.getElementById(before);
    if (anchor) anchor.before(s); else $('main')?.append(s);
  }
  if (links && !links.querySelector(`a[href="#${id}"]`)) {
    const a = make('a', heading); a.href = '#' + id;
    const contact = links.querySelector('a[href="#contact"]');
    if (contact) contact.before(a); else links.append(a);
  }
  let grid = s.querySelector('.generated-grid');
  if (!grid) { grid = make('div', '', 'grid two generated-grid'); s.append(grid); }
  grid.replaceChildren(); return grid;
}
function paragraph(parent, value) { if (value) parent.append(make('p', value)); }
async function loadProfile() {
  try {
    const response = await fetch('./profile.json', {cache: 'no-store'});
    if (!response.ok) throw Error('profile.json: HTTP ' + response.status);
    const p = await response.json();
    $$('[data-profile]').forEach(e => { if (typeof p[e.dataset.profile] === 'string') e.textContent = p[e.dataset.profile]; });
    document.title = p.name + ' | ' + p.title;
    const footer = $('footer .wrap');
    if (footer) footer.textContent = '© ' + new Date().getFullYear() + ' ' + p.name + ' · ' + p.title;
    const skills = $('#about .card');
    if (skills && Array.isArray(p.skills)) { skills.querySelectorAll('.tag').forEach(e => e.remove()); p.skills.forEach(x => skills.append(make('span', x, 'tag'))); }
    const research = $('#research .grid');
    if (research && Array.isArray(p.research)) {
      research.replaceChildren(); p.research.forEach((x,i) => {
        const a = make('article', '', 'card'); a.append(make('div', String(i+1).padStart(2,'0'), 'eyebrow'), make('h3', x.title)); paragraph(a,x.description); research.append(a);
      });
    }
    const projects = $('#project-grid');
    if (projects && Array.isArray(p.projects)) {
      projects.replaceChildren(); p.projects.forEach(x => {
        const a = make('article','','card'); a.dataset.category = x.category || '';
        a.append(make('span',x.tag,'tag'),make('h3',x.title)); paragraph(a,x.description);
        if (x.details) { const d = make('details'); d.append(make('summary','Research focus'),make('p',x.details)); a.append(d); }
        projects.append(a);
      }); applyFilter();
    }
    if (p.experience?.length) {
      const grid = section('experience','Professional background','Experience','research');
      p.experience.forEach(x => {
        const a = make('article','','card'); a.append(make('h3',x.title),make('div',x.company,'eyebrow'));
        paragraph(a,[x.period,x.duration,x.location].filter(Boolean).join(' · ')); paragraph(a,x.description); grid.append(a);
      });
    }
    const pub = $('#publications');
    if (pub && p.publications?.length) {
      pub.querySelector('p')?.remove();
      const grid = make('div','','grid two');
      p.publications.forEach(x => {
        const a = make('article','','card');
        if (x.type) a.append(make('span',x.type,'tag'));
        a.append(make('h3',x.title)); paragraph(a,[x.venue,x.year].filter(Boolean).join(' · ')); paragraph(a,x.authors); paragraph(a,x.description);
        if (x.doi) paragraph(a,'DOI: '+x.doi);
        addLink(a,'Read publication ↗',x.url || (x.doi ? 'https://doi.org/'+x.doi : '')); grid.append(a);
      }); pub.append(grid);
    }
    if (p.certifications?.length) {
      const grid = section('certifications','Professional development','Certifications','contact');
      p.certifications.forEach(x => {
        const a = make('article','','card'); a.append(make('h3',x.title),make('div',x.issuer,'eyebrow'));
        paragraph(a,x.date ? 'Issued '+x.date : ''); paragraph(a,x.credential_id ? 'Credential ID: '+x.credential_id : ''); addLink(a,'View credential ↗',x.url); grid.append(a);
      });
    }
    const contact = $('#contact .card');
    if (contact && p.links) {
      contact.querySelector('p')?.remove();
      Object.entries(p.links).forEach(([label,url]) => {
        if (!url) return;
        addLink(contact,label,label.toLowerCase() === 'email' && !url.startsWith('mailto:') ? 'mailto:'+url : url,'tag');
      });
    }
  } catch (error) {
    console.error('Portfolio profile failed to load:',error);
    const notice = make('p','Profile could not be fully loaded. Check profile.json and the browser console.','card');
    $('main')?.prepend(notice);
  }
}
loadProfile();
