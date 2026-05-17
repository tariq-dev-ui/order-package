import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [TranslateModule, MatExpansionModule, MatButtonModule, MatDialogModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  settings = inject(CoreService);
  options = this.settings.getOptions();
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);

  ngOnInit() {
    this.dialogRef.updateSize('300px');
  }

  onConfirm() {
    this.data.onConfirm();
  }
}
