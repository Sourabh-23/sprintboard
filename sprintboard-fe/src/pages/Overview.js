import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleDot, ClipboardList, FolderKanban, Plus, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { Avatar, Badge, EmptyState, Loading } from '../components/UI';

export default function Overview() {
  const { user, projects, selectedProject, selectedProjectId } = useApp();
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!selectedProjectId) { setLoading(false); setIssues([]); return; }
    setLoading(true);
    Promise.all([api.get(`/issues?project_id=${selectedProjectId}`), api.get(`/sprints?project_id=${selectedProjectId}`)])
      .then(([issueRes, sprintRes]) => { setIssues(issueRes.data.issues); setSprints(sprintRes.data.sprints); })
      .finally(() => setLoading(false));
  }, [selectedProjectId]);
  const stats = useMemo(() => ({ todo: issues.filter((i) => i.status === 'todo').length, progress: issues.filter((i) => i.status === 'in_progress').length, done: issues.filter((i) => i.status === 'done').length }), [issues]);
  const activeSprint = sprints.find((s) => s.status === 'active');

  return <div className="page-content">
    <header className="page-header"><div><span className="eyebrow">Good to see you, {user?.name?.split(' ')[0]}</span><h1>Workspace overview</h1><p>{selectedProject ? `${selectedProject.name} · ${selectedProject.description || 'Project activity and delivery snapshot'}` : 'Create your first project to get started.'}</p></div><Link to="/backlog" className="button button-primary"><Plus size={17} />Create issue</Link></header>
    {!projects.length ? <EmptyState icon={FolderKanban} title="Your workspace is ready" text="Create a project to start planning issues and sprints." action={<Link to="/projects" className="button button-primary">Create project</Link>} /> : loading ? <Loading /> : <>
      <section className="metric-grid">
        <article className="metric"><span className="metric-icon icon-ink"><ClipboardList size={20} /></span><div><p>Total issues</p><strong>{issues.length}</strong><span>in {selectedProject?.key}</span></div></article>
        <article className="metric"><span className="metric-icon icon-blue"><CircleDot size={20} /></span><div><p>In progress</p><strong>{stats.progress}</strong><span>being worked on</span></div></article>
        <article className="metric"><span className="metric-icon icon-green"><CheckCircle2 size={20} /></span><div><p>Completed</p><strong>{stats.done}</strong><span>{issues.length ? Math.round((stats.done / issues.length) * 100) : 0}% completion</span></div></article>
        <article className="metric"><span className="metric-icon icon-amber"><Timer size={20} /></span><div><p>Active sprint</p><strong className="metric-text">{activeSprint?.name || 'None'}</strong><span>{activeSprint ? 'currently running' : 'start a planned sprint'}</span></div></article>
      </section>
      <section className="overview-grid"><article className="panel"><div className="panel-header"><div><h2>Recent issues</h2><p>Latest work in this project</p></div><Link to="/backlog" className="text-link">View backlog <ArrowRight size={15} /></Link></div>
        <div className="issue-list">{issues.slice(-6).reverse().map((issue) => <div className="issue-row" key={issue.id}><span className={`issue-type issue-type-${issue.type}`}>{issue.type[0].toUpperCase()}</span><div className="issue-main"><strong>{issue.title}</strong><span>{issue.issue_key}</span></div><Badge tone={issue.priority}>{issue.priority}</Badge>{issue.assignee ? <Avatar name={issue.assignee.name} size="sm" /> : <span className="unassigned">–</span>}</div>)}{!issues.length && <EmptyState title="No issues yet" text="Create the first issue for this project." />}</div>
      </article><article className="panel"><div className="panel-header"><div><h2>Delivery progress</h2><p>Current issue distribution</p></div></div><div className="progress-visual"><div className="progress-ring" style={{ '--progress': `${issues.length ? (stats.done / issues.length) * 360 : 0}deg` }}><span><strong>{issues.length ? Math.round((stats.done / issues.length) * 100) : 0}%</strong><small>done</small></span></div><div className="progress-legend"><div><i className="dot dot-gray" />To do <strong>{stats.todo}</strong></div><div><i className="dot dot-blue" />In progress <strong>{stats.progress}</strong></div><div><i className="dot dot-green" />Done <strong>{stats.done}</strong></div></div></div></article></section>
    </>}
  </div>;
}
