import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  form,
  FormField,
  submit,
  required,
  minLength,
  validate,
} from '@angular/forms/signals';
import { GraphqlService } from '../../services/graphql.service';
import { SessionService } from '../../services/session.service';
import { Sector, SectorNode } from '../../models/sector.model';
import { buildSectorTree } from '../../utils/build-sector-tree';
import { filterSectorTree } from '../../utils/filter-sector-tree';
import { getSectorPath } from '../../utils/get-sector-path';
import { SectorTreeComponent } from '../sector-tree/sector-tree';
import { MatCheckboxModule } from '@angular/material/checkbox';

type RegistrationModel = {
  name: string;
  selectedSectorIds: string[];
  agreeToTerms: boolean;
};

type SelectedSectorChip = {
  id: string;
  leafName: string;
  parentPathLabel: string;
};

@Component({
  selector: 'app-form',
  imports: [SectorTreeComponent, FormField, MatCheckboxModule, RouterLink],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class FormComponent implements OnInit {
  private graphql = inject(GraphqlService);
  private session = inject(SessionService);

  private sectors = signal<Sector[]>([]);
  private fullSectorTree = signal<SectorNode[]>([]);
  sectorSearch = signal('');
  loading = signal(true);
  error = signal<string | null>(null);
  saveError = signal<string | null>(null);
  saveSuccess = signal(false);
  private saveSuccessTimeoutId: number | null = null;

  sectorTree = computed(() =>
    filterSectorTree(this.fullSectorTree(), this.sectorSearch()),
  );

  isSearching = computed(() => this.sectorSearch().trim().length > 0);

  selectedSectors = computed((): SelectedSectorChip[] => {
    const sectors = this.sectors();
    return this.registrationModel()
      .selectedSectorIds.map((id) => {
        const fullPath = getSectorPath(id, sectors);
        if (fullPath.length === 0) return null;
        const leafName = fullPath[fullPath.length - 1];
        const parents = fullPath.slice(0, -1);
        return {
          id,
          leafName,
          parentPathLabel: parents.join(' → '),
        };
      })
      .filter((item): item is SelectedSectorChip => item !== null)
      .sort((a, b) => a.leafName.localeCompare(b.leafName));
  });

  registrationModel = signal<RegistrationModel>({
    name: '',
    selectedSectorIds: [],
    agreeToTerms: false,
  });

  registrationForm = form(this.registrationModel, (schema) => {
    required(schema.name, { message: 'Name is required' });
    validate(schema.name, ({ value }) =>
      value().trim()
        ? undefined
        : { kind: 'required', message: 'Name is required' },
    );
    minLength(schema.selectedSectorIds, 1, {
      message: 'Select at least one sector',
    });
    validate(schema.agreeToTerms, ({ value }) =>
      value()
        ? undefined
        : { kind: 'required', message: 'You must agree to the terms' },
    );
  });

  constructor() {
    // Prefill whenever a session user is available (already loaded, or arrives from API).
    effect(() => {
      const user = this.session.user();
      if (!user) return;

      this.registrationModel.set({
        name: user.name,
        selectedSectorIds: [...user.selectedSectorIds],
        agreeToTerms: user.agreeToTerms,
      });
    });
  }

  ngOnInit() {
    this.graphql.getSectors().subscribe({
      next: (sectors) => {
        this.sectors.set(sectors);
        this.fullSectorTree.set(buildSectorTree(sectors));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load sectors. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.sectorSearch.set(value);
  }

  clearSearch() {
    this.sectorSearch.set('');
  }

  /** Sector tree is a custom control — sync selection into the signal model manually. */
  onSectorToggle(id: string) {
    this.registrationModel.update((model) => {
      const ids = model.selectedSectorIds;
      return {
        ...model,
        selectedSectorIds: ids.includes(id)
          ? ids.filter((x) => x !== id)
          : [...ids, id],
      };
    });
    this.registrationForm.selectedSectorIds().markAsTouched();
  }

  removeSelectedSector(id: string) {
    this.registrationModel.update((model) => ({
      ...model,
      selectedSectorIds: model.selectedSectorIds.filter((x) => x !== id),
    }));
    this.registrationForm.selectedSectorIds().markAsTouched();
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.clearSaveSuccessTimer();
    this.registrationForm.selectedSectorIds().markAsTouched();

    await submit(this.registrationForm, async () => {
      const { name, selectedSectorIds, agreeToTerms } =
        this.registrationModel();
      const existingId = this.session.user()?.id;

      try {
        const user = await firstValueFrom(
          this.graphql.saveUserData(
            name,
            selectedSectorIds,
            agreeToTerms,
            existingId,
          ),
        );
        this.session.setUser(user);
        this.saveSuccess.set(true);
        this.scheduleSaveSuccessHide();
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Could not save. Is the backend running?';
        this.saveError.set(message);
      }
    });
  }

  /** Pause auto-hide while the user is interacting with the message. */
  onSaveSuccessHover() {
    this.clearSaveSuccessTimer();
  }

  /** Restart a fresh 3s countdown when the pointer leaves. */
  onSaveSuccessLeave() {
    if (this.saveSuccess()) {
      this.scheduleSaveSuccessHide();
    }
  }

  private scheduleSaveSuccessHide() {
    this.clearSaveSuccessTimer();
    this.saveSuccessTimeoutId = window.setTimeout(() => {
      this.saveSuccess.set(false);
      this.saveSuccessTimeoutId = null;
    }, 3000);
  }

  private clearSaveSuccessTimer() {
    if (this.saveSuccessTimeoutId !== null) {
      window.clearTimeout(this.saveSuccessTimeoutId);
      this.saveSuccessTimeoutId = null;
    }
  }
}
