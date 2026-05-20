import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace, WorkspaceMember } from '../../models/workspace.model';

function initialsOf(name: string | null, email: string): string {
  if (!name) {
    const local = email.split('@')[0];
    const parts = local.split(/[._-]/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : local.slice(0, 2).toUpperCase();
  }
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function glyphOf(name: string): string {
  let h = 0;
  for (const c of name) h = ((h * 31) + c.charCodeAt(0)) | 0;
  return ['g0', 'g1', 'g2', 'g3', 'g4', 'g5'][Math.abs(h) % 6];
}

function avOf(id: string): string {
  let h = 0;
  for (const c of id) h = ((h * 31) + c.charCodeAt(0)) | 0;
  return ['a', 'b', 'c', 'd', 'e', 'f'][Math.abs(h) % 6];
}

function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.error?.message) return err.error.message;
  return 'Something went wrong. Please try again.';
}

interface Toast {
  type: 'ok' | 'err';
  msg: string;
}

@Component({
  selector: 'app-workspaces-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './workspaces-page.html',
  styleUrl: './workspaces-page.css',
})
export class WorkspacesPageComponent implements OnInit {
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);

  currentUserId = signal('');
  currentUserEmail = signal('');
  workspaces = signal<Workspace[]>([]);
  members = signal<WorkspaceMember[]>([]);
  selectedId = signal('');
  listSearch = signal('');
  memberSearch = signal('');
  createOpen = signal(false);
  inviteOpen = signal(false);
  confirmRemove = signal<WorkspaceMember | null>(null);
  toast = signal<Toast | null>(null);

  createName = signal('');
  createLoading = signal(false);
  createError = signal('');

  inviteEmail = signal('');
  inviteLoading = signal(false);
  inviteError = signal('');

  removeLoading = signal(false);

  readonly selectedWorkspace = computed(() =>
    this.workspaces().find(w => w.id === this.selectedId())
  );

  readonly isOwner = computed(() =>
    this.selectedWorkspace()?.ownerId === this.currentUserId()
  );

  readonly filteredWorkspaces = computed(() => {
    const q = this.listSearch().toLowerCase();
    return q
      ? this.workspaces().filter(w => w.name.toLowerCase().includes(q))
      : this.workspaces();
  });

  readonly sortedMembers = computed(() => {
    const ownerId = this.selectedWorkspace()?.ownerId ?? '';
    return [...this.members()].sort((a, b) => {
      if (a.userId === ownerId) return -1;
      if (b.userId === ownerId) return 1;
      return (a.name ?? a.email).localeCompare(b.name ?? b.email);
    });
  });

  readonly filteredMembers = computed(() => {
    const q = this.memberSearch().toLowerCase();
    return q
      ? this.sortedMembers().filter(m =>
          (m.name?.toLowerCase().includes(q) ?? false) || m.email.toLowerCase().includes(q)
        )
      : this.sortedMembers();
  });

  readonly createInitials = computed(() => {
    const n = this.createName().trim();
    return n ? initialsOf(n, '') : '??';
  });

  readonly createGlyph = computed(() => glyphOf(this.createName().trim() || 'new'));

  ngOnInit() {
    this.authService.currentUser().subscribe(user => {
      this.currentUserId.set(user.id);
      this.currentUserEmail.set(user.email);
      this.workspaceService.getUserWorkspaces(user.id).subscribe({
        next: wss => {
          this.workspaces.set(wss);
          if (wss.length > 0) {
            this.selectedId.set(wss[0].id);
            this.loadMembers(wss[0].id);
          }
        },
        error: err => this.showToast('err', errorMessage(err)),
      });
    });
  }

  selectWorkspace(id: string) {
    this.selectedId.set(id);
    this.memberSearch.set('');
    this.loadMembers(id);
  }

  private loadMembers(workspaceId: string) {
    this.workspaceService.getWorkspaceMembers(workspaceId).subscribe({
      next: m => this.members.set(m),
      error: err => this.showToast('err', errorMessage(err)),
    });
  }

  openCreate() {
    this.createName.set('');
    this.createError.set('');
    this.createOpen.set(true);
  }

  submitCreate() {
    const name = this.createName().trim();
    if (!name || this.createLoading()) return;
    this.createLoading.set(true);
    this.createError.set('');
    this.workspaceService.createWorkspace({ name, ownerId: this.currentUserId() }).subscribe({
      next: ws => {
        this.workspaces.update(wss => [ws, ...wss]);
        this.selectedId.set(ws.id);
        this.loadMembers(ws.id);
        this.createOpen.set(false);
        this.createLoading.set(false);
        this.showToast('ok', `Workspace "${ws.name}" created — you've been added as owner`);
      },
      error: err => {
        this.createLoading.set(false);
        this.createError.set(errorMessage(err));
      },
    });
  }

  openInvite() {
    this.inviteEmail.set('');
    this.inviteError.set('');
    this.inviteOpen.set(true);
  }

  invite() {
    const email = this.inviteEmail().trim();
    if (!email || this.inviteLoading()) return;
    this.inviteLoading.set(true);
    this.inviteError.set('');
    const wsId = this.selectedId();
    this.workspaceService.inviteMember(wsId, email).subscribe({
      next: () => {
        this.inviteLoading.set(false);
        this.inviteOpen.set(false);
        this.loadMembers(wsId);
        this.showToast('ok', `Invited ${email} to ${this.selectedWorkspace()?.name}`);
      },
      error: err => {
        this.inviteLoading.set(false);
        this.inviteError.set(errorMessage(err));
      },
    });
  }

  askRemove(member: WorkspaceMember) {
    this.confirmRemove.set(member);
  }

  confirmDoRemove() {
    const member = this.confirmRemove();
    if (!member || this.removeLoading()) return;
    this.removeLoading.set(true);
    const wsId = this.selectedId();
    const wsName = this.selectedWorkspace()?.name ?? '';
    this.workspaceService.removeMember(wsId, member.userId).subscribe({
      next: () => {
        this.members.update(ms => ms.filter(m => m.userId !== member.userId));
        this.confirmRemove.set(null);
        this.removeLoading.set(false);
        this.showToast('ok', `Removed ${member.name ?? member.email} from ${wsName}`);
      },
      error: err => {
        this.removeLoading.set(false);
        this.showToast('err', errorMessage(err));
        this.confirmRemove.set(null);
      },
    });
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private showToast(type: 'ok' | 'err', msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set({ type, msg });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3200);
  }

  initialsOf = initialsOf;
  glyphOf = glyphOf;
  avOf = avOf;
}
