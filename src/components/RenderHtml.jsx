import ReactHtmlParser from "react-html-parser";

const RenderHtml = (html) => {
  return <div>{ReactHtmlParser(html.html)}</div>;
};

export default RenderHtml;
