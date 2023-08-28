/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";
import { Bar, TitleBar } from "../views";
import { ContainerViewController } from "./containerViewController";

export class BodyViewController extends ContainerViewController {
    constructor(...classes: string[]) {
        super(...classes, 'body-view-controller');

        this.titleBar = new TitleBar(...classes, 'body-title-bar');
        this.footerBar = new Bar(...classes, 'body-footer-bar');

        this.view.appendChild(this.titleBar);
        this.view.appendChild(this.contentView);
        this.view.appendChild(this.footerBar);
    }

    public get contentView(): View { return this.contentViewController.view; }
}