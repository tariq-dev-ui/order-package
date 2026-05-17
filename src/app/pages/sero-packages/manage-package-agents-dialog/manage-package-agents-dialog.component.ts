import { Component, inject, signal, OnInit, Inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AdminAPIClient, SeroPackageModel, SeroPackageAgentModel, AgentModel, CountryData, RegionModel, CityData } from 'src/app/services/admin.api.client';

import { map } from 'rxjs/operators';
import { Observable, of, forkJoin } from 'rxjs';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiAgentSelectorComponent } from '../../package-builder/components/multi-agent-selector/multi-agent-selector.component';

@Component({
    selector: 'app-manage-package-agents-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatSelectModule,
        TranslateModule,
        ReactiveFormsModule,
        FormsModule,
        MultiAgentSelectorComponent
    ],
    templateUrl: './manage-package-agents-dialog.component.html',
    styles: []
})
export class ManagePackageAgentsDialogComponent implements OnInit {

    private dialogRef = inject(MatDialogRef<ManagePackageAgentsDialogComponent>);
    private adminApiClient = inject(AdminAPIClient);

    packageData: SeroPackageModel;

    agents = signal<SeroPackageAgentModel[]>([]);
    selectedAgentIds = signal<number[]>([]);
    isSaving = signal<boolean>(false);

    constructor(@Inject(MAT_DIALOG_DATA) public data: { package: SeroPackageModel }) {
        this.packageData = { ...data.package }; // Clone to avoid mutating original until save
        this.agents.set(this.packageData.Agents || []);
        
        // Extract initial IDs
        const initialIds = (this.packageData.Agents || [])
            .map(a => a.AgentId)
            .filter(id => id !== undefined) as number[];
        this.selectedAgentIds.set(initialIds);
    }

    ngOnInit() {
    }

    onSelectionChanged(selectedIds: number[]) {
        this.selectedAgentIds.set(selectedIds);
    }

    save() {
        this.isSaving.set(true);

        // Convert selected IDs back to SeroPackageAgentModel
        const updatedAgents: SeroPackageAgentModel[] = this.selectedAgentIds().map(id => ({
            AgentId: id,
            SeroPackageId: this.packageData.PackageID,
            IsActive: true
        }));

        // Update the package object with new agents list
        const updatedPackage: SeroPackageModel = {
            ...this.packageData,
            Agents: updatedAgents
        };

        this.adminApiClient.updatePackage({
            packageId: this.packageData.PackageID,
            body: updatedPackage
        }).subscribe({
            next: (response) => {
                this.isSaving.set(false);
                this.dialogRef.close({ success: true });
            },
            error: (err) => {
                console.error('Error updating package agents', err);
                this.isSaving.set(false);
                // Handle error (show snackbar etc)
            }
        });
    }
}
