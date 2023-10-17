/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { View } from "../core/view";

export class Dropbox extends View {
    public readonly onSelected = new CoreJS.Event<Dropbox, number>('Dropbox.onSelected');

    protected readonly label = document.createElement('span');
    protected readonly select = document.createElement('select');

    private _options: readonly HTMLOptionElement[];

    constructor(...classes: readonly string[]) {
        super(...classes, 'dropbox-view');

        this.propaginateClickEvents = false;
        this.title = '_dropbox_title_';
        this.options = [''];

        this.div.appendChild(this.label);
        this.div.appendChild(this.select);

        this.select.addEventListener('change', () => this.onSelected.emit(this, this.select.selectedIndex));
    }

    public get title(): string { return this.label.innerText; }
    public set title(value: string) { this.label.innerText = CoreJS.Localization.translate(value); }

    public get options(): readonly string[] { return this._options.map(option => option.text); }
    public set options(value: readonly string[]) {
        this.select.innerText = '';

        this._options = value.map(text => {
            const element = document.createElement('option');

            element.text = CoreJS.Localization.translate(text);

            this.select.appendChild(element);

            return element;
        });
    }

    public get hasFocus(): boolean { return document.activeElement == this.select; }

    public get selectedIndex(): number { return this.select.selectedIndex; }
    public set selectedIndex(value: number) { this.select.selectedIndex = value; }

    public get multipleSelectionEnabled(): boolean { return this.select.multiple; }
    public set multipleSelectionEnabled(value: boolean) { this.select.multiple = value; }

    public get selectedIndices(): readonly number[] {
        return this._options
            .map((option, index) => index)
            .filter(index => this._options[index].selected);
    }

    public set selectedIndices(value: readonly number[]) {
        this._options.forEach((option, index) => option.selected = value.includes(index));
    }

    public focus() {
        this.select.focus();
    }
}