/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { ButtonType } from "../enums";
import { View } from "../core/view";
import { Label } from "./label";

export class Button extends View {
    public readonly label = new Label('button-label');

    private _type: ButtonType;

    constructor(...classes: readonly string[]) {
        super(...classes, 'button-view');

        this.isClickable = true;
        this.propaginateClickEvents = false;
        this.type = ButtonType.Default;

        this.appendChild(this.label);
    }

    public get type(): ButtonType { return this._type; }
    public set type(value: ButtonType) {
        if (this._type)
            this.removeClass(this._type);

        this._type = value;
        this.text = '#_' + value;

        this.addClass(value);
    }

    public get text(): string { return this.label.text; }
    public set text(value: string) { this.label.text = value; }

    public get isTextVisible(): boolean { return this.label.isVisible; }
    public set isTextVisible(value: boolean) { this.label.isVisible = value; }

    public get isTextHidden(): boolean { return this.label.isHidden; }
    public set isTextHidden(value: boolean) { this.label.isHidden = value; }
}