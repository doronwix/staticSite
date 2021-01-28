import ReactDOM from "react-dom";
import "mobx-react-lite/optimizeForReactDom";

import { wrapComponentWithProvider } from "./wrapWithProvider";

export const createBinding = () => {
  const binding: KnockoutBindingHandler<any, any, any> = {
    init: (
      el: Element,
      valueAccessor,
      allBindings,
      viewModel,
      bindingContext
    ) => {
      ko.utils.domNodeDisposal.addDisposeCallback(el, () => {
        ReactDOM.unmountComponentAtNode(el);
      });

      const Component = ko.unwrap(valueAccessor());
      const store = bindingContext.$data.store;

      // Tell react to render/re-render
      ReactDOM.render(wrapComponentWithProvider(Component, store), el);

      return {
        controlsDescendantBindings: true,
      };
    },
    update: () => {
      return {
        controlsDescendantBindings: true,
      };
    },
  };
  return binding;
};
