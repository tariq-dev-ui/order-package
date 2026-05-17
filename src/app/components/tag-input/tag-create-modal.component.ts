import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TagBasicModel, getDefaultColor } from './tag.model';


@Component({
    selector: 'app-tag-create-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `

  <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-xl overflow-hidden transition-all transform animate-scale-in relative">       
        
        <!-- Modal Header -->
        <div class="border-b border-gray-100 p-5">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold text-gray-900">
              <i class="fa fa-tag text-primary-500 me-2"></i>
              {{ (editMode ? 'Edit Tag' : 'Create New Tag') | translate }}
            </h2>
            <button  type="button"
            (click)="close()" 
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <i class="fa fa-times"></i>
          </button>
          </div>
          <p class="mt-1 text-sm text-gray-500">{{ (editMode ? 'Fill in the details below to edit the tag' : 'Fill in the details below to create a new tag') | translate }}</p>
        </div>


        <div class="max-h-[70vh] overflow-y-auto py-5 pl-5 pr-1 custom-scroll">
        <!-- Modal Body -->
        <div class="p-3 space-y-3">
          <div>
            <label for="tagName" class="block text-sm font-medium text-gray-700 mb-1">{{ 'Name' | translate }}*</label>
            <input
              id="tagName"
              type="text"
              [(ngModel)]="tag.Name"
              class="block w-full h-14 px-3 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              [placeholder]="'Enter tag name' | translate"
              required
            />
          </div>

          <div>
            <label for="tagDescription" class="block text-sm font-medium text-gray-700 mb-1">{{ 'Description' | translate }}*</label>
            <textarea
              id="tagDescription"
              [(ngModel)]="tag.Description"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              [placeholder]="'Optional description' | translate"
              rows="3"
            ></textarea>
          </div>

          <div>
            <label for="tagColor" class="block text-sm font-medium text-gray-700 mb-1">{{ 'Color' | translate }}*</label>
            <div class="flex items-center space-x-3">
              <input
                id="tagColor"
                type="color"
                [(ngModel)]="tag.Color"
                [value]="tag.Color || defaultColor"
                class="w-14 h-14 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
              <span class="text-sm text-gray-500">{{ tag.Color || defaultColor }}</span>
            </div>
          </div>
        </div> 
        </div>
        

            <!-- Modal Footer -->
        <div class="flex justify-end space-x-3 p-5 border-t border-gray-200">
          <button type="button"
            (click)="close()"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {{ 'Cancel' | translate }}
          </button>
          <button type="button"
            (click)="save()"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="(!tag.Name || !tag.Description || !tag.Color)"
          >
            <i class="fa fa-check me-2"></i>
             {{ (editMode ? 'Save' : 'Create') | translate }}
          </button>
        </div>
        </div>
      </div>


  `
})
export class TagCreateModalComponent {

    @Input() tag: TagBasicModel = {
        Name: '',
        Description: '',
        Color: getDefaultColor()
    };
    @Input() editMode = false;
    @Output() saved = new EventEmitter<TagBasicModel>();
    @Output() closed = new EventEmitter<void>();

    defaultColor = getDefaultColor();

    save() {
        if (this.tag.Name) {
            this.saved.emit(this.tag);
        }
    }

    close() {
        this.closed.emit();
    }
}