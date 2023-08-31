/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

export class Route {
    private static _parameters: URLSearchParams = null;

    constructor(
        public readonly name: string,
        public readonly index?: number
    ) {
        this.init();
    }

    public init() {
        Route._parameters = new URLSearchParams(window.location.search);
    }

    public has(key: string): boolean {
        return Route._parameters.has(key);
    }

    public get(key: string): string {
        return Route._parameters.get(key);
    }

    public getNumber(key: string): number {
        return Number(Route._parameters.get(key));
    }

    public getBoolean(key: string): boolean {
        return Boolean(Route._parameters.get(key));
    }

    public set(key: string, value: any) {
        Route._parameters.set(key, value.toString());

        window.history.replaceState({}, this.name, this.toString());
    }

    public delete(key: string) {
        Route._parameters.delete(key);

        window.history.replaceState({}, this.name, this.toString());
    }

    public toString(): string {
        let result = '/' + this.name;

        if (this.index)
            result += '/' + this.index;

        const parameters = Route._parameters.toString();

        if (parameters)
            result += '?' + Route._parameters;

        return result;
    }
}