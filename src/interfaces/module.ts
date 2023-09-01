/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

export interface Module<TPreparer, TParent> {
    readonly prepare: (preparer: TPreparer) => Promise<void>;
    readonly init: (parent: TParent) => Promise<void>;
    readonly load: (parent: TParent) => Promise<void>;
    readonly unload: (parent: TParent) => Promise<void>;
    readonly start: (parent: TParent) => Promise<void>;
}