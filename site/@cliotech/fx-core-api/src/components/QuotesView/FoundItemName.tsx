import React from "react";

const stringEscapeForRegexp = (string: string) =>
  string.replace(/[-\/\\^$*+?.()|[\]{}]/gi, "\\$&");

const convertText = (searchString: string, text?: string) => {
  const input = text || "";
  // we escape what you're searching for use in regex - in case we have special chars
  const escapedSearchString = stringEscapeForRegexp(searchString);

  // group match regex
  const matcher = new RegExp(`(${escapedSearchString})`, "gi");
  const template = `<b class="bold">$1</b>`;

  return input.replace(matcher, template);
};

const FoundItemName: React.FunctionComponent<{
  text?: string;
  searchString: string;
}> = ({ text, searchString }) => {
  const converted = convertText(searchString, text);
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: converted,
      }}
    />
  );
};

export default FoundItemName;
