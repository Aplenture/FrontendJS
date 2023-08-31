/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Client } from "./client";
import { Request } from "./request";
import { JSONRequest } from "../requests";
import { ClientPreparer, Module, ServerPreparer } from "../interfaces";

const PARAMETER_ENDPOINT = 'endpoint';
const PARAMETER_ROUTES = 'routes';

interface Config {
    readonly endpoint: string;
    readonly routes: NodeJS.ReadOnlyDict<string>;
}

export class Server implements Module<ClientPreparer, void> {
    private readonly _requests: NodeJS.Dict<Request<any, any>> = {};
    private readonly _modules: readonly Module<ServerPreparer, Server>[];

    private _config: Config;
    private _infos: NodeJS.ReadOnlyDict<any>;

    constructor(public readonly name: string, ...modules: Module<ServerPreparer, Server>[]) {
        this._modules = modules;
    }

    public get endpoint(): string { return this._config.endpoint; }
    public get infos(): NodeJS.ReadOnlyDict<any> { return this._infos; }

    public async prepare(preparer: ClientPreparer): Promise<void> {
        const defaultConfig = {
            endpoint: 'http://localhost/',
            routes: {}
        };

        const subpreparer = {
            addRoute: (route: string) => defaultConfig.routes[route] = new CoreJS.StringParameter(route, '', route.toLowerCase())
        };

        const params = [
            new CoreJS.StringParameter(PARAMETER_ENDPOINT, `server endpoint for ${this.name}`, defaultConfig.endpoint),
            new CoreJS.DictionaryParameter<NodeJS.Dict<string>>(PARAMETER_ROUTES, 'all server routes', null, defaultConfig.routes)
        ];

        // prepare modules
        await Promise.all(this._modules.map(module => module.prepare(subpreparer)));

        // add server config to config
        preparer.add(new CoreJS.DictionaryParameter(this.name, `server config for ${this.name}`, params, defaultConfig));
    }

    public async init(): Promise<void> {
        this._config = Client.config.get(this.name);

        // check if endpoint ends with slash
        if ('/' != this.endpoint[this.endpoint.length - 1])
            throw new Error(`config.${this.name}.endpoint needs to end with '/' (slash)`);

        // load server infos
        this._infos = await new JSONRequest<void, NodeJS.ReadOnlyDict<any>>(this.endpoint).send().catch(() => ({}));

        // init modules
        await Promise.all(this._modules.map(module => module.init(this)));
    }

    public async load(): Promise<void> {
        await Promise.all(this._modules.map(module => module.load(this)));
    }

    public async loaded(): Promise<void> {
        await Promise.all(this._modules.map(module => module.loaded(this)));
    }

    public request<TArgs, TResponse>(route: string, parser: (data: string) => TResponse, args?: TArgs): Promise<TResponse> {
        if (!this._requests[route])
            this._requests[route] = new Request(this.endpoint, { route: this.getRoute(route) });

        const request = this._requests[route];

        return request.isRunning
            ? request.promise.then(parser)
            : request.send(args).then(parser);
    }

    public requestBool<TArgs>(route: string, args?: TArgs): Promise<boolean> {
        return this.request(route, CoreJS.parseToBool, args);
    }

    public requestJSON<TArgs, TResponse extends NodeJS.Dict<any>>(route: string, args?: TArgs): Promise<TResponse> {
        return this.request<TArgs, TResponse>(route, CoreJS.parseToJSON, args);
    }

    public requestNumber<TArgs>(route: string, args?: TArgs): Promise<number> {
        return this.request(route, CoreJS.parseToNumber, args);
    }

    public requestText<TArgs>(route: string, args?: TArgs): Promise<string> {
        return this.request(route, CoreJS.parseToString, args);
    }

    public cancel(route: string) {
        if (!this._requests[route])
            return;

        this._requests[route].cancel();
    }

    private getRoute(key: string): string {
        if (!this._config.routes[key])
            throw new Error(`Invalid route '${key}'. Call Server.addRoute() first!`);

        return this._config.routes[key];
    }
}