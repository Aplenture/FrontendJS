/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { INavigationViewController } from "../interfaces";
import { ViewController } from "../core/viewController";

export class StackViewController extends ViewController implements INavigationViewController {
    public readonly onPush = new CoreJS.Event<StackViewController, ViewController>('StackViewController.onPush');
    public readonly onPop = new CoreJS.Event<StackViewController, ViewController>('StackViewController.onPop');

    private stack = new CoreJS.Lifo<ViewController>();

    constructor(...classes: string[]) {
        super(...classes, 'stack-view-controller');
    }

    public get currentViewController(): ViewController { return this.children[0]; }
    public get count(): number { return this.stack.count; }

    public async pushViewController(next: ViewController): Promise<void> {
        if (0 > super.appendChild(next))
            return Promise.resolve();

        while (1 < this.children.length) {
            this.stack.push(this.children[0]);
            super.removeChildAtIndex(0);
        }

        await this.load();

        this.focus();

        this.onPush.emit(this, next);

        return new Promise<void>(resolve => this.onPop.once(() => resolve(), { listener: this, args: next }));
    }

    public async popViewController(): Promise<ViewController> {
        const current = this.currentViewController;

        if (!current)
            return current;

        await this.unload();

        super.removeChildAtIndex(0);

        const next = this.stack.pop();

        if (next) {
            super.appendChild(next);

            await this.load();

            this.focus();
        }

        this.onPop.emit(this, current);

        return current;
    }

    public appendChild(child: ViewController): number {
        if (0 > super.appendChild(child))
            return -1;

        while (1 < this.children.length) {
            this.stack.push(this.children[0]);
            super.removeChildAtIndex(0);
        }

        this.load()
            .then(() => this.focus())
            .then(() => this.onPush.emit(this, child));

        return this.stack.count - 1;
    }

    public removeChild(child: ViewController): number {
        const index = super.removeChild(child);

        if (0 <= index)
            child.unload()
                .then(() => super.appendChild(this.stack.pop()))
                .then(() => this.load())
                .then(() => this.focus())
                .then(() => this.onPop.emit(this, child));

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = super.removeChildAtIndex(index);

        if (child)
            child.unload()
                .then(() => super.appendChild(this.stack.pop()))
                .then(() => this.load())
                .then(() => this.focus())
                .then(() => this.onPop.emit(this, child));

        return child;
    }

    public removeAllChildren(): void {
        let child = this.currentViewController;

        while (child) {
            child.unload()
                .then(() => this.onPop.emit(this, child));

            child = this.stack.pop();
        }

        super.removeAllChildren();
    }
}