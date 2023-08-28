/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { JSONRequest } from "../requests";

export async function loadConfig<T extends any>(path = '/config.json'): Promise<T> {
    return await new JSONRequest<void, T>(path).send();
}