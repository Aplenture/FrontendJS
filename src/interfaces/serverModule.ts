/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { Server } from "../core";
import { Module } from "./module";

export interface ServerPreparer {
    readonly addRoute: (route: string) => void;
}

export interface ServerModule extends Module<ServerPreparer, Server> { }