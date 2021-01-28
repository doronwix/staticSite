import React, { FunctionComponent } from "react";

const FakeQuoteRow: FunctionComponent<{ isFavorite?: boolean }> = ({
  isFavorite,
}) => {
  return (
    <tr className="fake-row">
      <td className="favorite" />
      <td className="instrument ccpairs" />
      <td className="rate bidWidth" />
      <td className="rate askWidth ask-column" />
      <td className="rate ltr changePercentWidth" />
      <td className="rate highLow-column" />

      {isFavorite && <td className="re-order" />}
    </tr>
  );
};

export default FakeQuoteRow;
