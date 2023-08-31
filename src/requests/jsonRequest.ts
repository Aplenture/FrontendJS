/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Request, RequestOptions } from "../core/request";

export class JSONRequest<TParams, TResponse extends NodeJS.Dict<any>> extends Request<TParams, TResponse> {
    constructor(endpoint: string, options: RequestOptions<TResponse> = {}) {
        options.parser = data => {
            try {
                return CoreJS.parseToJSON(data);
            } catch (error) {
                throw new Error(`file '${this.url}' has invalid json format`);
            }
        };

        super(endpoint, options);
    }
}