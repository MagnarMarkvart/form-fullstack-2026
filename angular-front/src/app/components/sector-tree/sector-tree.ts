import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SectorNode } from '../../models/sector.model';

@Component({
  selector: 'app-sector-tree',
  imports: [MatTreeModule, MatIconModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './sector-tree.html',
  styleUrl: './sector-tree.css',
})
export class SectorTreeComponent {
  private injector = inject(Injector);

  nodes = input.required<SectorNode[]>();
  selectedIds = input<string[]>([]);
  /** When true, expand the whole visible tree. */
  expandAll = input(false);

  selectionChange = output<string>();

  tree = viewChild<MatTree<SectorNode>>('tree');

  dataSource = computed(() => this.nodes());

  childrenAccessor = (node: SectorNode) => node.children;

  hasChild = (_: number, node: SectorNode) => node.children.length > 0;

  constructor() {
    effect(() => {
      const shouldExpand = this.expandAll();
      const nodes = this.nodes();
      // Touch signals so the effect re-runs when they change.
      void nodes;

      afterNextRender(
        () => {
          const tree = this.tree();
          if (!tree) return;
          if (shouldExpand) {
            tree.expandAll();
          } else {
            tree.collapseAll();
          }
        },
        { injector: this.injector },
      );
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  onToggle(id: string) {
    this.selectionChange.emit(id);
  }
}
