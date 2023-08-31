/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Bar, TitleBar } from "../views";
import { View } from "./view";
import { ClientPreparer, Module } from "../interfaces";

export class ViewController implements Module<ClientPreparer, void> {
    public readonly onLoaded = new CoreJS.Event<ViewController, void>('ViewController.onLoaded');
    public readonly onUnloaded = new CoreJS.Event<ViewController, void>('ViewController.onUnloaded');

    public readonly view: View;

    public title: string;
    public index: number = null;
    public isEditable = false;

    private _titleBar: TitleBar;
    private _footerBar: Bar;

    private readonly _children: ViewController[] = [];

    private _parent: ViewController;

    constructor(...classes: readonly string[]) {
        this.view = new View(...classes, 'view-controller');
    }

    public get parent(): ViewController { return this._parent; }
    public get children(): readonly ViewController[] { return this._children; }

    public get titleBar(): TitleBar { return this._titleBar; }
    public set titleBar(value: TitleBar) { this._titleBar = value; }

    public get footerBar(): Bar { return this._footerBar; }
    public set footerBar(value: Bar) { this._footerBar = value; }

    public async prepare(preparer: ClientPreparer): Promise<void> {
        await Promise.all(this._children.map(child => child.prepare(preparer)));
    }

    public async init() {
        await Promise.all(this._children.map(child => child.init()));
    }

    public async load() {
        await Promise.all(this._children.map(child => child.load()));

        this.onLoaded.emit(this);
    }

    public async loaded() {
        await Promise.all(this._children.map(child => child.loaded()));
    }

    public async unload() {
        await Promise.all(this._children.map(child => child.unload()));

        this.onUnloaded.emit(this);
    }

    public focus() {
        this.view.focus();
        this._children.forEach(child => child.focus());
    }

    public appendChild(child: ViewController): number {
        if (!child)
            return -1;

        if (child._parent)
            child._parent.removeChild(child);

        child._parent = this;

        this.view.appendChild(child.view);

        return this._children.push(child) - 1;
    }

    public removeChild(child: ViewController): number {
        const index = this._children.findIndex(tmp => tmp == child);

        if (0 <= index) {
            this._children.splice(index, 1);
            this.view.removeChild(child.view);

            child._parent = null;
        }

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        if (index < 0)
            return null;

        if (index >= this._children.length)
            return null;

        const child = this._children[index];

        this._children.splice(index, 1);
        this.view.removeChild(child.view);

        child._parent = null;

        return child;
    }

    public removeAllChildren() {
        this._children.forEach(child => {
            this.view.removeChild(child.view);
            child._parent = null;
        });

        this._children.splice(0, this._children.length);
    }

    public removeFromParent() {
        if (!this._parent)
            return;

        this._parent.removeChild(this);
    }
}