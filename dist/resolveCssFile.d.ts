export declare const CSS_CACHE: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    reset: () => void;
    length: () => number;
};
declare const resolveCssFile: (src: string, crossOrigin?: 'anonymous' | 'use-credentials', cache?: boolean) => any;
export default resolveCssFile;
