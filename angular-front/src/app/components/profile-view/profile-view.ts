import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { GraphqlService } from '../../services/graphql.service';
import { Sector } from '../../models/sector.model';
import { getSectorPath } from '../../utils/get-sector-path';

export type SectorPathItem = {
  id: string;
  leafName: string;
  path: string[];
  pathLabel: string;
};

@Component({
  selector: 'app-profile-view',
  imports: [RouterLink],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css',
})
export class ProfileViewComponent implements OnInit {
  private session = inject(SessionService);
  private graphql = inject(GraphqlService);

  user = this.session.user;
  private sectors = signal<Sector[]>([]);

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
      next: (sectors) => this.sectors.set(sectors),
    });
  }
}
