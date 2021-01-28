import React from "react";

const SummaryEntryMock = ({
  id,
  _plusAction,
  _rightAction,
}: {
  id: string;
  _plusAction: () => void;
  _rightAction: () => void;
}) => <div id={id}>{"SummaryEntryMock"}</div>;

const mock = jest.fn().mockImplementation(SummaryEntryMock);

export default mock;
