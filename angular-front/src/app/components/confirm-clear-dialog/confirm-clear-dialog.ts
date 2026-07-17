import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export type ConfirmClearDialogData = {
  title: string;
  message: string;
};

@Component({
  selector: 'app-confirm-clear-dialog',
  imports: [MatDialogModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="overflow-hidden rounded-xl bg-white shadow-sm">
      <div class="border-b border-slate-100 bg-slate-900 px-6 py-5">
        <p class="text-xs font-medium tracking-widest text-slate-400 uppercase">
          Confirmation
        </p>
        <h2
          id="confirm-clear-title"
          class="mt-2 text-lg font-semibold tracking-tight text-white"
        >
          {{ data.title }}
        </h2>
      </div>

      <div class="space-y-6 px-6 py-6">
        <mat-dialog-content class="!m-0 !block !p-0">
          <p id="confirm-clear-description" class="text-sm leading-relaxed text-slate-600">
            {{ data.message }}
          </p>
        </mat-dialog-content>

        <mat-dialog-actions class="!m-0 !flex !justify-end !gap-2 !p-0" align="end">
          <button
            type="button"
            [mat-dialog-close]="false"
            aria-label="Cancel and keep registration data"
            class="cursor-pointer rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            [mat-dialog-close]="true"
            aria-label="Confirm permanent deletion of all registration data"
            class="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Clear all data
          </button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  // Material owns the overlay surface; strip its chrome so our Tailwind card is the only frame.
  styles: `
    .confirm-clear-dialog-panel .mat-mdc-dialog-surface {
      padding: 0;
      border: none;
      background: transparent;
      box-shadow: none;
    }
  `,
  host: {
    id: 'confirm-clear-dialog',
  },
})
export class ConfirmClearDialogComponent {
  readonly data = inject<ConfirmClearDialogData>(MAT_DIALOG_DATA);
}
