const copyStyles = (source, target) => {
  Array.from(source.styleSheets).forEach(styleSheet => {
    // For <style> elements
    let rules;

    try {
      rules = styleSheet.cssRules;
    } catch (err) {
      console.error(err);
    }
    if (rules) {
      const newStyleEl = source.createElement('style');

      // Write the text of each rule into the body of the style element
      Array.from(styleSheet.cssRules).forEach(cssRule => {
        const { cssText, type } = cssRule;
        // Hack to work around bug in Chrome
        // https://bugs.chromium.org/p/chromium/issues/detail?id=623347

        let returnText = cssText.replace(/(\s[0-9])+,([0-9]+s[\s;]+)/, '$1.$2');

        // Check if the cssRule type is CSSImportRule (3) or CSSFontFaceRule (5) to handle local imports on a about:blank page
        // '/custom.css' turns to 'http://my-site.com/custom.css'
        if ([3, 5].includes(type)) {
          returnText = cssText
            .split('url(')
            .map(line => {
              if (line[1] === '/') {
                return `${line.slice(0, 1)}${
                  window.location.origin
                }${line.slice(1)}`;
              }

              return line;
            })
            .join('url(');
        }
        newStyleEl.appendChild(source.createTextNode(returnText));
      });

      target.head.appendChild(newStyleEl);
    } else if (styleSheet.href) {
      // for <link> elements loading CSS from a URL
      const newLinkEl = source.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      target.head.appendChild(newLinkEl);
    }
  });
};

module.exports = {
  copyStyles
};

