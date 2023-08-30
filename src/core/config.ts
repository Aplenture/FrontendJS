/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

const KEY_STORAGE = 'config';

export class Config extends CoreJS.Config {
    public clear(): void { this.reset(); }

    public reset(): void {
        window.localStorage.removeItem(KEY_STORAGE);

        super.reset();
    }

    public load(): boolean {
        const data = window.localStorage.getItem(KEY_STORAGE);

        if (!data)
            return false;

        this.deserialize(data);

        return true;
    }

    public save() {
        window.localStorage.setItem(KEY_STORAGE, JSON.stringify(this));
    }
}