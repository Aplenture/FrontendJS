/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Request, RequestOptions } from "../core/request";

export class BoolRequest<TParams> extends Request<TParams, boolean> {
    constructor(endpoint: string, options: RequestOptions<boolean> = {}) {
        options.parser = CoreJS.parseToBool;

        super(endpoint, options);
    }
}