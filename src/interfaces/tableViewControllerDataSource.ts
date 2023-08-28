/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";
import { TableViewController } from "../controllers/tableViewController";

export interface TableViewControllerDataSource {
    numberOfCategories?(sender: TableViewController): number;
    numberOfCells(sender: TableViewController, category: number): number;
    createHeader?(sender: TableViewController,): View;
    createCategory?(sender: TableViewController, index: number): View | null;
    createCell(sender: TableViewController, category: number): View;
    updateCell(sender: TableViewController, cell: View, row: number, category: number): void;
}