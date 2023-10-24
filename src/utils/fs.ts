/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { JSONRequest } from "../requests";

export async function loadConfig<T extends any>(path = '/config.json'): Promise<T> {
    return await new JSONRequest<void, T>(path).send();
}

/*!
 * downloads content
 * inspired by https://stackoverflow.com/a/18197341
 */
export function download(file: CoreJS.File) {
    const element = document.createElement('a');

    element.id = 'download';
    element.setAttribute('href', `data:${file.type};charset=${file.charset},` + file.toString());
    element.setAttribute('download', file.name);

    element.style.display = 'none';

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}