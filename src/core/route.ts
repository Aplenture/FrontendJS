/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

export class Route {
    private _parameters: URLSearchParams = null;

    constructor(
        public readonly name: string,
        public readonly index?: number
    ) { }

    public init() {
        this._parameters = new URLSearchParams(window.location.search);
    }

    public has(key: string): boolean {
        return this._parameters.has(key);
    }

    public get(key: string): string {
        return this._parameters.get(key);
    }

    public getNumber(key: string): number {
        return Number(this._parameters.get(key));
    }

    public getBoolean(key: string): boolean {
        return Boolean(this._parameters.get(key));
    }

    public set(key: string, value: any) {
        this._parameters.set(key, value.toString());

        window.history.replaceState({}, this.name, this.toString());
    }

    public delete(key: string) {
        this._parameters.delete(key);

        window.history.replaceState({}, this.name, this.toString());
    }

    public toString(): string {
        let result = '/' + this.name;

        if (this.index)
            result += '/' + this.index;

        const parameters = this._parameters.toString();

        if (parameters)
            result += '?' + this._parameters;

        return result;
    }
}