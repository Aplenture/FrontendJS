/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Request, RequestOptions } from "../core/request";

export class NumberRequest<TParams> extends Request<TParams, number> {
    constructor(api: string, options?: RequestOptions) {
        super(api, CoreJS.parseToNumber, options);
    }
}