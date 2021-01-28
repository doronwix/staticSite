export interface IEventsApi {
  postEvent: (event: string, cat: any) => void;
}

const eventsApi = () => ({
  postEvent: (event: string, cat: any) => {
    ko.postbox.publish(event, cat);
  },
});

export default eventsApi;
