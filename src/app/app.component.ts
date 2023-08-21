import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SocketService } from './services/socket.service';
import { CallService } from './services/call.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
 
  @ViewChild('remoteVideo')
  remoteVideo!: ElementRef;

  constructor(
    private readonly socketService: SocketService,
    private readonly callService: CallService,
  ) {}

  ngOnInit(): void {
    this.socketService.getMessages().subscribe((payload) => this._handleMessage(payload));
  }

  public async makeCall(): Promise<void> {
    this.callService.makeCall(this.remoteVideo)
  }

  private async _handleMessage(data:any): Promise<void> {
    
    switch (data.type) {
      case 'offer':
       await this.callService.handleOffer(data.offer, this.remoteVideo);
        break;

      case 'answer':
       await this.callService.handleAnswer(data.answer);
        break;

      case 'candidate':
        this.callService.handleCandidate(data.candidate);
        break;

      default:
        break;
    }
  }

}
