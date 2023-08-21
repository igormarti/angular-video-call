import { ElementRef, Injectable } from "@angular/core";
import { SocketService } from "./socket.service";
import Config from '../configs/rtcConfig.config';

@Injectable({
    providedIn:"root"
})
export class CallService{

    private connection!: RTCPeerConnection;

    constructor(private readonly SocketService:SocketService){}


    public async makeCall(videoEle: ElementRef): Promise<void>{
        this.initConnection(videoEle);

        const offer = await this.connection.createOffer();

        this.connection.setLocalDescription(offer);

        this.SocketService.sendMessage(offer);
    }

    public async handleOffer(
        offer: RTCSessionDescription,
        remoteVideo: ElementRef
      ): Promise<void> {
        await this.initConnection(remoteVideo);
    
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
    
        const answer = await this.connection.createAnswer();
    
        await this.connection.setLocalDescription(answer);
    
        this.SocketService.sendMessage({ type: 'answer', answer });
      }
    
      public async handleAnswer(answer: RTCSessionDescription): Promise<void> {
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    
      public async handleCandidate(candidate: RTCIceCandidate): Promise<void> {
        if (candidate) {
          await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }

    private async initConnection(videoEle: ElementRef): Promise<void>{
        this.connection = new RTCPeerConnection(Config);

        await this._getStreams(videoEle);

        this._registerConnectionListeners();
    }

    private async _getStreams(videoEle: ElementRef): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia ({
          video: true,
          audio: true,
        });
        const remoteStream = new MediaStream();
    
        videoEle.nativeElement.srcObject = remoteStream;
    
        this.connection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        };
    
        stream.getTracks().forEach((track) => {
          this.connection.addTrack(track, stream);
        });
      }

      private _registerConnectionListeners(): void {
        this.connection.onicegatheringstatechange = (ev: Event) => {
          console.log(
            `ICE gathering state changed: ${this.connection.iceGatheringState}`
          );
        };
    
        this.connection.onconnectionstatechange = () => {
          console.log(
            `Connection state change: ${this.connection.connectionState}`
          );
        };
    
        this.connection.onsignalingstatechange = () => {
          console.log(`Signaling state change: ${this.connection.signalingState}`);
        };
    
        this.connection.oniceconnectionstatechange = () => {
          console.log(
            `ICE connection state change: ${this.connection.iceConnectionState}`
          );
        };
        this.connection.onicecandidate = (event) => {
          if (event.candidate) {
            const payload = {
              type: 'candidate',
              candidate: event.candidate.toJSON(),
            };
            this.SocketService.sendMessage(payload);
          }
        };
      }
}