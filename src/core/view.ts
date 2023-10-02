/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Bounds } from "../interfaces";

export class View {
    public readonly onClick = new CoreJS.Event<View, void>('View.onClick');
    public readonly onEnterKey = new CoreJS.Event<View, void>('View.onEnterKey');
    public readonly onEscapeKey = new CoreJS.Event<View, void>('View.onEscapeKey');
    public readonly onHiddenChanged = new CoreJS.Event<View, boolean>('View.onHiddenChanged');
    public readonly onScrolled = new CoreJS.Event<View, void>('View.onScrolled');

    public index: number = null;
    public propaginateClickEvents = true;
    public propaginateKeyEvents = true;

    protected readonly div = document.createElement('div');

    private readonly _children: View[] = [];

    private _parent: View;

    constructor(...classes: string[]) {
        classes.push('view');
        classes.forEach(c => this.div.classList.add(c));

        this.div.addEventListener('mousedown', event => event.detail > 1 && event.preventDefault(), false);
        this.div.addEventListener('scroll', _ => this.onScrolled.emit(this), false);

        this.div.addEventListener('click', event => {
            this.onClick.emit(this);

            if (!this.propaginateClickEvents)
                event.stopPropagation();
        });

        this.div.addEventListener("keydown", event => {
            switch (event.key) {
                case 'Enter':
                    this.onEnterKey.emit(this);
                    break;

                case 'Escape':
                    this.onEscapeKey.emit(this);
                    break;
            }

            if (!this.propaginateKeyEvents)
                event.stopPropagation();
        });
    }

    public get className(): string { return this.div.className; }

    public get id(): string { return this.div.id; }
    public set id(value: string) { this.div.id = value; }

    public get parent(): View { return this._parent; }
    public get children(): readonly View[] { return this._children; }

    public get hasFocus(): boolean { return document.activeElement == this.div; }

    public get tabIndex(): number { return this.div.tabIndex; }
    public set tabIndex(value: number) { this.div.tabIndex = value; }

    public get width(): number { return this.div.offsetWidth };
    public get height(): number { return this.div.offsetHeight };

    public get description(): string { return this.div.title; }
    public set description(value: string) { this.div.title = CoreJS.Localization.translate(value); }

    public get isVisible(): boolean { return !this.isHidden; }
    public set isVisible(value: boolean) { this.isHidden = !value; }

    public get isEnabled(): boolean { return !this.isDisabled; }
    public set isEnabled(value: boolean) { this.isDisabled = !value; }

    public get isHidden() { return this.div.classList.contains('hidden'); }
    public set isHidden(value) {
        if (value)
            this.div.classList.add('hidden');
        else
            this.div.classList.remove('hidden');

        this.onHiddenChanged.emit(this, value);
    }

    public get isDisabled(): boolean { return this.div.classList.contains('disabled'); }
    public set isDisabled(value: boolean) {
        if (value)
            this.div.classList.add('disabled');
        else
            this.div.classList.remove('disabled');
    }

    public get isSelected(): boolean { return this.div.classList.contains('selected'); }
    public set isSelected(value: boolean) {
        if (value)
            this.div.classList.add('selected');
        else
            this.div.classList.remove('selected');
    }

    public get isClickable(): boolean { return this.div.classList.contains('clickable'); }
    public set isClickable(value: boolean) {
        if (value)
            this.div.classList.add('clickable');
        else
            this.div.classList.remove('clickable');
    }

    public get isNegative(): boolean { return this.div.classList.contains('negative'); }
    public set isNegative(value: boolean) {
        if (value)
            this.div.classList.add('negative');
        else
            this.div.classList.remove('negative');
    }

    public get backgroundColor(): string { return this.div.style.background; }
    public set backgroundColor(value: string) { this.div.style.background = value; }

    public get bounds(): Bounds { return this.div.getBoundingClientRect(); }

    public scrollBy(x: number, y: number) {
        this.div.scrollBy({
            top: y,
            left: x,
            behavior: "smooth"
        });
    }

    public scrollTo(x: number, y: number) {
        this.div.scrollTo({
            top: y,
            left: x,
            behavior: "smooth"
        });
    }

    public focus() {
        this.div.focus();
        this._children.forEach(child => child.focus());
    }

    public click() {
        this.onClick.emit(this);
    }

    public hasClass(value: string): boolean {
        return this.div.classList.contains(value);
    }

    public addClass(value: string) {
        this.div.classList.add(value);
    }

    public removeClass(value: string) {
        this.div.classList.remove(value);
    }

    public appendChild(child: View): number {
        if (!child)
            return -1;

        if (child.parent)
            child.parent.removeChild(child);

        child._parent = this;

        this.div.appendChild(child.div);

        return this._children.push(child) - 1;
    }

    public removeChild(child: View): number {
        let result: number;

        this.div.childNodes.forEach((node, index) => {
            if (node !== child.div)
                return;

            result = index;

            child._parent = null;

            this._children.splice(index, 1);
            this.div.removeChild(node);
        });

        return result;
    }

    public removeChildAtIndex(index: number): View {
        if (index < 0)
            return null;

        if (index >= this._children.length)
            return null;

        const child = this._children[index];

        child._parent = null;

        this._children.splice(index, 1);
        this.div.removeChild(this.div.childNodes[index]);

        return child;
    }

    public removeAllChildren() {
        this._children.forEach(child => {
            this.div.removeChild(child.div);
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