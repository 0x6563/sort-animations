export class Constant {
    #v: any;
    get value() {
        return this.#v;
    }
    constructor(value: any) {
        this.#v = value;
    }
}