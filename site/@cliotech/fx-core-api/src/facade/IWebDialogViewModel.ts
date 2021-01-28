import { IWebViewType } from "./enums/IWebViewType";
import { IWebDialogType } from "./enums/IWebDialogType";

export interface IWebDialogOptions {
  title?: string;
  width?: number;
  height?: string;
  dialogClass?: string;
  closeText?: string;
  openTimeout?: number;
  persistent?: boolean;
  useDialogPosition?: boolean;
  customTitle?: string;
  dragStart?: () => any;
}

export interface IWebDialogViewModel {
  open: (
    name: IWebDialogType,
    options: IWebDialogOptions,
    eView: IWebViewType,
    args?: any
  ) => void;
  isOpen: () => boolean;
  getCurrentView: () => number;
  close: () => void;
}
