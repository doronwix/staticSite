import { IWebBonusData } from "../facade/IWebBonusManager";
import { IWebFacade } from "../facade/IWebFacade";

export interface IBonusApi {
  getBonusData: () => IWebBonusData;
  subscribeToChangeUpdates: (
    subFn: (bonusData: IWebBonusData) => void
  ) => () => void;
}

export default ({ BonusManager }: IWebFacade): IBonusApi => ({
  getBonusData: () => BonusManager.bonus(),

  subscribeToChangeUpdates: (subFn: (bonusData: IWebBonusData) => void) => {
    const newSubFn = () => {
      const data = BonusManager.bonus();
      subFn(data);
    };

    BonusManager.onChange.Add(newSubFn);
    return () => BonusManager.onChange.Remove(newSubFn);
  },
});
