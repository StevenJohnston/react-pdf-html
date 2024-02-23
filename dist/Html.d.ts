import React from 'react';
import { ClassNameRenderer, HtmlRenderers } from './render';
import { HtmlStyle, HtmlStyles } from './styles';
export declare type HtmlProps = {
    collapse?: boolean;
    renderers?: HtmlRenderers;
    style?: HtmlStyle | (HtmlStyle | undefined)[];
    stylesheet?: HtmlStyles | HtmlStyles[];
    resetStyles?: boolean;
    children: string;
    classNameRenderer?: ClassNameRenderer;
};
declare const Html: React.FC<HtmlProps>;
export default Html;
