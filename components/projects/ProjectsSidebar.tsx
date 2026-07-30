'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Cancel01Icon, Folder01Icon, Search01Icon, Clock01Icon, ArrowLeft01Icon, Add01Icon, ViewIcon } from 'hugeicons-react';
import { ProjectMeta, Collection, ProjectVersion, listCollections, createCollection, renameCollection, deleteCollection, listProjectVersions, restoreProjectVersion, updateProjectCollections } from '@/lib/project-manager';
import { cn } from '@/lib/utils';
import { CloudUsagePanel } from './CloudUsagePanel';

interface ProjectsSidebarProps {
  open: boolean;
  onClose: () => void;
  projects: ProjectMeta[];
  loading: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<ProjectMeta>) => void;
}

type SortMode = 'recent' | 'oldest' | 'name';
type PanelMode = 'projects' | 'versions';

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
};

export function ProjectsSidebar({ open, onClose, projects, loading, onLoad, onDelete, onUpdateProject }: ProjectsSidebarProps) {
  const [projectList, setProjectList] = React.useState<ProjectMeta[]>([]);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<SortMode>('recent');
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [creatingCol, setCreatingCol] = React.useState(false);
  const [activeCollection, setActiveCollection] = React.useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [showNewCollection, setShowNewCollection] = React.useState(false);
  const [editingCollection, setEditingCollection] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [pickerOpen, setPickerOpen] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<PanelMode>('projects');
  const [versionProject, setVersionProject] = React.useState<ProjectMeta | null>(null);
  const [versions, setVersions] = React.useState<ProjectVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = React.useState(false);

  // Close collection picker on click outside
  React.useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-col-picker]')) setPickerOpen(null);
    };
    setTimeout(() => window.addEventListener('click', handler), 0);
    return () => window.removeEventListener('click', handler);
  }, [pickerOpen]);

  // Sync from props, preserving local collectionIds so toggles persist
  React.useEffect(() => {
    setProjectList((prev) => {
      if (prev.length === 0) return projects;
      const prevMap = new Map(prev.map((p) => [p.id, p]));
      return projects.map((p) => ({
        ...p,
        collectionIds: prevMap.get(p.id)?.collectionIds ?? p.collectionIds,
      }));
    });
  }, [projects]);

  React.useEffect(() => {
    if (open) {
      listCollections().then(setCollections).catch(() => {});
    } else {
      setSearch('');
      setConfirmDelete(null);
      setActiveCollection(null);
      setMode('projects');
      setVersionProject(null);
      setVersions([]);
      setPickerOpen(null);
      setShowNewCollection(false);
    }
  }, [open]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'versions') {
          setMode('projects');
          setVersionProject(null);
          setVersions([]);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, mode]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = q ? projectList.filter((p) => p.name.toLowerCase().includes(q)) : [...projectList];

    if (activeCollection) {
      list = list.filter((p) => (p.collectionIds ?? []).includes(activeCollection));
    }

    switch (sort) {
      case 'recent': list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
      case 'oldest': list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return list;
  }, [projectList, search, sort, activeCollection]);

  const handleCreateCollection = () => {
    const name = newCollectionName.trim();
    if (!name || creatingCol) return;
    // Prevent duplicate names
    if (collections.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setNewCollectionName('');
      setShowNewCollection(false);
      return;
    }
    setCreatingCol(true);
    const now = new Date().toISOString();
    const col: Collection = { id: `tmp_${Date.now()}`, name, createdAt: now, updatedAt: now };
    setCollections((prev) => [...prev, col]);
    setNewCollectionName('');
    setShowNewCollection(false);
    // Sync to server in background — replace temp with real ID on success
    createCollection(name).then((real) => {
      setCollections((prev) => prev.map((c) => (c.id === col.id ? real : c)));
    }).catch(() => {
      setCollections((prev) => prev.filter((c) => c.id !== col.id));
    }).finally(() => setCreatingCol(false));
  };

  const handleRenameCollection = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    await renameCollection(id, name);
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    setEditingCollection(null);
  };

  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (activeCollection === id) setActiveCollection(null);
  };

  const openVersions = async (project: ProjectMeta) => {
    setVersionProject(project);
    setMode('versions');
    setVersionsLoading(true);
    const v = await listProjectVersions(project.id);
    setVersions(v);
    setVersionsLoading(false);
  };

  const handleRestoreVersion = async (projectId: string, versionId: string) => {
    const data = await restoreProjectVersion(projectId, versionId);
    if (data) {
      onLoad(projectId);
      setMode('projects');
      setVersionProject(null);
      setVersions([]);
    }
  };

  const handleToggleCollection = (projectId: string, collectionId: string) => {
    const p = projectList.find((pr) => pr.id === projectId);
    if (!p) return;
    const ids = p.collectionIds ?? [];
    const has = ids.includes(collectionId);
    const next = has ? ids.filter((id) => id !== collectionId) : [...ids, collectionId];
    // Optimistic: update local state immediately
    setProjectList((prev) => prev.map((pr) => (pr.id === projectId ? { ...pr, collectionIds: next } : pr)));
    onUpdateProject?.(projectId, { collectionIds: next });
    // Sync to server in background
    updateProjectCollections(projectId, next).catch((err) => console.error('updateProjectCollections failed', err));
  };

  const handleDelete = async (projectId: string) => {
    await onDelete(projectId);
    setProjectList((prev) => prev.filter((p) => p.id !== projectId));
    setConfirmDelete(null);
  };

  const colMap = new Map(collections.map((c) => [c.id, c.name]));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={mode === 'versions' ? () => { setMode('projects'); setVersionProject(null); setVersions([]); } : onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md"
            style={{ margin: '4px' }}
          >
            <div className="h-full w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#1c1c1e]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  {mode === 'versions' ? (
                    <>
                      <button onClick={() => { setMode('projects'); setVersionProject(null); setVersions([]); }}
                        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                        <ArrowLeft01Icon size={14} className="text-white/50" />
                      </button>
                      <div className="flex items-center gap-2">
                        <Clock01Icon size={14} className="text-white/60" />
                        <h2 className="text-sm font-medium text-white/80">History</h2>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Folder01Icon size={14} className="text-white/60" />
                      <h2 className="text-sm font-medium text-white/80">Projects</h2>
                    </div>
                  )}
                </div>
                <button onClick={onClose}
                  className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <Cancel01Icon size={14} className="text-white/50" />
                </button>
              </div>

              {mode === 'projects' && <CloudUsagePanel projectCount={projectList.length} />}

              {mode === 'versions' ? (
                /* Version History View */
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1.5">
                  {versionProject && (
                    <div className="px-1 pb-3">
                      <p className="text-sm text-white/80 font-medium truncate">{versionProject.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{versionProject.imageName || 'No image'}</p>
                    </div>
                  )}
                  {versionsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Clock01Icon className="w-10 h-10 text-white/20 mb-3" />
                      <p className="text-sm text-white/50">No saved versions</p>
                      <p className="text-xs text-white/30 mt-1">Versions are created automatically on each save</p>
                    </div>
                  ) : (
                    versions.map((v) => (
                      <div key={v.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3 min-w-0">
                          <Clock01Icon className="w-4 h-4 text-white/30 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-white/80 truncate">{v.label || `Version ${formatDate(v.timestamp)}`}</p>
                            <p className="text-xs text-white/40">{formatDate(v.timestamp)}</p>
                          </div>
                        </div>
                        <button onClick={() => handleRestoreVersion(v.projectId, v.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer">
                          Restore
                        </button>
                      </div>
                    ))
                  )}
                  {versions.length > 0 && (
                    <p className="text-xs text-white/30 text-center pt-3">{versions.length} version{versions.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
              ) : (
                /* Projects View */
                <>
                  {/* Collections — folder tree */}
                  <div className="px-4 pt-3 pb-1 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white/40">Folders</span>
                      <button onClick={() => { setShowNewCollection(true); setNewCollectionName(''); }}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">
                        <Add01Icon size={12} /> New
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {/* All Projects folder */}
                      <div onClick={() => setActiveCollection(null)}
                        className={cn('flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer',
                          !activeCollection ? 'bg-white/10' : 'hover:bg-white/5'
                        )}>
                        <Folder01Icon size={16} className={cn('shrink-0', !activeCollection ? 'text-white' : 'text-white/40')} />
                        <span className={cn('flex-1 truncate text-xs', !activeCollection ? 'text-white' : 'text-white/60')}>All Projects</span>
                        <span className="text-[10px] text-white/30">{projectList.length}</span>
                      </div>
                      {collections.map((col) => {
                        const count = projectList.filter((p) => (p.collectionIds ?? []).includes(col.id)).length;
                        const isActive = activeCollection === col.id;
                        return (
                          <div key={col.id}>
                            {editingCollection === col.id ? (
                              <div className="flex items-center gap-2 px-2 py-1">
                                <Folder01Icon size={14} className="shrink-0 text-white/30" />
                                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                                  onBlur={() => handleRenameCollection(col.id)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameCollection(col.id); if (e.key === 'Escape') setEditingCollection(null); }}
                                  className="flex-1 text-xs rounded border border-white/20 bg-white/5 text-white placeholder:text-white/30 focus:outline-none px-2 py-1"
                                  autoFocus />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer hover:bg-white/5"
                                onClick={() => setActiveCollection(isActive ? null : col.id)}>
                                <Folder01Icon size={16} className={cn('shrink-0', isActive ? 'text-white' : 'text-white/40')} />
                                <span className={cn('flex-1 truncate text-xs', isActive ? 'text-white' : 'text-white/60')}>{col.name}</span>
                                <span className="text-[10px] text-white/30 mr-1">{count}</span>
                                <button onClick={(e) => { e.stopPropagation(); setEditingCollection(col.id); setEditName(col.name); }}
                                  className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer transition-all">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCollection(col.id); }}
                                  className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer transition-all">
                                  <Cancel01Icon size={10} className="text-white/50" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {showNewCollection && (
                        <div className="flex items-center gap-2 px-2 py-1">
                          <Folder01Icon size={14} className="shrink-0 text-white/30" />
                          <input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="Folder name..."
                            onBlur={handleCreateCollection}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCollection(); if (e.key === 'Escape') setShowNewCollection(false); }}
                            className="flex-1 text-xs rounded border border-white/20 bg-white/5 text-white placeholder:text-white/30 focus:outline-none px-2 py-1"
                            autoFocus />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search + Sort */}
                  <div className="px-4 pt-3 pb-2 space-y-2.5 shrink-0">
                    <div className="relative">
                      <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full h-9 pl-9 pr-3 text-sm rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all" />
                    </div>
                    <div className="flex gap-1.5">
                      {(['recent', 'oldest', 'name'] as const).map((mode) => (
                        <button key={mode} onClick={() => setSort(mode)}
                          className={cn('px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                            sort === mode ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white/70'
                          )}>
                          {mode === 'recent' ? 'Recent' : mode === 'oldest' ? 'Oldest' : 'Name'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project list */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-1.5">
                    {loading ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Folder01Icon className="w-10 h-10 text-white/20 mb-3" />
                        <p className="text-sm text-white/50">{search || activeCollection ? 'No projects match' : 'No saved projects'}</p>
                        <p className="text-xs text-white/30 mt-1">{search || activeCollection ? 'Try different filters' : 'Save a project to see it here'}</p>
                      </div>
                    ) : (
                      filtered.map((project) => {
                        const colNames = (project.collectionIds ?? []).map((id) => colMap.get(id)).filter(Boolean) as string[];
                        return (
                          <div key={project.id}
                            onClick={() => onLoad(project.id)}
                            className="group relative p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                            <div className="flex gap-3 items-center">
                              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                                {project.imageUrl && !project.imageUrl.startsWith('blob:') ? (
                                  <img src={project.imageUrl} alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const el = e.target as HTMLImageElement;
                                      el.style.display = 'none';
                                      el.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                      svg.setAttribute('width', '18');
                                      svg.setAttribute('height', '18');
                                      svg.setAttribute('viewBox', '0 0 24 24');
                                      svg.setAttribute('fill', 'none');
                                      svg.setAttribute('stroke', 'currentColor');
                                      svg.setAttribute('stroke-width', '1.5');
                                      svg.classList.add('text-white/30');
                                      svg.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>';
                                      el.parentElement!.appendChild(svg);
                                    }} />
                                ) : (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white/80 truncate leading-tight">{project.name}</p>
                                {project.imageName && (
                                  <p className="text-xs text-white/40 mt-0.5 truncate">{project.imageName}</p>
                                )}
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-white/40">{formatDate(project.updatedAt)}</span>
                                  {colNames.length > 0 && <span className="text-xs text-white/30">·</span>}
                                  {colNames.slice(0, 2).map((n) => (
                                    <span key={n} className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded-md">{n}</span>
                                  ))}
                                  {colNames.length > 2 && <span className="text-[10px] text-white/30">+{colNames.length - 2}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Bottom action bar */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                              <button onClick={(e) => { e.stopPropagation(); openVersions(project); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer">
                                <Clock01Icon size={14} />
                                History
                              </button>
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setPickerOpen(pickerOpen === project.id ? null : project.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer">
                                  <Folder01Icon size={14} />
                                  Move
                                </button>
                                {pickerOpen === project.id && (
                                  <div data-col-picker className="absolute bottom-full left-0 mb-1.5 w-44 p-2 rounded-xl bg-[#252527] border border-white/10 shadow-xl z-10 space-y-0.5">
                                    {collections.length === 0 && (
                                      <p className="text-xs text-white/40 px-2 py-1.5">No folders yet</p>
                                    )}
                                    {collections.map((col) => {
                                      const inCol = (project.collectionIds ?? []).includes(col.id);
                                      return (
                                        <button key={col.id} onClick={() => handleToggleCollection(project.id, col.id)}
                                          className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer',
                                            inCol ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                                          )}>
                                          <Folder01Icon size={14} className={inCol ? 'text-white' : 'text-white/30'} />
                                          {col.name}
                                          {inCol && <span className="ml-auto text-[10px] text-white/40">✓</span>}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <div className="ml-auto">
                                {confirmDelete === project.id ? (
                                  <div className="flex gap-1.5">
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all cursor-pointer">Delete</button>
                                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white/50 transition-all cursor-pointer">Cancel</button>
                                  </div>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(project.id); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all cursor-pointer">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {projectList.length > 0 && (
                    <div className="px-4 py-3 border-t border-white/5 shrink-0">
                      <p className="text-xs text-white/30 text-center">
                        {projectList.length} {projectList.length === 1 ? 'project' : 'projects'}
                        {activeCollection && collections.find((c) => c.id === activeCollection) && (
                          <> in <span className="text-white/50">{collections.find((c) => c.id === activeCollection)!.name}</span></>
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
