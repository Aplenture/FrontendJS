import * as CoreJS from "corejs";
import { Client } from "./client";
import { Request } from "./request";
import { BoolRequest, JSONRequest, NumberRequest, TextRequest } from "../requests";

const PARAMETER_ENDPOINT = 'endpoint';
const PARAMETER_ROUTES = 'routes';

const DEFAULT_CONFIG: Config = {
    endpoint: 'http://localhost/',
    routes: {}
}

interface Config {
    readonly endpoint: string;
    readonly routes: NodeJS.Dict<string>;
}

export class Server {
    private readonly _routeParameter = new CoreJS.DictionaryParameter<NodeJS.Dict<string>>(PARAMETER_ROUTES, 'all server routes', null, DEFAULT_CONFIG.routes);
    private readonly _requests: NodeJS.Dict<Request<any, any>> = {};

    private _config: Config;
    private _infos: NodeJS.ReadOnlyDict<any>;

    constructor(public readonly name: string) {
        this.init();
        this.load();
    }

    public get endpoint(): string { return this._config.endpoint; }

    public async getInfos() {
        if (!this._infos)
            this._infos = await new JSONRequest<void, NodeJS.ReadOnlyDict<any>>(this.endpoint).send().catch(() => ({}));

        return this._infos;
    }

    public addRoute(route: string) {
        if (this._routeParameter.parameters.some(tmp => tmp.name == route))
            return;

        const def = route.toLowerCase();

        this._routeParameter.parameters.push(new CoreJS.StringParameter(route, '', def));

        if (this._config)
            this._config.routes[route] = def;
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

    private init() {
        if (!Client.isInitialized)
            return Client.onInit.once(() => this.init());

        Client.config.add(new CoreJS.DictionaryParameter(this.name, `server config for ${this.name}`, [
            new CoreJS.StringParameter(PARAMETER_ENDPOINT, `server endpoint for ${this.name}`, DEFAULT_CONFIG.endpoint),
            this._routeParameter
        ], Object.assign({}, DEFAULT_CONFIG)));
    }

    private load() {
        if (!Client.isLoaded)
            return Client.onLoading.once(() => this.load());

        this._config = Client.config.get(this.name);

        this._routeParameter.parameters.forEach(param => this._config.routes[param.name] = param.parse(this._config.routes[param.name]));

        if ('/' != this.endpoint[this.endpoint.length - 1])
            throw new Error(`config.${this.name}.endpoint needs to end with '/' (slash)`);
    }

    private getRoute(key: string): string {
        if (!this._config.routes[key])
            throw new Error(`Invalid route '${key}'. Call Server.addRoute() first!`);

        return this._config.routes[key];
    }
}