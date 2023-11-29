/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";
import { ViewController } from "../core/viewController";

export class LoadingViewController extends ViewController {
    constructor(...classes: readonly string[]) {
        super(...classes, 'loading-view-controller');
    }

    public async init(): Promise<void> {
        const animationView = new View('animation-view');

        for (let i = 1; i <= 12; ++i)
            animationView.appendChild(new View(i.toString()));

        this.view.appendChild(animationView);

        this.stop();

        await super.init();
    }

    public play() {
        this.view.isVisible = true;
    }

    public stop() {
        this.view.isVisible = false;
    }
}