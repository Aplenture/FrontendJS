/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export interface RequestOptions {
    route?: string;
    type?: CoreJS.RequestMethod;
    useCredentials?: boolean;
    headers?: NodeJS.ReadOnlyDict<string>;
}

export class Request<TArgs> {
    public readonly onRequesting = new CoreJS.Event<Request<TArgs>, any>('Request.onRequesting');
    public readonly onResponse = new CoreJS.Event<Request<TArgs>, any>('Request.onResponse');
    public readonly onFinished = new CoreJS.Event<Request<TArgs>, void>('Request.onFinished');
    public readonly onCanceled = new CoreJS.Event<Request<TArgs>, void>('Request.onCanceled');

    public route: string;
    public type: CoreJS.RequestMethod;

    private readonly request = new XMLHttpRequest();

    private _running = false;
    private _count = 0;
    private _promise: Promise<any>;
    private _canceled = false;

    constructor(public endpoint: string, options: RequestOptions = {}) {
        this.route = options.route || '';
        this.type = options.type || CoreJS.RequestMethod.Get;

        this.request.withCredentials = options.useCredentials || false;

        if (options.headers)
            Object.keys(options.headers).forEach(name => this.setHeader(name, options.headers[name]));
    }

    public get isRunning(): boolean { return this._running; }
    public get count(): number { return this._count; }
    public get url(): string { return this.endpoint + this.route; }
    public get promise(): Promise<any> { return this._promise; }

    public send(args: TArgs = {} as TArgs): Promise<any> {
        for (const key in args)
            if (undefined === args[key])
                delete args[key];

        if (this._running)
            throw new Error(`request '${this.url}' is running already`);

        this._running = true;
        this._count += 1;
        this._canceled = false;
        this._promise = new Promise<any>((resolve, reject) => {
            this.onRequesting.emit(this, args);

            const argsString = CoreJS.URLArgsToString(args);
            const uri = this.createURI(argsString, this.url);
            const body = this.createBody(argsString);

            this.request.open(this.type, uri, true);
            this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            this.request.onreadystatechange = () => {
                if (this.request.readyState !== 4)
                    return;

                if (this._canceled)
                    return;

                // enable request only after finishing promise handling
                // to avoid parallel request handlings
                setTimeout(() => this.finish(), 0);

                switch (this.request.status) {
                    case CoreJS.ResponseCode.OK: {
                        this.onResponse.emit(this, this.request.responseText);

                        return resolve(this.request.responseText);
                    }

                    case CoreJS.ResponseCode.NoContent:
                        return resolve(null);

                    case 0:
                        return reject(new Error('#_server_not_responding'));

                    default:
                        return reject(new Error(this.request.responseText || '#_something_went_wrong'));
                }
            };

            this.request.send(body);
        });

        return this._promise;
    }

    public cancel() {
        if (!this._running)
            return;

        this._canceled = true;

        this.request.onreadystatechange = null;
        this.request.abort();

        this.onCanceled.emit(this);
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

    private finish() {
        this._running = false;
        this._promise = null;

        this.onFinished.emit(this);
    }
}