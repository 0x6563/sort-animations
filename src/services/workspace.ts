export class Workspace {
    listmap: Map<Item[], number> = new Map();
    itemmap: Map<Item, number> = new Map();
    history: HistoryItem[] = [];
    main: Item[] = []
    lists: Item[][] = [];

    constructor(
        private source: number[],
        private enableHistory: boolean = false
    ) {
        this.reset();
    }


    move(target: Item[], a: Item, index?: number) {
        const listid = this.getListId(target);
        const list = this.getList(target);
        const item = this.getItem(a);
        if (item.list != listid) {
            this.remove(this.lists[item.list], item);
        }
        if (typeof index === 'number') {
            this.fill(list, index - 1);
        } else {
            index = list.length;
        }
        item.list = listid;
        item.index = index;
        list[index] = item;
        this.log('move', {
            target: listid,
            item: this.getItemId(item),
            index,
        }, 1);
    }

    swap(a: Item, b: Item) {
        const item1 = this.getItem(a);
        const item2 = this.getItem(b);
        const i1 = item1.index;
        const l1 = item1.list;
        const i2 = item2.index;
        const l2 = item2.list;
        item1.index = i2;
        item2.index = i1;
        item1.list = l2;
        item2.list = l1;
        this.lists[l2][i2] = item1;
        this.lists[l1][i1] = item2;
        this.log('swap', {
            a: this.getItemId(item1),
            b: this.getItemId(item2),
        }, 2);
    }

    createList() {
        const i = this.lists.length;
        const ary = [];
        this.listmap.set(ary, i);
        this.lists.push(ary);
        this.log('list', undefined, 1);
        return ary;
    }

    deleteList(source: Item[]) {
        const listid = this.getListId(source);
        const list = this.getList(source);
        this.lists.splice(listid, 1);
        for (let i = listid; i < this.lists.length; i++) {
            const list = this.lists[i];
            this.listmap.set(list, i);
            list.forEach((v) => (v.list = i));
        }
        this.log('delete', { list: listid });
    }

    reindex(source: Item[]) {
        const listid = this.getListId(source);
        const list = this.getList(source);
        const n = list.length;
        list.splice(0, n, ...list.filter(v => v.value))
        list.forEach((v, i) => (v.index = i));
        this.log('reindex', { list: listid }, n);
    }

    fill(source: Item[], length: number) {
        const list = this.getList(source);
        const listId = this.getListId(source);

        for (let i = list.length; i < length - 1; i++) {
            list.push({ $: i, index: i, value: 0, list: listId });
        }
    }

    compare(a: Item, b: Item) {
        const item1 = this.getItem(a);
        const item2 = this.getItem(b);
        this.log('compare', {
            a: this.getItemId(item1),
            b: this.getItemId(item2),
        }, 1);
        return item1.value - item2.value;
    }

    unhighlight() {
        this.log('unhighlight');
    }

    noAnimate() {
        this.log('noanimate')
    }

    animate() {
        this.log('animate');
    }

    custom(label: string, cost: number = 0) {
        this.log('custom', { label }, cost);
    }

    replay(replay: HistoryItem) {
        if (replay.operation == 'swap') {
            return this.swap(this.getItem(replay.arguments.a), this.getItem(replay.arguments.b));
        }
        if (replay.operation == 'compare') {
            return this.compare(this.getItem(replay.arguments.a), this.getItem(replay.arguments.b));
        }
        if (replay.operation == 'list') {
            return this.createList();
        }
        if (replay.operation == 'delete') {
            return this.deleteList(this.getList(replay.arguments.list));
        }
        if (replay.operation == 'move') {
            return this.move(this.getList(replay.arguments.target), this.getItem(replay.arguments.item), replay.arguments.index);
        }
        if (replay.operation == 'reindex') {
            return this.reindex(this.getList(replay.arguments.list))
        }
        if (replay.operation == 'custom' || replay.operation == 'animate' || replay.operation == 'noanimate' || replay.operation == 'unhighlight') {
            return;
        }
        throw 'Unhandled Replay';
    }

    reset() {
        this.listmap = new Map();
        this.itemmap = new Map();
        this.history = [];
        this.lists = [];
        this.main = [];
        for (let i = 0; i < this.source.length; i++) {
            const item = { $: i, index: i, value: this.source[i], list: 0 }
            this.main.push(item);
            this.itemmap.set(item, i);
        }
        this.lists.push(this.main.slice());
        this.listmap.set(this.lists[0], 0);
    }

    scope() {
        return {
            Move: (target: Item[], item: Item, index?: number) => this.move(target, item, index),
            Swap: (a: Item, b: Item) => this.swap(a, b),
            Compare: (a: Item, b: Item) => this.compare(a, b),
            List: () => this.createList(),
            Delete: (source: Item[]) => this.deleteList(source),
            Reindex: (source: Item[]) => this.reindex(source),
            Unhighlight: () => this.unhighlight(),
            NoAnimate: () => this.noAnimate(),
            Animate: () => this.animate(),
            Custom: (label: string, cost: number = 0) => this.custom(label, cost),

        }
    }

    private log(operation: HistoryItem['operation'], a: any = {}, cost: number = 0) {
        if (this.enableHistory) {
            this.history.push({
                cost,
                operation,
                arguments: a
            });
        }
    }

    private getListId(list: Item[] | number): number {
        return typeof list === 'number' ? list : this.listmap.get(list) as number;
    }

    getList(list: Item[] | number): Item[] {
        return typeof list === 'number' ? this.lists[list] : list;
    }

    getItem(item: Item | number): Item {
        return typeof item === 'number' ? this.main[item] : item;

    }

    private getItemId(item: Item | number): number {
        return typeof item === 'number' ? item : this.itemmap.get(item) as number;

    }

    private remove(source: Item[], item: Item) {
        const replacement: Item = {
            $: item.index,
            index: item.index,
            value: 0,
            list: item.list,
        };
        item.list = -1;
        const index = source.indexOf(item);
        if (index >= 0) {
            source.splice(index, 1, replacement);
        }
        return item;
    }
}

export interface Item {
    $: number;
    index: number;
    value: number;
    list: number;
}

export interface HistoryItem {
    cost: number;
    operation: 'custom' | 'swap' | 'compare' | 'noanimate' | 'animate' | 'unhighlight' | 'move' | 'list' | 'delete' | 'reindex';
    arguments: any;
}