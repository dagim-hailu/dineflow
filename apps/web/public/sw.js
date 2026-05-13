(() => {
  'use strict';
  let e,
    t,
    a,
    s = {
      googleAnalytics: 'googleAnalytics',
      precache: 'precache-v2',
      prefix: 'serwist',
      runtime: 'runtime',
      suffix: 'undefined' != typeof registration ? registration.scope : '',
    },
    r = (e) => [s.prefix, e, s.suffix].filter((e) => e && e.length > 0).join('-'),
    n = {
      updateDetails: (e) => {
        var t = (t) => {
          let a = e[t];
          'string' == typeof a && (s[t] = a);
        };
        for (let e of Object.keys(s)) t(e);
      },
      getGoogleAnalyticsName: (e) => e || r(s.googleAnalytics),
      getPrecacheName: (e) => e || r(s.precache),
      getRuntimeName: (e) => e || r(s.runtime),
    };
  var i = class extends Error {
    details;
    constructor(e, t) {
      (super(
        ((e, ...t) => {
          let a = e;
          return (t.length > 0 && (a += ` :: ${JSON.stringify(t)}`), a);
        })(e, t),
      ),
        (this.name = e),
        (this.details = t));
    }
  };
  function c(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  let o = new Set();
  function l(e, t) {
    let a = new URL(e);
    for (let e of t) a.searchParams.delete(e);
    return a.href;
  }
  async function h(e, t, a, s) {
    let r = l(t.url, a);
    if (t.url === r) return e.match(t, s);
    let n = { ...s, ignoreSearch: !0 };
    for (let i of await e.keys(t, n)) if (r === l(i.url, a)) return e.match(i, s);
  }
  var u = class {
    promise;
    resolve;
    reject;
    constructor() {
      this.promise = new Promise((e, t) => {
        ((this.resolve = e), (this.reject = t));
      });
    }
  };
  let d = async () => {
      for (let e of o) await e();
    },
    m = '-precache-',
    g = async (e, t = m) => {
      let a = (await self.caches.keys()).filter(
        (a) => a.includes(t) && a.includes(self.registration.scope) && a !== e,
      );
      return (await Promise.all(a.map((e) => self.caches.delete(e))), a);
    },
    f = (e, t) => {
      let a = t();
      return (e.waitUntil(a), a);
    },
    w = (e, t) => t.some((t) => e instanceof t),
    p = new WeakMap(),
    y = new WeakMap(),
    _ = new WeakMap(),
    b = {
      get(e, t, a) {
        if (e instanceof IDBTransaction) {
          if ('done' === t) return p.get(e);
          if ('store' === t)
            return a.objectStoreNames[1] ? void 0 : a.objectStore(a.objectStoreNames[0]);
        }
        return x(e[t]);
      },
      set: (e, t, a) => ((e[t] = a), !0),
      has: (e, t) => (e instanceof IDBTransaction && ('done' === t || 'store' === t)) || t in e,
    };
  function x(e) {
    if (e instanceof IDBRequest) {
      let t = new Promise((t, a) => {
        let s = () => {
            (e.removeEventListener('success', r), e.removeEventListener('error', n));
          },
          r = () => {
            (t(x(e.result)), s());
          },
          n = () => {
            (a(e.error), s());
          };
        (e.addEventListener('success', r), e.addEventListener('error', n));
      });
      return (_.set(t, e), t);
    }
    if (y.has(e)) return y.get(e);
    let s = (function (e) {
      if ('function' == typeof e)
        return (
          a ||
          (a = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
          ])
        ).includes(e)
          ? function (...t) {
              return (e.apply(R(this), t), x(this.request));
            }
          : function (...t) {
              return x(e.apply(R(this), t));
            };
      return (e instanceof IDBTransaction &&
        (function (e) {
          if (p.has(e)) return;
          let t = new Promise((t, a) => {
            let s = () => {
                (e.removeEventListener('complete', r),
                  e.removeEventListener('error', n),
                  e.removeEventListener('abort', n));
              },
              r = () => {
                (t(), s());
              },
              n = () => {
                (a(e.error || new DOMException('AbortError', 'AbortError')), s());
              };
            (e.addEventListener('complete', r),
              e.addEventListener('error', n),
              e.addEventListener('abort', n));
          });
          p.set(e, t);
        })(e),
      w(e, t || (t = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])))
        ? new Proxy(e, b)
        : e;
    })(e);
    return (s !== e && (y.set(e, s), _.set(s, e)), s);
  }
  let R = (e) => _.get(e);
  function v(e, t, { blocked: a, upgrade: s, blocking: r, terminated: n } = {}) {
    let i = indexedDB.open(e, t),
      c = x(i);
    return (
      s &&
        i.addEventListener('upgradeneeded', (e) => {
          s(x(i.result), e.oldVersion, e.newVersion, x(i.transaction), e);
        }),
      a && i.addEventListener('blocked', (e) => a(e.oldVersion, e.newVersion, e)),
      c
        .then((e) => {
          (n && e.addEventListener('close', () => n()),
            r && e.addEventListener('versionchange', (e) => r(e.oldVersion, e.newVersion, e)));
        })
        .catch(() => {}),
      c
    );
  }
  let E = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
    q = ['put', 'add', 'delete', 'clear'],
    S = new Map();
  function D(e, t) {
    if (!(e instanceof IDBDatabase && !(t in e) && 'string' == typeof t)) return;
    if (S.get(t)) return S.get(t);
    let a = t.replace(/FromIndex$/, ''),
      s = t !== a,
      r = q.includes(a);
    if (!(a in (s ? IDBIndex : IDBObjectStore).prototype) || !(r || E.includes(a))) return;
    let n = async function (e, ...t) {
      let n = this.transaction(e, r ? 'readwrite' : 'readonly'),
        i = n.store;
      return (s && (i = i.index(t.shift())), (await Promise.all([i[a](...t), r && n.done]))[0]);
    };
    return (S.set(t, n), n);
  }
  b = ((e) => ({
    ...e,
    get: (t, a, s) => D(t, a) || e.get(t, a, s),
    has: (t, a) => !!D(t, a) || e.has(t, a),
  }))(b);
  let N = ['continue', 'continuePrimaryKey', 'advance'],
    C = {},
    P = new WeakMap(),
    T = new WeakMap(),
    k = {
      get(e, t) {
        if (!N.includes(t)) return e[t];
        let a = C[t];
        return (
          a ||
            (a = C[t] =
              function (...e) {
                P.set(this, T.get(this)[t](...e));
              }),
          a
        );
      },
    };
  async function* A(...e) {
    let t = this;
    if ((t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)) return;
    let a = new Proxy(t, k);
    for (T.set(a, t), _.set(a, R(t)); t; )
      (yield a, (t = await (P.get(a) || t.continue())), P.delete(a));
  }
  function I(e, t) {
    return (
      (t === Symbol.asyncIterator && w(e, [IDBIndex, IDBObjectStore, IDBCursor])) ||
      ('iterate' === t && w(e, [IDBIndex, IDBObjectStore]))
    );
  }
  b = ((e) => ({
    ...e,
    get: (t, a, s) => (I(t, a) ? A : e.get(t, a, s)),
    has: (t, a) => I(t, a) || e.has(t, a),
  }))(b);
  let U = async (t, a) => {
      let s = null;
      if ((t.url && (s = new URL(t.url).origin), s !== self.location.origin))
        throw new i('cross-origin-copy-response', { origin: s });
      let r = t.clone(),
        n = { headers: new Headers(r.headers), status: r.status, statusText: r.statusText },
        c = a ? a(n) : n,
        o = !(function () {
          if (void 0 === e) {
            let t = new Response('');
            if ('body' in t)
              try {
                (new Response(t.body), (e = !0));
              } catch {
                e = !1;
              }
            e = !1;
          }
          return e;
        })()
          ? await r.blob()
          : r.body;
      return new Response(o, c);
    },
    L = 'requests',
    F = 'queueName';
  var O = class {
      _db = null;
      async addEntry(e) {
        let t = (await this.getDb()).transaction(L, 'readwrite', { durability: 'relaxed' });
        (await t.store.add(e), await t.done);
      }
      async getFirstEntryId() {
        return (await (await this.getDb()).transaction(L).store.openCursor())?.value.id;
      }
      async getAllEntriesByQueueName(e) {
        return (await (await this.getDb()).getAllFromIndex(L, F, IDBKeyRange.only(e))) || [];
      }
      async getEntryCountByQueueName(e) {
        return (await this.getDb()).countFromIndex(L, F, IDBKeyRange.only(e));
      }
      async deleteEntry(e) {
        await (await this.getDb()).delete(L, e);
      }
      async getFirstEntryByQueueName(e) {
        return await this.getEndEntryFromIndex(IDBKeyRange.only(e), 'next');
      }
      async getLastEntryByQueueName(e) {
        return await this.getEndEntryFromIndex(IDBKeyRange.only(e), 'prev');
      }
      async getEndEntryFromIndex(e, t) {
        return (await (await this.getDb()).transaction(L).store.index(F).openCursor(e, t))?.value;
      }
      async getDb() {
        return (
          this._db ||
            (this._db = await v('serwist-background-sync', 3, { upgrade: this._upgradeDb })),
          this._db
        );
      }
      _upgradeDb(e, t) {
        (t > 0 && t < 3 && e.objectStoreNames.contains(L) && e.deleteObjectStore(L),
          e
            .createObjectStore(L, { autoIncrement: !0, keyPath: 'id' })
            .createIndex(F, F, { unique: !1 }));
      }
    },
    M = class {
      _queueName;
      _queueDb;
      constructor(e) {
        ((this._queueName = e), (this._queueDb = new O()));
      }
      async pushEntry(e) {
        (delete e.id, (e.queueName = this._queueName), await this._queueDb.addEntry(e));
      }
      async unshiftEntry(e) {
        let t = await this._queueDb.getFirstEntryId();
        (t ? (e.id = t - 1) : delete e.id,
          (e.queueName = this._queueName),
          await this._queueDb.addEntry(e));
      }
      async popEntry() {
        return this._removeEntry(await this._queueDb.getLastEntryByQueueName(this._queueName));
      }
      async shiftEntry() {
        return this._removeEntry(await this._queueDb.getFirstEntryByQueueName(this._queueName));
      }
      async getAll() {
        return await this._queueDb.getAllEntriesByQueueName(this._queueName);
      }
      async size() {
        return await this._queueDb.getEntryCountByQueueName(this._queueName);
      }
      async deleteEntry(e) {
        await this._queueDb.deleteEntry(e);
      }
      async _removeEntry(e) {
        return (e && (await this.deleteEntry(e.id)), e);
      }
    };
  let B = [
    'method',
    'referrer',
    'referrerPolicy',
    'mode',
    'credentials',
    'cache',
    'redirect',
    'integrity',
    'keepalive',
  ];
  var K = class e {
    _requestData;
    static async fromRequest(t) {
      let a = { url: t.url, headers: {} };
      for (let e of ('GET' !== t.method && (a.body = await t.clone().arrayBuffer()),
      t.headers.forEach((e, t) => {
        a.headers[t] = e;
      }),
      B))
        void 0 !== t[e] && (a[e] = t[e]);
      return new e(a);
    }
    constructor(e) {
      ('navigate' === e.mode && (e.mode = 'same-origin'), (this._requestData = e));
    }
    toObject() {
      let e = Object.assign({}, this._requestData);
      return (
        (e.headers = Object.assign({}, this._requestData.headers)),
        e.body && (e.body = e.body.slice(0)),
        e
      );
    }
    toRequest() {
      return new Request(this._requestData.url, this._requestData);
    }
    clone() {
      return new e(this.toObject());
    }
  };
  let W = 'serwist-background-sync',
    j = new Set(),
    $ = (e) => {
      let t = { request: new K(e.requestData).toRequest(), timestamp: e.timestamp };
      return (e.metadata && (t.metadata = e.metadata), t);
    };
  var H = class {
      _name;
      _onSync;
      _maxRetentionTime;
      _queueStore;
      _forceSyncFallback;
      _syncInProgress = !1;
      _requestsAddedDuringSync = !1;
      constructor(e, { forceSyncFallback: t, onSync: a, maxRetentionTime: s } = {}) {
        if (j.has(e)) throw new i('duplicate-queue-name', { name: e });
        (j.add(e),
          (this._name = e),
          (this._onSync = a || this.replayRequests),
          (this._maxRetentionTime = s || 10080),
          (this._forceSyncFallback = !!t),
          (this._queueStore = new M(this._name)),
          this._addSyncListener());
      }
      get name() {
        return this._name;
      }
      async pushRequest(e) {
        await this._addRequest(e, 'push');
      }
      async unshiftRequest(e) {
        await this._addRequest(e, 'unshift');
      }
      async popRequest() {
        return this._removeRequest('pop');
      }
      async shiftRequest() {
        return this._removeRequest('shift');
      }
      async getAll() {
        let e = await this._queueStore.getAll(),
          t = Date.now(),
          a = [];
        for (let s of e) {
          let e = 60 * this._maxRetentionTime * 1e3;
          t - s.timestamp > e ? await this._queueStore.deleteEntry(s.id) : a.push($(s));
        }
        return a;
      }
      async size() {
        return await this._queueStore.size();
      }
      async _addRequest({ request: e, metadata: t, timestamp: a = Date.now() }, s) {
        let r = { requestData: (await K.fromRequest(e.clone())).toObject(), timestamp: a };
        switch ((t && (r.metadata = t), s)) {
          case 'push':
            await this._queueStore.pushEntry(r);
            break;
          case 'unshift':
            await this._queueStore.unshiftEntry(r);
        }
        this._syncInProgress ? (this._requestsAddedDuringSync = !0) : await this.registerSync();
      }
      async _removeRequest(e) {
        let t,
          a = Date.now();
        switch (e) {
          case 'pop':
            t = await this._queueStore.popEntry();
            break;
          case 'shift':
            t = await this._queueStore.shiftEntry();
        }
        if (t) {
          let s = 60 * this._maxRetentionTime * 1e3;
          return a - t.timestamp > s ? this._removeRequest(e) : $(t);
        }
      }
      async replayRequests() {
        let e;
        for (; (e = await this.shiftRequest()); )
          try {
            await fetch(e.request.clone());
          } catch {
            throw (
              await this.unshiftRequest(e),
              new i('queue-replay-failed', { name: this._name })
            );
          }
      }
      async registerSync() {
        if ('sync' in self.registration && !this._forceSyncFallback)
          try {
            await self.registration.sync.register(`${W}:${this._name}`);
          } catch (e) {}
      }
      _addSyncListener() {
        'sync' in self.registration && !this._forceSyncFallback
          ? self.addEventListener('sync', (e) => {
              if (e.tag === `${W}:${this._name}`) {
                let t = async () => {
                  let t;
                  this._syncInProgress = !0;
                  try {
                    await this._onSync({ queue: this });
                  } catch (e) {
                    if (e instanceof Error) throw e;
                  } finally {
                    (this._requestsAddedDuringSync &&
                      !(t && !e.lastChance) &&
                      (await this.registerSync()),
                      (this._syncInProgress = !1),
                      (this._requestsAddedDuringSync = !1));
                  }
                };
                e.waitUntil(t());
              }
            })
          : this._onSync({ queue: this });
      }
      static get _queueNames() {
        return j;
      }
    },
    G = class {
      _queue;
      constructor(e, t) {
        this._queue = new H(e, t);
      }
      async fetchDidFail({ request: e }) {
        await this._queue.pushRequest({ request: e });
      }
    };
  let Q = {
    cacheWillUpdate: async ({ response: e }) => (200 === e.status || 0 === e.status ? e : null),
  };
  function V(e) {
    return 'string' == typeof e ? new Request(e) : e;
  }
  var z = class {
      event;
      request;
      url;
      params;
      _cacheKeys = {};
      _strategy;
      _handlerDeferred;
      _extendLifetimePromises;
      _plugins;
      _pluginStateMap;
      constructor(e, t) {
        for (let a of ((this.event = t.event),
        (this.request = t.request),
        t.url && ((this.url = t.url), (this.params = t.params)),
        (this._strategy = e),
        (this._handlerDeferred = new u()),
        (this._extendLifetimePromises = []),
        (this._plugins = [...e.plugins]),
        (this._pluginStateMap = new Map()),
        this._plugins))
          this._pluginStateMap.set(a, {});
        this.event.waitUntil(this._handlerDeferred.promise);
      }
      async fetch(e) {
        let { event: t } = this,
          a = V(e),
          s = await this.getPreloadResponse();
        if (s) return s;
        let r = this.hasCallback('fetchDidFail') ? a.clone() : null;
        try {
          for (let e of this.iterateCallbacks('requestWillFetch'))
            a = await e({ request: a.clone(), event: t });
        } catch (e) {
          if (e instanceof Error)
            throw new i('plugin-error-request-will-fetch', { thrownErrorMessage: e.message });
        }
        let n = a.clone();
        try {
          let e;
          for (let s of ((e = await fetch(
            a,
            'navigate' === a.mode ? void 0 : this._strategy.fetchOptions,
          )),
          this.iterateCallbacks('fetchDidSucceed')))
            e = await s({ event: t, request: n, response: e });
          return e;
        } catch (e) {
          throw (
            r &&
              (await this.runCallbacks('fetchDidFail', {
                error: e,
                event: t,
                originalRequest: r.clone(),
                request: n.clone(),
              })),
            e
          );
        }
      }
      async fetchAndCachePut(e) {
        let t = await this.fetch(e),
          a = t.clone();
        return (this.waitUntil(this.cachePut(e, a)), t);
      }
      async cacheMatch(e) {
        let t,
          a = V(e),
          { cacheName: s, matchOptions: r } = this._strategy,
          n = await this.getCacheKey(a, 'read'),
          i = { ...r, cacheName: s };
        for (let e of ((t = await caches.match(n, i)),
        this.iterateCallbacks('cachedResponseWillBeUsed')))
          t =
            (await e({
              cacheName: s,
              matchOptions: r,
              cachedResponse: t,
              request: n,
              event: this.event,
            })) || void 0;
        return t;
      }
      async cachePut(e, t) {
        let a = V(e);
        await c(0);
        let s = await this.getCacheKey(a, 'write');
        if (!t)
          throw new i('cache-put-with-no-response', {
            url: new URL(String(s.url), location.href).href.replace(
              RegExp(`^${location.origin}`),
              '',
            ),
          });
        let r = await this._ensureResponseSafeToCache(t);
        if (!r) return !1;
        let { cacheName: n, matchOptions: o } = this._strategy,
          l = await self.caches.open(n),
          u = this.hasCallback('cacheDidUpdate'),
          m = u ? await h(l, s.clone(), ['__WB_REVISION__'], o) : null;
        try {
          await l.put(s, u ? r.clone() : r);
        } catch (e) {
          if (e instanceof Error) throw ('QuotaExceededError' === e.name && (await d()), e);
        }
        for (let e of this.iterateCallbacks('cacheDidUpdate'))
          await e({
            cacheName: n,
            oldResponse: m,
            newResponse: r.clone(),
            request: s,
            event: this.event,
          });
        return !0;
      }
      async getCacheKey(e, t) {
        let a = `${e.url} | ${t}`;
        if (!this._cacheKeys[a]) {
          let s = e;
          for (let e of this.iterateCallbacks('cacheKeyWillBeUsed'))
            s = V(await e({ mode: t, request: s, event: this.event, params: this.params }));
          this._cacheKeys[a] = s;
        }
        return this._cacheKeys[a];
      }
      hasCallback(e) {
        for (let t of this._strategy.plugins) if (e in t) return !0;
        return !1;
      }
      async runCallbacks(e, t) {
        for (let a of this.iterateCallbacks(e)) await a(t);
      }
      *iterateCallbacks(e) {
        for (let t of this._strategy.plugins)
          if ('function' == typeof t[e]) {
            let a = this._pluginStateMap.get(t),
              s = (s) => {
                let r = { ...s, state: a };
                return t[e](r);
              };
            yield s;
          }
      }
      waitUntil(e) {
        return (this._extendLifetimePromises.push(e), e);
      }
      async doneWaiting() {
        let e;
        for (; (e = this._extendLifetimePromises.shift()); ) await e;
      }
      destroy() {
        this._handlerDeferred.resolve(null);
      }
      async getPreloadResponse() {
        if (
          this.event instanceof FetchEvent &&
          'navigate' === this.event.request.mode &&
          'preloadResponse' in this.event
        )
          try {
            let e = await this.event.preloadResponse;
            if (e) return e;
          } catch (e) {
            return;
          }
      }
      async _ensureResponseSafeToCache(e) {
        let t = e,
          a = !1;
        for (let e of this.iterateCallbacks('cacheWillUpdate'))
          if (
            ((t = (await e({ request: this.request, response: t, event: this.event })) || void 0),
            (a = !0),
            !t)
          )
            break;
        return (!a && t && 200 !== t.status && (t = void 0), t);
      }
    },
    J = class {
      cacheName;
      plugins;
      fetchOptions;
      matchOptions;
      constructor(e = {}) {
        ((this.cacheName = n.getRuntimeName(e.cacheName)),
          (this.plugins = e.plugins || []),
          (this.fetchOptions = e.fetchOptions),
          (this.matchOptions = e.matchOptions));
      }
      handle(e) {
        let [t] = this.handleAll(e);
        return t;
      }
      handleAll(e) {
        e instanceof FetchEvent && (e = { event: e, request: e.request });
        let t = e.event,
          a = 'string' == typeof e.request ? new Request(e.request) : e.request,
          s = new z(
            this,
            e.url
              ? { event: t, request: a, url: e.url, params: e.params }
              : { event: t, request: a },
          ),
          r = this._getResponse(s, a, t);
        return [r, this._awaitComplete(r, s, a, t)];
      }
      async _getResponse(e, t, a) {
        let s;
        await e.runCallbacks('handlerWillStart', { event: a, request: t });
        try {
          if (((s = await this._handle(t, e)), void 0 === s || 'error' === s.type))
            throw new i('no-response', { url: t.url });
        } catch (r) {
          if (r instanceof Error) {
            for (let n of e.iterateCallbacks('handlerDidError'))
              if (void 0 !== (s = await n({ error: r, event: a, request: t }))) break;
          }
          if (!s) throw r;
        }
        for (let r of e.iterateCallbacks('handlerWillRespond'))
          s = await r({ event: a, request: t, response: s });
        return s;
      }
      async _awaitComplete(e, t, a, s) {
        let r, n;
        try {
          r = await e;
        } catch {}
        try {
          (await t.runCallbacks('handlerDidRespond', { event: s, request: a, response: r }),
            await t.doneWaiting());
        } catch (e) {
          e instanceof Error && (n = e);
        }
        if (
          (await t.runCallbacks('handlerDidComplete', {
            event: s,
            request: a,
            response: r,
            error: n,
          }),
          t.destroy(),
          n)
        )
          throw n;
      }
    },
    X = class extends J {
      _networkTimeoutSeconds;
      constructor(e = {}) {
        (super(e),
          this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(Q),
          (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0));
      }
      async _handle(e, t) {
        let a,
          s = [],
          r = [];
        if (this._networkTimeoutSeconds) {
          let { id: n, promise: i } = this._getTimeoutPromise({ request: e, logs: s, handler: t });
          ((a = n), r.push(i));
        }
        let n = this._getNetworkPromise({ timeoutId: a, request: e, logs: s, handler: t });
        r.push(n);
        let c = await t.waitUntil(
          (async () => (await t.waitUntil(Promise.race(r))) || (await n))(),
        );
        if (!c) throw new i('no-response', { url: e.url });
        return c;
      }
      _getTimeoutPromise({ request: e, logs: t, handler: a }) {
        let s;
        return {
          promise: new Promise((t) => {
            s = setTimeout(async () => {
              t(await a.cacheMatch(e));
            }, 1e3 * this._networkTimeoutSeconds);
          }),
          id: s,
        };
      }
      async _getNetworkPromise({ timeoutId: e, request: t, logs: a, handler: s }) {
        let r, n;
        try {
          n = await s.fetchAndCachePut(t);
        } catch (e) {
          e instanceof Error && (r = e);
        }
        return (e && clearTimeout(e), (r || !n) && (n = await s.cacheMatch(t)), n);
      }
    },
    Y = class extends J {
      _networkTimeoutSeconds;
      constructor(e = {}) {
        (super(e), (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0));
      }
      async _handle(e, t) {
        let a, s;
        try {
          let a = [t.fetch(e)];
          if (this._networkTimeoutSeconds) {
            let e = c(1e3 * this._networkTimeoutSeconds);
            a.push(e);
          }
          if (!(s = await Promise.race(a)))
            throw Error(
              `Timed out the network response after ${this._networkTimeoutSeconds} seconds.`,
            );
        } catch (e) {
          e instanceof Error && (a = e);
        }
        if (!s) throw new i('no-response', { url: e.url, error: a });
        return s;
      }
    };
  let Z = (e) => (e && 'object' == typeof e ? e : { handle: e });
  var ee = class {
      handler;
      match;
      method;
      catchHandler;
      constructor(e, t, a = 'GET') {
        ((this.handler = Z(t)), (this.match = e), (this.method = a));
      }
      setCatchHandler(e) {
        this.catchHandler = Z(e);
      }
    },
    et = class e extends J {
      _fallbackToNetwork;
      static defaultPrecacheCacheabilityPlugin = {
        cacheWillUpdate: async ({ response: e }) => (!e || e.status >= 400 ? null : e),
      };
      static copyRedirectedCacheableResponsesPlugin = {
        cacheWillUpdate: async ({ response: e }) => (e.redirected ? await U(e) : e),
      };
      constructor(t = {}) {
        ((t.cacheName = n.getPrecacheName(t.cacheName)),
          super(t),
          (this._fallbackToNetwork = !1 !== t.fallbackToNetwork),
          this.plugins.push(e.copyRedirectedCacheableResponsesPlugin));
      }
      async _handle(e, t) {
        let a = await t.getPreloadResponse();
        if (a) return a;
        let s = await t.cacheMatch(e);
        return (
          s ||
          (t.event && 'install' === t.event.type
            ? await this._handleInstall(e, t)
            : await this._handleFetch(e, t))
        );
      }
      async _handleFetch(e, t) {
        let a,
          s = t.params || {};
        if (this._fallbackToNetwork) {
          let r = s.integrity,
            n = e.integrity,
            i = !n || n === r;
          ((a = await t.fetch(
            new Request(e, { integrity: 'no-cors' !== e.mode ? n || r : void 0 }),
          )),
            r &&
              i &&
              'no-cors' !== e.mode &&
              (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, a.clone())));
        } else throw new i('missing-precache-entry', { cacheName: this.cacheName, url: e.url });
        return a;
      }
      async _handleInstall(e, t) {
        this._useDefaultCacheabilityPluginIfNeeded();
        let a = await t.fetch(e);
        if (!(await t.cachePut(e, a.clone())))
          throw new i('bad-precaching-response', { url: e.url, status: a.status });
        return a;
      }
      _useDefaultCacheabilityPluginIfNeeded() {
        let t = null,
          a = 0;
        for (let [s, r] of this.plugins.entries())
          r !== e.copyRedirectedCacheableResponsesPlugin &&
            (r === e.defaultPrecacheCacheabilityPlugin && (t = s), r.cacheWillUpdate && a++);
        0 === a
          ? this.plugins.push(e.defaultPrecacheCacheabilityPlugin)
          : a > 1 && null !== t && this.plugins.splice(t, 1);
      }
    },
    ea = class extends ee {
      _allowlist;
      _denylist;
      constructor(e, { allowlist: t = [/./], denylist: a = [] } = {}) {
        (super((e) => this._match(e), e), (this._allowlist = t), (this._denylist = a));
      }
      _match({ url: e, request: t }) {
        if (t && 'navigate' !== t.mode) return !1;
        let a = e.pathname + e.search;
        for (let e of this._denylist) if (e.test(a)) return !1;
        return !!this._allowlist.some((e) => e.test(a));
      }
    },
    es = class extends ee {
      constructor(e, t, a) {
        super(
          ({ url: t }) => {
            let a = e.exec(t.href);
            if (a) return t.origin !== location.origin && 0 !== a.index ? void 0 : a.slice(1);
          },
          t,
          a,
        );
      }
    };
  let er = (e) => {
    if (!e) throw new i('add-to-cache-list-unexpected-type', { entry: e });
    if ('string' == typeof e) {
      let t = new URL(e, location.href);
      return { cacheKey: t.href, url: t.href };
    }
    let { revision: t, url: a } = e;
    if (!a) throw new i('add-to-cache-list-unexpected-type', { entry: e });
    if (!t) {
      let e = new URL(a, location.href);
      return { cacheKey: e.href, url: e.href };
    }
    let s = new URL(a, location.href),
      r = new URL(a, location.href);
    return (s.searchParams.set('__WB_REVISION__', t), { cacheKey: s.href, url: r.href });
  };
  var en = class {
    updatedURLs = [];
    notUpdatedURLs = [];
    handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    };
    cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: a }) => {
      if ('install' === e.type && t?.originalRequest && t.originalRequest instanceof Request) {
        let e = t.originalRequest.url;
        a ? this.notUpdatedURLs.push(e) : this.updatedURLs.push(e);
      }
      return a;
    };
  };
  let ei = async (e, t, a) => {
    let s = t.map((e, t) => ({ index: t, item: e })),
      r = async (e) => {
        let t = [];
        for (;;) {
          let r = s.pop();
          if (!r) return e(t);
          let n = await a(r.item);
          t.push({ result: n, index: r.index });
        }
      },
      n = Array.from({ length: e }, () => new Promise(r));
    return (await Promise.all(n))
      .flat()
      .sort((e, t) => (e.index < t.index ? -1 : 1))
      .map((e) => e.result);
  };
  'undefined' != typeof navigator && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var ec = class {
      _statuses;
      _headers;
      constructor(e = {}) {
        ((this._statuses = e.statuses), e.headers && (this._headers = new Headers(e.headers)));
      }
      isResponseCacheable(e) {
        let t = !0;
        if ((this._statuses && (t = this._statuses.includes(e.status)), this._headers && t)) {
          for (let [a, s] of this._headers.entries())
            if (e.headers.get(a) !== s) {
              t = !1;
              break;
            }
        }
        return t;
      }
    },
    eo = class {
      _cacheableResponse;
      constructor(e) {
        this._cacheableResponse = new ec(e);
      }
      cacheWillUpdate = async ({ response: e }) =>
        this._cacheableResponse.isResponseCacheable(e) ? e : null;
    };
  let el = 'cache-entries',
    eh = (e) => {
      let t = new URL(e, location.href);
      return ((t.hash = ''), t.href);
    };
  var eu = class {
      _cacheName;
      _db = null;
      constructor(e) {
        this._cacheName = e;
      }
      _getId(e) {
        return `${this._cacheName}|${eh(e)}`;
      }
      _upgradeDb(e) {
        let t = e.createObjectStore(el, { keyPath: 'id' });
        (t.createIndex('cacheName', 'cacheName', { unique: !1 }),
          t.createIndex('timestamp', 'timestamp', { unique: !1 }));
      }
      _upgradeDbAndDeleteOldDbs(e) {
        (this._upgradeDb(e),
          this._cacheName &&
            (function (e, { blocked: t } = {}) {
              let a = indexedDB.deleteDatabase(e);
              (t && a.addEventListener('blocked', (e) => t(e.oldVersion, e)),
                x(a).then(() => void 0));
            })(this._cacheName));
      }
      async setTimestamp(e, t) {
        e = eh(e);
        let a = { id: this._getId(e), cacheName: this._cacheName, url: e, timestamp: t },
          s = (await this.getDb()).transaction(el, 'readwrite', { durability: 'relaxed' });
        (await s.store.put(a), await s.done);
      }
      async getTimestamp(e) {
        return (await (await this.getDb()).get(el, this._getId(e)))?.timestamp;
      }
      async expireEntries(e, t) {
        let a = await (await this.getDb())
            .transaction(el, 'readwrite')
            .store.index('timestamp')
            .openCursor(null, 'prev'),
          s = [],
          r = 0;
        for (; a; ) {
          let n = a.value;
          (n.cacheName === this._cacheName &&
            ((e && n.timestamp < e) || (t && r >= t) ? (a.delete(), s.push(n.url)) : r++),
            (a = await a.continue()));
        }
        return s;
      }
      async getDb() {
        return (
          this._db ||
            (this._db = await v('serwist-expiration', 1, {
              upgrade: this._upgradeDbAndDeleteOldDbs.bind(this),
            })),
          this._db
        );
      }
    },
    ed = class {
      _isRunning = !1;
      _rerunRequested = !1;
      _maxEntries;
      _maxAgeSeconds;
      _matchOptions;
      _cacheName;
      _timestampModel;
      constructor(e, t = {}) {
        ((this._maxEntries = t.maxEntries),
          (this._maxAgeSeconds = t.maxAgeSeconds),
          (this._matchOptions = t.matchOptions),
          (this._cacheName = e),
          (this._timestampModel = new eu(e)));
      }
      async expireEntries() {
        if (this._isRunning) {
          this._rerunRequested = !0;
          return;
        }
        this._isRunning = !0;
        let e = this._maxAgeSeconds ? Date.now() - 1e3 * this._maxAgeSeconds : 0,
          t = await this._timestampModel.expireEntries(e, this._maxEntries),
          a = await self.caches.open(this._cacheName);
        for (let e of t) await a.delete(e, this._matchOptions);
        ((this._isRunning = !1),
          this._rerunRequested && ((this._rerunRequested = !1), this.expireEntries()));
      }
      async updateTimestamp(e) {
        await this._timestampModel.setTimestamp(e, Date.now());
      }
      async isURLExpired(e) {
        if (!this._maxAgeSeconds) return !1;
        let t = await this._timestampModel.getTimestamp(e),
          a = Date.now() - 1e3 * this._maxAgeSeconds;
        return void 0 === t || t < a;
      }
      async delete() {
        ((this._rerunRequested = !1), await this._timestampModel.expireEntries(1 / 0));
      }
    },
    em = class {
      _config;
      _cacheExpirations;
      constructor(e = {}) {
        var t;
        ((this._config = e),
          (this._cacheExpirations = new Map()),
          this._config.maxAgeFrom || (this._config.maxAgeFrom = 'last-fetched'),
          this._config.purgeOnQuotaError && ((t = () => this.deleteCacheAndMetadata()), o.add(t)));
      }
      _getCacheExpiration(e) {
        if (e === n.getRuntimeName()) throw new i('expire-custom-caches-only');
        let t = this._cacheExpirations.get(e);
        return (t || ((t = new ed(e, this._config)), this._cacheExpirations.set(e, t)), t);
      }
      cachedResponseWillBeUsed({ event: e, cacheName: t, request: a, cachedResponse: s }) {
        if (!s) return null;
        let r = this._isResponseDateFresh(s),
          n = this._getCacheExpiration(t),
          i = 'last-used' === this._config.maxAgeFrom,
          c = (async () => {
            (i && (await n.updateTimestamp(a.url)), await n.expireEntries());
          })();
        try {
          e.waitUntil(c);
        } catch {}
        return r ? s : null;
      }
      _isResponseDateFresh(e) {
        if ('last-used' === this._config.maxAgeFrom) return !0;
        let t = Date.now();
        if (!this._config.maxAgeSeconds) return !0;
        let a = this._getDateHeaderTimestamp(e);
        return null === a || a >= t - 1e3 * this._config.maxAgeSeconds;
      }
      _getDateHeaderTimestamp(e) {
        if (!e.headers.has('date')) return null;
        let t = new Date(e.headers.get('date')).getTime();
        return Number.isNaN(t) ? null : t;
      }
      async cacheDidUpdate({ cacheName: e, request: t }) {
        let a = this._getCacheExpiration(e);
        (await a.updateTimestamp(t.url), await a.expireEntries());
      }
      async deleteCacheAndMetadata() {
        for (let [e, t] of this._cacheExpirations) (await self.caches.delete(e), await t.delete());
        this._cacheExpirations = new Map();
      }
    };
  let eg = /^\/(\w+\/)?collect/,
    ef = ({ serwist: e, cacheName: t, ...a }) => {
      let s = n.getGoogleAnalyticsName(t),
        r = new G('serwist-google-analytics', {
          maxRetentionTime: 2880,
          onSync: (
            (e) =>
            async ({ queue: t }) => {
              let a;
              for (; (a = await t.shiftRequest()); ) {
                let { request: s, timestamp: r } = a,
                  n = new URL(s.url);
                try {
                  let t =
                      'POST' === s.method
                        ? new URLSearchParams(await s.clone().text())
                        : n.searchParams,
                    a = r - (Number(t.get('qt')) || 0),
                    i = Date.now() - a;
                  if ((t.set('qt', String(i)), e.parameterOverrides))
                    for (let a of Object.keys(e.parameterOverrides)) {
                      let s = e.parameterOverrides[a];
                      t.set(a, s);
                    }
                  ('function' == typeof e.hitFilter && e.hitFilter.call(null, t),
                    await fetch(
                      new Request(n.origin + n.pathname, {
                        body: t.toString(),
                        method: 'POST',
                        mode: 'cors',
                        credentials: 'omit',
                        headers: { 'Content-Type': 'text/plain' },
                      }),
                    ));
                } catch (e) {
                  throw (await t.unshiftRequest(a), e);
                }
              }
            }
          )(a),
        });
      for (let t of [
        new ee(
          ({ url: e }) => 'www.googletagmanager.com' === e.hostname && '/gtm.js' === e.pathname,
          new X({ cacheName: s }),
          'GET',
        ),
        new ee(
          ({ url: e }) =>
            'www.google-analytics.com' === e.hostname && '/analytics.js' === e.pathname,
          new X({ cacheName: s }),
          'GET',
        ),
        new ee(
          ({ url: e }) => 'www.googletagmanager.com' === e.hostname && '/gtag/js' === e.pathname,
          new X({ cacheName: s }),
          'GET',
        ),
        ...((e) => {
          let t = ({ url: e }) => 'www.google-analytics.com' === e.hostname && eg.test(e.pathname),
            a = new Y({ plugins: [e] });
          return [new ee(t, a, 'GET'), new ee(t, a, 'POST')];
        })(r),
      ])
        e.registerRoute(t);
    };
  var ew = class {
    _fallbackUrls;
    _serwist;
    constructor({ fallbackUrls: e, serwist: t }) {
      ((this._fallbackUrls = e), (this._serwist = t));
    }
    async handlerDidError(e) {
      for (let t of this._fallbackUrls)
        if ('string' == typeof t) {
          let e = await this._serwist.matchPrecache(t);
          if (void 0 !== e) return e;
        } else if (t.matcher(e)) {
          let e = await this._serwist.matchPrecache(t.url);
          if (void 0 !== e) return e;
        }
    }
  };
  let ep = async (e, t) => {
    try {
      if (206 === t.status) return t;
      let a = e.headers.get('range');
      if (!a) throw new i('no-range-header');
      let s = ((e) => {
          let t = e.trim().toLowerCase();
          if (!t.startsWith('bytes='))
            throw new i('unit-must-be-bytes', { normalizedRangeHeader: t });
          if (t.includes(',')) throw new i('single-range-only', { normalizedRangeHeader: t });
          let a = /(\d*)-(\d*)/.exec(t);
          if (!a || !(a[1] || a[2]))
            throw new i('invalid-range-values', { normalizedRangeHeader: t });
          return {
            start: '' === a[1] ? void 0 : Number(a[1]),
            end: '' === a[2] ? void 0 : Number(a[2]),
          };
        })(a),
        r = await t.blob(),
        n = ((e, t, a) => {
          let s,
            r,
            n = e.size;
          if ((a && a > n) || (t && t < 0))
            throw new i('range-not-satisfiable', { size: n, end: a, start: t });
          return (
            void 0 !== t && void 0 !== a
              ? ((s = t), (r = a + 1))
              : void 0 !== t && void 0 === a
                ? ((s = t), (r = n))
                : void 0 !== a && void 0 === t && ((s = n - a), (r = n)),
            { start: s, end: r }
          );
        })(r, s.start, s.end),
        c = r.slice(n.start, n.end),
        o = c.size,
        l = new Response(c, { status: 206, statusText: 'Partial Content', headers: t.headers });
      return (
        l.headers.set('Content-Length', String(o)),
        l.headers.set('Content-Range', `bytes ${n.start}-${n.end - 1}/${r.size}`),
        l
      );
    } catch (e) {
      return new Response('', { status: 416, statusText: 'Range Not Satisfiable' });
    }
  };
  var ey = class {
      cachedResponseWillBeUsed = async ({ request: e, cachedResponse: t }) =>
        t && e.headers.has('range') ? await ep(e, t) : t;
    },
    e_ = class extends J {
      async _handle(e, t) {
        let a,
          s = await t.cacheMatch(e);
        if (s);
        else
          try {
            s = await t.fetchAndCachePut(e);
          } catch (e) {
            e instanceof Error && (a = e);
          }
        if (!s) throw new i('no-response', { url: e.url, error: a });
        return s;
      }
    },
    eb = class extends J {
      constructor(e = {}) {
        (super(e), this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(Q));
      }
      async _handle(e, t) {
        let a,
          s = t.fetchAndCachePut(e).catch(() => {});
        t.waitUntil(s);
        let r = await t.cacheMatch(e);
        if (r);
        else
          try {
            r = await s;
          } catch (e) {
            e instanceof Error && (a = e);
          }
        if (!r) throw new i('no-response', { url: e.url, error: a });
        return r;
      }
    },
    ex = class extends ee {
      constructor(e, t) {
        super(({ request: a }) => {
          let s = e.getUrlsToPrecacheKeys();
          for (let r of (function* (
            e,
            {
              directoryIndex: t = 'index.html',
              ignoreURLParametersMatching: a = [/^utm_/, /^fbclid$/],
              cleanURLs: s = !0,
              urlManipulation: r,
            } = {},
          ) {
            let n = new URL(e, location.href);
            ((n.hash = ''), yield n.href);
            let i = ((e, t = []) => {
              for (let a of [...e.searchParams.keys()])
                t.some((e) => e.test(a)) && e.searchParams.delete(a);
              return e;
            })(n, a);
            if ((yield i.href, t && i.pathname.endsWith('/'))) {
              let e = new URL(i.href);
              ((e.pathname += t), yield e.href);
            }
            if (s) {
              let e = new URL(i.href);
              ((e.pathname += '.html'), yield e.href);
            }
            if (r) for (let e of r({ url: n })) yield e.href;
          })(a.url, t)) {
            let t = s.get(r);
            if (t) return { cacheKey: t, integrity: e.getIntegrityForPrecacheKey(t) };
          }
        }, e.precacheStrategy);
      }
    },
    eR = class {
      _precacheController;
      constructor({ precacheController: e }) {
        this._precacheController = e;
      }
      cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
        let a = t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url);
        return a ? new Request(a, { headers: e.headers }) : e;
      };
    },
    ev = class {
      _urlsToCacheKeys = new Map();
      _urlsToCacheModes = new Map();
      _cacheKeysToIntegrities = new Map();
      _concurrentPrecaching;
      _precacheStrategy;
      _routes;
      _defaultHandlerMap;
      _catchHandler;
      _requestRules;
      constructor({
        precacheEntries: e,
        precacheOptions: t,
        skipWaiting: a = !1,
        importScripts: s,
        navigationPreload: r = !1,
        cacheId: i,
        clientsClaim: c = !1,
        runtimeCaching: o,
        offlineAnalyticsConfig: l,
        disableDevLogs: h = !1,
        fallbacks: u,
        requestRules: d,
      } = {}) {
        var m, f;
        let {
          precacheStrategyOptions: w,
          precacheRouteOptions: p,
          precacheMiscOptions: y,
        } = ((e, t = {}) => {
          let {
            cacheName: a,
            plugins: s = [],
            fetchOptions: r,
            matchOptions: i,
            fallbackToNetwork: c,
            directoryIndex: o,
            ignoreURLParametersMatching: l,
            cleanURLs: h,
            urlManipulation: u,
            cleanupOutdatedCaches: d,
            concurrency: m = 10,
            navigateFallback: g,
            navigateFallbackAllowlist: f,
            navigateFallbackDenylist: w,
          } = t ?? {};
          return {
            precacheStrategyOptions: {
              cacheName: n.getPrecacheName(a),
              plugins: [...s, new eR({ precacheController: e })],
              fetchOptions: r,
              matchOptions: i,
              fallbackToNetwork: c,
            },
            precacheRouteOptions: {
              directoryIndex: o,
              ignoreURLParametersMatching: l,
              cleanURLs: h,
              urlManipulation: u,
            },
            precacheMiscOptions: {
              cleanupOutdatedCaches: d,
              concurrency: m,
              navigateFallback: g,
              navigateFallbackAllowlist: f,
              navigateFallbackDenylist: w,
            },
          };
        })(this, t);
        if (
          ((this._concurrentPrecaching = y.concurrency),
          (this._precacheStrategy = new et(w)),
          (this._routes = new Map()),
          (this._defaultHandlerMap = new Map()),
          (this._requestRules = d),
          (this.handleInstall = this.handleInstall.bind(this)),
          (this.handleActivate = this.handleActivate.bind(this)),
          (this.handleFetch = this.handleFetch.bind(this)),
          (this.handleCache = this.handleCache.bind(this)),
          s && s.length > 0 && self.importScripts(...s),
          r &&
            self.registration?.navigationPreload &&
            self.addEventListener('activate', (e) => {
              e.waitUntil(self.registration.navigationPreload.enable().then(() => {}));
            }),
          void 0 !== i && ((m = { prefix: i }), n.updateDetails(m)),
          a
            ? self.skipWaiting()
            : self.addEventListener('message', (e) => {
                e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting();
              }),
          c && self.addEventListener('activate', () => self.clients.claim()),
          e && e.length > 0 && this.addToPrecacheList(e),
          y.cleanupOutdatedCaches &&
            ((f = w.cacheName),
            self.addEventListener('activate', (e) => {
              e.waitUntil(g(n.getPrecacheName(f)).then((e) => {}));
            })),
          this.registerRoute(new ex(this, p)),
          y.navigateFallback &&
            this.registerRoute(
              new ea(this.createHandlerBoundToUrl(y.navigateFallback), {
                allowlist: y.navigateFallbackAllowlist,
                denylist: y.navigateFallbackDenylist,
              }),
            ),
          void 0 !== l &&
            ('boolean' == typeof l ? l && ef({ serwist: this }) : ef({ ...l, serwist: this })),
          void 0 !== o)
        ) {
          if (void 0 !== u) {
            let e = new ew({ fallbackUrls: u.entries, serwist: this });
            o.forEach((t) => {
              t.handler instanceof J &&
                !t.handler.plugins.some((e) => 'handlerDidError' in e) &&
                t.handler.plugins.push(e);
            });
          }
          for (let e of o) this.registerCapture(e.matcher, e.handler, e.method);
        }
        h && (self.__WB_DISABLE_DEV_LOGS = !0);
      }
      get precacheStrategy() {
        return this._precacheStrategy;
      }
      get routes() {
        return this._routes;
      }
      addEventListeners() {
        (self.addEventListener('install', this.handleInstall),
          self.addEventListener('activate', this.handleActivate),
          self.addEventListener('fetch', this.handleFetch),
          self.addEventListener('message', this.handleCache));
      }
      addToPrecacheList(e) {
        let t = [];
        for (let a of e) {
          'string' == typeof a
            ? t.push(a)
            : a && !a.integrity && void 0 === a.revision && t.push(a.url);
          let { cacheKey: e, url: s } = er(a),
            r = 'string' != typeof a && a.revision ? 'reload' : 'default';
          if (this._urlsToCacheKeys.has(s) && this._urlsToCacheKeys.get(s) !== e)
            throw new i('add-to-cache-list-conflicting-entries', {
              firstEntry: this._urlsToCacheKeys.get(s),
              secondEntry: e,
            });
          if ('string' != typeof a && a.integrity) {
            if (
              this._cacheKeysToIntegrities.has(e) &&
              this._cacheKeysToIntegrities.get(e) !== a.integrity
            )
              throw new i('add-to-cache-list-conflicting-integrities', { url: s });
            this._cacheKeysToIntegrities.set(e, a.integrity);
          }
          (this._urlsToCacheKeys.set(s, e), this._urlsToCacheModes.set(s, r));
        }
        t.length > 0 &&
          console.warn(`Serwist is precaching URLs without revision info: ${t.join(', ')}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`);
      }
      handleInstall(e) {
        return (
          this.registerRequestRules(e),
          f(e, async () => {
            let t = new en();
            (this.precacheStrategy.plugins.push(t),
              await ei(
                this._concurrentPrecaching,
                Array.from(this._urlsToCacheKeys.entries()),
                async ([t, a]) => {
                  let s = this._cacheKeysToIntegrities.get(a),
                    r = this._urlsToCacheModes.get(t),
                    n = new Request(t, { integrity: s, cache: r, credentials: 'same-origin' });
                  await Promise.all(
                    this.precacheStrategy.handleAll({
                      event: e,
                      request: n,
                      url: new URL(n.url),
                      params: { cacheKey: a },
                    }),
                  );
                },
              ));
            let { updatedURLs: a, notUpdatedURLs: s } = t;
            return { updatedURLs: a, notUpdatedURLs: s };
          })
        );
      }
      async registerRequestRules(e) {
        if (this._requestRules && e?.addRoutes)
          try {
            (await e.addRoutes(this._requestRules), (this._requestRules = void 0));
          } catch (e) {
            throw e;
          }
      }
      handleActivate(e) {
        return f(e, async () => {
          let e = await self.caches.open(this.precacheStrategy.cacheName),
            t = await e.keys(),
            a = new Set(this._urlsToCacheKeys.values()),
            s = [];
          for (let r of t) a.has(r.url) || (await e.delete(r), s.push(r.url));
          return { deletedCacheRequests: s };
        });
      }
      handleFetch(e) {
        let { request: t } = e,
          a = this.handleRequest({ request: t, event: e });
        a && e.respondWith(a);
      }
      handleCache(e) {
        if (e.data && 'CACHE_URLS' === e.data.type) {
          let { payload: t } = e.data,
            a = Promise.all(
              t.urlsToCache.map((t) => {
                let a;
                return (
                  (a = 'string' == typeof t ? new Request(t) : new Request(...t)),
                  this.handleRequest({ request: a, event: e })
                );
              }),
            );
          (e.waitUntil(a), e.ports?.[0] && a.then(() => e.ports[0].postMessage(!0)));
        }
      }
      setDefaultHandler(e, t = 'GET') {
        this._defaultHandlerMap.set(t, Z(e));
      }
      setCatchHandler(e) {
        this._catchHandler = Z(e);
      }
      registerCapture(e, t, a) {
        let s = ((e, t, a) => {
          if ('string' == typeof e) {
            let s = new URL(e, location.href);
            return new ee(({ url: e }) => e.href === s.href, t, a);
          }
          if (e instanceof RegExp) return new es(e, t, a);
          if ('function' == typeof e) return new ee(e, t, a);
          if (e instanceof ee) return e;
          throw new i('unsupported-route-type', {
            moduleName: 'serwist',
            funcName: 'parseRoute',
            paramName: 'capture',
          });
        })(e, t, a);
        return (this.registerRoute(s), s);
      }
      registerRoute(e) {
        (this._routes.has(e.method) || this._routes.set(e.method, []),
          this._routes.get(e.method).push(e));
      }
      unregisterRoute(e) {
        if (!this._routes.has(e.method))
          throw new i('unregister-route-but-not-found-with-method', { method: e.method });
        let t = this._routes.get(e.method).indexOf(e);
        if (t > -1) this._routes.get(e.method).splice(t, 1);
        else throw new i('unregister-route-route-not-registered');
      }
      getUrlsToPrecacheKeys() {
        return this._urlsToCacheKeys;
      }
      getPrecachedUrls() {
        return [...this._urlsToCacheKeys.keys()];
      }
      getPrecacheKeyForUrl(e) {
        let t = new URL(e, location.href);
        return this._urlsToCacheKeys.get(t.href);
      }
      getIntegrityForPrecacheKey(e) {
        return this._cacheKeysToIntegrities.get(e);
      }
      async matchPrecache(e) {
        let t = e instanceof Request ? e.url : e,
          a = this.getPrecacheKeyForUrl(t);
        if (a) return (await self.caches.open(this.precacheStrategy.cacheName)).match(a);
      }
      createHandlerBoundToUrl(e) {
        let t = this.getPrecacheKeyForUrl(e);
        if (!t) throw new i('non-precached-url', { url: e });
        return (a) => (
          (a.request = new Request(e)),
          (a.params = { cacheKey: t, ...a.params }),
          this.precacheStrategy.handle(a)
        );
      }
      handleRequest({ request: e, event: t }) {
        let a,
          s = new URL(e.url, location.href);
        if (!s.protocol.startsWith('http')) return;
        let r = s.origin === location.origin,
          { params: n, route: i } = this.findMatchingRoute({
            event: t,
            request: e,
            sameOrigin: r,
            url: s,
          }),
          c = i?.handler,
          o = e.method;
        if ((!c && this._defaultHandlerMap.has(o) && (c = this._defaultHandlerMap.get(o)), !c))
          return;
        try {
          a = c.handle({ url: s, request: e, event: t, params: n });
        } catch (e) {
          a = Promise.reject(e);
        }
        let l = i?.catchHandler;
        return (
          a instanceof Promise &&
            (this._catchHandler || l) &&
            (a = a.catch(async (a) => {
              if (l)
                try {
                  return await l.handle({ url: s, request: e, event: t, params: n });
                } catch (e) {
                  e instanceof Error && (a = e);
                }
              if (this._catchHandler)
                return this._catchHandler.handle({ url: s, request: e, event: t });
              throw a;
            })),
          a
        );
      }
      findMatchingRoute({ url: e, sameOrigin: t, request: a, event: s }) {
        for (let r of this._routes.get(a.method) || []) {
          let n,
            i = r.match({ url: e, sameOrigin: t, request: a, event: s });
          if (i)
            return (
              (Array.isArray((n = i)) && 0 === n.length) ||
              (i.constructor === Object && 0 === Object.keys(i).length)
                ? (n = void 0)
                : 'boolean' == typeof i && (n = void 0),
              { route: r, params: n }
            );
        }
        return {};
      }
    };
  let eE = { rscPrefetch: 'pages-rsc-prefetch', rsc: 'pages-rsc', html: 'pages' },
    eq = [
      {
        matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: new e_({
          cacheName: 'google-fonts-webfonts',
          plugins: [new em({ maxEntries: 4, maxAgeSeconds: 31536e3, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: new eb({
          cacheName: 'google-fonts-stylesheets',
          plugins: [new em({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: new eb({
          cacheName: 'static-font-assets',
          plugins: [new em({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: new eb({
          cacheName: 'static-image-assets',
          plugins: [new em({ maxEntries: 64, maxAgeSeconds: 2592e3, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/static.+\.js$/i,
        handler: new e_({
          cacheName: 'next-static-js-assets',
          plugins: [new em({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/image\?url=.+$/i,
        handler: new eb({
          cacheName: 'next-image',
          plugins: [new em({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:mp3|wav|ogg)$/i,
        handler: new e_({
          cacheName: 'static-audio-assets',
          plugins: [
            new em({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' }),
            new ey(),
          ],
        }),
      },
      {
        matcher: /\.(?:mp4|webm)$/i,
        handler: new e_({
          cacheName: 'static-video-assets',
          plugins: [
            new em({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' }),
            new ey(),
          ],
        }),
      },
      {
        matcher: /\.(?:js)$/i,
        handler: new eb({
          cacheName: 'static-js-assets',
          plugins: [new em({ maxEntries: 48, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:css|less)$/i,
        handler: new eb({
          cacheName: 'static-style-assets',
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/data\/.+\/.+\.json$/i,
        handler: new X({
          cacheName: 'next-data',
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:json|xml|csv)$/i,
        handler: new X({
          cacheName: 'static-data-assets',
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      { matcher: /\/api\/auth\/.*/, handler: new Y({ networkTimeoutSeconds: 10 }) },
      {
        matcher: ({ sameOrigin: e, url: { pathname: t } }) => e && t.startsWith('/api/'),
        method: 'GET',
        handler: new X({
          cacheName: 'apis',
          plugins: [new em({ maxEntries: 16, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
          networkTimeoutSeconds: 10,
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          '1' === e.headers.get('RSC') &&
          '1' === e.headers.get('Next-Router-Prefetch') &&
          a &&
          !t.startsWith('/api/'),
        handler: new X({
          cacheName: eE.rscPrefetch,
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          '1' === e.headers.get('RSC') && a && !t.startsWith('/api/'),
        handler: new X({
          cacheName: eE.rsc,
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          e.headers.get('Content-Type')?.includes('text/html') && a && !t.startsWith('/api/'),
        handler: new X({
          cacheName: eE.html,
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ url: { pathname: e }, sameOrigin: t }) => t && !e.startsWith('/api/'),
        handler: new X({
          cacheName: 'others',
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ sameOrigin: e }) => !e,
        handler: new X({
          cacheName: 'cross-origin',
          plugins: [new em({ maxEntries: 32, maxAgeSeconds: 3600 })],
          networkTimeoutSeconds: 10,
        }),
      },
      { matcher: /.*/i, method: 'GET', handler: new Y() },
    ];
  new ev({
    precacheEntries: [
      {
        revision: '6efae0601f7ececb806913036d212d01',
        url: '/_next/static/6V2j1LMKoCJRRFWxJCMIS/_buildManifest.js',
      },
      {
        revision: 'b6652df95db52feb4daf4eca35380933',
        url: '/_next/static/6V2j1LMKoCJRRFWxJCMIS/_ssgManifest.js',
      },
      { revision: null, url: '/_next/static/chunks/1345-07627c4af255c9c3.js' },
      { revision: null, url: '/_next/static/chunks/1455-aaf3997d327447a5.js' },
      { revision: null, url: '/_next/static/chunks/1887-6f019d7c678184f5.js' },
      { revision: null, url: '/_next/static/chunks/2544-2bc976fe0b142d1b.js' },
      { revision: null, url: '/_next/static/chunks/2684-4d3ff09a232b676d.js' },
      { revision: null, url: '/_next/static/chunks/3111-b0a23bb335e8180b.js' },
      { revision: null, url: '/_next/static/chunks/3453-ef0fe6234d0e34a6.js' },
      { revision: null, url: '/_next/static/chunks/3541-663aed8ab1f25224.js' },
      { revision: null, url: '/_next/static/chunks/3917-d17066f47fe1b99a.js' },
      { revision: null, url: '/_next/static/chunks/469-7ab99eb44aa8e68f.js' },
      { revision: null, url: '/_next/static/chunks/4782-f9976475d9766ea3.js' },
      { revision: null, url: '/_next/static/chunks/495ed1de-eb41894543b60d12.js' },
      { revision: null, url: '/_next/static/chunks/5685-89f3179f16260d83.js' },
      { revision: null, url: '/_next/static/chunks/5817-a3c0c0b8568624a9.js' },
      { revision: null, url: '/_next/static/chunks/6755-eff88348666d8ea0.js' },
      { revision: null, url: '/_next/static/chunks/6995-bfbb432adefd97f0.js' },
      { revision: null, url: '/_next/static/chunks/7375-664d470b8fdeed2d.js' },
      { revision: null, url: '/_next/static/chunks/7613-18d328f2bb5a97ee.js' },
      { revision: null, url: '/_next/static/chunks/819-1bf5f3ac37608933.js' },
      { revision: null, url: '/_next/static/chunks/9257-bf4181e961dd7901.js' },
      { revision: null, url: '/_next/static/chunks/9727-57ae0a871bad758a.js' },
      { revision: null, url: '/_next/static/chunks/app/(auth)/login/page-28ce557c8231d304.js' },
      { revision: null, url: '/_next/static/chunks/app/(auth)/register/page-9fed683d5dd86ca7.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/(auth)/staff/login/page-3e1ecf159882ed36.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(auth/)/staff/login/page-36855d11bb1ab11e.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(customer)/checkout/page-8b41aa96927b6394.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(customer)/orders/page-9a218367f6444d65.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(customer)/profile/page-af241cfe06dc25d1.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(customer)/track/%5BorderId%5D/page-3ca079be2c0e4986.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(customer/)/checkout/page-a687b3165f5f36d4.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(customer/)/profile/page-14a01927dc5df58e.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/(customer/)/track/%5BorderId/%5D/page-3ed2d1ec7556e1fb.js',
      },
      { revision: null, url: '/_next/static/chunks/app/(staff)/kitchen/page-ac9246e54523cae9.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/(staff)/manager/menu/page-6582f30daad0972e.js',
      },
      { revision: null, url: '/_next/static/chunks/app/(staff)/manager/page-fd8a871c86e25e52.js' },
      { revision: null, url: '/_next/static/chunks/app/(staff)/waiter/page-b79ae78fa32e0947.js' },
      { revision: null, url: '/_next/static/chunks/app/_not-found/page-c7efa741ac579fcb.js' },
      { revision: null, url: '/_next/static/chunks/app/about/page-8de3c623abae702a.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-c7efa741ac579fcb.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/auth/test-login/route-c7efa741ac579fcb.js',
      },
      { revision: null, url: '/_next/static/chunks/app/api/test-login/route-c7efa741ac579fcb.js' },
      { revision: null, url: '/_next/static/chunks/app/booking/page-ca4367f69d3bdb40.js' },
      { revision: null, url: '/_next/static/chunks/app/contact/page-1621e07d9ad7fdd4.js' },
      { revision: null, url: '/_next/static/chunks/app/drinks/page-12feac48c3fc8960.js' },
      { revision: null, url: '/_next/static/chunks/app/layout-0cfae9345615dacc.js' },
      { revision: null, url: '/_next/static/chunks/app/menu/page-19b8aa205a1900e5.js' },
      { revision: null, url: '/_next/static/chunks/app/not-found-9814da96a474e543.js' },
      { revision: null, url: '/_next/static/chunks/app/offline/page-cb06d2659c3a9103.js' },
      { revision: null, url: '/_next/static/chunks/app/page-f4a184773a79c4db.js' },
      { revision: null, url: '/_next/static/chunks/app/service/page-dd78fd850e28e909.js' },
      { revision: null, url: '/_next/static/chunks/app/team/page-4705df358deee2e0.js' },
      { revision: null, url: '/_next/static/chunks/app/testimonial/page-4705df358deee2e0.js' },
      { revision: null, url: '/_next/static/chunks/app/~offline/page-715d7e7f1555a7ae.js' },
      { revision: null, url: '/_next/static/chunks/framework-f00fddb9800f9292.js' },
      { revision: null, url: '/_next/static/chunks/main-app-00d29249287d9c9b.js' },
      { revision: null, url: '/_next/static/chunks/main-d61f32dbc1846f95.js' },
      { revision: null, url: '/_next/static/chunks/pages/_app-4cd8e4dd8361c634.js' },
      { revision: null, url: '/_next/static/chunks/pages/_error-a610d92577b864ba.js' },
      {
        revision: '846118c33b2c0e922d7b3a7676f81f6f',
        url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
      },
      { revision: null, url: '/_next/static/chunks/webpack-f832babc9e287d72.js' },
      { revision: null, url: '/_next/static/css/3a02a291d8f5344f.css' },
      {
        revision: 'be7c930fceb794521be0a68e113a71d8',
        url: '/_next/static/media/034d78ad42e9620c-s.woff2',
      },
      {
        revision: 'b550bca8934bd86812d1f5e28c9cc1de',
        url: '/_next/static/media/0484562807a97172-s.p.woff2',
      },
      {
        revision: '2bb210b8081040a4dbe6df4930371342',
        url: '/_next/static/media/0760b9c03b107412-s.woff2',
      },
      {
        revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
      },
      {
        revision: '4e2553027f1d60eff32898367dd4d541',
        url: '/_next/static/media/21350d82a1f187e9-s.woff2',
      },
      {
        revision: '69d9d2cdadeab7225297d50fc8e48e8b',
        url: '/_next/static/media/29a4aea02fdee119-s.woff2',
      },
      {
        revision: '9e3ecbe4bb4c6f0b71adc1cd481c2bdc',
        url: '/_next/static/media/29e7bbdce9332268-s.woff2',
      },
      {
        revision: '12f5bf5a52bd0c0b712e66a1ce0dea91',
        url: '/_next/static/media/5745efda93e8d0f7-s.woff2',
      },
      {
        revision: '792477d09826b11d1e5a611162c9797a',
        url: '/_next/static/media/8888a3826f4a3af4-s.p.woff2',
      },
      {
        revision: '01ba6c2a184b8cba08b0d57167664d75',
        url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
      },
      {
        revision: 'a0606f383bd4428aeda18ca6c290133e',
        url: '/_next/static/media/9937cfa0190a876c-s.p.woff2',
      },
      {
        revision: 'd3aa06d13d3cf9c0558927051f3cb948',
        url: '/_next/static/media/a1386beebedccca4-s.woff2',
      },
      {
        revision: '0bd523f6049956faaf43c254a719d06a',
        url: '/_next/static/media/b957ea75a84b6ea7-s.p.woff2',
      },
      {
        revision: '9e494903d6b0ffec1a1e14d34427d44d',
        url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
      },
      {
        revision: '5a1b7c983a9dc0a87a2ff138e07ae822',
        url: '/_next/static/media/c3bc380753a8436c-s.woff2',
      },
      {
        revision: '027a89e9ab733a145db70f09b8a18b42',
        url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
      },
      {
        revision: '9516f567cd80b0f418bba2f1299ed6d1',
        url: '/_next/static/media/db911767852bc875-s.woff2',
      },
      {
        revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
      },
      {
        revision: '65850a373e258f1c897a2b3d75eb74de',
        url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
      },
      {
        revision: '43751174b6b810eb169101a20d8c26f8',
        url: '/_next/static/media/eafabf029ad39a43-s.p.woff2',
      },
      {
        revision: '63af7d5e18e585fad8d0220e5d551da1',
        url: '/_next/static/media/f10b8e9d91f3edcb-s.woff2',
      },
      {
        revision: 'f2a04185547c36abfa589651236a9849',
        url: '/_next/static/media/fe0777f1195381cb-s.woff2',
      },
      { revision: '888af2151b1f3cad46bd4f5730a98594', url: '/file-text.svg' },
      { revision: '101ba0a88108a8ea12a3efeb8fb67e0a', url: '/globe.svg' },
      { revision: '7848ed4dafa180e2df214ad72a00213d', url: '/icons/icon-192x192.png' },
      { revision: '90f866d8d594e18bad80aa2d1a066111', url: '/icons/icon-384x384.png' },
      { revision: '61e17e4de41a99f9ce14a6231a3784b2', url: '/icons/icon-512x512.png' },
      { revision: '7848ed4dafa180e2df214ad72a00213d', url: '/icons/icon-maskable-192x192.png' },
      { revision: '61e17e4de41a99f9ce14a6231a3784b2', url: '/icons/icon-maskable-512x512.png' },
      { revision: '53f1fa7a60834995b2cdbee68eaa442f', url: '/img/about-1.jpg' },
      { revision: 'c3ab666abf007900ffb21f9ee6c34f75', url: '/img/about-2.jpg' },
      { revision: '2ae931a605355a99884de62c0cd945a2', url: '/img/about-3.jpg' },
      { revision: '8370c1da581077f080068dba122303e4', url: '/img/about-4.jpg' },
      { revision: '0cd54c936699e06c5123563a4f40375b', url: '/img/bg-hero.jpg' },
      { revision: '956a7a83a4de153711928ba6abefd848', url: '/img/ca.jpg' },
      { revision: '72b8cba22f237c737ff6bf68701c9f50', url: '/img/cb.jpg' },
      { revision: '6080264b395349a011a766b02046c750', url: '/img/cc.jpg' },
      { revision: '28cf322d8cbfe89bb4674e3c841d6589', url: '/img/cd.png' },
      { revision: '967c611462fe993d37cb6b88225b9927', url: '/img/ce.jpg' },
      { revision: 'f7fa6c218420a85c0c5ee592932eac3a', url: '/img/cf.jpg' },
      { revision: '7f82aebc9bcd700caf0bc402e886399f', url: '/img/cg.jpg' },
      { revision: '1979747fc9bcd27f47453a9ac098da88', url: '/img/ch.jpg' },
      { revision: '4aefa3d08e5976bd704e76049ba31f2a', url: '/img/ci.jpg' },
      { revision: '047f1de62bb21d8f10fea5ba6bd5cd13', url: '/img/da.jpg' },
      { revision: 'dd812e1c544573b5b2091d1581d8efcf', url: '/img/db.jpg' },
      { revision: '07894b9e29f23b32eb07f2b7411abd52', url: '/img/dc.jpg' },
      { revision: '8ff9dc2a85229c30872361bc029c0dbe', url: '/img/dd.jpg' },
      { revision: 'de005c27e0962d41ce57aaaa27eb6f82', url: '/img/de.jpg' },
      { revision: '401ac35d732db53f47223ff2fd74c9af', url: '/img/df.jpg' },
      { revision: '8e2bfdf491345fdaf8325099c4a67057', url: '/img/dg.jpg' },
      { revision: '3559152864b1c0e1ca8e0680d8b7a683', url: '/img/di.jpg' },
      { revision: '4c59703f341b0440ab8619e0f123bb6c', url: '/img/ha.jpg' },
      { revision: '3208d3ed83bb6806de63b984161181f8', url: '/img/hb.jpg' },
      { revision: 'ae35dbca21695b2ca0fb579b060d8e79', url: '/img/hc.jpg' },
      { revision: '9968cfd68d40002e672a287a7c31fbf7', url: '/img/hd.jpg' },
      { revision: '6901bf7c4b42b42e462ed33213f5ffa1', url: '/img/he.jpg' },
      { revision: 'f5a08880fe38220d9f6fcd58c5eb30eb', url: '/img/hero.png' },
      { revision: 'faaabd02b3445a482e6d25b039cce5e0', url: '/img/hf.jpg' },
      { revision: '2563b00a3f973e6fe0f1791ac243de47', url: '/img/hg.jpg' },
      { revision: '5afc00d74ff0b84269bc37c57dc522f5', url: '/img/hh.jpg' },
      { revision: 'f33bb63c1f894b0573d6bc9fe825f81d', url: '/img/hi.jpg' },
      { revision: '5652cdeadd8c7d2b1199c6a63d50251c', url: '/img/la.jpg' },
      { revision: '5951c68f7819e3bc723fccd95255c7d3', url: '/img/lab.jpg' },
      { revision: 'e6b92f160cb55c007d91d4a215b67804', url: '/img/lc.jpg' },
      { revision: '380e053f1a3cc0c313730e17a132be41', url: '/img/ld.jpg' },
      { revision: '87c69e1c2bc99f8670717ea8fbfe099f', url: '/img/le.jpg' },
      { revision: 'c050a566219898de599a9568c956eddc', url: '/img/lf.jpg' },
      { revision: 'a8cf29782c1dfed1f57998ce24aa929f', url: '/img/lg.jpg' },
      { revision: '8be3d30391d4855daa5957731efdeccc', url: '/img/lh.jpg' },
      { revision: '2acfda76a087b8569e890c8c56c77c1b', url: '/img/li.jpg' },
      { revision: '6afa6e955f1eb9c1c8c6dda55dcb42a1', url: '/img/lj.jpg' },
      { revision: '2522612261610c7c8c7668ce54154200', url: '/img/logo.png' },
      { revision: 'd2bd26026a97eb4a7242f552c9fd5c7b', url: '/img/menu-1.jpg' },
      { revision: '796eec90bf03e082d484b3f2b0252ad6', url: '/img/menu-2.jpg' },
      { revision: '2d4bf6cd6d4e5b7667b799de6615a837', url: '/img/menu-3.jpg' },
      { revision: 'e237898f445097bddc3a3873ee73b041', url: '/img/menu-4.jpg' },
      { revision: '9d0f056980770bc4c78ed11d0f4c338d', url: '/img/menu-5.jpg' },
      { revision: 'b14ae75e1b8cdf4b0f6ea6f8e928867e', url: '/img/menu-6.jpg' },
      { revision: '69bf24fde4a42a62f78881f0dae44f80', url: '/img/menu-7.jpg' },
      { revision: 'fd68ee45df9865b62795721f2dec4c3e', url: '/img/menu-8.jpg' },
      { revision: '4b50efa275ffcb45eb717d8dc186ea81', url: '/img/sa.jpg' },
      { revision: '9d92d1cbe3db825cb0482f07fe27db42', url: '/img/sb.jpg' },
      { revision: 'a03b83b70ed5549c92b18dfee7020bc0', url: '/img/sc.jpg' },
      { revision: '440dd3a634c85f504b08046bc26d9448', url: '/img/sd.jpg' },
      { revision: '6a5a4d19ecdda4553fd31a7d8f06e119', url: '/img/se.jpg' },
      { revision: 'e62bcdd6e6cb767a5a5661a85e97cf84', url: '/img/sf.jpg' },
      { revision: '726652576fd3374d61de582c1294028b', url: '/img/sg.jpg' },
      { revision: '7aa31e61d8bc79610947b09529055cb1', url: '/img/sh.jpg' },
      { revision: 'df61d5792f23138b8e52de72cd8faa94', url: '/img/si.jpg' },
      { revision: 'e2148df468b0738e53f7d80e2a853fa6', url: '/img/team-1.jpg' },
      { revision: '9dd578190205ebfd64c837bd2894b6f0', url: '/img/team-2.jpg' },
      { revision: '134093f2c09740aa51015a42271e86c7', url: '/img/team-3.jpg' },
      { revision: 'fbbe02d67b3a3ad1be55400370be0ede', url: '/img/team-4.jpg' },
      { revision: '64a5d16c40afde3d3c2109477c217bfd', url: '/img/testimonial-1.jpg' },
      { revision: 'edf85c62027f4c849fac2345997fd364', url: '/img/testimonial-2.jpg' },
      { revision: '6d6cd5a03aa8ae932d5fce413740e597', url: '/img/testimonial-3.jpg' },
      { revision: 'efa63a57f8da299aa8f4f143c2eb4404', url: '/img/testimonial-4.jpg' },
      { revision: '6c9284ef9adc85f41e5b5c5bff49cae8', url: '/img/video.jpg' },
      { revision: '7dffe4a3182444a45e10e87311a15bcc', url: '/js/main.js' },
      { revision: '57db4a2811f951ff841fb4f77220d95b', url: '/lib/animate/animate.css' },
      { revision: '4cd52090fb293f124b8cb9877760fe92', url: '/lib/animate/animate.min.css' },
      { revision: 'd0ce5cfe7008eab4a73260954f06df68', url: '/lib/counterup/counterup.min.js' },
      { revision: 'ec0a5208d6fa3bb72fe78c1cf3008600', url: '/lib/easing/easing.js' },
      { revision: 'adf739cca147aff5e39fd65e6e64f420', url: '/lib/easing/easing.min.js' },
      { revision: '35dd9820e3468f0e4d68f65b307aa23d', url: '/lib/owlcarousel/LICENSE' },
      {
        revision: '01000918725acebd286de3787fca4ee0',
        url: '/lib/owlcarousel/assets/ajax-loader.gif',
      },
      {
        revision: '83ef097be10f83e9f999a55c34a04beb',
        url: '/lib/owlcarousel/assets/owl.carousel.css',
      },
      {
        revision: 'de0dfbabe627afa1b718d848b6b58e97',
        url: '/lib/owlcarousel/assets/owl.carousel.min.css',
      },
      {
        revision: '26dd7ebd96f611bff70d97bd1eb24ca1',
        url: '/lib/owlcarousel/assets/owl.theme.default.css',
      },
      {
        revision: '275048a23c69c24c6bd3316d9a45882e',
        url: '/lib/owlcarousel/assets/owl.theme.default.min.css',
      },
      {
        revision: '8d78112daf1543f9f929c60a5735ce2b',
        url: '/lib/owlcarousel/assets/owl.theme.green.css',
      },
      {
        revision: '95a767285dbb8f91ec5d6482155bd0e3',
        url: '/lib/owlcarousel/assets/owl.theme.green.min.css',
      },
      {
        revision: '4a37f8008959c75f619bf0a3a4e2d7a2',
        url: '/lib/owlcarousel/assets/owl.video.play.png',
      },
      { revision: '0aa8dbbc9beca33dd418f7b2a3c966b1', url: '/lib/owlcarousel/owl.carousel.js' },
      { revision: 'b7b9c97cd68ec336d01a79d5be48c58d', url: '/lib/owlcarousel/owl.carousel.min.js' },
      { revision: 'b99a005e732c428ed3a616f3f14861e4', url: '/lib/waypoints/links.php' },
      { revision: '7d05f92297dede9ecfe3706efb95677a', url: '/lib/waypoints/waypoints.min.js' },
      { revision: 'ec605061aa84a17893e9b7cfe7d1601b', url: '/lib/wow/wow.js' },
      { revision: '3f3d63e2feea51da5ea907e80e74d75d', url: '/lib/wow/wow.min.js' },
      { revision: '92b3b5ef4bf6f2879c763f6ca13836bd', url: '/manifest.json' },
      { revision: '8e061864f388b47f33a1c3780831193e', url: '/next.svg' },
      { revision: '0fed3e81bc7448caba847f88e7a6852c', url: '/turborepo-dark.svg' },
      { revision: '6d8507c88d714e75c86e5fe70253b656', url: '/turborepo-light.svg' },
      { revision: '8bb08185574bc8e792bece7536c726f5', url: '/vercel.svg' },
      { revision: '34857d17263ccc6b04245b92a9f013ff', url: '/window.svg' },
    ],
    precacheOptions: { navigateFallback: '/offline' },
    skipWaiting: !0,
    clientsClaim: !0,
    navigationPreload: !0,
    runtimeCaching: [
      {
        matcher: (e) => {
          let { url: t } = e;
          return '/graphql' === t.pathname;
        },
        handler: new X({
          cacheName: 'graphql-cache',
          networkTimeoutSeconds: 5,
          plugins: [
            new em({ maxEntries: 64, maxAgeSeconds: 86400 }),
            new eo({ statuses: [0, 200] }),
          ],
        }),
      },
      ...eq,
    ],
  }).addEventListeners();
})();
