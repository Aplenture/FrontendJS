/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { TableSelectionMode } from "../enums";
import { GridViewControllerDataSource } from "../interfaces";
import { View } from "../core/view";
import { ViewController } from "../core/viewController";
import { GridView, Label } from "../views";

export class GridViewController extends ViewController {
    public readonly onSelectedCell = new CoreJS.Event<GridViewController, View>('GridViewController.onSelectedCell');
    public readonly onDeselectedCell = new CoreJS.Event<GridViewController, View>('GridViewController.onSelectedCell');

    public readonly titleLabel = new Label('title');
    public readonly gridView = new GridView();

    public dataSource: GridViewControllerDataSource;

    private _cells: View[] = [];

    constructor(...classes: string[]) {
        super(...classes, 'grid-view-controller');

        this.titleLabel.text = 'grid title';

        this.view.appendChild(this.titleLabel);
        this.view.appendChild(this.gridView);
    }

    public get cells(): readonly View[] { return this._cells; }

    public get selectionMode(): TableSelectionMode { return this.gridView.selectionMode; }
    public set selectionMode(value: TableSelectionMode) { this.gridView.selectionMode = value; }

    public get canScrollTop(): boolean { return this.cells[0].bounds.top < this.gridView.bounds.top; }
    public get canScrollBottom(): boolean { return this.cells[this.cells.length - 1].bounds.bottom > this.gridView.bounds.bottom; }

    public get canScrollLeft(): boolean { return this.cells[0].bounds.left < this.gridView.bounds.left; }
    public get canScrollRight(): boolean { return this.cells[this.cells.length - 1].bounds.right > this.gridView.bounds.right; }

    public load(): Promise<void> {
        this.render();

        return super.load();
    }

    public render() {
        if (!this.dataSource)
            throw new Error('missing grid view controller data source');

        this.deselectAllCells();

        this.gridView.removeAllChildren();

        for (let i = 0, c = this.dataSource.numberOfCells(this); i < c; ++i) {
            const cell = this.reuseCell(i);

            this.dataSource.updateCell(this, cell, i);
            this.gridView.appendCell(cell);
        }
    }

    public isCellSelected(index: number): boolean {
        if (0 > index)
            return false;

        if (index >= this._cells.length)
            return;

        return this._cells[index].isSelected;
    }

    public deselectAllCells(): void {
        this.gridView.selectedCells.forEach(cell => {
            cell.isSelected = false;

            this.onDeselectedCell.emit(this, cell);
        });
    }

    public deselectCell(index: number): void {
        if (!this.isCellSelected(index))
            return;

        const cell = this._cells[index];

        cell.isSelected = false;

        this.onDeselectedCell.emit(this, cell);
    }

    public selectCell(index: number): void {
        if (this.selectionMode == TableSelectionMode.None)
            return;

        if (0 > index)
            return;

        if (index >= this._cells.length)
            return;

        if (this.isCellSelected(index))
            return;

        const cell = this._cells[index];

        if (this.selectionMode == TableSelectionMode.Single)
            this.deselectAllCells();

        if (this.selectionMode != TableSelectionMode.Clickable)
            cell.isSelected = true;

        this.onSelectedCell.emit(this, cell);
    }

    private reuseCell(index: number): View {
        while (index >= this._cells.length)
            this._cells.push(this.createCell(index));

        return this._cells[index];
    }

    private createCell(index: number): View {
        const cell = this.dataSource.createCell(this, index);

        cell.index = index;
        cell.isClickable = this.selectionMode != TableSelectionMode.None;

        cell.onClick.on(() => {
            if (this.selectionMode == TableSelectionMode.None)
                return;

            if (this.isCellSelected(index))
                this.deselectCell(index);
            else
                this.selectCell(index);
        });

        return cell;
    }

    public scrollHoriztonal(pages = 1): boolean {
        if (0 == pages)
            return false;

        const view = this.gridView.bounds;

        let result = false;

        if (pages > 0) {
            const cells = this.cells.map(cell => cell.bounds);
            const rightCell = cells.find(cell => cell.right >= view.right) ?? cells[cells.length - 1];
            const x = (view.right - view.top) * pages - (view.right - rightCell.top);
            const targetRight = x + view.right;
            const righterCell = cells.find(cell => cell.right >= targetRight);

            result = !righterCell;

            this.gridView.scrollBy(x, 0);
        } else {
            const cells = this.cells.map(cell => cell.bounds).reverse();
            const leftCell = cells.find(cell => cell.left <= view.left) ?? cells[cells.length - 1];
            const x = (view.bottom - view.left) * pages + (leftCell.bottom - view.left);
            const targetLeft = x + view.left;
            const lefterCell = cells.find(cell => cell.left <= targetLeft);

            result = !lefterCell;

            this.gridView.scrollBy(x, 0);
        }

        return result;
    }

    public scrollVertical(pages = 1): boolean {
        if (0 == pages)
            return false;

        const view = this.gridView.bounds;

        let result = false;

        if (pages > 0) {
            const cells = this.cells.map(cell => cell.bounds);
            const bottomCell = cells.find(cell => cell.bottom >= view.bottom) ?? cells[cells.length - 1];
            const y = (view.bottom - view.top) * pages - (view.bottom - bottomCell.top);
            const targetBottom = y + view.bottom;
            const lowerCell = cells.find(cell => cell.bottom >= targetBottom);

            result = !lowerCell;

            this.gridView.scrollBy(0, y);
        } else {
            const cells = this.cells.map(cell => cell.bounds).reverse();
            const topCell = cells.find(cell => cell.top <= view.top) ?? cells[cells.length - 1];
            const y = (view.bottom - view.top) * pages + (topCell.bottom - view.top);
            const targetTop = y + view.top;
            const upperCell = cells.find(cell => cell.top <= targetTop);

            result = !upperCell;

            this.gridView.scrollBy(0, y);
        }

        return result;
    }
}