import React from "react";

interface HighlightProps {
  text: string;
  query: string;
}

const Highlight: React.FC<HighlightProps> = ({ text, query }) => {
  if (!query) return <>{text}</>;

  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? <b key={index}>{part}</b> : part
      )}
    </>
  );
};

export default Highlight;
