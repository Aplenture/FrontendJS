/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { ViewController } from "../core/viewController";

export interface INavigationViewController {
    pushViewController(viewController: ViewController): Promise<void>;
    popViewController(): Promise<ViewController>;
}