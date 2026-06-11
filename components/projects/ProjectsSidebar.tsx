'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectMeta } from '@/lib/project-manager';

interface ProjectsSidebarProps {
  open: boolean;
  onClose: () => void;
  projects: ProjectMeta[];
  loading: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectsSidebar({ open, onClose, projects, loading, onLoad, onDelete }: ProjectsSidebarProps) {
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260, mass: 0.8 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border/40 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-border/40 shrink-0">
              <h2 className="text-sm font-semibold text-foreground">My Projects</h2>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30 mb-3">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm text-muted-foreground">No saved projects</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Save a project to see it here</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex gap-3 p-3 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-muted/50 border border-border/30 shrink-0 overflow-hidden flex items-center justify-center">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                            `;
                          }}
                        />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-medium text-foreground truncate leading-tight">{project.name}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {project.imageName || 'No image'}
                      </p>
                      <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                        {new Date(project.updatedAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => onLoad(project.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer"
                      >
                        Open
                      </button>
                      {confirmDelete === project.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { onDelete(project.id); setConfirmDelete(null); }}
                            className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1.5 text-xs font-medium rounded-lg bg-muted/30 hover:bg-muted/60 text-muted-foreground transition-all cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(project.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted/30 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {projects.length > 0 && (
              <div className="px-4 py-3 border-t border-border/40 shrink-0">
                <p className="text-[11px] text-muted-foreground/40 text-center">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'} · Saved to cloud
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
