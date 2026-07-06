import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, CircleDot, Plus } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useApp } from '../context/AppContext';
import { Avatar, Badge, EmptyState, Loading } from '../components/UI';
import { IssueDetailModal, IssueFormModal } from '../components/IssueModal';

const columns = [
  { key: 'todo', label: 'To do', icon: Circle },
  { key: 'in_progress', label: 'In progress', icon: CircleDot },
  { key: 'done', label: 'Done', icon: CheckCircle2 },
];
export default function Board() {
  const { selectedProject, selectedProjectId, notify } = useApp();
  const [sprints, setSprints] = useState([]); const [sprintId, setSprintId] = useState(''); const [board, setBoard] = useState({ todo: [], in_progress: [], done: [] }); const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [createOpen, setCreateOpen] = useState(false); const [detailId, setDetailId] = useState(null); const [dragging, setDragging] = useState(null);
  const loadSprints = async () => { if (!selectedProjectId) { setSprints([]); setSprintId(''); setLoading(false); return; } try { const [s, u] = await Promise.all([api.get(`/sprints?project_id=${selectedProjectId}`), api.get('/users')]); setSprints(s.data.sprints); setUsers(u.data.users); setSprintId((current) => { if (s.data.sprints.some((x) => String(x.id) === String(current))) return current; const preferred = s.data.sprints.find((x) => x.status === 'active') || s.data.sprints.find((x) => x.status === 'planned') || s.data.sprints[0]; return preferred ? String(preferred.id) : ''; }); } catch (err) { notify(getErrorMessage(err), 'error'); } };
  const loadBoard = async () => { if (!sprintId) { setBoard({ todo: [], in_progress: [], done: [] }); setLoading(false); return; } setLoading(true); try { const { data } = await api.get(`/sprints/${sprintId}/board`); setBoard(data.board); } catch (err) { notify(getErrorMessage(err), 'error'); } finally { setLoading(false); } };
  useEffect(() => { loadSprints(); }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadBoard(); }, [sprintId]); // eslint-disable-line react-hooks/exhaustive-deps
  const move = async (status) => { if (!dragging || dragging.status === status) return; const original = board; setBoard((b) => ({ ...b, [dragging.status]: b[dragging.status].filter((i) => i.id !== dragging.id), [status]: [...b[status], { ...dragging, status }] })); try { await api.patch(`/issues/${dragging.id}`, { status }); } catch (err) { setBoard(original); notify(getErrorMessage(err), 'error'); } finally { setDragging(null); } };
  const currentSprint = sprints.find((s) => String(s.id) === String(sprintId));
  return <div className="page-content board-page"><header className="page-header"><div><span className="eyebrow">{selectedProject?.key || 'Project board'}</span><h1>Sprint board</h1><p>Move work through the delivery flow.</p></div><button className="button button-primary" onClick={() => setCreateOpen(true)} disabled={!sprintId}><Plus size={17} />Create issue</button></header>
    <div className="board-toolbar"><div><label>Sprint</label><select value={sprintId} onChange={(e) => setSprintId(e.target.value)}><option value="">Select sprint</option>{sprints.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.status}</option>)}</select></div>{currentSprint && <div className="sprint-summary"><Badge tone={currentSprint.status}>{currentSprint.status}</Badge><CalendarDays size={16} /><span>{currentSprint.start_date ? new Date(currentSprint.start_date).toLocaleDateString() : 'No start date'} – {currentSprint.end_date ? new Date(currentSprint.end_date).toLocaleDateString() : 'No end date'}</span></div>}</div>
    {loading ? <Loading /> : !sprintId ? <EmptyState title="No sprint selected" text="Create or select a sprint to open its board." /> : <div className="kanban">{columns.map(({ key, label, icon: Icon }) => <section className={`kanban-column column-${key}`} key={key} onDragOver={(e) => e.preventDefault()} onDrop={() => move(key)}><header><span><Icon size={17} />{label}</span><b>{board[key]?.length || 0}</b></header><div className="kanban-items">{board[key]?.map((issue) => <article className="issue-card" key={issue.id} draggable onDragStart={() => setDragging(issue)} onClick={() => setDetailId(issue.id)}><div className="issue-card-top"><span className={`issue-type issue-type-${issue.type}`}>{issue.type[0].toUpperCase()}</span><span>{selectedProject?.key}-{issue.issue_number}</span></div><h3>{issue.title}</h3><footer><Badge tone={issue.priority}>{issue.priority}</Badge>{issue.assignee_id ? <Avatar name={users.find((u) => Number(u.id) === Number(issue.assignee_id))?.name || '?'} size="sm" /> : <span className="avatar avatar-sm avatar-empty">?</span>}</footer></article>)}{!board[key]?.length && <div className="column-empty">Drop issues here</div>}</div></section>)}</div>}
    <IssueFormModal open={createOpen} onClose={() => setCreateOpen(false)} users={users} sprints={sprints} initialSprintId={sprintId} onSaved={loadBoard} /><IssueDetailModal issueId={detailId} onClose={() => setDetailId(null)} users={users} onChanged={loadBoard} />
  </div>;
}
