import type { Snackbar } from "../types";

let nextId = 0;
const items: Snackbar[] = $state([]);

// Items are $state proxies, so snackbars are matched by id, not identity.
const close = (snackbar: Snackbar) => {
    const index = items.findIndex((item) => item.id === snackbar.id);
    if (index !== -1) items.splice(index, 1);
};

export const snacks = {
    get items() {
        return items;
    },
    addSnack: (snackbar: Snackbar) => {
        const toAdd: Snackbar = { ...snackbar, id: nextId++ };
        items.push(toAdd);
        if (snackbar.timeout !== undefined && snackbar.timeout > 0) {
            setTimeout(() => close(toAdd), snackbar.timeout);
        }
    },
    close,
};
