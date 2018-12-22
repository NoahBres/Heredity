import { default as Heredity } from "../Heredity";

export default interface VizClass {
  readonly _heredity: Heredity;
  readonly _parentElement: HTMLElement;

  init(): void;
  update(): void;
  link(toLink: VizClass): boolean;
}

export function injectStylesheet(style: string, styleId: string) {
  const existingScript = document.getElementById(styleId);

  if (existingScript) {
    return;
  }

  const node = document.createElement("style");
  node.innerHTML = style;
  node.id = styleId;

  document.body.appendChild(node);
}
