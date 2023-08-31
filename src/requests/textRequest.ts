/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Request, RequestOptions } from "../core/request";

export class TextRequest<TParams> extends Request<TParams, string> {
    constructor(endpoint: string, options: RequestOptions<string> = {}) {
        options.parser = CoreJS.parseToString;

        super(endpoint, options);
    }
}