import { Injectable } from '@nestjs/common';

export interface ListItem {
    name: string,
    id?: number
}

@Injectable()
export class ListService {
    list: ListItem[] = [];

    getList(): ListItem[] {
        console.log("get")
        return this.list;
    }

    addItem(newItem: ListItem): ListItem[] {
        console.log("add")
        if (this.list.length) {
            newItem.id = Math.max(...this.list.map(i => i.id as number)) + 1;
        } else {
            newItem.id = 1
        };

        this.list.push(newItem);
        return this.list;
    }

    editItem(id: number, item: ListItem): ListItem[] {
        console.log("edit", id, item)
        this.list = this.list.map(i => {
            if (i.id == id) {
                return { ...i, name: item.name }
            } else {
                return i
            }
        })

        return this.list;
    }

    deleteItem(id: number): ListItem[] {
        console.log("delete", id)
        this.list = this.list.filter(i => i.id != id);

        return this.list;
    }
}
