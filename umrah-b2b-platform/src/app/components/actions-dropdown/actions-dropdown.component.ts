import { Component, input, output, signal, computed, ChangeDetectionStrategy, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, CdkOverlayOrigin, CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay'; // Import CDK Overlay modules

/**
 * Interface defining the structure of an action item in the dropdown.
 */
export interface DropdownAction {
  label: string; // The text displayed for the action
  value: string; // A unique identifier or value associated with the action
  status?: number;
}

@Component({
  selector: 'app-actions-dropdown',
  standalone: true,
  imports: [CommonModule, OverlayModule], // Add OverlayModule to imports
  templateUrl: './actions-dropdown.component.html',
  styleUrl: './actions-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsDropdownComponent {
  actions = input.required<DropdownAction[]>();
  actionSelected = output<DropdownAction>();

  isOpen = signal(false);

  hasStatusActions = computed(() => {
    const actions = this.actions();
    if (!actions) {
      return false;
    }
    return actions.some(action => action.status);
  });

  // Reference to the button element, which will be the origin for the overlay
  @ViewChild('dropdownTrigger') dropdownTrigger!: ElementRef;

  // Define the positions for the overlay. This array specifies how the overlay
  // should attempt to position itself relative to the origin.
  // We try bottom-start first, then top-start if there's not enough space below.
  overlayPositions : ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 4, // Small offset from the button
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -4, // Small offset from the button when opening upwards
    },
  ];

  /**
   * Toggles the `isOpen` signal's value, effectively showing or hiding the dropdown.
   */
  toggleDropdown(): void {
    this.isOpen.update(current => !current);
  }

  /**
   * Handles the click event on an individual action item within the dropdown.
   * Emits the selected action and then closes the dropdown.
   * @param action The `DropdownAction` object that was clicked.
   */
  onActionClick(action: DropdownAction): void {
    this.actionSelected.emit(action);
    this.isOpen.set(false); // Close the dropdown
  }

  /**
   * Called when the backdrop of the overlay is clicked.
   * This automatically closes the dropdown when clicking outside.
   */
  onBackdropClick(): void {
    this.isOpen.set(false);
  }
}
