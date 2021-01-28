import { types, Instance, SnapshotIn, applySnapshot } from "mobx-state-tree";
import { IWebEQuoteStates } from "../../../facade/enums/IWebEQuoteStates";
import { mobxNumericEnum } from "../../../utils/mobxEnumWrapper";
import { IWebEHighLowStates } from "../../../facade/enums/IWebEHighLowStates";

export const Quote = types
  .model({
    id: types.identifierNumber,
    state: types.optional(
      mobxNumericEnum(IWebEQuoteStates),
      IWebEQuoteStates.NotChanged
    ),
    bid: types.maybe(types.string),
    ask: types.maybe(types.string),
    open: types.maybe(types.string),
    high: types.maybe(types.string),
    low: types.maybe(types.string),
    highBid: types.maybe(types.string),
    lowAsk: types.maybe(types.string),
    tradeTime: types.maybe(types.string),
    change: types.maybe(types.number),
    changePips: types.maybe(types.number),
    close: types.maybe(types.string),
    previousState: types.maybe(mobxNumericEnum(IWebEQuoteStates)),
  })
  .views((self) => ({
    get isActive() {
      return (
        self.state !== IWebEQuoteStates.Disabled &&
        self.state !== IWebEQuoteStates.TimedOut &&
        self.state !== IWebEQuoteStates.Locked
      );
    },

    get highLowState() {
      switch (self.state) {
        case IWebEQuoteStates.Disabled:
          return IWebEHighLowStates.MarketClosed;
        case IWebEQuoteStates.TimedOut:
        case IWebEQuoteStates.Locked:
          return self.previousState === IWebEQuoteStates.Disabled
            ? IWebEHighLowStates.NA
            : IWebEHighLowStates.Active;
        default:
          return IWebEHighLowStates.Active;
      }
    },

    get twoDigitChange() {
      return Math.round((self.change || 0) * 100) / 100;
    },
  }))
  .actions((self) => {
    const update = (data: IQuoteSnapshotIn) => {
      applySnapshot(self, {
        ...data,
        previousState: self.state,
      });
    };
    return {
      update,
    };
  });

export interface IQuoteType extends Instance<typeof Quote> {}

export interface IQuoteSnapshotIn extends SnapshotIn<typeof Quote> {}
