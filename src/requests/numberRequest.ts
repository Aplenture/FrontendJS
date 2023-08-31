/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Request, RequestOptions } from "../core/request";

export class NumberRequest<TParams> extends Request<TParams, number> {
    constructor(endpoint: string, options: RequestOptions<number> = {}) {
        options.parser = CoreJS.parseToNumber;

        super(endpoint, options);
    }
}