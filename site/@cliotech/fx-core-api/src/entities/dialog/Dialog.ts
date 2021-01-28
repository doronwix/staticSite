import { types, Instance, getEnv } from "mobx-state-tree";
import { IApi } from "../../api";
import { IWebDialogType } from "../../facade/enums/IWebDialogType";
import { IWebDialogOptions } from "../../facade/IWebDialogViewModel";
import { IWebViewType } from "../../facade/enums/IWebViewType";

const Dialog = types.model({}).actions((self) => {
  const open = (
    name: IWebDialogType,
    options: IWebDialogOptions,
    eView: IWebViewType,
    args?: any
  ) => {
    const { dialogApi } = getEnv(self) as IApi;
    return dialogApi.open(name, options, eView, args);
  };

  const redirectToForm = getEnv<IApi>(self).viewsManagerApi.redirectToForm;
  const switchViewVisible = getEnv<IApi>(self).viewsManagerApi
    .switchViewVisible;
  const postEvent = getEnv<IApi>(self).eventsApi.postEvent;

  return {
    open,
    redirectToForm,
    switchViewVisible,
    postEvent,
  };
});

export interface IDialogType extends Instance<typeof Dialog> {}

export default Dialog;
