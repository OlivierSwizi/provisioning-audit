import logger from "@/logger";

import(`../assets/token/DT_swizi/Fonts/Swizi-Glyphicons.ttf`).then((Glyphicons) => {
  const glyphs = new FontFace("Swizi-Glyphicons", `url(${Glyphicons.default})`);
  glyphs
    .load()
    .then((loaded_face) => {
      document.fonts.add(loaded_face);
    })
    .catch((error) => {
      logger.error(error);
    });
});

Promise.all([
  import(`../assets/token/DT_swizi/Fonts/Swizi-Title-Bold.ttf`),
  import(`../assets/token/DT_swizi/Fonts/Swizi-Title-Italic.ttf`),
  import(`../assets/token/DT_swizi/Fonts/Swizi-Title-Regular.ttf`),
  import(`../assets/token/DT_swizi/Fonts/Swizi-Bold.ttf`),
  import(`../assets/token/DT_swizi/Fonts/Swizi-Italic.ttf`),
  import(`../assets/token/DT_swizi/Fonts/Swizi-Regular.ttf`),
]).then(([boldTitle, italicTitle, regularTitle, bold, italic, regular]) => {
  const boldTitleFace = new FontFace("Swizi-Title", `url(${boldTitle.default})`, {
    weight: "bold",
  });
  const italicTitleFace = new FontFace("Swizi-Title", `url(${italicTitle.default})`, {
    style: "italic",
  });
  const regularTitleFace = new FontFace("Swizi-Title", `url(${regularTitle.default})`, {
    weight: "normal",
  });
  const boldFace = new FontFace("Swizi", `url(${bold.default})`, {
    weight: "bold",
  });
  const italicFace = new FontFace("Swizi", `url(${italic.default})`, {
    style: "italic",
  });
  const regularFace = new FontFace("Swizi", `url(${regular.default})`, {
    weight: "normal",
  });
  Promise.all([
    boldTitleFace.load(),
    italicTitleFace.load(),
    regularTitleFace.load(),
    boldFace.load(),
    italicFace.load(),
    regularFace.load(),
  ])
    .then(
      ([
        loadedBoldTitle,
        loadedItalicTitle,
        loadedRegularTitle,
        loadedBold,
        loadedItalic,
        loadedRegular,
      ]) => {
        document.fonts.add(loadedBoldTitle);
        document.fonts.add(loadedItalicTitle);
        document.fonts.add(loadedRegularTitle);
        document.fonts.add(loadedBold);
        document.fonts.add(loadedItalic);
        document.fonts.add(loadedRegular);
      },
    )
    .catch((error) => {
      logger.error(error);
    });
});
