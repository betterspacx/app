'use client';

import { storageService } from '@/lib/storage-service';
import { supabase } from '@/lib/supabase/client';
import { getSubscription } from '@/lib/supabase/auth-service';
import { getLimit } from '@/lib/plans';

const CACHE_PREFIX = 'betterflow_projects_cache_';
const COLLECTIONS_CACHE_KEY = 'betterflow_collections_cache';

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  imageName: string | null;
  imageUrl: string | null;
  collectionIds: string[];
}

export interface ProjectData {
  meta: ProjectMeta;
  editorState: unknown;
  imageState: unknown;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  timestamp: string;
  label: string | null;
  editorState: unknown;
  imageState: unknown;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsIndex {
  projects: ProjectMeta[];
}

interface CollectionsData {
  collections: Collection[];
}

function projectKey(uid: string, projectId: string): string {
  return `users/${uid}/projects/${projectId}.json`;
}

function versionIndexKey(uid: string, projectId: string): string {
  return `users/${uid}/projects/${projectId}/versions-index.json`;
}

function versionKey(uid: string, projectId: string, versionId: string): string {
  return `users/${uid}/projects/${projectId}/versions/${versionId}.json`;
}

function indexKey(uid: string): string {
  return `users/${uid}/projects-index.json`;
}

function collectionsKey(uid: string): string {
  return `users/${uid}/collections.json`;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

let cachedUid: string | null = null;

async function getUid(): Promise<string | null> {
  if (cachedUid) return cachedUid;
  const { data } = await supabase.auth.getSession();
  cachedUid = data.session?.user?.id ?? null;
  return cachedUid;
}

async function blobUrlToBase64(blobUrl: string): Promise<string> {
  if (!blobUrl.startsWith('blob:')) return blobUrl;
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return blobUrl;
  }
}

function getCacheKey(uid: string): string {
  return `${CACHE_PREFIX}${uid}`;
}

function readCache(uid: string): ProjectMeta[] | null {
  try {
    const raw = localStorage.getItem(getCacheKey(uid));
    return raw ? (JSON.parse(raw) as ProjectMeta[]) : null;
  } catch {
    return null;
  }
}

function writeCache(uid: string, projects: ProjectMeta[]): void {
  try {
    localStorage.setItem(getCacheKey(uid), JSON.stringify(projects));
  } catch {
    // Storage full — ignore
  }
}

function removeCache(uid: string): void {
  try {
    localStorage.removeItem(getCacheKey(uid));
  } catch {
    // ignore
  }
}

function sortProjects(projects: ProjectMeta[]): ProjectMeta[] {
  return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
  index.projects = sortProjects(index.projects);
  await storageService.write(indexKey(uid), JSON.stringify(index), 'application/json');
  writeCache(uid, index.projects);
}

async function removeFromIndex(uid: string, projectId: string): Promise<void> {
  const raw = await storageService.read(indexKey(uid));
  if (!raw) return;
  const index: ProjectsIndex = JSON.parse(raw);
  index.projects = index.projects.filter((p) => p.id !== projectId);
  await storageService.write(indexKey(uid), JSON.stringify(index), 'application/json');
  writeCache(uid, index.projects);
}

export async function saveProject(
  name: string,
  editorState: unknown,
  imageState: unknown,
  existingId?: string
): Promise<ProjectMeta> {
  const uid = await getUid();
  if (!uid) throw new Error('Not authenticated');

  const id = existingId || generateId();

  const sub = await getSubscription();
  const isNew = !existingId;

  if (isNew) {
    const maxProjects = getLimit(sub, 'maxProjects');
    if ((maxProjects as number) > 0) {
      const projects = await listProjects();
      if (projects.length >= (maxProjects as number)) {
        throw new Error(`Free plan limited to ${maxProjects} projects. Upgrade to Cloud for unlimited.`);
      }
    }
  }

  const imgState = imageState as Record<string, unknown>;
  let imageUrl = (imgState?.uploadedImageUrl as string) ?? null;

  if (imageUrl && imageUrl.startsWith('blob:')) {
    imageUrl = await blobUrlToBase64(imageUrl);
    (imageState as Record<string, unknown>).uploadedImageUrl = imageUrl;
  }

  const now = new Date().toISOString();
  const imageName = (imgState?.imageName as string) ?? null;

  // Preserve collectionIds if re-saving
  let collectionIds: string[] = [];
  if (existingId) {
    const existingMeta = await getProjectMeta(uid, existingId);
    if (existingMeta) collectionIds = existingMeta.collectionIds ?? [];
  }

  const meta: ProjectMeta = {
    id,
    name,
    createdAt: isNew ? now : '',
    updatedAt: now,
    imageName,
    imageUrl,
    collectionIds,
  };

  const data: ProjectData = { meta, editorState, imageState };

  // Save current version as a history version before overwriting
  if (existingId) {
    const existingRaw = await storageService.read(projectKey(uid, id));
    if (existingRaw) {
      await saveVersion(uid, id, existingRaw);
    }
  }

  await storageService.write(projectKey(uid, id), JSON.stringify(data), 'application/json');
  await updateIndex(uid, meta);

  return { ...meta, createdAt: meta.createdAt || now };
}

async function getProjectMeta(uid: string, projectId: string): Promise<ProjectMeta | null> {
  const raw = await storageService.read(indexKey(uid));
  if (!raw) return null;
  const index: ProjectsIndex = JSON.parse(raw);
  return index.projects.find((p) => p.id === projectId) ?? null;
}

async function saveVersion(uid: string, projectId: string, projectRaw: string): Promise<void> {
  const versionId = generateId();
  const data = JSON.parse(projectRaw) as ProjectData;
  const version: ProjectVersion = {
    id: versionId,
    projectId,
    timestamp: new Date().toISOString(),
    label: null,
    editorState: data.editorState,
    imageState: data.imageState,
  };

  // Update version index
  const indexRaw = await storageService.read(versionIndexKey(uid, projectId));
  const vIndex: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  vIndex.unshift(versionId);
  // Keep max 20 versions per project
  const trimmed = vIndex.slice(0, 20);

  await storageService.write(versionKey(uid, projectId, versionId), JSON.stringify(version), 'application/json');
  await storageService.write(versionIndexKey(uid, projectId), JSON.stringify(trimmed), 'application/json');
}

export async function loadProject(projectId: string): Promise<ProjectData | null> {
  const uid = await getUid();
  if (!uid) return null;

  const raw = await storageService.read(projectKey(uid, projectId));
  if (!raw) return null;

  return JSON.parse(raw) as ProjectData;
}

export async function listProjectVersions(projectId: string): Promise<ProjectVersion[]> {
  const uid = await getUid();
  if (!uid) return [];

  const raw = await storageService.read(versionIndexKey(uid, projectId));
  if (!raw) return [];

  const versionIds: string[] = JSON.parse(raw);
  const versions: ProjectVersion[] = [];

  for (const vid of versionIds) {
    const vRaw = await storageService.read(versionKey(uid, projectId, vid));
    if (vRaw) versions.push(JSON.parse(vRaw) as ProjectVersion);
  }

  return versions;
}

export async function loadProjectVersion(projectId: string, versionId: string): Promise<ProjectVersion | null> {
  const uid = await getUid();
  if (!uid) return null;

  const raw = await storageService.read(versionKey(uid, projectId, versionId));
  if (!raw) return null;

  return JSON.parse(raw) as ProjectVersion;
}

export async function restoreProjectVersion(projectId: string, versionId: string): Promise<ProjectData | null> {
  const uid = await getUid();
  if (!uid) return null;

  const version = await loadProjectVersion(projectId, versionId);
  if (!version) return null;

  // Save current as version first
  const currentRaw = await storageService.read(projectKey(uid, projectId));
  if (currentRaw) {
    await saveVersion(uid, projectId, currentRaw);
  }

  const currentMetaRaw = await storageService.read(indexKey(uid));
  const index: ProjectsIndex = currentMetaRaw ? JSON.parse(currentMetaRaw) : { projects: [] };
  const meta = index.projects.find((p) => p.id === projectId);
  if (!meta) return null;

  const restored: ProjectData = {
    meta,
    editorState: version.editorState,
    imageState: version.imageState,
  };

  await storageService.write(projectKey(uid, projectId), JSON.stringify(restored), 'application/json');
  meta.updatedAt = new Date().toISOString();
  await updateIndex(uid, meta);

  return restored;
}

async function syncIndexFromApi(uid: string): Promise<ProjectMeta[]> {
  const raw = await storageService.read(indexKey(uid));
  if (!raw) return [];
  const index: ProjectsIndex = JSON.parse(raw);
  index.projects = sortProjects(index.projects);
  writeCache(uid, index.projects);
  return index.projects;
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const uid = await getUid();
  if (!uid) return [];

  const cached = readCache(uid);
  if (cached) {
    syncIndexFromApi(uid).catch(() => {});
    return cached;
  }

  const projects = await syncIndexFromApi(uid);
  return projects;
}

export async function deleteProject(projectId: string): Promise<void> {
  const uid = await getUid();
  if (!uid) return;

  // Remove version history
  const vRaw = await storageService.read(versionIndexKey(uid, projectId));
  if (vRaw) {
    const versionIds: string[] = JSON.parse(vRaw);
    for (const vid of versionIds) {
      await storageService.remove(versionKey(uid, projectId, vid));
    }
    await storageService.remove(versionIndexKey(uid, projectId));
  }

  await storageService.remove(projectKey(uid, projectId));
  await removeFromIndex(uid, projectId);
}

export async function updateProjectCollections(
  projectId: string,
  collectionIds: string[]
): Promise<void> {
  const uid = await getUid();
  if (!uid) return;

  const raw = await storageService.read(indexKey(uid));
  if (!raw) return;
  const index: ProjectsIndex = JSON.parse(raw);
  const project = index.projects.find((p) => p.id === projectId);
  if (!project) return;

  project.collectionIds = collectionIds;
  await updateIndex(uid, project);
}

// ── Collections ───────────────────────────────────────────────────────────────

export async function listCollections(): Promise<Collection[]> {
  const uid = await getUid();
  if (!uid) return [];

  const raw = await storageService.read(collectionsKey(uid));
  if (!raw) return [];

  const data: CollectionsData = JSON.parse(raw);
  return data.collections;
}

export async function createCollection(name: string): Promise<Collection> {
  const uid = await getUid();
  if (!uid) throw new Error('Not authenticated');

  const now = new Date().toISOString();
  const collection: Collection = {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
  };

  const raw = await storageService.read(collectionsKey(uid));
  const data: CollectionsData = raw ? JSON.parse(raw) : { collections: [] };
  data.collections.push(collection);

  await storageService.write(collectionsKey(uid), JSON.stringify(data), 'application/json');
  return collection;
}

export async function renameCollection(collectionId: string, name: string): Promise<void> {
  const uid = await getUid();
  if (!uid) return;

  const raw = await storageService.read(collectionsKey(uid));
  if (!raw) return;
  const data: CollectionsData = JSON.parse(raw);
  const col = data.collections.find((c) => c.id === collectionId);
  if (!col) return;

  col.name = name;
  col.updatedAt = new Date().toISOString();
  await storageService.write(collectionsKey(uid), JSON.stringify(data), 'application/json');
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const uid = await getUid();
  if (!uid) return;

  const raw = await storageService.read(collectionsKey(uid));
  if (!raw) return;
  const data: CollectionsData = JSON.parse(raw);
  data.collections = data.collections.filter((c) => c.id !== collectionId);
  await storageService.write(collectionsKey(uid), JSON.stringify(data), 'application/json');

  // Remove collection from all projects
  const pRaw = await storageService.read(indexKey(uid));
  if (pRaw) {
    const index: ProjectsIndex = JSON.parse(pRaw);
    let changed = false;
    for (const p of index.projects) {
      const before = p.collectionIds?.length ?? 0;
      p.collectionIds = (p.collectionIds ?? []).filter((cid) => cid !== collectionId);
      if (p.collectionIds.length !== before) changed = true;
    }
    if (changed) {
      await storageService.write(indexKey(uid), JSON.stringify(index), 'application/json');
    }
  }
}

export async function addProjectToCollection(projectId: string, collectionId: string): Promise<void> {
  const uid = await getUid();
  if (!uid) return;

  const raw = await storageService.read(indexKey(uid));
  if (!raw) return;
  const index: ProjectsIndex = JSON.parse(raw);
  const project = index.projects.find((p) => p.id === projectId);
  if (!project) return;

  const ids = project.collectionIds ?? [];
  if (!ids.includes(collectionId)) {
    ids.push(collectionId);
    project.collectionIds = ids;
    await updateIndex(uid, project);
  }
}

export async function removeProjectFromCollection(projectId: string, collectionId: string): Promise<void> {
  const uid = await getUid();
  if (!uid) return;

  const raw = await storageService.read(indexKey(uid));
  if (!raw) return;
  const index: ProjectsIndex = JSON.parse(raw);
  const project = index.projects.find((p) => p.id === projectId);
  if (!project) return;

  project.collectionIds = (project.collectionIds ?? []).filter((cid) => cid !== collectionId);
  await updateIndex(uid, project);
}
