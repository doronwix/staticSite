import { types, Instance, SnapshotIn } from "mobx-state-tree";
import { Preset } from "../preset/preset";

import { WithRefsModelType } from "../../util";
import { IInstrumentData } from "../../../api/instrumentsApi";

export const Instrument = types
  .model({
    id: types.identifierNumber,
    isFavorite: types.optional(types.boolean, false),
    preset: types.maybe(types.safeReference(types.late((): any => Preset))),
    hasPriceAlert: types.optional(types.boolean, false),
    instrumentData: types.frozen<IInstrumentData>(),
  })
  .actions((self) => {
    const setFavorite = (favorite: boolean) => {
      self.isFavorite = favorite;
    };

    const setPriceAlert = (hasPriceAlert: boolean) => {
      self.hasPriceAlert = hasPriceAlert;
    };
    return {
      setFavorite,
      setPriceAlert,
    };
  });

interface IRefs {
  preset: typeof Preset;
}
export interface IInstrumentType
  extends Instance<WithRefsModelType<typeof Instrument, IRefs>> {}

export interface IInstrumentSnapshotIn extends SnapshotIn<typeof Instrument> {}
