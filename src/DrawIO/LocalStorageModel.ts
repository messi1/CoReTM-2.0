export default class LocalStorageModel {
    private storageKey: string;
    private repo: Storage;
    private callbacks: any[];
    constructor(storageKey = 'diagram') {
        this.storageKey = storageKey
        this.repo = localStorage
        this.callbacks = []
    }
    observe(callback : any) {
        var key = this.storageKey
        this.callbacks.push(function (e: { key: string; newValue: string; }) {
            //console.log('callback fire!')
            if (e.key !== key) {
                return
            }

            var record = JSON.parse(e.newValue)
            callback(record)
        })
    }

    read(key = this.storageKey) {
        var item = localStorage.getItem(key)
        // @ts-ignore
        return JSON.parse(item)
    }

    write(value : any, key = this.storageKey) {
        // @ts-ignore
        if (typeof value !== String) {
            value = JSON.stringify(value)
        }

        // Dispatch StorageEvent manually for subscribers
        // in same browser context
        const event = new StorageEvent('storage', {
            key: key,
            oldValue: this.read(key),
            newValue: value,
        })

        localStorage.setItem(key, value)
        this.callbacks.forEach(c => c(event))
    }
}
