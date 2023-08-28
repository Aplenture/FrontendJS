/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export interface RequestOptions {
    readonly endpoint?: string;
    readonly type?: CoreJS.RequestMethod;
    readonly useCredentials?: boolean;
    readonly headers?: NodeJS.ReadOnlyDict<string>;
}

export class Request<TArgs, TResponse> {
    public readonly onRequesting = new CoreJS.Event<Request<TArgs, TResponse>, any>('Request.onRequesting');
    public readonly onResponse = new CoreJS.Event<Request<TArgs, TResponse>, TResponse>('Request.onResponse');

    public readonly url: string;
    public readonly type: CoreJS.RequestMethod;

    private readonly request = new XMLHttpRequest();

    private _running = false;
    private _count = 0;

    constructor(
        api: string,
        private readonly parser: (data: string) => TResponse,
        options: RequestOptions = {}
    ) {
        this.url = (options.endpoint || '') + api;
        this.type = options.type || CoreJS.RequestMethod.Get;
        this.request.withCredentials = options.useCredentials || false;

        if (options.headers)
            Object.keys(options.headers).forEach(name => this.setHeader(name, options.headers[name]));
    }

    public get isRunning(): boolean { return this._running; }
    public get count(): number { return this._count; }

    public send(args?: TArgs): Promise<TResponse> {
        for (const key in args)
            if (undefined === args[key])
                delete args[key];

        if (this._running)
            throw new Error(`request '${this.url}' is running already`);

        this._running = true;
        this._count += 1;

        return new Promise<TResponse>((resolve, reject) => {
            const argsString = CoreJS.URLArgsToString(args);
            const uri = this.createURI(argsString, this.url);
            const body = this.createBody(argsString);

            this.request.open(this.type, uri, true);
            this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            this.request.onreadystatechange = () => {
                if (this.request.readyState !== 4)
                    return;

                // enable request only after finishing promise handling
                // to avoid parallel request handlings
                setTimeout(() => this._running = false, 0);

                switch (this.request.status) {
                    case CoreJS.ResponseCode.OK: {
                        let result: TResponse;

                        try {
                            result = this.parser(this.request.responseText);
                        } catch (error) {
                            return reject(error);
                        }

                        this.onResponse.emit(this, result);

                        return resolve(result);
                    }

                    case CoreJS.ResponseCode.NoContent:
                        return resolve(null);

                    case 0:
                        return reject(new Error('#_server_not_responding'));

                    default:
                        return reject(new Error(this.request.responseText || '#_something_went_wrong'));
                }
            };

            this.onRequesting.emit(this, args);
            this.request.send(body);
        });
    }

    public setHeader(name: string, value: string) {
        this.request.setRequestHeader(name, value);
    }

    protected createURI(args: string, url: string): string {
        let result = '';

        switch (this.type) {
            case CoreJS.RequestMethod.Get:
                result += args
                    ? url + "?" + args
                    : url;
                break;

            default:
                result += url;
                break;
        }

        return result;
    }

    protected createBody(args: string): any {
        switch (this.type) {
            case CoreJS.RequestMethod.Post:
                return args;

            default:
                return "";
        }
    }
}