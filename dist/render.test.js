"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const stringify = require('json-stringify-safe');
const render_1 = __importStar(require("./render"));
const scrub = (object) => {
    if (Array.isArray(object)) {
        object.forEach(scrub);
    }
    else if (object && typeof object === 'object') {
        if (object.parentNode) {
            delete object.parentNode;
        }
        if (object.childNodes) {
            delete object.childNodes;
        }
        Object.keys(object).forEach((key) => scrub(object[key]));
    }
};
const renderer_1 = require("@react-pdf/renderer");
const path_1 = __importDefault(require("path"));
const renderers_1 = __importStar(require("./renderers"));
const inlineElement = {
    tag: 'span',
};
const blockElement = {
    tag: 'div',
};
describe('render', () => {
    describe('collapseWhitespace', () => {
        it('Should reduce all continuous whitespace to a single space', () => {
            expect((0, render_1.collapseWhitespace)('\n\n foo  \t  bar  ')).toBe(' foo bar ');
        });
    });
    describe('bucketElements', () => {
        it('Should bucket elements and trim strings correctly with collapse: true', () => {
            const stringContent = `  foo
      bar
      
      `;
            const elements = [
                blockElement,
                blockElement,
                inlineElement,
                stringContent,
                blockElement,
            ];
            const bucketed = (0, render_1.bucketElements)(elements, true);
            expect(bucketed).toEqual([
                { hasBlock: true, content: [blockElement, blockElement] },
                { hasBlock: false, content: [inlineElement, '  foo\n      bar'] },
                { hasBlock: true, content: [blockElement] },
            ]);
        });
        it('Should bucket elements and not trim strings with collapse: false', () => {
            const stringContent = `  foo
      bar
      
      `;
            const elements = [
                blockElement,
                blockElement,
                inlineElement,
                stringContent,
                blockElement,
            ];
            const bucketed = (0, render_1.bucketElements)(elements, false);
            expect(bucketed).toEqual([
                { hasBlock: true, content: [blockElement, blockElement] },
                { hasBlock: false, content: [inlineElement, stringContent] },
                { hasBlock: true, content: [blockElement] },
            ]);
        });
    });
    describe('hasBlockContent', () => {
        it('Should return false for string elements', () => {
            expect((0, render_1.hasBlockContent)('')).toBe(false);
        });
        it('Should return false for inline elements', () => {
            expect((0, render_1.hasBlockContent)(inlineElement)).toBe(false);
        });
        it('Should return true for block elements', () => {
            expect((0, render_1.hasBlockContent)(blockElement)).toBe(true);
        });
        it('Should return true for inline elements with block content', () => {
            const inlineElementWithBlockContent = {
                tag: 'span',
                content: [blockElement],
            };
            expect((0, render_1.hasBlockContent)(inlineElementWithBlockContent)).toBe(true);
        });
        it('Should return true for anchor elements with block content', () => {
            const anchorWithBlockContent = {
                tag: 'a',
                content: [blockElement],
            };
            expect((0, render_1.hasBlockContent)(anchorWithBlockContent)).toBe(true);
        });
        it('Should return false for anchor elements with inline content', () => {
            const anchorWithInlineContent = {
                tag: 'a',
                content: [inlineElement],
            };
            expect((0, render_1.hasBlockContent)(anchorWithInlineContent)).toBe(false);
        });
        it('Should return false for inline elements with inline content', () => {
            const inlineElementWithBlockContent = {
                tag: 'span',
                content: [inlineElement],
            };
            expect((0, render_1.hasBlockContent)(inlineElementWithBlockContent)).toBe(false);
        });
    });
    describe('renderHtml', () => {
        it('Should correctly merge styles', () => {
            const result1 = (0, render_1.default)('<p></p>', {
                style: {
                    color: 'blue',
                },
            });
            expect(result1.props.style).toEqual([
                { color: 'blue' },
                { fontSize: 18 },
            ]);
            const result2 = (0, render_1.default)('<p></p>', {
                style: [
                    {
                        color: 'blue',
                    },
                ],
            });
            expect(result2.props.style).toEqual([
                { color: 'blue' },
                { fontSize: 18 },
            ]);
        });
        it('Should use a custom renderer', () => {
            const foo = jest.fn();
            const html = '<foo>Custom Content</foo>';
            const rootView = (0, render_1.default)(html, {
                renderers: {
                    foo,
                },
            });
            expect(rootView.type).toBe(renderer_1.View);
            const firstChild = rootView.props.children;
            expect(firstChild.type).toBe(foo);
        });
        it('Should render a link with text inside it', () => {
            const html = '<a href="http://google.com">link text</a>';
            const rootView = (0, render_1.default)(html);
            expect(rootView.type).toBe(renderer_1.View);
            const a = rootView.props.children;
            expect(a.type).toBe(renderers_1.default.a);
            expect(a.props.element.tag).toBe('a');
            const aText = a.props.children;
            expect(aText.type).toBe(renderer_1.Text);
            expect(aText.props.children).toEqual('link text');
        });
        it('Should render inline elements with proper text wrapper', () => {
            const html = `<p>Paragraph with <strong>bold</strong>, <i>italic</i>, <u>underline</u> and <s>strikethrough</s></p>`;
            const rootView = (0, render_1.default)(html);
            expect(rootView.type).toBe(renderer_1.View);
            const p = rootView.props.children;
            expect(p.props.element.tag).toBe('p');
            expect(p.type).toBe(renderers_1.renderBlock);
            const pText = p.props.children;
            expect(pText.type).toBe(renderer_1.Text);
            expect(pText.props.children.length).toBe(8);
        });
        it('Should render keep spaces around custom elements', () => {
            const html = `<p>Paragraph with <CustomElement /> between text</p>`;
            const rootView = (0, render_1.default)(html, {
                renderers: {
                    customelement: () => react_1.default.createElement(renderer_1.View, null),
                },
            });
            const p = rootView.props.children.props.children;
            expect(p[0].props.children).toBe('Paragraph with ');
            expect(p[2].props.children).toBe(' between text');
        });
        it('Should render anchors as inline if their content is inline', () => {
            const html = `<p>Link to <a href="//www.google.com">Google</a> using react-pdf-html.</p>`;
            const rootView = (0, render_1.default)(html);
            expect(rootView.type).toBe(renderer_1.View);
            const p = rootView.props.children;
            expect(p.props.element.tag).toBe('p');
            expect(p.type).toBe(renderers_1.renderBlock);
            const pText = p.props.children;
            expect(pText.type).toBe(renderer_1.Text);
            expect(pText.props.children.length).toBe(3);
            expect(pText.props.children[0]).toBe('Link to ');
            const anchor = pText.props.children[1];
            expect(anchor.props.element.tag).toBe('a');
            const anchorText = anchor.props.children;
            expect(anchorText.type).toBe(renderer_1.Text);
            expect(anchorText.props.children).toBe('Google');
            expect(pText.props.children[2]).toBe(' using react-pdf-html.');
        });
        it('Should render span as block style suggests it is block', () => {
            const html = `<p>Expecting <span style="display: block">block text!</span> to render correctly</p>`;
            const rootView = (0, render_1.default)(html);
            expect(rootView.type).toBe(renderer_1.View);
            const p = rootView.props.children;
            expect(p.props.element.tag).toBe('p');
            expect(p.type).toBe(renderers_1.renderBlock);
            expect(p.props.children.length).toBe(3);
            const pText1 = p.props.children[0];
            expect(pText1.type).toBe(renderer_1.Text);
            expect(pText1.props.children).toBe('Expecting');
            const blockSpan = p.props.children[1];
            expect(blockSpan.props.element.tag).toBe('span');
            expect(blockSpan.type).toBe(renderers_1.renderBlock);
            const spanText = blockSpan.props.children;
            expect(spanText.type).toBe(renderer_1.Text);
            expect(spanText.props.children).toBe('block text!');
            const pText2 = p.props.children[2];
            expect(pText2.type).toBe(renderer_1.Text);
            expect(pText2.props.children).toBe('to render correctly');
        });
        it('Should apply background-color to child elements', () => {
            const content = `
<style>
.highlightClass {
  background-color: #ffff00;
}
</style>
<p><span class="highlightClass"><span style="color: blue;">Blue text</span></span></p>
`;
            const rootView = (0, render_1.default)(content);
            scrub(rootView);
            expect(rootView.type).toBe(renderer_1.View);
            expect(rootView.props.children.length).toBe(2);
            const p = rootView.props.children[1];
            expect(p.props.element.tag).toBe('p');
            const span = p.props.children;
            expect(span.props.element.tag).toBe('span');
            expect(span.props.style).toEqual([
                {
                    backgroundColor: '#ffff00',
                },
            ]);
        });
        it('Should wrap a string child of a block element', () => {
            const content = `
<p>Text block</p>
`;
            const rootView = (0, render_1.default)(content);
            scrub(rootView);
            expect(rootView.type).toBe(renderer_1.View);
            const p = rootView.props.children;
            expect(p.props.element.tag).toBe('p');
            const text = p.props.children;
            expect(text.type).toBe(renderer_1.Text);
            const string = text.props.children;
            expect(string).toBe('Text block');
        });
        it('Should wrap mixed inline child elements', () => {
            const content = `
<p>Text block<span>and more</span></p>
`;
            const rootView = (0, render_1.default)(content);
            scrub(rootView);
            expect(rootView.type).toBe(renderer_1.View);
            const p = rootView.props.children;
            expect(p.props.element.tag).toBe('p');
            const text = p.props.children;
            expect(text.type).toBe(renderer_1.Text);
            const string = text.props.children[0];
            expect(string).toBe('Text block');
            const span = text.props.children[1];
            expect(span.props.element.tag).toBe('span');
            expect(span.props.children).toBe('and more');
        });
        it('Should render a PDF with custom font without errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const fonts = path_1.default.resolve(__dirname, 'fonts');
            renderer_1.Font.clear();
            renderer_1.Font.register({
                family: 'Open Sans',
                fonts: [
                    { src: fonts + '/Open_Sans/OpenSans-Regular.ttf' },
                    { src: fonts + '/Open_Sans/OpenSans-Bold.ttf', fontWeight: 'bold' },
                    {
                        src: fonts + '/Open_Sans/OpenSans-Italic.ttf',
                        fontStyle: 'italic',
                    },
                    {
                        src: fonts + '/Open_Sans/OpenSans-BoldItalic.ttf',
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                    },
                ],
            });
            yield renderer_1.Font.load({ fontFamily: 'Open Sans' });
            const content = `<html>
  <style>
    body {
      font-family: 'Open Sans';
    }
  </style>
  <body>
    <p>
        Paragraph with <strong>bold</strong>, <i>italic</i>, <u>underline</u> and <s>strikethrough</s>
        <img src="https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80" />
    </p>
    <ul>
        <li>
          First level
          <ul><li>Second level</li></ul>
        </li>
    </ul>
  </body>
</html>`;
            const rootView = (0, render_1.default)(content);
            expect(rootView.type).toBe(renderer_1.View);
            const html = rootView.props.children;
            expect(html.type).toBe(renderers_1.renderPassThrough);
            expect(html.props.children.length).toBe(2);
            const style = html.props.children[0];
            expect(style.type).toBe(renderers_1.renderNoop);
            expect(style.props.element.tag).toBe('style');
            const body = html.props.children[1];
            expect(body.type).toBe(renderers_1.renderBlock);
            expect(body.props.element.tag).toBe('body');
            expect(body.props.children.length).toBe(2);
            const p = body.props.children[0];
            expect(p.type).toBe(renderers_1.renderBlock);
            expect(p.props.element.tag).toBe('p');
            expect(p.props.children.length).toBe(2);
            const pText = p.props.children[0];
            expect(pText.type).toBe(renderer_1.Text);
            expect(pText.props.children.length).toBe(8);
            const image = p.props.children[1];
            expect(image.type).toBe(renderers_1.default.img);
            expect(image.props.element.tag).toBe('img');
            const ul = body.props.children[1];
            expect(ul.type).toBe(renderers_1.renderBlock);
            expect(ul.props.element.tag).toBe('ul');
            const li = ul.props.children;
            expect(li.props.children.length).toBe(2);
            // pText.props.children.forEach((child: any) => {
            //   if (typeof child === 'string') {
            //     console.log(`"${child}"`);
            //   } else {
            //     console.log(child.props?.element?.tag, child.type);
            //   }
            // });
            const document = (react_1.default.createElement(renderer_1.Document, null,
                react_1.default.createElement(renderer_1.Page, { size: "LETTER" },
                    react_1.default.createElement(react_1.default.Fragment, null, rootView))));
            try {
                const pdfString = yield (0, renderer_1.renderToString)(document);
                // console.log(pdfString);
            }
            catch (e) {
                fail(e);
            }
        }));
    });
    it('Should render a PDF with an svg without errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const content = `<html>
      <body>
        <svg xmlns="http://www.w3.org/2000/svg" width="500" height="300">
          <defs>
            <linearGradient id="linearGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="red" stop-opacity="1" />
              <stop offset="100%" style="stop-color:yellow;stop-opacity:1" />
            </linearGradient>

            <radialGradient id="radialGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:orange;stop-opacity:1" />
              <stop offset="100%" style="stop-color:blue;stop-opacity:1" />
            </radialGradient>

            <clipPath id="starClip">
              <polygon points="100,10 40,198 190,78 10,78 160,198" />
            </clipPath> 
          </defs>

          <rect width="100%" height="100%" fill="url(#linearGrad)" />

          <line x1="30" y1="80" x2="200" y2="250" stroke="black" stroke-width="3" />
          <polyline points="220,50 280,80 250,150 300,200" fill="none" stroke="green" stroke-width="3" />
          <polygon points="320,80 340,140 400,120" fill="url(#radialGrad)" /> 
          <path d="M420,50 C480,80 450,200 400,240" stroke="purple" stroke-width="4" fill="none"/>

          <rect x="230" y="160" width="60" height="30" fill="lightblue" stroke="black" />
          <circle cx="360" cy="220" r="20" fill="pink" />
          <ellipse cx="430" cy="260" rx="30" ry="15" fill="brown" />

          <text x="60" y="60" font-size="24">SVG Shapes</text>
          <text x="90" y="120">
            <tspan>Multiline</tspan>
            <tspan x="90" dy="20">Text</tspan> 
          </text>

          <g clip-path="url(#starClip)">
            <circle cx="100" cy="100" r="80" fill="#f0f" stroke="black" stroke-width="3" />
          </g>
        </svg>
      </body>
    </html>`;
        const rootView = (0, render_1.default)(content);
        expect(rootView.type).toBe(renderer_1.View);
        const html = rootView.props.children;
        expect(html.type).toBe(renderers_1.renderPassThrough);
        const body = html.props.children;
        expect(body.type).toBe(renderers_1.renderBlock);
        expect(body.props.element.tag).toBe('body');
        const svg = body.props.children;
        expect(svg.props.element.tag).toBe('svg');
        expect(svg.props.element.attributes).toStrictEqual({
            height: '300',
            width: '500',
            xmlns: 'http://www.w3.org/2000/svg',
        });
        const defs = svg.props.children[0];
        expect(defs.props.element.tag).toBe('defs');
        expect(defs.props.element.attributes).toStrictEqual({});
        const linearGradient = defs.props.children[0];
        expect(linearGradient.props.element.tag).toBe('lineargradient');
        expect(linearGradient.props.element.attributes).toStrictEqual({
            id: 'linearGrad',
            x1: '0%',
            x2: '100%',
            y1: '50%',
            y2: '50%',
        });
        const lStop1 = linearGradient.props.children[0];
        expect(lStop1.props.element.tag).toBe('stop');
        expect(lStop1.props.element.attributes).toStrictEqual({
            offset: '0%',
            'stop-color': 'red',
            'stop-opacity': '1',
        });
        const lStop2 = linearGradient.props.children[1];
        expect(lStop2.props.element.tag).toBe('stop');
        expect(lStop2.props.element.attributes).toStrictEqual({
            offset: '100%',
            style: 'stop-color:yellow;stop-opacity:1',
        });
        const radialGradient = defs.props.children[2];
        expect(radialGradient.props.element.tag).toBe('radialgradient');
        const rStop1 = radialGradient.props.children[0];
        expect(rStop1.props.element.tag).toBe('stop');
        const rStop2 = radialGradient.props.children[1];
        expect(rStop2.props.element.tag).toBe('stop');
        const clipPath = defs.props.children[4];
        expect(clipPath.props.element.tag).toBe('clippath');
        const polygonClip = clipPath.props.children;
        expect(polygonClip.props.element.tag).toBe('polygon');
        const rect = svg.props.children[1];
        expect(rect.props.element.tag).toBe('rect');
        const line = svg.props.children[2];
        expect(line.props.element.tag).toBe('line');
        const polyline = svg.props.children[3];
        expect(polyline.props.element.tag).toBe('polyline');
        const polygon = svg.props.children[4];
        expect(polygon.props.element.tag).toBe('polygon');
        const path = svg.props.children[5];
        expect(path.props.element.tag).toBe('path');
        const rect2 = svg.props.children[6];
        expect(rect2.props.element.tag).toBe('rect');
        const circle = svg.props.children[7];
        expect(circle.props.element.tag).toBe('circle');
        const ellipse = svg.props.children[8];
        expect(ellipse.props.element.tag).toBe('ellipse');
        const text = svg.props.children[9];
        expect(text.props.element.tag).toBe('text');
        const textMulti = svg.props.children[10];
        expect(textMulti.props.element.tag).toBe('text');
        const tspan1 = textMulti.props.children[0];
        expect(tspan1.props.element.tag).toBe('tspan');
        const tspan2 = textMulti.props.children[1];
        expect(tspan2.props.element.tag).toBe('tspan');
        const g = svg.props.children[11];
        expect(g.props.element.tag).toBe('g');
        const gCircle = g.props.children;
        expect(gCircle.props.element.tag).toBe('circle');
        const document = (react_1.default.createElement(renderer_1.Document, null,
            react_1.default.createElement(renderer_1.Page, { size: "LETTER" },
                react_1.default.createElement(react_1.default.Fragment, null, rootView))));
        try {
            const pdfString = yield (0, renderer_1.renderToString)(document);
        }
        catch (e) {
            fail(e);
        }
    }));
});
//# sourceMappingURL=render.test.js.map