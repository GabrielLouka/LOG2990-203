export class Action<T> {
    private funcs: ((arg: T) => void)[] = [];

    add(func: (arg: T) => void): void {
        this.funcs.push(func);
    }

    remove(func: (arg: T) => void): void {
        const index = this.funcs.indexOf(func);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (index !== -1) {
            this.funcs.splice(index, 1);
        }
    }

    invoke(arg: T): void {
        this.funcs.forEach((func) => func(arg));
    }
}
