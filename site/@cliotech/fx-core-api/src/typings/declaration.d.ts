/**
 * declare .less modules so we can use import "stuff.less" in Typescript
 */

declare module "*.less" {
  const styles: { [className: string]: string };
  export default styles;
}

declare module "*.css" {
  const styles: { [className: string]: string };
  export default styles;
}

declare module "mobx-devtools-mst" {
  const makeInspectabpe: (t: any) => void;
  export default makeInspectabpe;
}
