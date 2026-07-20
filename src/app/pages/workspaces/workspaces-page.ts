import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/utils/http-error';
import { avOf, glyphOf, initialsOf } from '../../core/utils/avatar';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace, WorkspaceMember } from '../../models/workspace.model';
import { ButtonComponent } from '../../components/ui/common/button/button';
import { ConfirmDialogComponent } from '../../components/ui/common/confirm-dialog/confirm-dialog';
import { ModalShellComponent } from '../../components/ui/common/modal-shell/modal-shell';
import { ToastComponent } from '../../components/ui/common/toast/toast';

@Component({
  selector: 'app-workspaces-page',
  imports: [
    FormsModule,
    RouterLink,
    ButtonComponent,
    ConfirmDialogComponent,
    ModalShellComponent,
    ToastComponent,
  ],
  templateUrl: './workspaces-page.html',
  styleUrl: './workspaces-page.css',
})
export class WorkspacesPageComponent implements OnInit {
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private destroyRef = inject(DestroyRef);

  protected toastService = inject(ToastService);

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
    const query = this.listSearch().toLowerCase();
    return query
      ? this.workspaces().filter(workspace => workspace.name.toLowerCase().includes(query))
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
    const query = this.memberSearch().toLowerCase();
    return query
      ? this.sortedMembers().filter(member =>
          (member.name?.toLowerCase().includes(query) ?? false) || member.email.toLowerCase().includes(query)
        )
      : this.sortedMembers();
  });

  readonly createInitials = computed(() => {
    const n = this.createName().trim();
    return n ? initialsOf(n, '') : '??';
  });

  readonly createGlyph = computed(() => glyphOf(this.createName().trim() || 'new'));

  ngOnInit() {
    this.authService.currentUser().pipe(
      tap(user => {
        this.currentUserId.set(user.id);
        this.currentUserEmail.set(user.email);
      }),
      switchMap(user => this.workspaceService.getUserWorkspaces(user.id)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: workspaces => {
        this.workspaces.set(workspaces);
        if (workspaces.length > 0) {
          this.selectedId.set(workspaces[0].id);
          this.loadMembers(workspaces[0].id);
        }
      },
      error: err => this.toastService.err(errorMessage(err)),
    });
  }

  selectWorkspace(id: string) {
    this.selectedId.set(id);
    this.memberSearch.set('');
    this.loadMembers(id);
  }

  private loadMembers(workspaceId: string) {
    this.workspaceService.getWorkspaceMembers(workspaceId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: m => this.members.set(m),
      error: err => this.toastService.err(errorMessage(err)),
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
    this.workspaceService.createWorkspace({ name, ownerId: this.currentUserId() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ws => {
        this.workspaces.update(list => [ws, ...list]);
        this.selectedId.set(ws.id);
        this.loadMembers(ws.id);
        this.createOpen.set(false);
        this.createLoading.set(false);
        this.toastService.ok(`Workspace "${ws.name}" created — you've been added as owner`);
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
    const workspaceId = this.selectedId();
    this.workspaceService.inviteMember(workspaceId, email).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.inviteLoading.set(false);
        this.inviteOpen.set(false);
        this.loadMembers(workspaceId);
        this.toastService.ok(`Invited ${email} to ${this.selectedWorkspace()?.name}`);
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
    const workspaceId = this.selectedId();
    const workspaceName = this.selectedWorkspace()?.name ?? '';
    this.workspaceService.removeMember(workspaceId, member.userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.members.update(members => members.filter(m => m.userId !== member.userId));
        this.confirmRemove.set(null);
        this.removeLoading.set(false);
        this.toastService.ok(`Removed ${member.name ?? member.email} from ${workspaceName}`);
      },
      error: err => {
        this.removeLoading.set(false);
        this.toastService.err(errorMessage(err));
        this.confirmRemove.set(null);
      },
    });
  }

  initialsOf = initialsOf;
  glyphOf = glyphOf;
  avOf = avOf;
}
