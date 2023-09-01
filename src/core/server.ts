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
import { ClientModule, ClientPreparer, ServerModule } from "../interfaces";

const PARAMETER_ENDPOINT = 'endpoint';
const PARAMETER_ROUTES = 'routes';

interface Config {
    readonly endpoint: string;
    readonly routes: NodeJS.ReadOnlyDict<string>;
}

export class Server implements ClientModule {
    private readonly _requests: NodeJS.Dict<Request<any>> = {};
    private readonly _modules: readonly ServerModule[];

    private _config: Config;
    private _infos: NodeJS.ReadOnlyDict<any>;

    constructor(public readonly name: string, ...modules: ServerModule[]) {
        this._modules = modules;
    }

    public get endpoint(): string { return this._config.endpoint; }
    public get infos(): NodeJS.ReadOnlyDict<any> { return this._infos; }

    public async prepare(preparer: ClientPreparer): Promise<void> {
        const routesParameters = [];
        const defaultConfig = {
            endpoint: 'http://localhost/',
            routes: {}
        };

        const subpreparer = {
            addRoute: (route: string) => {
                routesParameters.push(new CoreJS.StringParameter(route, '', route));
                defaultConfig.routes[route] = route;
            }
        };

        const params = [
            new CoreJS.StringParameter(PARAMETER_ENDPOINT, `server endpoint for ${this.name}`, defaultConfig.endpoint),
            new CoreJS.DictionaryParameter<NodeJS.Dict<string>>(PARAMETER_ROUTES, 'all server routes', routesParameters, defaultConfig.routes)
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

        // load requests
        Object.keys(this._config.routes).forEach(key => this._requests[key.toLowerCase()] = new Request(this.endpoint, { route: this._config.routes[key] }));

        // init modules
        await Promise.all(this._modules.map(module => module.init(this)));
    }

    public async load(): Promise<void> {
        await Promise.all(this._modules.map(module => module.load(this)));
    }

    public async unload(): Promise<void> {
        await Promise.all(this._modules.map(module => module.unload(this)));
    }

    public async start(): Promise<void> {
        await Promise.all(this._modules.map(module => module.start(this)));
    }

    public request<TArgs, TResponse>(route: string, parser: (data: string) => TResponse, args?: TArgs): Promise<TResponse> {
        const request = this.getRequest(route);

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
        this.getRequest(route).cancel();
    }

    private getRequest(route: string) {
        const request = this._requests[route.toLowerCase()];

        if (!request)
            throw new Error(`Invalid route '${route}'. Prepare routes in server modules!`);

        return request;
    }
}