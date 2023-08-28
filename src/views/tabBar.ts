/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { View } from "../core/view";
import { Bar } from "./bar";
import { Label } from "./label";

export class TabBar extends Bar {
    public readonly onItemClicked = new CoreJS.Event<TabBar, number>('TabBar.onItemClicked');

    constructor(...classes: string[]) {
        super(...classes, 'tab-bar-view');
    }

    public get selectedIndex(): number { return this.children.findIndex(child => child.isSelected); }
    public set selectedIndex(value: number) {
        if (value == this.selectedIndex)
            return;

        this.children.forEach((view, index) => view.isSelected = index == value);
    }

    public addItem(title: string): number {
        const item = new View('item', title);
        const label = new Label();

        label.text = title;

        item.appendChild(label);

        return this.appendChild(item);
    }

    public appendChild(child: View): number {
        const index = super.appendChild(child);

        child.isClickable = true;
        child.propaginateClickEvents = false;

        child.onClick.on(() => this.selectedIndex = index);
        child.onClick.on(() => this.onItemClicked.emit(this, index));

        return index;
    }
}