"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSS_CACHE = void 0;
const fs_1 = __importDefault(require("fs"));
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
const sync_fetch_1 = __importDefault(require("sync-fetch"));
const createCache = ({ limit = 100 } = {}) => {
    let cache = {};
    let keys = [];
    return {
        get: (key) => cache[key],
        set: (key, value) => {
            keys.push(key);
            if (keys.length > limit) {
                delete cache[keys.shift()];
            }
            cache[key] = value;
        },
        reset: () => {
            cache = {};
            keys = [];
        },
        length: () => keys.length,
    };
};
exports.CSS_CACHE = createCache({ limit: 30 });
const getAbsoluteLocalPath = (src) => {
    // if (BROWSER) {
    //   throw new Error('Cannot check local paths in client-side environment');
    // }
    const { protocol, auth, host, port, hostname, path: pathname, } = url_1.default.parse(src);
    const absolutePath = path_1.default.resolve(pathname);
    if ((protocol && protocol !== 'file:') || auth || host || port || hostname) {
        return undefined;
    }
    return absolutePath;
};
const fetchLocalFile = (src) => {
    // if (BROWSER) {
    //   throw new Error('Cannot fetch local file in this environment');
    // }
    const absolutePath = getAbsoluteLocalPath(src);
    if (!absolutePath) {
        throw new Error(`Cannot fetch non-local path: ${src}`);
    }
    return fs_1.default.readFileSync(absolutePath, { encoding: 'utf8', flag: 'r' });
};
const fetchRemoteFile = (uri, options) => {
    const response = (0, sync_fetch_1.default)(uri, options);
    return response.text();
};
const resolveImageFromUrl = (src, crossOrigin = 'anonymous') => {
    return getAbsoluteLocalPath(src)
        ? fetchLocalFile(src)
        : fetchRemoteFile(src, {
            method: 'GET',
        });
};
const resolveCssFile = (src, crossOrigin = 'anonymous', cache = true) => {
    let image;
    if (cache && exports.CSS_CACHE.get(src)) {
        return exports.CSS_CACHE.get(src);
    }
    else {
        image = resolveImageFromUrl(src, crossOrigin);
    }
    if (!image) {
        throw new Error('Cannot resolve image');
    }
    if (cache) {
        exports.CSS_CACHE.set(src, image);
    }
    return image;
};
exports.default = resolveCssFile;
//# sourceMappingURL=resolveCssFile.js.map