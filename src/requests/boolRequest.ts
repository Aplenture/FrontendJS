/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Request, RequestOptions } from "../core/request";

export class BoolRequest<TParams> extends Request<TParams> {
    constructor(endpoint: string, options?: RequestOptions) {
        super(endpoint, options);
    }

    public send(args?: TParams): Promise<boolean> {
        return super.send(args).then(CoreJS.parseToBool);
    }
}