/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */
import processTpl, { genLinkReplaceSymbol } from "./process-tpl";
import { getGlobalProp, getInlineCode, noteGlobalProps } from "./utils";
var styleCache = {};
var scriptCache = {};
var embedHTMLCache = {};

if (!window.fetch) {
  throw new Error("There is no fetch on the window env, You can get polyfill in https://polyfill.io/ or the other ways");
}

var defaultFetch = window.fetch.bind(window);

function defaultGetDomain(url) {
  try {
    // URL 构造函数不支持使用 // 前缀的 url
    // location.protocol 获取协议, 比如 http
    // ${location.protocol}${url} => http://localhost:8080
    var href = new URL(url.startsWith("//") ? "".concat(location.protocol).concat(url) : url); // 返回值 例如http://localhost:8080

    return href.origin;
  } catch (e) {
    return "";
  }
}

function defaultGetTemplate(tpl) {
  return tpl;
}
/**
 * convert external css link to inline style for performance optimization
 * @param template
 * @param styles
 * @param opts
 * @return embedHTML
 */


function getEmbedHTML(template, styles) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _opts$fetch = opts.fetch,
      fetch = _opts$fetch === void 0 ? defaultFetch : _opts$fetch;
  var embedHTML = template;
  return _getExternalStyleSheets(styles, fetch).then(function (styleSheets) {
    // 读取style link 内容, 替换link
    embedHTML = styles.reduce(function (html, styleSrc, i) {
      // let styleId = styleSrc.match(/\/\/([^/]*)\//)[1];
      html = html.replace(genLinkReplaceSymbol(styleSrc), //添加替换styleLink注释
      "<style>/* ".concat(styleSrc, " */").concat(styleSheets[i], "</style>"));
      return html;
    }, embedHTML);
    return embedHTML;
  });
} // for prefetch


function _getExternalStyleSheets(styles) {
  var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultFetch;
  return Promise.all(styles.map(function (styleLink) {
    if (styleLink.startsWith("<")) {
      // if it is inline style
      // 读取style标签内的内容, 返回样式
      return getInlineCode(styleLink);
    } else {
      // external styles
      return styleCache[styleLink] || (styleCache[styleLink] = fetch(styleLink).then(function (response) {
        return response.text();
      }));
    }
  }));
} // for prefetch


export { _getExternalStyleSheets as getExternalStyleSheets };

function _getExternalScripts(scripts) {
  var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultFetch;
  return Promise.all(scripts.map(function (script) {
    if (script.startsWith("<")) {
      // if it is inline script
      // 行内script直接返回
      return getInlineCode(script);
    } else {
      // external script
      return scriptCache[script] || (scriptCache[script] = fetch(script).then(function (response) {
        return response.text();
      }));
    }
  }));
}

export { _getExternalScripts as getExternalScripts };

function _execScripts(entry, scripts) {
  var proxy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _opts$fetch2 = opts.fetch,
      fetch = _opts$fetch2 === void 0 ? defaultFetch : _opts$fetch2;
  return _getExternalScripts(scripts, fetch).then(function (scriptsText) {
    window.proxy = proxy;
    var geval = eval;

    function exec(scriptSrc, inlineScript, resolve) {
      var markName = "Evaluating script ".concat(scriptSrc);
      var measureName = "Evaluating Time Consuming: ".concat(scriptSrc);

      if (process.env.NODE_ENV === "development") {
        performance.mark(markName);
      }

      if (scriptSrc === entry) {
        var value = noteGlobalProps();
        console.log('lastGlobalProp', value);

        try {
          // bind window.proxy to change `this` reference in script
          var aa = geval(";(function(window){;".concat(inlineScript, "\n}).bind(window.proxy)(window.proxy);"));
          console.log("geval", geval(";(function(window){;".concat(inlineScript, "\n}).bind(window.proxy)(window.proxy);")));
        } catch (e) {
          console.error("error occurs while executing the entry ".concat(scriptSrc));
          throw e;
        }

        var exports = proxy[getGlobalProp()] || {};
        resolve(exports);
      } else {
        try {
          // bind window.proxy to change `this` reference in script
          geval(";(function(window){;".concat(inlineScript, "\n}).bind(window.proxy)(window.proxy);"));
          console.log("geval执行了");
        } catch (e) {
          console.error("error occurs while executing ".concat(scriptSrc));
          throw e;
        }
      }

      if (process.env.NODE_ENV === "development") {
        performance.measure(measureName, markName);
        performance.clearMarks(markName);
        performance.clearMeasures(measureName);
      }
    }

    function schedule(i, resolvePromise) {
      if (i < scripts.length) {
        var scriptSrc = scripts[i];
        var inlineScript = scriptsText[i];
        exec(scriptSrc, inlineScript, resolvePromise); // resolve the promise while the last script executed and entry not provided

        if (!entry && i === scripts.length - 1) {
          resolvePromise();
        } else {
          schedule(i + 1, resolvePromise);
        }
      }
    }

    return new Promise(function (resolve) {
      return schedule(0, resolve);
    });
  });
}

export { _execScripts as execScripts };
export default function importHTML(url) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var fetch = defaultFetch;
  var getDomain = defaultGetDomain;
  var getTemplate = defaultGetTemplate; // compatible with the legacy importHTML api

  if (typeof opts === "function") {
    fetch = opts;
  } else {
    fetch = opts.fetch || defaultFetch;
    getDomain = opts.getDomain || defaultGetDomain;
    getTemplate = opts.getTemplate || defaultGetTemplate;
  }

  return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url).then(function (response) {
    return response.text();
  }).then(function (html) {
    var domain = getDomain(url);
    var assetPublicPath = "".concat(domain, "/");

    var _processTpl = processTpl(getTemplate(html), domain),
        template = _processTpl.template,
        scripts = _processTpl.scripts,
        entry = _processTpl.entry,
        styles = _processTpl.styles;

    console.log("template", template);
    console.log("scripts", scripts);
    console.log("entry", entry);
    console.log("styles", styles);
    return getEmbedHTML(template, styles, {
      fetch: fetch
    }).then(function (embedHTML) {
      return {
        template: embedHTML,
        assetPublicPath: assetPublicPath,
        getExternalScripts: function getExternalScripts() {
          return _getExternalScripts(scripts, fetch);
        },
        getExternalStyleSheets: function getExternalStyleSheets() {
          return _getExternalStyleSheets(styles, fetch);
        },
        execScripts: function execScripts(proxy) {
          if (!scripts.length) {
            return Promise.resolve();
          }

          return _execScripts(entry, scripts, proxy, {
            fetch: fetch
          });
        }
      };
    });
  }));
}
export function importEntry(entry) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _opts$fetch3 = opts.fetch,
      fetch = _opts$fetch3 === void 0 ? defaultFetch : _opts$fetch3,
      _opts$getDomain = opts.getDomain,
      getDomain = _opts$getDomain === void 0 ? defaultGetDomain : _opts$getDomain,
      _opts$getTemplate = opts.getTemplate,
      getTemplate = _opts$getTemplate === void 0 ? defaultGetTemplate : _opts$getTemplate;

  if (!entry) {
    throw new SyntaxError("entry should not be empty!");
  } // html entry


  if (typeof entry === "string") {
    return importHTML(entry, {
      fetch: fetch,
      getDomain: getDomain,
      getTemplate: getTemplate
    });
  } // config entry


  if (Array.isArray(entry.scripts) || Array.isArray(entry.styles)) {
    var _entry$scripts = entry.scripts,
        scripts = _entry$scripts === void 0 ? [] : _entry$scripts,
        _entry$styles = entry.styles,
        styles = _entry$styles === void 0 ? [] : _entry$styles,
        _entry$html = entry.html,
        html = _entry$html === void 0 ? "" : _entry$html;
    return getEmbedHTML(html, styles, {
      fetch: fetch
    }).then(function (embedHTML) {
      return {
        template: embedHTML,
        assetPublicPath: "/",
        getExternalScripts: function getExternalScripts() {
          return _getExternalScripts(scripts, fetch);
        },
        getExternalStyleSheets: function getExternalStyleSheets() {
          return _getExternalStyleSheets(styles, fetch);
        },
        execScripts: function execScripts(proxy) {
          if (!scripts.length) {
            return Promise.resolve();
          }

          return _execScripts(scripts[scripts.length - 1], scripts, proxy, {
            fetch: fetch
          });
        }
      };
    });
  } else {
    throw new SyntaxError("entry scripts or styles should be array!");
  }
}