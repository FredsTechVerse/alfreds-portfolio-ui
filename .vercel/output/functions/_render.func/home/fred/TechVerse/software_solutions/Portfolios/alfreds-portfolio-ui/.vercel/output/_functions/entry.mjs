import 'node:fs';
import 'node:http';
import { TLSSocket } from 'node:tls';
import { d as appendForwardSlash, j as joinPaths, s as slash, p as prependForwardSlash, r as removeTrailingForwardSlash, e as collapseDuplicateSlashes } from './chunks/astro/assets-service_a011f3d6.mjs';
import 'cookie';
import { l as levels, d as dateTimeFormat, A as AstroCookies, c as computePreferredLocale, a as computePreferredLocaleList, b as computeCurrentLocale, r as routeIsRedirect, e as redirectRouteStatus, f as redirectRouteGenerate, g as routeIsFallback, h as attachCookiesToResponse, i as createAPIContext, j as callEndpoint, k as callMiddleware, L as Logger, m as AstroIntegrationLogger, R as RouteCache, n as getSetCookiesFromResponse, o as createRenderContext, manifest } from './manifest_e86b88c2.mjs';
import { yellow, dim, bold, cyan, red, reset } from 'kleur/colors';
import { A as AstroError, R as ReservedSlotName, l as renderSlotToString, n as renderJSX, o as chunkToString, C as ClientAddressNotAvailable, S as StaticClientAddressNotAvailable, p as ResponseSentError, q as CantRenderPage, t as renderPage$1 } from './chunks/astro_51f604e9.mjs';
import 'html-escaper';
import 'clsx';
import buffer from 'node:buffer';
import crypto from 'node:crypto';
import nodePath from 'node:path';
import 'node:url';
import 'fast-glob';
import 'node:fs/promises';
import 'node:module';
import { renderers } from './renderers.mjs';

const routeDataSymbol = Symbol.for("astro.routeData");
function checkIsLocaleFree(pathname, locales) {
  for (const locale of locales) {
    if (pathname.includes(`/${locale}`)) {
      return false;
    }
  }
  return true;
}
function createI18nMiddleware(i18n, base, trailingSlash) {
  if (!i18n) {
    return void 0;
  }
  return async (context, next) => {
    if (!i18n) {
      return await next();
    }
    const routeData = Reflect.get(context.request, routeDataSymbol);
    if (routeData) {
      if (routeData.type !== "page" && routeData.type !== "fallback") {
        return await next();
      }
    }
    const url = context.url;
    const { locales, defaultLocale, fallback } = i18n;
    const response = await next();
    if (response instanceof Response) {
      const separators = url.pathname.split("/");
      const pathnameContainsDefaultLocale = url.pathname.includes(`/${defaultLocale}`);
      const isLocaleFree = checkIsLocaleFree(url.pathname, i18n.locales);
      if (i18n.routing === "prefix-other-locales" && pathnameContainsDefaultLocale) {
        const newLocation = url.pathname.replace(`/${defaultLocale}`, "");
        response.headers.set("Location", newLocation);
        return new Response(null, {
          status: 404,
          headers: response.headers
        });
      } else if (i18n.routing === "prefix-always") {
        if (url.pathname === base + "/" || url.pathname === base) {
          if (trailingSlash === "always") {
            return context.redirect(`${appendForwardSlash(joinPaths(base, i18n.defaultLocale))}`);
          } else {
            return context.redirect(`${joinPaths(base, i18n.defaultLocale)}`);
          }
        } else if (isLocaleFree) {
          return new Response(null, {
            status: 404,
            headers: response.headers
          });
        }
      }
      if (response.status >= 300 && fallback) {
        const fallbackKeys = i18n.fallback ? Object.keys(i18n.fallback) : [];
        const urlLocale = separators.find((s) => locales.includes(s));
        if (urlLocale && fallbackKeys.includes(urlLocale)) {
          const fallbackLocale = fallback[urlLocale];
          let newPathname;
          if (fallbackLocale === defaultLocale && i18n.routing !== "prefix-always") {
            newPathname = url.pathname.replace(`/${urlLocale}`, ``);
          } else {
            newPathname = url.pathname.replace(`/${urlLocale}`, `/${fallbackLocale}`);
          }
          return context.redirect(newPathname);
        }
      }
    }
    return response;
  };
}
const i18nPipelineHook = (ctx) => {
  Reflect.set(ctx.request, routeDataSymbol, ctx.route);
};

let lastMessage;
let lastMessageCount = 1;
const consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) {
      dest = console.log;
    }
    function getPrefix() {
      let prefix = "";
      let type = event.label;
      if (type) {
        prefix += dim(dateTimeFormat.format(/* @__PURE__ */ new Date()) + " ");
        if (event.level === "info") {
          type = bold(cyan(`[${type}]`));
        } else if (event.level === "warn") {
          type = bold(yellow(`[${type}]`));
        } else if (event.level === "error") {
          type = bold(red(`[${type}]`));
        }
        prefix += `${type} `;
      }
      return reset(prefix);
    }
    let message = event.message;
    if (message === lastMessage) {
      lastMessageCount++;
      message = `${message} ${yellow(`(x${lastMessageCount})`)}`;
    } else {
      lastMessage = message;
      lastMessageCount = 1;
    }
    const outMessage = getPrefix() + message;
    dest(outMessage);
    return true;
  }
};

const RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
  renderers: []
};

function createEnvironment(options) {
  return options;
}

function sequence(...handlers) {
  const filtered = handlers.filter((h) => !!h);
  const length = filtered.length;
  if (!length) {
    const handler = defineMiddleware((context, next) => {
      return next();
    });
    return handler;
  }
  return defineMiddleware((context, next) => {
    return applyHandle(0, context);
    function applyHandle(i, handleContext) {
      const handle = filtered[i];
      const result = handle(handleContext, async () => {
        if (i < length - 1) {
          return applyHandle(i + 1, handleContext);
        } else {
          return next();
        }
      });
      return result;
    }
  });
}

function defineMiddleware(fn) {
  return fn;
}

function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    return joinPaths(assetsPrefix, slash(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    return href;
  }
}
function createStylesheetElement(stylesheet, base, assetsPrefix) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix) {
  return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)));
}
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}

function matchRoute(pathname, manifest) {
  const decodedPathname = decodeURI(pathname);
  return manifest.routes.find((route) => {
    return route.pattern.test(decodedPathname) || route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(decodedPathname));
  });
}

const clientAddressSymbol$1 = Symbol.for("astro.clientAddress");
const responseSentSymbol$1 = Symbol.for("astro.responseSent");
function getFunctionExpression(slot) {
  if (!slot)
    return;
  if (slot.expressions?.length !== 1)
    return;
  return slot.expressions[0];
}
class Slots {
  #result;
  #slots;
  #logger;
  constructor(result, slots, logger) {
    this.#result = result;
    this.#slots = slots;
    this.#logger = logger;
    if (slots) {
      for (const key of Object.keys(slots)) {
        if (this[key] !== void 0) {
          throw new AstroError({
            ...ReservedSlotName,
            message: ReservedSlotName.message(key)
          });
        }
        Object.defineProperty(this, key, {
          get() {
            return true;
          },
          enumerable: true
        });
      }
    }
  }
  has(name) {
    if (!this.#slots)
      return false;
    return Boolean(this.#slots[name]);
  }
  async render(name, args = []) {
    if (!this.#slots || !this.has(name))
      return;
    const result = this.#result;
    if (!Array.isArray(args)) {
      this.#logger.warn(
        "Astro.slots.render",
        `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as a item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`
      );
    } else if (args.length > 0) {
      const slotValue = this.#slots[name];
      const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
      const expression = getFunctionExpression(component);
      if (expression) {
        const slot = async () => typeof expression === "function" ? expression(...args) : expression;
        return await renderSlotToString(result, slot).then((res) => {
          return res != null ? String(res) : res;
        });
      }
      if (typeof component === "function") {
        return await renderJSX(result, component(...args)).then(
          (res) => res != null ? String(res) : res
        );
      }
    }
    const content = await renderSlotToString(result, this.#slots[name]);
    const outHTML = chunkToString(result, content);
    return outHTML;
  }
}
function createResult(args) {
  const { params, request, resolve, locals } = args;
  const url = new URL(request.url);
  const headers = new Headers();
  headers.set("Content-Type", "text/html");
  const response = {
    status: args.status,
    statusText: "OK",
    headers
  };
  Object.defineProperty(response, "headers", {
    value: response.headers,
    enumerable: true,
    writable: false
  });
  let cookies = args.cookies;
  let preferredLocale = void 0;
  let preferredLocaleList = void 0;
  let currentLocale = void 0;
  const result = {
    styles: args.styles ?? /* @__PURE__ */ new Set(),
    scripts: args.scripts ?? /* @__PURE__ */ new Set(),
    links: args.links ?? /* @__PURE__ */ new Set(),
    componentMetadata: args.componentMetadata ?? /* @__PURE__ */ new Map(),
    renderers: args.renderers,
    clientDirectives: args.clientDirectives,
    compressHTML: args.compressHTML,
    partial: args.partial,
    pathname: args.pathname,
    cookies,
    /** This function returns the `Astro` faux-global */
    createAstro(astroGlobal, props, slots) {
      const astroSlots = new Slots(result, slots, args.logger);
      const Astro = {
        // @ts-expect-error
        __proto__: astroGlobal,
        get clientAddress() {
          if (!(clientAddressSymbol$1 in request)) {
            if (args.adapterName) {
              throw new AstroError({
                ...ClientAddressNotAvailable,
                message: ClientAddressNotAvailable.message(args.adapterName)
              });
            } else {
              throw new AstroError(StaticClientAddressNotAvailable);
            }
          }
          return Reflect.get(request, clientAddressSymbol$1);
        },
        get cookies() {
          if (cookies) {
            return cookies;
          }
          cookies = new AstroCookies(request);
          result.cookies = cookies;
          return cookies;
        },
        get preferredLocale() {
          if (preferredLocale) {
            return preferredLocale;
          }
          if (args.locales) {
            preferredLocale = computePreferredLocale(request, args.locales);
            return preferredLocale;
          }
          return void 0;
        },
        get preferredLocaleList() {
          if (preferredLocaleList) {
            return preferredLocaleList;
          }
          if (args.locales) {
            preferredLocaleList = computePreferredLocaleList(request, args.locales);
            return preferredLocaleList;
          }
          return void 0;
        },
        get currentLocale() {
          if (currentLocale) {
            return currentLocale;
          }
          if (args.locales) {
            currentLocale = computeCurrentLocale(
              request,
              args.locales,
              args.routingStrategy,
              args.defaultLocale
            );
            if (currentLocale) {
              return currentLocale;
            }
          }
          return void 0;
        },
        params,
        props,
        locals,
        request,
        url,
        redirect(path, status) {
          if (request[responseSentSymbol$1]) {
            throw new AstroError({
              ...ResponseSentError
            });
          }
          return new Response(null, {
            status: status || 302,
            headers: {
              Location: path
            }
          });
        },
        response,
        slots: astroSlots
      };
      return Astro;
    },
    resolve,
    response,
    _metadata: {
      hasHydrationScript: false,
      hasRenderedHead: false,
      hasDirectives: /* @__PURE__ */ new Set(),
      headInTree: false,
      extraHead: [],
      propagators: /* @__PURE__ */ new Set()
    }
  };
  return result;
}

async function renderPage({ mod, renderContext, env, cookies }) {
  if (routeIsRedirect(renderContext.route)) {
    return new Response(null, {
      status: redirectRouteStatus(renderContext.route, renderContext.request.method),
      headers: {
        location: redirectRouteGenerate(renderContext.route, renderContext.params)
      }
    });
  } else if (routeIsFallback(renderContext.route)) {
    return new Response(null, {
      status: 404
    });
  } else if (!mod) {
    throw new AstroError(CantRenderPage);
  }
  const Component = mod.default;
  if (!Component)
    throw new Error(`Expected an exported Astro component but received typeof ${typeof Component}`);
  const result = createResult({
    adapterName: env.adapterName,
    links: renderContext.links,
    styles: renderContext.styles,
    logger: env.logger,
    params: renderContext.params,
    pathname: renderContext.pathname,
    componentMetadata: renderContext.componentMetadata,
    resolve: env.resolve,
    renderers: env.renderers,
    clientDirectives: env.clientDirectives,
    compressHTML: env.compressHTML,
    request: renderContext.request,
    partial: !!mod.partial,
    site: env.site,
    scripts: renderContext.scripts,
    ssr: env.ssr,
    status: renderContext.status ?? 200,
    cookies,
    locals: renderContext.locals ?? {},
    locales: renderContext.locales,
    defaultLocale: renderContext.defaultLocale,
    routingStrategy: renderContext.routing
  });
  if (mod.frontmatter && typeof mod.frontmatter === "object" && "draft" in mod.frontmatter) {
    env.logger.warn(
      "astro",
      `The drafts feature is deprecated and used in ${renderContext.route.component}. You should migrate to content collections instead. See https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries for more information.`
    );
  }
  const response = await renderPage$1(
    result,
    Component,
    renderContext.props,
    {},
    env.streaming,
    renderContext.route
  );
  if (result.cookies) {
    attachCookiesToResponse(response, result.cookies);
  }
  return response;
}

class Pipeline {
  env;
  #onRequest;
  #hooks = {
    before: []
  };
  /**
   * The handler accepts the *original* `Request` and result returned by the endpoint.
   * It must return a `Response`.
   */
  #endpointHandler;
  /**
   * When creating a pipeline, an environment is mandatory.
   * The environment won't change for the whole lifetime of the pipeline.
   */
  constructor(env) {
    this.env = env;
  }
  setEnvironment() {
  }
  /**
   * When rendering a route, an "endpoint" will a type that needs to be handled and transformed into a `Response`.
   *
   * Each consumer might have different needs; use this function to set up the handler.
   */
  setEndpointHandler(handler) {
    this.#endpointHandler = handler;
  }
  /**
   * A middleware function that will be called before each request.
   */
  setMiddlewareFunction(onRequest) {
    this.#onRequest = onRequest;
  }
  /**
   * Removes the current middleware function. Subsequent requests won't trigger any middleware.
   */
  unsetMiddlewareFunction() {
    this.#onRequest = void 0;
  }
  /**
   * Returns the current environment
   */
  getEnvironment() {
    return this.env;
  }
  /**
   * The main function of the pipeline. Use this function to render any route known to Astro;
   */
  async renderRoute(renderContext, componentInstance) {
    for (const hook of this.#hooks.before) {
      hook(renderContext, componentInstance);
    }
    const result = await this.#tryRenderRoute(
      renderContext,
      this.env,
      componentInstance,
      this.#onRequest
    );
    if (renderContext.route.type === "endpoint") {
      if (!this.#endpointHandler) {
        throw new Error(
          "You created a pipeline that does not know how to handle the result coming from an endpoint."
        );
      }
      return this.#endpointHandler(renderContext.request, result);
    } else {
      return result;
    }
  }
  /**
   * It attempts to render a route. A route can be a:
   * - page
   * - redirect
   * - endpoint
   *
   * ## Errors
   *
   * It throws an error if the page can't be rendered.
   */
  async #tryRenderRoute(renderContext, env, mod, onRequest) {
    const apiContext = createAPIContext({
      request: renderContext.request,
      params: renderContext.params,
      props: renderContext.props,
      site: env.site,
      adapterName: env.adapterName,
      locales: renderContext.locales,
      routingStrategy: renderContext.routing,
      defaultLocale: renderContext.defaultLocale
    });
    switch (renderContext.route.type) {
      case "page":
      case "fallback":
      case "redirect": {
        if (onRequest) {
          return await callMiddleware(
            env.logger,
            onRequest,
            apiContext,
            () => {
              return renderPage({
                mod,
                renderContext,
                env,
                cookies: apiContext.cookies
              });
            }
          );
        } else {
          return await renderPage({
            mod,
            renderContext,
            env,
            cookies: apiContext.cookies
          });
        }
      }
      case "endpoint": {
        return await callEndpoint(mod, env, renderContext, onRequest);
      }
      default:
        throw new Error(`Couldn't find route of type [${renderContext.route.type}]`);
    }
  }
  /**
   * Store a function that will be called before starting the rendering phase.
   * @param fn
   */
  onBeforeRenderRoute(fn) {
    this.#hooks.before.push(fn);
  }
}

class EndpointNotFoundError extends Error {
  originalResponse;
  constructor(originalResponse) {
    super();
    this.originalResponse = originalResponse;
  }
}
class SSRRoutePipeline extends Pipeline {
  constructor(env) {
    super(env);
    this.setEndpointHandler(this.#ssrEndpointHandler);
  }
  // This function is responsible for handling the result coming from an endpoint.
  async #ssrEndpointHandler(request, response) {
    if (response.headers.get("X-Astro-Response") === "Not-Found") {
      throw new EndpointNotFoundError(response);
    }
    return response;
  }
}

const clientLocalsSymbol = Symbol.for("astro.locals");
const responseSentSymbol = Symbol.for("astro.responseSent");
const STATUS_CODES = /* @__PURE__ */ new Set([404, 500]);
class App {
  /**
   * The current environment of the application
   */
  #manifest;
  #manifestData;
  #routeDataToRouteInfo;
  #logger = new Logger({
    dest: consoleLogDestination,
    level: "info"
  });
  #baseWithoutTrailingSlash;
  #pipeline;
  #adapterLogger;
  constructor(manifest, streaming = true) {
    this.#manifest = manifest;
    this.#manifestData = {
      routes: manifest.routes.map((route) => route.routeData)
    };
    this.#routeDataToRouteInfo = new Map(manifest.routes.map((route) => [route.routeData, route]));
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#manifest.base);
    this.#pipeline = new SSRRoutePipeline(this.#createEnvironment(streaming));
    this.#adapterLogger = new AstroIntegrationLogger(
      this.#logger.options,
      this.#manifest.adapterName
    );
  }
  getAdapterLogger() {
    return this.#adapterLogger;
  }
  /**
   * Creates an environment by reading the stored manifest
   *
   * @param streaming
   * @private
   */
  #createEnvironment(streaming = false) {
    return createEnvironment({
      adapterName: this.#manifest.adapterName,
      logger: this.#logger,
      mode: "production",
      compressHTML: this.#manifest.compressHTML,
      renderers: this.#manifest.renderers,
      clientDirectives: this.#manifest.clientDirectives,
      resolve: async (specifier) => {
        if (!(specifier in this.#manifest.entryModules)) {
          throw new Error(`Unable to resolve [${specifier}]`);
        }
        const bundlePath = this.#manifest.entryModules[specifier];
        switch (true) {
          case bundlePath.startsWith("data:"):
          case bundlePath.length === 0: {
            return bundlePath;
          }
          default: {
            return createAssetLink(bundlePath, this.#manifest.base, this.#manifest.assetsPrefix);
          }
        }
      },
      routeCache: new RouteCache(this.#logger),
      site: this.#manifest.site,
      ssr: true,
      streaming
    });
  }
  set setManifestData(newManifestData) {
    this.#manifestData = newManifestData;
  }
  removeBase(pathname) {
    if (pathname.startsWith(this.#manifest.base)) {
      return pathname.slice(this.#baseWithoutTrailingSlash.length + 1);
    }
    return pathname;
  }
  #getPathnameFromRequest(request) {
    const url = new URL(request.url);
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    return pathname;
  }
  match(request, _opts = {}) {
    const url = new URL(request.url);
    if (this.#manifest.assets.has(url.pathname))
      return void 0;
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    const routeData = matchRoute(pathname, this.#manifestData);
    if (!routeData || routeData.prerender)
      return void 0;
    return routeData;
  }
  async render(request, routeData, locals) {
    if (request.url !== collapseDuplicateSlashes(request.url)) {
      request = new Request(collapseDuplicateSlashes(request.url), request);
    }
    if (!routeData) {
      routeData = this.match(request);
    }
    if (!routeData) {
      return this.#renderError(request, { status: 404 });
    }
    Reflect.set(request, clientLocalsSymbol, locals ?? {});
    const pathname = this.#getPathnameFromRequest(request);
    const defaultStatus = this.#getDefaultStatusCode(routeData, pathname);
    const mod = await this.#getModuleForRoute(routeData);
    const pageModule = await mod.page();
    const url = new URL(request.url);
    const renderContext = await this.#createRenderContext(
      url,
      request,
      routeData,
      mod,
      defaultStatus
    );
    let response;
    try {
      let i18nMiddleware = createI18nMiddleware(
        this.#manifest.i18n,
        this.#manifest.base,
        this.#manifest.trailingSlash
      );
      if (i18nMiddleware) {
        if (mod.onRequest) {
          this.#pipeline.setMiddlewareFunction(
            sequence(i18nMiddleware, mod.onRequest)
          );
        } else {
          this.#pipeline.setMiddlewareFunction(i18nMiddleware);
        }
        this.#pipeline.onBeforeRenderRoute(i18nPipelineHook);
      } else {
        if (mod.onRequest) {
          this.#pipeline.setMiddlewareFunction(mod.onRequest);
        }
      }
      response = await this.#pipeline.renderRoute(renderContext, pageModule);
    } catch (err) {
      if (err instanceof EndpointNotFoundError) {
        return this.#renderError(request, { status: 404, response: err.originalResponse });
      } else {
        this.#logger.error("ssr", err.stack || err.message || String(err));
        return this.#renderError(request, { status: 500 });
      }
    }
    if (routeData.type === "page" || routeData.type === "redirect") {
      if (STATUS_CODES.has(response.status)) {
        return this.#renderError(request, {
          response,
          status: response.status
        });
      }
      Reflect.set(response, responseSentSymbol, true);
      return response;
    }
    return response;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  /**
   * Creates the render context of the current route
   */
  async #createRenderContext(url, request, routeData, page, status = 200) {
    if (routeData.type === "endpoint") {
      const pathname = "/" + this.removeBase(url.pathname);
      const mod = await page.page();
      const handler = mod;
      return await createRenderContext({
        request,
        pathname,
        route: routeData,
        status,
        env: this.#pipeline.env,
        mod: handler,
        locales: this.#manifest.i18n?.locales,
        routing: this.#manifest.i18n?.routing,
        defaultLocale: this.#manifest.i18n?.defaultLocale
      });
    } else {
      const pathname = prependForwardSlash(this.removeBase(url.pathname));
      const info = this.#routeDataToRouteInfo.get(routeData);
      const links = /* @__PURE__ */ new Set();
      const styles = createStylesheetElementSet(info.styles);
      let scripts = /* @__PURE__ */ new Set();
      for (const script of info.scripts) {
        if ("stage" in script) {
          if (script.stage === "head-inline") {
            scripts.add({
              props: {},
              children: script.children
            });
          }
        } else {
          scripts.add(createModuleScriptElement(script));
        }
      }
      const mod = await page.page();
      return await createRenderContext({
        request,
        pathname,
        componentMetadata: this.#manifest.componentMetadata,
        scripts,
        styles,
        links,
        route: routeData,
        status,
        mod,
        env: this.#pipeline.env,
        locales: this.#manifest.i18n?.locales,
        routing: this.#manifest.i18n?.routing,
        defaultLocale: this.#manifest.i18n?.defaultLocale
      });
    }
  }
  /**
   * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
   * This also handles pre-rendered /404 or /500 routes
   */
  async #renderError(request, { status, response: originalResponse, skipMiddleware = false }) {
    const errorRouteData = matchRoute("/" + status, this.#manifestData);
    const url = new URL(request.url);
    if (errorRouteData) {
      if (errorRouteData.prerender) {
        const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
        const statusURL = new URL(
          `${this.#baseWithoutTrailingSlash}/${status}${maybeDotHtml}`,
          url
        );
        const response2 = await fetch(statusURL.toString());
        const override = { status };
        return this.#mergeResponses(response2, originalResponse, override);
      }
      const mod = await this.#getModuleForRoute(errorRouteData);
      try {
        const newRenderContext = await this.#createRenderContext(
          url,
          request,
          errorRouteData,
          mod,
          status
        );
        const page = await mod.page();
        if (skipMiddleware === false && mod.onRequest) {
          this.#pipeline.setMiddlewareFunction(mod.onRequest);
        }
        if (skipMiddleware) {
          this.#pipeline.unsetMiddlewareFunction();
        }
        const response2 = await this.#pipeline.renderRoute(newRenderContext, page);
        return this.#mergeResponses(response2, originalResponse);
      } catch {
        if (skipMiddleware === false && mod.onRequest) {
          return this.#renderError(request, {
            status,
            response: originalResponse,
            skipMiddleware: true
          });
        }
      }
    }
    const response = this.#mergeResponses(new Response(null, { status }), originalResponse);
    Reflect.set(response, responseSentSymbol, true);
    return response;
  }
  #mergeResponses(newResponse, oldResponse, override) {
    if (!oldResponse) {
      if (override !== void 0) {
        return new Response(newResponse.body, {
          status: override.status,
          statusText: newResponse.statusText,
          headers: newResponse.headers
        });
      }
      return newResponse;
    }
    const { statusText, headers } = oldResponse;
    const status = override?.status ? override.status : oldResponse.status === 200 ? newResponse.status : oldResponse.status;
    return new Response(newResponse.body, {
      status,
      statusText: status === 200 ? newResponse.statusText : statusText,
      headers: new Headers(Array.from(headers))
    });
  }
  #getDefaultStatusCode(routeData, pathname) {
    if (!routeData.pattern.exec(pathname)) {
      for (const fallbackRoute of routeData.fallbackRoutes) {
        if (fallbackRoute.pattern.test(pathname)) {
          return 302;
        }
      }
    }
    const route = removeTrailingForwardSlash(routeData.route);
    if (route.endsWith("/404"))
      return 404;
    if (route.endsWith("/500"))
      return 500;
    return 200;
  }
  async #getModuleForRoute(route) {
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.#manifest.pageMap) {
        const importComponentInstance = this.#manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        const pageModule = await importComponentInstance();
        return pageModule;
      } else if (this.#manifest.pageModule) {
        const importComponentInstance = this.#manifest.pageModule;
        return importComponentInstance;
      } else {
        throw new Error(
          "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
        );
      }
    }
  }
}

function apply() {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", {
      value: crypto.webcrypto
    });
  }
  if (!globalThis.File) {
    Object.defineProperty(globalThis, "File", {
      value: buffer.File
    });
  }
}

const clientAddressSymbol = Symbol.for("astro.clientAddress");
function createRequestFromNodeRequest(req, options) {
  const protocol = req.socket instanceof TLSSocket || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const hostname = req.headers.host || req.headers[":authority"];
  const url = `${protocol}://${hostname}${req.url}`;
  const headers = makeRequestHeaders(req);
  const method = req.method || "GET";
  let bodyProps = {};
  const bodyAllowed = method !== "HEAD" && method !== "GET" && !options?.emptyBody;
  if (bodyAllowed) {
    bodyProps = makeRequestBody(req);
  }
  const request = new Request(url, {
    method,
    headers,
    ...bodyProps
  });
  if (req.socket?.remoteAddress) {
    Reflect.set(request, clientAddressSymbol, req.socket.remoteAddress);
  }
  return request;
}
function makeRequestHeaders(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === void 0) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.append(name, value);
    }
  }
  return headers;
}
function makeRequestBody(req) {
  if (req.body !== void 0) {
    if (typeof req.body === "string" && req.body.length > 0) {
      return { body: Buffer.from(req.body) };
    }
    if (typeof req.body === "object" && req.body !== null && Object.keys(req.body).length > 0) {
      return { body: Buffer.from(JSON.stringify(req.body)) };
    }
    if (typeof req.body === "object" && req.body !== null && typeof req.body[Symbol.asyncIterator] !== "undefined") {
      return asyncIterableToBodyProps(req.body);
    }
  }
  return asyncIterableToBodyProps(req);
}
function asyncIterableToBodyProps(iterable) {
  return {
    // Node uses undici for the Request implementation. Undici accepts
    // a non-standard async iterable for the body.
    // @ts-expect-error
    body: iterable,
    // The duplex property is required when using a ReadableStream or async
    // iterable for the body. The type definitions do not include the duplex
    // property because they are not up-to-date.
    // @ts-expect-error
    duplex: "half"
  };
}
class NodeApp extends App {
  match(req, opts = {}) {
    if (!(req instanceof Request)) {
      req = createRequestFromNodeRequest(req, {
        emptyBody: true
      });
    }
    return super.match(req, opts);
  }
  render(req, routeData, locals) {
    if (!(req instanceof Request)) {
      req = createRequestFromNodeRequest(req);
    }
    return super.render(req, routeData, locals);
  }
}

nodePath.posix.join;

const ASTRO_PATH_HEADER = "x-astro-path";
const ASTRO_PATH_PARAM = "x_astro_path";
const ASTRO_LOCALS_HEADER = "x-astro-locals";
const ASTRO_MIDDLEWARE_SECRET_HEADER = "x-astro-middleware-secret";

apply();
const createExports = (manifest, { middlewareSecret }) => {
  const app = new NodeApp(manifest);
  const handler = async (req, res) => {
    const url = new URL(`https://example.com${req.url}`);
    const clientAddress = req.headers["x-forwarded-for"];
    const localsHeader = req.headers[ASTRO_LOCALS_HEADER];
    const middlewareSecretHeader = req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
    const realPath = req.headers[ASTRO_PATH_HEADER] ?? url.searchParams.get(ASTRO_PATH_PARAM);
    if (typeof realPath === "string") {
      req.url = realPath;
    }
    let locals = {};
    if (localsHeader) {
      if (middlewareSecretHeader !== middlewareSecret) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }
      locals = typeof localsHeader === "string" ? JSON.parse(localsHeader) : JSON.parse(localsHeader[0]);
    }
    delete req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
    const webResponse = await app.render(req, { addCookieHeader: true, clientAddress, locals });
    await NodeApp.writeResponse(webResponse, res);
  };
  return { default: handler };
};

const _page0  = () => import('./chunks/generic_300df45f.mjs');
const _page1  = () => import('./chunks/index_d98e6bf8.mjs');const pageMap = new Map([["node_modules/astro/dist/assets/endpoint/generic.js", _page0],["src/pages/index.astro", _page1]]);
const _manifest = Object.assign(manifest, {
	pageMap,
	renderers,
});
const _args = {"middlewareSecret":"faeafde9-8ee1-4281-b911-436b343e4e66"};

const _exports = createExports(_manifest, _args);
const _default = _exports['default'];

export { _default as default, pageMap };
