import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { getExternalScripts as rawGetExternalScripts, getExternalStyleSheets as rawGetExternalStyleSheets } from './../index';
test('test custome fetch importHTML',
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(done) {
    var mockHeaders, _fetch, importHTML, _ref3, getExternalScripts, getExternalStyleSheets;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            mockHeaders = {
              'referer': 'http://kuitos.me'
            };
            _fetch = jest.fn().mockImplementation(function (url, opts) {
              return Promise.resolve({
                text: function text() {}
              });
            });
            importHTML = jest.fn().mockImplementation(function (url, _ref2) {
              var fetch = _ref2.fetch;
              return {
                getExternalScripts: function getExternalScripts() {
                  return rawGetExternalScripts(['http://kuitos.me/index.js'], fetch);
                },
                getExternalStyleSheets: function getExternalStyleSheets() {
                  return rawGetExternalStyleSheets(['http://kuitos.me/index.css'], fetch);
                }
              };
            });
            _context.next = 5;
            return importHTML('http://kuitos.me', {
              fetch: function fetch(url) {
                return _fetch(url, {
                  headers: mockHeaders
                });
              }
            });

          case 5:
            _ref3 = _context.sent;
            getExternalScripts = _ref3.getExternalScripts;
            getExternalStyleSheets = _ref3.getExternalStyleSheets;
            _context.next = 10;
            return getExternalScripts();

          case 10:
            _context.next = 12;
            return getExternalStyleSheets();

          case 12:
            // 对所有 fetch calls 的 args opt 做校验, reduce 结果为 false 则 fetch 的透传符合预期
            expect(_fetch.mock.calls.reduce(function (pre, cur) {
              return pre || cur[1].headers !== mockHeaders;
            }, false)).toBe(false);
            done();

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());