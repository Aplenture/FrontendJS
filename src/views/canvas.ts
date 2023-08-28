/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";

export class Canvas extends View {
    protected readonly canvas = document.createElement('canvas');

    constructor(...classes: readonly string[]) {
        super(...classes, 'canvas-view');

        this.div.appendChild(this.canvas);
    }
}