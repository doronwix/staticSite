import { IWebERegistrationListName } from "../facade/enums/IWebERegistrationListName";
import { IWebFacade } from "../facade/IWebFacade";

export interface IRegistrationApi {
  update: (
    listName: IWebERegistrationListName,
    list: Array<[number, string?]>
  ) => void;
}

export default ({ RegistrationManager }: IWebFacade) => ({
  update: (
    listName: IWebERegistrationListName,
    list: Array<[number, string?]>
  ) => {
    RegistrationManager.Update(listName, list);
  },
});
