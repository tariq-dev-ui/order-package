import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestModel } from '../orders.model';

export interface ChatDialogData {
  request: RequestModel;
  agentId: number;
}

@Component({
  selector: 'chat-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-panel">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-content">
          <span class="material-icons-round">chat</span>
          <div>
            <div class="chat-header-title">Order Chat</div>
            <div class="chat-header-sub">{{ data.request.Title }} · #{{ data.request.Id }}</div>
          </div>
        </div>
        <button class="chat-close" (click)="close()">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-messages">
        <div class="chat-demo-notice">
          <span class="material-icons-round">info</span>
          <span>Chat is in preview mode. Real-time messaging will be available in a future release.</span>
        </div>

        <!-- Demo messages -->
        @for (msg of demoMessages; track msg.id) {
          <div class="chat-msg" [class.mine]="msg.mine">
            <div class="msg-bubble">
              <div class="msg-text">{{ msg.text }}</div>
              <div class="msg-time">{{ msg.time }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Input -->
      <div class="chat-input-wrap">
        <textarea
          class="chat-input"
          [(ngModel)]="messageText"
          (keydown.enter)="$event.preventDefault(); sendMessage()"
          rows="2"
          placeholder="Type a message... (Enter to send)">
        </textarea>
        <button class="chat-send" (click)="sendMessage()" [disabled]="!messageText.trim()">
          <span class="material-icons-round">send</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .chat-panel { display: flex; flex-direction: column; height: 100%; background: #fff; }

    .chat-header {
      background: linear-gradient(135deg, #2d5a27, #4a7c59);
      padding: 18px 20px; display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .chat-header-content { display: flex; align-items: center; gap: 12px; }
    .chat-header-content .material-icons-round { font-size: 26px; color: rgba(255,255,255,.85); }
    .chat-header-title { font-size: 16px; font-weight: 700; color: #fff; }
    .chat-header-sub   { font-size: 12px; color: rgba(255,255,255,.65); margin-top: 2px; }
    .chat-close {
      background: rgba(255,255,255,.15); border: none; border-radius: 8px;
      padding: 6px; cursor: pointer; color: #fff; display: flex; align-items: center;
      transition: background 0.15s;
    }
    .chat-close:hover { background: rgba(255,255,255,.25); }
    .chat-close .material-icons-round { font-size: 18px; }

    .chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }

    .chat-demo-notice {
      display: flex; align-items: center; gap: 8px;
      background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 8px; padding: 10px 14px;
      font-size: 12px; color: #92400e;
    }
    .chat-demo-notice .material-icons-round { font-size: 16px; flex-shrink: 0; }

    .chat-msg { display: flex; }
    .chat-msg.mine { justify-content: flex-end; }

    .msg-bubble {
      max-width: 70%; background: #f3f4f6; border-radius: 12px 12px 12px 2px;
      padding: 10px 14px; display: flex; flex-direction: column; gap: 4px;
    }
    .chat-msg.mine .msg-bubble {
      background: #2d5a27; border-radius: 12px 12px 2px 12px;
    }
    .msg-text { font-size: 14px; color: #111827; line-height: 1.4; }
    .chat-msg.mine .msg-text { color: #fff; }
    .msg-time { font-size: 11px; color: #9ca3af; }
    .chat-msg.mine .msg-time { color: rgba(255,255,255,.6); text-align: right; }

    .chat-input-wrap {
      border-top: 1px solid #e5e7eb; padding: 12px 16px;
      display: flex; gap: 10px; align-items: flex-end; flex-shrink: 0;
    }
    .chat-input {
      flex: 1; resize: none; border: 1px solid #d1d5db; border-radius: 8px;
      padding: 10px 12px; font-size: 14px; font-family: inherit; color: #111827;
      transition: border-color 0.15s;
    }
    .chat-input:focus { outline: none; border-color: #2d5a27; }
    .chat-send {
      background: #2d5a27; border: none; border-radius: 8px;
      padding: 10px 14px; cursor: pointer; color: #fff;
      display: flex; align-items: center; flex-shrink: 0;
      transition: background 0.15s;
    }
    .chat-send:hover { background: #1e3d1a; }
    .chat-send:disabled { opacity: .5; cursor: not-allowed; }
    .chat-send .material-icons-round { font-size: 18px; }
  `],
})
export class ChatDialogComponent {
  readonly data: ChatDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ChatDialogComponent>);

  messageText = '';

  demoMessages = [
    { id: 1, text: 'Hello, I have a question about this order.', time: '10:30 AM', mine: false },
    { id: 2, text: 'Sure, how can I help you?', time: '10:32 AM', mine: true },
    { id: 3, text: 'Can we adjust the hotel dates?', time: '10:33 AM', mine: false },
  ];

  sentMessages = signal<{ id: number; text: string; time: string; mine: boolean }[]>([]);

  sendMessage() {
    if (!this.messageText.trim()) return;
    this.demoMessages = [
      ...this.demoMessages,
      {
        id: Date.now(),
        text: this.messageText.trim(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        mine: true,
      },
    ];
    this.messageText = '';
  }

  close() { this.dialogRef.close(); }
}
