export default interface IRenderer {
  html: HTMLElement;
  render(data?: any): void;
}