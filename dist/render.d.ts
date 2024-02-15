import React, { ReactElement } from 'react';
import renderers from './renderers';
import { HtmlContent, HtmlElement } from './parse';
import { HtmlStyle, HtmlStyles } from './styles';
import { Style } from '@react-pdf/types';
import { Tag } from './tags';
export declare type BaseHtmlRenderer = {
    element: HtmlElement;
    style: Style[];
    children: React.ReactNode;
    stylesheets: HtmlStyles[];
};
export declare type HtmlRenderer = React.FC<React.PropsWithChildren<BaseHtmlRenderer>>;
export declare type WrapperRenderer = (Wrapper: React.ElementType, renderer: BaseHtmlRenderer) => React.ReactElement;
export declare type HtmlRenderers = Record<Tag | string, HtmlRenderer>;
export declare type HtmlRenderOptions = {
    collapse: boolean;
    renderers: HtmlRenderers;
    stylesheets: HtmlStyles[];
    resetStyles: boolean;
};
declare type ContentBucket = {
    hasBlock: boolean;
    content: HtmlContent;
};
export declare const isBlockStyle: (style: HtmlStyle) => boolean;
export declare const hasBlockContent: (element: HtmlElement | string) => boolean;
/**
 * Groups all block and non-block elements into buckets so that all non-block elements can be rendered in a parent Text element
 * @param elements Elements to place in buckets of block and non-block content
 * @param collapse
 * @param parentTag
 */
export declare const bucketElements: (elements: HtmlContent, collapse: boolean, parentTag?: string | undefined) => ContentBucket[];
declare type RenderedContent = ReactElement | ReactElement[] | string | string[];
export declare const renderElement: (element: HtmlElement | string, stylesheets: HtmlStyles[], renderers: HtmlRenderers, children?: any, index?: number | undefined) => RenderedContent;
export declare const collapseWhitespace: (string: any) => string;
export declare const renderBucketElement: (element: HtmlElement | string, options: HtmlRenderOptions, index: number) => RenderedContent;
export declare const renderElements: (elements: HtmlContent, options: HtmlRenderOptions, parent?: HtmlElement | undefined) => RenderedContent | RenderedContent[];
export declare const applyStylesheets: (stylesheets: HtmlStyles[], rootElement: HtmlElement) => void;
declare const renderHtml: (text: string, options?: {
    collapse?: boolean;
    renderers?: HtmlRenderers;
    style?: Style | Style[];
    stylesheet?: HtmlStyles | HtmlStyles[];
    resetStyles?: boolean;
}) => ReactElement;
export default renderHtml;