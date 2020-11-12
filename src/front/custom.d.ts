declare module "*.scss" {
  const styles: { [className: string]: string };
  export default styles;
}

declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.gif" {
  const content: any;
  export default content;
}