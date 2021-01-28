import { IWebCustomer } from "../facade/IWebCustomer";
import { IWebFacade } from "../facade/IWebFacade";
import { ICustomerSnapshotIn } from "../entities/customer";

export interface ICustomerApi {
  getCustomerData: () => Partial<ICustomerSnapshotIn>;
  subscribeToCcyIdChanges: (cb: (val: number) => void) => KnockoutSubscription;
}

const getCustomerData = (customer: IWebCustomer) => {
  return {
    ...customer.prop,
    selectedCcyId: customer.prop.selectedCcyId(),
  };
};

export default (facet: IWebFacade): ICustomerApi => ({
  getCustomerData: () => getCustomerData(facet.Customer),
  subscribeToCcyIdChanges: (cb) =>
    facet.Customer.prop.selectedCcyId.subscribe(cb),
});
