/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { TableSelectionMode } from "../enums";
import { View } from "../core/view";

export class TableView extends View {
    private _selectionMode = TableSelectionMode.None;

    constructor(...classes: string[]) {
        super(...classes, 'table-view');

        this.alternatingBackgroundColor = true;
    }

    public get selectedCells(): readonly View[] {
        return this.findCells().filter(child => child.isSelected);
    }

    public get selectedCellIndices(): readonly number[] {
        const cells = this.findCells();

        return cells
            .map((_, index) => index)
            .filter(index => cells[index].isSelected);
    }

    public get selectionMode(): TableSelectionMode { return this._selectionMode; }
    public set selectionMode(value: TableSelectionMode) {
        this._selectionMode = value;
        this.findCells().forEach(cell => cell.isClickable = value != TableSelectionMode.None);
    }

    public get alternatingBackgroundColor(): boolean { return this.hasClass('alternatingBackgroundColor'); }
    public set alternatingBackgroundColor(value: boolean) {
        if (value)
            this.addClass('alternatingBackgroundColor');
        else
            this.removeClass('alternatingBackgroundColor');
    }

    public appendHeader(view: View) {
        if (!view.hasClass('header'))
            view.addClass('header');

        this.removeChild(this.findHeader());
        this.appendChild(view);

        // reappend children after header
        this.children.forEach(child => this.appendChild(child));
    }

    public appendCategory(view: View) {
        if (!view.hasClass('category'))
            view.addClass('category');

        this.appendChild(view);
    }

    public appendCell(view: View) {
        if (!view.hasClass('cell'))
            view.addClass('cell');

        this.appendChild(view);
    }

    public findHeader(): View {
        return this.children.find(child => child.hasClass('header'));
    }

    public findCategories(): readonly View[] {
        return this.children.filter(child => child.hasClass('category'));
    }

    public findCells(): readonly View[] {
        return this.children.filter(child => child.hasClass('cell'));
    }
}