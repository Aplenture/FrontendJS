/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";
import { GridViewController } from "../controllers/gridViewController";

export interface GridViewControllerDataSource {
    numberOfCells(sender: GridViewController): number;
    createCell(sender: GridViewController, index: number): View;
    updateCell(sender: GridViewController, cell: View, index: number): void;
}