'use client';

import { storageService } from '@/lib/storage-service';
import { auth } from '@/lib/firebase';

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  imageName: string | null;
  imageUrl: string | null;
}

export interface ProjectData {
  meta: ProjectMeta;
  editorState: unknown;
  imageState: unknown;
}

interface ProjectsIndex {
  projects: ProjectMeta[];
}

function projectKey(uid: string, projectId: string): string {
  return `users/${uid}/projects/${projectId}.json`;
}

function indexKey(uid: string): string {
  return `users/${uid}/projects-index.json`;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

async function updateIndex(uid: string, meta: ProjectMeta): Promise<void> {
  const raw = await storageService.read(indexKey(uid));
  const index: ProjectsIndex = raw ? JSON.parse(raw) : { projects: [] };
  const idx = index.projects.findIndex((p) => p.id === meta.id);
  if (idx >= 0) {
    index.projects[idx] = meta;
  } else {
    index.projects.push(meta);
  }
  index.projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  await storageService.write(indexKey(uid), JSON.stringify(index), 'application/json');
}

async function removeFromIndex(uid: string, projectId: string): Promise<void> {
  const raw = await storageService.read(indexKey(uid));
  if (!raw) return;
  const index: ProjectsIndex = JSON.parse(raw);
  index.projects = index.projects.filter((p) => p.id !== projectId);
  await storageService.write(indexKey(uid), JSON.stringify(index), 'application/json');
}

export async function saveProject(
  name: string,
  editorState: unknown,
  imageState: unknown,
  existingId?: string
): Promise<ProjectMeta> {
  const uid = getUid();
  if (!uid) throw new Error('Not authenticated');

  const id = existingId || generateId();
  const now = new Date().toISOString();
  const imgState = imageState as Record<string, unknown>;
  const imageName = (imgState?.imageName as string) ?? null;
  const imageUrl = (imgState?.uploadedImageUrl as string) ?? null;

  const meta: ProjectMeta = {
    id,
    name,
    createdAt: existingId ? '' : now,
    updatedAt: now,
    imageName,
    imageUrl,
  };

  const data: ProjectData = { meta, editorState, imageState };

  await storageService.write(projectKey(uid, id), JSON.stringify(data), 'application/json');
  await updateIndex(uid, meta);

  return { ...meta, createdAt: meta.createdAt || now };
}

export async function loadProject(projectId: string): Promise<ProjectData | null> {
  const uid = getUid();
  if (!uid) return null;

  const raw = await storageService.read(projectKey(uid, projectId));
  if (!raw) return null;

  return JSON.parse(raw) as ProjectData;
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const uid = getUid();
  if (!uid) return [];

  const raw = await storageService.read(indexKey(uid));
  if (raw) {
    const index: ProjectsIndex = JSON.parse(raw);
    index.projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return index.projects;
  }

  return [];
}

export async function deleteProject(projectId: string): Promise<void> {
  const uid = getUid();
  if (!uid) return;

  await storageService.remove(projectKey(uid, projectId));
  await removeFromIndex(uid, projectId);
}
