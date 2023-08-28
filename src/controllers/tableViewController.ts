/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { TableSelectionMode } from "../enums";
import { TableViewControllerDataSource } from "../interfaces";
import { View } from "../core/view";
import { ViewController } from "../core/viewController";
import { Label, TableView } from "../views";

export class TableViewController extends ViewController {
    public readonly onSelectedCell = new CoreJS.Event<TableViewController, View>('TableViewController.onSelectedCell');
    public readonly onDeselectedCell = new CoreJS.Event<TableViewController, View>('TableViewController.onSelectedCell');

    public readonly titleLabel = new Label('title');
    public readonly tableView = new TableView();

    public dataSource: TableViewControllerDataSource;

    private _header: View;
    private _cells: View[][] = [];

    constructor(...classes: string[]) {
        super(...classes, 'table-view-controller');

        this.titleLabel.text = 'table title';

        this.view.appendChild(this.titleLabel);
        this.view.appendChild(this.tableView);
    }

    public get header(): View { return this._header; }
    public get cells(): readonly View[][] { return this._cells; }

    public get selectionMode(): TableSelectionMode { return this.tableView.selectionMode; }
    public set selectionMode(value: TableSelectionMode) { this.tableView.selectionMode = value; }

    public load(): Promise<void> {
        this.render();

        return super.load();
    }

    public render() {
        if (!this.dataSource)
            throw new Error('missing table view controller data source');

        const numCategories = this.dataSource.numberOfCategories && this.dataSource.numberOfCategories(this) || 1;

        this._header = this.dataSource.createHeader && this.dataSource.createHeader(this);

        this.deselectAllCells();

        this.tableView.removeAllChildren();

        if (this._header)
            this.tableView.appendHeader(this._header);

        for (let category = 0; category < numCategories; ++category) {
            const numCells = this.dataSource.numberOfCells(this, category);
            const categoryView = this.dataSource.createCategory && this.dataSource.createCategory(this, category);

            if (categoryView)
                this.tableView.appendCategory(categoryView);

            for (let row = 0; row < numCells; ++row) {
                const cell = this.reuseCell(category, row);

                this.dataSource.updateCell(this, cell, row, category);
                this.tableView.appendCell(cell);
            }
        }
    }

    public cellAtIndex(index: number, category?: number): View {
        if (undefined == category) {
            category = 0;

            while (this._cells[category] && index >= this._cells[category].length) {
                category++;
                index -= this._cells[category].length;
            }
        }

        return this._cells[category] && this._cells[category][index];
    }

    public isCellSelected(category: number, row: number): boolean {
        if (0 > category)
            return;

        if (0 > row)
            return;

        if (category >= this._cells.length)
            return;

        if (row >= this._cells[category].length)
            return;

        return this._cells[category][row].isSelected;
    }

    public deselectAllCells(): void {
        this.tableView.selectedCells.forEach(cell => {
            cell.isSelected = false;

            this.onDeselectedCell.emit(this, cell);
        });
    }

    public deselectCell(category: number, row: number): void {
        if (!this.isCellSelected(category, row))
            return;

        const cell = this._cells[category][row];

        cell.isSelected = false;

        this.onDeselectedCell.emit(this, cell);
    }

    public selectCell(category: number, row: number): void {
        if (this.selectionMode == TableSelectionMode.None)
            return;

        if (0 > category)
            return;

        if (0 > row)
            return;

        if (category >= this._cells.length)
            return;

        if (row >= this._cells[category].length)
            return;

        if (this.isCellSelected(category, row))
            return;

        const cell = this._cells[category][row];

        if (this.selectionMode == TableSelectionMode.Single)
            this.deselectAllCells();

        if (this.selectionMode != TableSelectionMode.Clickable)
            cell.isSelected = true;

        this.onSelectedCell.emit(this, cell);
    }

    private reuseCell(category: number, row: number): View {
        while (category >= this._cells.length)
            this._cells.push([]);

        const categoryCells = this._cells[category];

        while (row >= categoryCells.length)
            categoryCells.push(this.createCell(category, row));

        return categoryCells[row];
    }

    private createCell(category: number, row: number): View {
        const cell = this.dataSource.createCell(this, category);

        cell.index = row;
        cell.isClickable = this.selectionMode != TableSelectionMode.None;

        cell.onClick.on(() => {
            if (this.selectionMode == TableSelectionMode.None)
                return;

            if (this.isCellSelected(category, row))
                this.deselectCell(category, row);
            else
                this.selectCell(category, row);
        });

        return cell;
    }
}