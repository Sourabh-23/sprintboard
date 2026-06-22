const state = {
  token: localStorage.getItem('sprintboard_token'),
  user: JSON.parse(localStorage.getItem('sprintboard_user') || 'null'),
  authMode: 'login',
  view: 'projects',
  projects: [],
  selectedProjectId: localStorage.getItem('sprintboard_project_id'),
  issues: [],
  sprints: [],
  users: [],
  selectedSprintId: null,
  board: null,
};

const app = document.querySelector('#app');

const api = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const esc = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const formData = (form) => Object.fromEntries(new FormData(form).entries());
const selectedProject = () => state.projects.find((p) => String(p.id) === String(state.selectedProjectId));

const setSession = (data) => {
  state.token = data.accessToken;
  state.user = data.user;
  localStorage.setItem('sprintboard_token', state.token);
  localStorage.setItem('sprintboard_user', JSON.stringify(state.user));
};

const logout = () => {
  localStorage.removeItem('sprintboard_token');
  localStorage.removeItem('sprintboard_user');
  localStorage.removeItem('sprintboard_project_id');
  location.reload();
};

const loadData = async () => {
  const [projects, users] = await Promise.all([api('/api/projects'), api('/api/users')]);
  state.projects = projects.projects;
  state.users = users.users;
  if (!state.selectedProjectId && state.projects.length) state.selectedProjectId = String(state.projects[0].id);
  if (!state.selectedProjectId) return;
  localStorage.setItem('sprintboard_project_id', state.selectedProjectId);
  const [issues, sprints] = await Promise.all([
    api(`/api/issues?project_id=${state.selectedProjectId}`),
    api(`/api/sprints?project_id=${state.selectedProjectId}`),
  ]);
  state.issues = issues.issues;
  state.sprints = sprints.sprints;
  if (!state.selectedSprintId && state.sprints.length) {
    const active = state.sprints.find((s) => s.status === 'active');
    state.selectedSprintId = String((active || state.sprints[0]).id);
  }
  if (state.selectedSprintId) state.board = (await api(`/api/sprints/${state.selectedSprintId}/board`)).board;
};

const renderAuth = () => {
  app.innerHTML = `
    <section class="auth">
      <aside class="auth-side">
        <h1>SprintBoard</h1>
        <p>Manage projects, issues, sprints, kanban board, comments, and team members.</p>
      </aside>
      <div class="auth-card">
        <div class="tabs">
          <button class="${state.authMode === 'login' ? 'active' : ''}" data-auth="login">Login</button>
          <button class="${state.authMode === 'register' ? 'active' : ''}" data-auth="register">Register</button>
        </div>
        <form class="form" id="authForm">
          ${state.authMode === 'register' ? input('Name', 'name', 'text', true) : ''}
          ${input('Email', 'email', 'email', true)}
          ${input('Password', 'password', 'password', true)}
          ${state.authMode === 'register' ? input('Organization name', 'organizationName', 'text', true) : ''}
          <button class="btn">${state.authMode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
      </div>
    </section>
  `;
};

const input = (label, name, type = 'text', required = false) => `
  <div class="field"><label>${label}</label><input name="${name}" type="${type}" ${required ? 'required' : ''}></div>
`;

const select = (label, name, options, value = '') => `
  <div class="field"><label>${label}</label><select name="${name}" id="${name}">
    ${options.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
  </select></div>
`;

const renderShell = () => {
  const p = selectedProject();
  app.innerHTML = `
    <section class="shell">
      <aside class="sidebar">
        <div class="brand">SprintBoard</div>
        <nav class="nav">${['projects', 'issues', 'sprints', 'board', 'team'].map((v) => `<button class="${state.view === v ? 'active' : ''}" data-view="${v}">${v}</button>`).join('')}</nav>
        <div class="sidebar-footer"><span>${esc(state.user?.name)}</span><span>${esc(state.user?.role)}</span><button class="btn secondary small" id="logout">Logout</button></div>
      </aside>
      <section>
        <header class="topbar">
          <div><h2>${state.view}</h2><div class="meta">${p ? `${esc(p.name)} (${esc(p.key)})` : 'Create a project first'}</div></div>
          <div class="actions">
            <select id="projectSelect">${state.projects.map((x) => `<option value="${x.id}" ${String(x.id) === String(state.selectedProjectId) ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
            <button class="btn secondary" id="refresh">Refresh</button>
          </div>
        </header>
        <div class="content">${renderView()}</div>
      </section>
    </section>
  `;
};

const renderView = () => {
  if (state.view !== 'projects' && !selectedProject()) return '<div class="empty">Create a project first.</div>';
  if (state.view === 'projects') return renderProjects();
  if (state.view === 'issues') return renderIssues();
  if (state.view === 'sprints') return renderSprints();
  if (state.view === 'board') return renderBoard();
  return renderTeam();
};

const renderProjects = () => `
  <div class="grid two">
    <section class="panel"><h3>Create project</h3><form class="form" id="projectForm">${input('Name','name','text',true)}${input('Key','key','text',true)}<div class="field"><label>Description</label><textarea name="description"></textarea></div><button class="btn">Create</button></form></section>
    <section class="stack">${state.projects.map((p) => `<article class="item ${String(p.id) === String(state.selectedProjectId) ? 'active' : ''}"><div class="item-title">${esc(p.name)}</div><div class="meta">${esc(p.key)} ${esc(p.description || '')}</div><button class="btn secondary small" data-project="${p.id}">Open</button></article>`).join('') || '<div class="empty">No projects.</div>'}</section>
  </div>
`;

const userOptions = () => [{ value: '', label: 'Unassigned' }].concat(state.users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })));
const renderIssues = () => `
  <div class="grid two">
    <section class="panel"><h3>Create issue</h3><form class="form" id="issueForm">${input('Title','title','text',true)}<div class="field"><label>Description</label><textarea name="description"></textarea></div>${select('Type','type',['task','story','bug'].map((v)=>({value:v,label:v})))}${select('Priority','priority',['low','medium','high','urgent'].map((v)=>({value:v,label:v})),'medium')}${select('Assignee','assignee_id',userOptions())}<button class="btn">Create</button></form></section>
    <section class="stack">${state.issues.map(issueItem).join('') || '<div class="empty">No issues.</div>'}</section>
  </div>
`;
const issueItem = (i) => `<article class="item"><span class="badge">${esc(i.issue_key || i.id)}</span><div class="item-title">${esc(i.title)}</div><div class="meta">${esc(i.type)} - ${esc(i.priority)} - ${esc(i.assignee?.name || 'Unassigned')}</div><select data-status="${i.id}">${['todo','in_progress','done'].map((s)=>`<option value="${s}" ${i.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="btn secondary small" data-comments="${i.id}">Comments</button></article>`;

const renderSprints = () => `
  <div class="grid two">
    <section class="panel"><h3>Create sprint</h3><form class="form" id="sprintForm">${input('Name','name','text',true)}<div class="field"><label>Goal</label><textarea name="goal"></textarea></div>${input('Start date','start_date','date')}${input('End date','end_date','date')}<button class="btn">Create</button></form></section>
    <section class="stack">${state.sprints.map((s)=>`<article class="item"><div class="item-title">${esc(s.name)}</div><div class="meta">${esc(s.goal || '')}</div><span class="badge">${esc(s.status)}</span><div class="actions"><button class="btn secondary small" data-sprint="${s.id}">Board</button><button class="btn small" data-start="${s.id}">Start</button><button class="btn small" data-complete="${s.id}">Complete</button></div></article>`).join('') || '<div class="empty">No sprints.</div>'}</section>
  </div>
`;

const renderBoard = () => `
  <section class="grid">
    <div class="panel actions">${select('Sprint','sprintPicker',state.sprints.map((s)=>({value:s.id,label:`${s.name} (${s.status})`})),state.selectedSprintId || '')}${select('Issue','issuePicker',state.issues.map((i)=>({value:i.id,label:`${i.issue_key}: ${i.title}`})))}<button class="btn" id="addIssue">Add issue</button></div>
    ${state.board ? `<div class="board">${['todo','in_progress','done'].map((status)=>`<section class="column"><h3>${status}</h3><div class="stack">${(state.board[status] || []).map(issueItem).join('') || '<div class="empty">Empty</div>'}</div></section>`).join('')}</div>` : '<div class="empty">Select a sprint.</div>'}
  </section>
`;

const renderTeam = () => `
  <div class="grid two">
    <section class="panel"><h3>Add member</h3><form class="form" id="memberForm">${input('Name','name','text',true)}${input('Email','email','email',true)}${input('Password','password','password',true)}${select('Role','role',['member','admin','viewer'].map((v)=>({value:v,label:v})))}<button class="btn">Add member</button></form></section>
    <section class="stack">${state.users.map((u)=>`<article class="item"><div class="item-title">${esc(u.name)}</div><div class="meta">${esc(u.email)}</div><span class="badge">${esc(u.role)}</span></article>`).join('')}</section>
  </div>
`;

const refresh = async () => { await loadData(); renderShell(); };
const render = async () => { if (!state.token) return renderAuth(); await refresh(); };

document.addEventListener('click', async (e) => {
  const t = e.target;
  try {
    if (t.dataset.auth) { state.authMode = t.dataset.auth; renderAuth(); }
    if (t.dataset.view) { state.view = t.dataset.view; renderShell(); }
    if (t.id === 'logout') logout();
    if (t.id === 'refresh') await refresh();
    if (t.dataset.project) { state.selectedProjectId = t.dataset.project; state.selectedSprintId = null; await refresh(); }
    if (t.dataset.sprint) { state.selectedSprintId = t.dataset.sprint; state.view = 'board'; await refresh(); }
    if (t.dataset.start) { await api(`/api/sprints/${t.dataset.start}/start`, { method: 'PATCH', body: '{}' }); await refresh(); }
    if (t.dataset.complete) { await api(`/api/sprints/${t.dataset.complete}/complete`, { method: 'PATCH', body: '{}' }); await refresh(); }
    if (t.id === 'addIssue') { await api(`/api/sprints/${state.selectedSprintId}/issues`, { method: 'POST', body: JSON.stringify({ issue_id: document.querySelector('#issuePicker').value }) }); await refresh(); }
    if (t.dataset.comments) await openComments(t.dataset.comments);
  } catch (err) { alert(err.message); }
});

document.addEventListener('change', async (e) => {
  const t = e.target;
  try {
    if (t.id === 'projectSelect') { state.selectedProjectId = t.value; state.selectedSprintId = null; await refresh(); }
    if (t.id === 'sprintPicker') { state.selectedSprintId = t.value; await refresh(); }
    if (t.dataset.status) { await api(`/api/issues/${t.dataset.status}`, { method: 'PATCH', body: JSON.stringify({ status: t.value }) }); await refresh(); }
  } catch (err) { alert(err.message); }
});

document.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = formData(form);
  try {
    if (form.id === 'authForm') {
      const result = await api(state.authMode === 'login' ? '/api/auth/login' : '/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
      if (state.authMode === 'register') { alert('Account created. Login now.'); state.authMode = 'login'; return renderAuth(); }
      setSession(result); return render();
    }
    if (form.id === 'projectForm') await api('/api/projects', { method: 'POST', body: JSON.stringify(data) });
    if (form.id === 'issueForm') await api('/api/issues', { method: 'POST', body: JSON.stringify({ ...data, project_id: state.selectedProjectId, assignee_id: data.assignee_id || null }) });
    if (form.id === 'sprintForm') await api('/api/sprints', { method: 'POST', body: JSON.stringify({ ...data, project_id: state.selectedProjectId }) });
    if (form.id === 'memberForm') await api('/api/users', { method: 'POST', body: JSON.stringify(data) });
    if (form.id === 'commentForm') { await api('/api/comments', { method: 'POST', body: JSON.stringify(data) }); document.querySelector('.modal')?.remove(); await openComments(data.issue_id); return; }
    form.reset(); await refresh();
  } catch (err) { alert(err.message); }
});

const openComments = async (issueId) => {
  const data = await api(`/api/comments?issue_id=${issueId}`);
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box"><div class="row" style="justify-content:space-between"><h3>Comments</h3><button class="btn secondary small" data-close>Close</button></div><div class="stack">${data.comments.map((c)=>`<article class="item"><div class="meta">${esc(c.author?.name || 'Member')}</div><div>${esc(c.content)}</div></article>`).join('') || '<div class="empty">No comments.</div>'}</div><form class="form" id="commentForm"><input type="hidden" name="issue_id" value="${issueId}"><div class="field"><label>Comment</label><textarea name="content" required></textarea></div><button class="btn">Add comment</button></form></div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target.dataset.close !== undefined || e.target === modal) modal.remove(); });
};

render();
