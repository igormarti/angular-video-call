import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import {Observable} from 'rxjs'


@Injectable({
    providedIn: "root"
})
export class SocketService {

    constructor(private readonly socketClientIO: Socket) {}

    getMessages():Observable<any> {
        return this.socketClientIO.fromEvent('message')
    }

    sendMessage(payload: any): void {
        this.socketClientIO.emit('send-message', payload);
    }
}