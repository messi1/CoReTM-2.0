export default class CORSCommunicator {
    private target: any;
    constructor (target : any) {
        this.target = target
    }
    send (message : any) {
        var stringified = JSON.stringify(message);
        if (this.target && this.target.contentWindow) {
            this.target.contentWindow.postMessage(stringified, '*');
        }

    }
    receive (callback : any) {
        window.addEventListener('message', callback)
    }
}
