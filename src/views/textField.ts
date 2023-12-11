/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { View } from "../core/view";

export enum TextFieldType {
    Text = 'text',
    Password = 'password',
    Date = 'date',
    Number = 'number',
    Currency = 'currency',
    Color = 'color'
}

export class TextField extends View {
    public readonly onChange = new CoreJS.Event<TextField, string>('TextField.onChange');

    protected readonly label = document.createElement('span');
    protected readonly input = document.createElement('input');

    private _type = TextFieldType.Text;

    constructor(...classes: readonly string[]) {
        super(...classes, 'text-field-view');

        this.propaginateClickEvents = false;
        this.title = '_text_field_title_';

        this.div.appendChild(this.label);
        this.div.appendChild(this.input);

        this.input.type = this._type;
        this.input.addEventListener("input", (event: InputEvent) => this.onChange.emit(this, event.data));

        this.label.innerText = '_text_field_label_';

        this.onChange.on(() => {
            switch (this._type) {
                case TextFieldType.Number:
                    this.input.value = CoreJS.parseToNumeric(this.input.value);
                    break;

                case TextFieldType.Currency:
                    const selectionStart = this.input.selectionStart;
                    const initialLength = this.input.value.length;

                    this.input.value = CoreJS.formatCurrency(Number(CoreJS.parseToNumeric(this.input.value)));

                    const deltaLength = this.input.value.length - initialLength;
                    const selectionIndex = Math.min(selectionStart + deltaLength, this.input.value.length - 2);

                    this.input.setSelectionRange(selectionIndex, selectionIndex);
                    break;
            }
        });
    }


    public get isReadonly(): boolean { return this.input.readOnly; }
    public set isReadonly(value: boolean) { this.input.readOnly = value; }

    public get hasFocus(): boolean { return document.activeElement == this.input; }

    public get type(): TextFieldType { return this._type; }
    public set type(value: TextFieldType) {
        this._type = value;

        switch (value) {
            case TextFieldType.Currency:
                this.input.type = 'text';
                this.input.value = CoreJS.formatCurrency(Number(CoreJS.parseToNumeric(this.input.value)));
                break;

            case TextFieldType.Number:
                this.input.type = value;
                this.input.value = CoreJS.parseToNumeric(this.input.value);
                break;

            default:
                this.input.type = value;
                break;
        }
    }

    public get title(): string { return this.label.innerText; }
    public set title(value: string) { this.label.innerText = CoreJS.Localization.translate(value); }

    public get isTitleVisible(): boolean { return !this.isTitleHidden; }
    public set isTitleVisible(value: boolean) { this.isTitleHidden = !value; }

    public get isTitleHidden() { return this.label.classList.contains('hidden'); }
    public set isTitleHidden(value) {
        if (value)
            this.label.classList.add('hidden');
        else
            this.label.classList.remove('hidden');
    }

    public get value(): string {
        return this._type == TextFieldType.Currency
            ? CoreJS.parseToNumeric(this.input.value)
            : this.input.value;
    }

    public set value(value: string) {
        switch (this._type) {
            case TextFieldType.Currency:
                this.input.value = CoreJS.formatCurrency(Number(CoreJS.parseToNumeric(value)));
                break;

            case TextFieldType.Number:
                this.input.value = CoreJS.parseToNumeric(value);
                break;

            default:
                this.input.value = value;
                break;
        }
    }

    public get dateValue(): Date { return CoreJS.calcDate({ date: new Date(this.value) }); }
    public set dateValue(value: Date) { this.value = CoreJS.formatDate("YYYY-MM-DD", value); }

    public get numberValue(): number { return Number(this.value); }
    public set numberValue(value: number) { this.value = value.toString(); }

    public get placeholder(): string { return this.input.placeholder; }
    public set placeholder(value: string) { this.input.placeholder = CoreJS.Localization.translate(value); }

    public get selectionStart() { return this.input.selectionStart; }
    public get selectionRange() { return this.input.selectionEnd - this.input.selectionStart; }

    public focus() {
        this.input.focus();
    }

    public selectRange(start?: number, end = this.value.length) {
        this.input.setSelectionRange(start, end);
    }
}