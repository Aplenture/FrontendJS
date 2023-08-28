/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";
import { Bar } from "./bar";
import { Label } from "./label";

export class TitleBar extends Bar {
    public readonly leftView = new View('left');
    public readonly middleView = new View('middle');
    public readonly rightView = new View('right');
    public readonly titleLabel = new Label('title');

    constructor(...classes: string[]) {
        super(...classes, 'title-bar-view');

        this.appendChild(this.leftView);
        this.appendChild(this.middleView);
        this.appendChild(this.rightView);

        this.middleView.appendChild(this.titleLabel);
    }

    public get title(): string { return this.titleLabel.text; }
    public set title(value: string) { this.titleLabel.text = value; }
}