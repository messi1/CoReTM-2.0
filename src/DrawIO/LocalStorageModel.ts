export default class LocalStorageModel {
    private storageKey: string;
    private repo: Storage;
    private callbacks: ((event: StorageEvent) => void)[];
    constructor(storageKey = 'diagram') {
        this.storageKey = storageKey
        this.repo = localStorage
        this.callbacks = []
    }
    observe(callback : (record : string) => void) {
        const key = this.storageKey
        this.callbacks.push((e: StorageEvent) => {
            if (e.key !== key) {
                return;
            }
            const record = e.newValue;
            if (record) {
                callback(record);
            }
        })
    }

    read(key = this.storageKey): any {
        return this.repo.getItem(key);
    }

    write(value: any, key: any = this.storageKey) {
        const oldValue = this.read(key);
        const event = new StorageEvent('storage', {
            key: key,
            oldValue: oldValue,
            newValue: value,
        });
        this.repo.setItem(key, value);
        this.callbacks.forEach(c => c(event));
    }
}
