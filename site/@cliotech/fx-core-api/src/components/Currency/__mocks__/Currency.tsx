import React from "react";

const CurrencyMock = ({ children, id }: { id: string; children: string }) => (
  <div id={id}>{children}</div>
);

const mock = jest.fn().mockImplementation(CurrencyMock);

export default mock;
