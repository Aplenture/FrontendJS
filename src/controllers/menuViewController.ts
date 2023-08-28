/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { View } from "../core/view";
import { ViewController } from "../core/viewController";
import { Bar, MenuView, TabBar, TitleBar } from "../views";
import { ContainerViewController } from "./containerViewController";

export class MenuViewController extends ViewController {
    public readonly onSelected = new CoreJS.Event<MenuViewController, number>('MenuViewController.onSelected');

    public readonly containerViewController = new ContainerViewController();

    public readonly menuView: MenuView;
    public readonly tabBar: TabBar;

    private readonly _viewControllers: ViewController[] = [];

    private _selectedIndex = -1;

    constructor(...classes: string[]) {
        super(...classes, 'menu-view-controller');

        const relativeViewController = new ViewController('relative');

        this.menuView = new MenuView(...classes, 'menu-menu-view');
        this.tabBar = new TabBar(...classes, 'menu-tab-bar');

        this.menuView.onItemClicked.on(index => this.selectedIndex = index);
        this.menuView.onItemClicked.on(index => this.onSelected.emit(this, index));

        this.tabBar.onItemClicked.on(index => this.selectedIndex = index);
        this.tabBar.onItemClicked.on(index => this.onSelected.emit(this, index));

        this.view.appendChild(this.menuView);

        relativeViewController.appendChild(this.containerViewController);

        super.appendChild(relativeViewController);

        this.containerViewController.view.appendChild(this.tabBar);
    }

    public get children(): readonly ViewController[] { return this._viewControllers; }
    public get contentView(): View { return this.containerViewController.contentViewController.view; }

    public get titleBar(): TitleBar { return super.titleBar; }
    public set titleBar(value: TitleBar) {
        super.titleBar = value;
        this._viewControllers.forEach(controller => controller.titleBar = value);
    }

    public get footerBar(): Bar { return super.footerBar; }
    public set footerBar(value: Bar) {
        super.footerBar = value;
        this._viewControllers.forEach(controller => controller.footerBar = value);
    }

    public get selectedViewController(): ViewController { return this._viewControllers[this._selectedIndex]; }

    public get selectedIndex(): number { return this._selectedIndex; }
    public set selectedIndex(value: number) {
        if (value == this.selectedIndex)
            return;

        if (value < 0 || this._viewControllers.length <= value)
            throw new Error(`selected index (${value}) is out of bounds [0,${this._viewControllers.length - 1}]`);

        const current = this._viewControllers[this._selectedIndex];
        const next = this._viewControllers[value];

        this._selectedIndex = value;

        if (current) {
            current.unload();
            this.containerViewController.removeChild(current);
        }

        this.containerViewController.appendChild(next);

        this.menuView.selectedIndex = value;
        this.tabBar.selectedIndex = value;

        this.load().then(() => this.focus());
    }

    public async load(): Promise<void> {
        if (0 > this.selectedIndex && this._viewControllers.length)
            this.selectedIndex = 0;
        else
            await super.load();
    }

    public focus(): void {
        if (this.selectedViewController)
            this.selectedViewController.focus();
    }

    public enableViewController(index: number, enabled = true) {
        if (0 > index)
            return;

        if (index >= this.children.length)
            return;

        this.menuView.children[index].isDisabled = !enabled;
        this.tabBar.children[index].isDisabled = !enabled;
    }

    public disableViewController(index: number) {
        this.enableViewController(index, false);
    }

    public appendChild(viewController: ViewController, title = viewController.title || '_missing_title_'): number {
        const index = this._viewControllers.push(viewController) - 1;

        viewController.titleBar = this.titleBar;
        viewController.footerBar = this.footerBar;

        this.menuView.addItem(title);
        this.tabBar.addItem(title);

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = this._viewControllers.indexOf(child);

        if (0 <= index) {
            this._viewControllers.splice(index, 1);
            this.menuView.removeChildAtIndex(index);
            this.tabBar.removeChildAtIndex(index);
        }

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = this._viewControllers[index];

        if (child) {
            this._viewControllers.splice(index, 1);
            this.menuView.removeChildAtIndex(index);
            this.tabBar.removeChildAtIndex(index);
        }

        return child;
    }

    public removeAllChildren() {
        this._viewControllers.forEach(controller => controller.unload());
        this._viewControllers.splice(0);

        this.containerViewController.removeAllChildren();
        this.menuView.removeAllChildren();
        this.tabBar.removeAllChildren();
    }
}