export default class CORSCommunicator {
    private target: HTMLIFrameElement | null;

    constructor(target: HTMLIFrameElement | null) {
        this.target = target;
    }

    send(message: object) {
        const stringified = JSON.stringify(message);
        if (this.target && this.target.contentWindow) {
            console.log('Sending message: ', stringified);
            this.target.contentWindow.postMessage(stringified, '*');
        }
    }

    receive(callback: (event: MessageEvent) => void) {
        window.addEventListener('message', callback);
    }
}
