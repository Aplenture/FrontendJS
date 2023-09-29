/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Router } from "../../core";

const KEY_API = 'api';
const KEY_SECRET = 'secret';

interface Options {
    readonly rights?: number;
    readonly expiration?: number;
    readonly label?: string;
}

export class Access {
    public rights: number;
    public expiration: number;
    public label: string;

    constructor(
        public readonly api: string,
        public readonly secret: string,
        options: Options = {}
    ) {
        this.rights = options.rights || 0;
        this.expiration = options.expiration || null;
        this.label = options.label || '';
    }

    public static fromHex(value: string): Access {
        const data = CoreJS.Serialization.fromHex(value);

        return new Access(data[0], data[1]);
    }

    public static fromURL(): Access | null {
        const api = Router.route.get(KEY_API);
        const secret = Router.route.get(KEY_SECRET);

        Router.route.delete(KEY_API);
        Router.route.delete(KEY_SECRET);

        if (!api)
            return null;

        if (!secret)
            return null;

        return new Access(api, secret);
    }

    public static fromStorage(key: string): Access | null {
        const data = window.sessionStorage.getItem(key)
            || window.localStorage.getItem(key);

        if (!data)
            return null;

        return Access.fromHex(data);
    }

    public static deserialize(key: string, allowFromURL = true): Access | null {
        if (allowFromURL) {
            const access = this.fromURL();

            if (access)
                return access;
        }

        return this.fromStorage(key);
    }

    public serialize(key: string, keepLogin = false) {
        if (keepLogin) {
            window.localStorage.setItem(key, this.toHex());
            window.sessionStorage.removeItem(key);
        } else {
            window.sessionStorage.setItem(key, this.toHex());
            window.localStorage.removeItem(key);
        }
    }

    public parametrize(): string {
        return CoreJS.URLArgsToString({
            api: this.api,
            secret: this.secret
        });
    }

    public sign(message: string): string {
        return CoreJS.createSign(message, this.secret);
    }

    public hasRights(rights: number): boolean {
        return 0 != (this.rights & rights);
    }

    public reset(key: string) {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
    }

    public toString(): string {
        return this.toHex();
    }

    public toHex(): string {
        return CoreJS.Serialization.toHex([this.api, this.secret]);
    }
}