/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export abstract class Clipboard {
    public static readonly onCopy = new CoreJS.Event<void, string>('Clipboard.onCopy');

    public static async canCopy(): Promise<boolean> {
        try {
            const permission = await navigator.permissions.query({ name: "clipboard-write" } as any);

            return permission.state == 'granted';
        } catch (error) {
            return false;
        }
    }

    public static async copy(value: string, key = ''): Promise<void> {
        await navigator.clipboard.writeText(value);

        this.onCopy.emit(null, key);
    }
}