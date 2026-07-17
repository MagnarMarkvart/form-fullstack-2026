import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { GraphqlService } from '../../services/graphql.service';
import { Sector } from '../../models/sector.model';
import { getSectorPath } from '../../utils/get-sector-path';
import {
  ConfirmClearDialogComponent,
  ConfirmClearDialogData,
} from '../confirm-clear-dialog/confirm-clear-dialog';

export type SectorPathItem = {
  id: string;
  leafName: string;
  path: string[];
  pathLabel: string;
};

@Component({
  selector: 'app-profile-view',
  imports: [RouterLink, MatDialogModule],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css',
})
export class ProfileViewComponent implements OnInit {
  private session = inject(SessionService);
  private graphql = inject(GraphqlService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  user = this.session.user;
  private sectors = signal<Sector[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  clearing = signal(false);
  clearError = signal<string | null>(null);

  selectedSectorPaths = computed((): SectorPathItem[] => {
    const user = this.user();
    if (!user) return [];

    const sectors = this.sectors();
    return user.selectedSectorIds
      .map((id) => {
        const fullPath = getSectorPath(id, sectors);
        if (fullPath.length === 0) return null;

        const leafName = fullPath[fullPath.length - 1];
        const parents = fullPath.slice(0, -1);

        return {
          id,
          leafName,
          path: parents,
          pathLabel: parents.join(' → '),
        };
      })
      .filter((item): item is SectorPathItem => item !== null)
      .sort((a, b) => a.leafName.localeCompare(b.leafName));
  });

  ngOnInit() {
    this.graphql.getSectors().subscribe({
      next: (sectors) => {
        this.sectors.set(sectors);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load sector names.');
        this.loading.set(false);
      },
    });
  }

  async onClearAllData() {
    const user = this.user();
    if (!user || this.clearing()) return;

    const confirmed = await firstValueFrom(
      this.dialog
        .open<ConfirmClearDialogComponent, ConfirmClearDialogData, boolean>(
          ConfirmClearDialogComponent,
          {
            width: '400px',
            panelClass: 'confirm-clear-dialog-panel',
            autoFocus: 'dialog',
            ariaLabelledBy: 'confirm-clear-title',
            ariaDescribedBy: 'confirm-clear-description',
            data: {
              title: 'Clear all registration data?',
              message:
                'This permanently deletes your saved name, sector selections, and terms agreement. This cannot be undone.',
            },
          },
        )
        .afterClosed(),
    );

    if (!confirmed) return;

    this.clearing.set(true);
    this.clearError.set(null);

    try {
      await firstValueFrom(this.graphql.deleteUserData(user.id));
      this.session.clearUser();
      await this.router.navigateByUrl('/');
    } catch {
      this.clearError.set('Could not clear registration data. Please try again.');
      this.clearing.set(false);
    }
  }
}
