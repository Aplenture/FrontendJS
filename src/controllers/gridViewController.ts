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
}