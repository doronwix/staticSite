import React, { useRef } from "react";

import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import QuotesTable from "./QuotesTable";
import PresetTabs from "./PresetTabs";
import { observer } from "mobx-react-lite";

const QuotesView = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<number>();

  return (
    <div id="RatesGrid">
      <DndProvider backend={Backend}>
        <PresetTabs tableRef={tableRef} selectedRowRef={selectedRowRef} />
        <QuotesTable tableRef={tableRef} selectedRowRef={selectedRowRef} />
      </DndProvider>
    </div>
  );
};

// eslint-disable-next-line react/display-name
export default observer(QuotesView);
