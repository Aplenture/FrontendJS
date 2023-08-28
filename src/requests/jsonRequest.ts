/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { Request, RequestOptions } from "../core/request";

export class JSONRequest<TParams, TResponse> extends Request<TParams, TResponse> {
    constructor(api: string, options?: RequestOptions) {
        super(api, data => {
            try {
                return JSON.parse(data);
            } catch (error) {
                throw new Error(`file '${this.url}' has invalid json format`);
            }
        }, options);
    }
}