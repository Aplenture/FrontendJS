/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";

export class ImageView extends View {
    protected readonly image = document.createElement('img');

    constructor(...classes: readonly string[]) {
        super(...classes, 'image-view');

        this.div.appendChild(this.image);
    }

    public get source(): string { return this.image.src; }
    public set source(value: string) { this.image.src = value; }
}