/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { ButtonType, TitledLabelType } from "../enums";
import { Clipboard } from "../core/clipboard";
import { View } from "../core/view";
import { Button } from "./button";

export class TitledLabel extends View {
    protected readonly titleLabel = document.createElement('span');
    protected readonly valueLabel = document.createElement('span');

    private _type = TitledLabelType.Text;
    private _value = '';

    private _copyButton: Button;
    private _exposeButton: Button;

    constructor(...classes: readonly string[]) {
        super(...classes, 'titled-label-view');

        const container = document.createElement('div');

        this.titleLabel.innerText = '_label_title_';
        this.valueLabel.innerText = '_label_text_';

        container.appendChild(this.titleLabel);
        container.appendChild(this.valueLabel);

        this.div.append(container);
    }

    public get title(): string { return this.titleLabel.innerText; }
    public set title(value: string) { this.titleLabel.innerText = CoreJS.Localization.translate(value); }

    public get text(): string { return this._value; }
    public set text(value: string) {
        this._value = CoreJS.Localization.translate(value);
        this.valueLabel.innerText = this.isExposed
            ? this._value
            : '***';

        switch (this.type) {
            case TitledLabelType.Balance:
                if (0 > this.numberValue)
                    this.valueLabel.classList.add('negative');
                else
                    this.valueLabel.classList.remove('negative');
                break;
        }
    }

    public get type(): TitledLabelType { return this._type; }
    public set type(value: TitledLabelType) {
        this._type = value;
        this.exposeButton.isVisible = !this.isExposed;

        switch (value) {
            case TitledLabelType.Balance:
                if (0 > this.numberValue)
                    this.valueLabel.classList.add('negative');
                else
                    this.valueLabel.classList.remove('negative');
                break;

            default:
                this.valueLabel.classList.remove('negative');
                break;
        }
    }

    public get numberValue(): number { return Number(CoreJS.parseToNumeric(this.text)); }

    public get isExposed(): boolean { return this._type != TitledLabelType.Password; }
    public set isExposed(value: boolean) {
        this._type = value
            ? TitledLabelType.Text
            : TitledLabelType.Password;

        this.valueLabel.innerText = value
            ? this._value
            : '***';
    }

    public get copyButton(): Button {
        if (this._copyButton)
            return this._copyButton;

        this._copyButton = new Button('copy-button');
        this._copyButton.type = ButtonType.Copy;
        this._copyButton.onClick.on(() => Clipboard.copy(this.text, this.title));
        this.appendChild(this._copyButton);

        return this._copyButton;
    }

    public get exposeButton(): Button {
        if (this._exposeButton)
            return this._exposeButton;

        this._exposeButton = new Button('expose-button');
        this._exposeButton.type = ButtonType.Expose;
        this._exposeButton.onClick.on(() => this.isExposed = !this.isExposed);
        this.appendChild(this._exposeButton);

        return this._exposeButton;
    }
}