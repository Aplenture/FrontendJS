/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Module } from "./module";

export interface ClientPreparer {
    readonly add: (parameter: CoreJS.Parameter<any>, onChange?: CoreJS.EventHandler<CoreJS.Config, string>, listener?: any) => boolean;
}

export interface ClientModule extends Module<ClientPreparer, void> { }