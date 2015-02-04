// Generated by IcedCoffeeScript 1.8.0-c

/*
    Oven, a Google+ Userscript Framework
    Copyright (C) 2013 Jingqin Lynn

    Includes IcedCoffeeScript Compiler v1.6.2a
      http://iced-coffee-script.github.io/iced-coffee-script
      Copyright 2011, Jeremy Ashkenas, Maxwell Krohn
      Released under the MIT License

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/*
// ==UserScript==
// @name Google+ Userscript Framework
// @namespace http://project.quietmusic.org/2012/userscript/oven/
// @description Google+ Userscript Framework
// @include *
// @grant GM_xmlhttpRequest
// @run-at document-start
// ==/UserScript==
 */

(function() {
  var MutationObserver, Oven, d, observer, on_frame_loaded, onready, oven, update_code, __iced_deferrals, __iced_k, _ref, _ref1,
    __slice = [].slice;

  window.iced = {
    Deferrals: (function() {
      function _Class(_arg) {
        this.continuation = _arg;
        this.count = 1;
        this.ret = null;
      }

      _Class.prototype._fulfill = function() {
        if (!--this.count) {
          return this.continuation(this.ret);
        }
      };

      _Class.prototype.defer = function(defer_params) {
        ++this.count;
        return (function(_this) {
          return function() {
            var inner_params, _ref;
            inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (defer_params != null) {
              if ((_ref = defer_params.assign_fn) != null) {
                _ref.apply(null, inner_params);
              }
            }
            return _this._fulfill();
          };
        })(this);
      };

      return _Class;

    })(),
    findDeferral: function() {
      return null;
    },
    trampoline: function(_fn) {
      return _fn();
    }
  };
  window.__iced_k = window.__iced_k_noop = function() {};

  if (location.href.indexOf('https://plus.google.com/') !== 0) {
    return;
  }

  if (!window.ExtOvenEval) {
    update_code = window.localStorage['ExtOvenCode'];
    if (update_code != null) {
      window.ExtOvenEval = true;
      eval('//# sourceURL=OvenCode.user.js\n' + update_code);
      return;
    }
  } else {
    if ((window['chrome'] != null) && (window.chrome['extension'] == null)) {
      on_frame_loaded = function(e) {
        if (e.target.src.indexOf('https://plus.google.com/') !== 0) {
          return;
        }
        if (e.target.contentWindow.ExtOvenEval) {
          return;
        }
        e.target.contentWindow.ExtOvenEval = true;
        return e.target.contentWindow["eval"](window.localStorage['ExtOvenCode']);
      };
      MutationObserver = (_ref = window.MutationObserver) != null ? _ref : window.WebKitMutationObserver;
      if (!MutationObserver && (typeof unsafeWindow !== "undefined" && unsafeWindow !== null)) {
        MutationObserver = (_ref1 = unsafeWindow.MutationObserver) != null ? _ref1 : unsafeWindow.WebKitMutationObserver;
      }
      if (MutationObserver) {
        observer = new MutationObserver(function(mutations) {
          return mutations.forEach(function(mutation) {
            var el, ell, result, _i, _len, _ref2, _results;
            if (mutation.type === 'childList' && mutation.addedNodes) {
              _ref2 = mutation.addedNodes;
              _results = [];
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                el = _ref2[_i];
                if (el.tagName === 'IFRAME') {
                  el.addEventListener('load', on_frame_loaded, false);
                }
                if (el.querySelector && (result = el.querySelectorAll('iframe'))) {
                  _results.push((function() {
                    var _j, _len1, _results1;
                    _results1 = [];
                    for (_j = 0, _len1 = result.length; _j < _len1; _j++) {
                      ell = result[_j];
                      _results1.push(ell.addEventListener('load', on_frame_loaded, false));
                    }
                    return _results1;
                  })());
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            }
          });
        });
        observer.observe(document, {
          childList: true,
          subtree: true
        });
      }
    }
  }

  Oven = (function() {
    function Oven() {
      var _ref2;
      this.api = {
        lang: {},
        manager: this
      };
      this.snippets = {};
      this.status = {};
      this.storage = window.localStorage;
      this.sync_interval = 0;
      this.version = 1;
      this.updateUrl = (_ref2 = this.storage['ExtOvenUpdateUrl']) != null ? _ref2 : 'https://github.com/quietlynn/oven/raw/master/oven.user.js';
    }

    Oven.prototype.load = function(callback) {
      var data, name, snip, _i, _len, _ref2;
      snip = this.storage['ExtOvenSnippets'];
      if (!snip) {
        this.init((function(_this) {
          return function() {
            return _this.load(callback);
          };
        })(this));
        return false;
      }
      try {
        _ref2 = JSON.parse(this.storage['ExtOvenSnippets']);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          name = _ref2[_i];
          data = JSON.parse(this.storage['ExtOvenSnippet_' + name]);
          this.snippets[name] = data;
        }
      } catch (_error) {
        this.panic();
        this.init((function(_this) {
          return function() {
            return _this.load(callback);
          };
        })(this));
        return false;
      }
      if (this.version > this.storage['ExtOvenVersion']) {
        this.update((function(_this) {
          return function() {
            return _this.load(callback);
          };
        })(this));
      }
      if (callback) {
        callback();
      }
      return true;
    };

    Oven.prototype.version_compare = function(v1, v2) {
      var i, i1, i2, sv1, sv2, _i, _ref2;
      sv1 = v1.split(".");
      sv2 = v2.split(".");
      for (i = _i = 0, _ref2 = sv1.length - 1; 0 <= _ref2 ? _i <= _ref2 : _i >= _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
        if (sv2.length - 1 < i) {
          return 1;
        }
        i1 = parseInt(sv1[i]);
        i2 = parseInt(sv2[i]);
        if (i1 > i2) {
          return 1;
        }
        if (i1 < i2) {
          return -1;
        }
      }
      if (sv1.length === sv2.length) {
        return 0;
      }
      return -1;
    };

    Oven.prototype.init = function(callback) {
      var data, name, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      this.storage['ExtOvenUpdateDate'] = new Date();
      this.storage['ExtOvenVersion'] = this.version;
      this.snippets = {
        'oven.lang.coffee': {
          deps: ['oven.lang.iced'],
          code: 'oven.lang.coffee = oven.lang.iced;',
          url: null,
          builtin: true
        },
        'oven.lang.iced': {
          deps: ['io.github.maxtaco.iced.compiler'],
          code: 'oven.lang.iced = function (source) {\n  return CoffeeScript.compile(source, {runtime: \'window\'});\n}',
          url: null,
          builtin: true
        }
      };
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced",
            funcname: "Oven.init"
          });
          _this.install('io.github.maxtaco.iced.compiler', 'https://maxtaco.github.io/coffee-script/extras/iced-coffee-script-1.8.0-a.js', __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return data = arguments[0];
              };
            })(),
            lineno: 141
          }), 'bypass_cache');
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (data) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced",
                funcname: "Oven.init"
              });
              _this.install('oven.ui', 'https://github.com/quietlynn/oven-gplus/raw/master/oven_ui.oven.iced', __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return data = arguments[0];
                  };
                })(),
                lineno: 146
              }), 'bypass_cache');
              __iced_deferrals._fulfill();
            })(function() {
              if (data) {
                for (name in _this.snippets) {
                  _this.snippets[name].builtin = true;
                }
                _this.save();
                if (callback) {
                  callback();
                }
              }
              return __iced_k();
            });
          } else {
            return __iced_k();
          }
        };
      })(this));
    };

    Oven.prototype.panic = function() {
      var name, _results;
      _results = [];
      for (name in this.storage) {
        if (name.indexOf('ExtOven') === 0) {
          _results.push(delete this.storage[name]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Oven.prototype.update = function(callback) {
      this.storage['ExtOvenVersion'] = this.version;
      this.snippets['io.github.maxtaco.iced.compiler'].url = 'https://maxtaco.github.io/coffee-script/extras/iced-coffee-script-1.8.0-a.js';
      return callback();
    };

    Oven.prototype.save = function() {
      var data, name, names, _ref2;
      console.log('Oven::save');
      names = [];
      _ref2 = this.snippets;
      for (name in _ref2) {
        data = _ref2[name];
        this.storage['ExtOvenSnippet_' + name] = JSON.stringify(data);
        names.push(name);
      }
      return this.storage['ExtOvenSnippets'] = JSON.stringify(names);
    };

    Oven.prototype.xhr = function(url, callback, bypass_cache) {
      var onreadystatechange, xhr, _;
      if (bypass_cache == null) {
        bypass_cache = false;
      }
      if (bypass_cache) {
        url += (/\?/.test(url) ? "&" : "?") + ("_=" + (new Date()).getTime());
      }
      onreadystatechange = function(xhr) {
        if (xhr.target) {
          xhr = xhr.target;
        }
        if (xhr.readyState === 4) {
          if (callback) {
            if (xhr.status === 200) {
              return callback(xhr.responseText);
            } else {
              console.log("OVEN::xhr ERROR " + xhr.status + ": " + xhr.responseText);
              return callback(null);
            }
          }
        }
      };
      if (typeof GM_xmlhttpRequest !== "undefined" && GM_xmlhttpRequest !== null) {
        return GM_xmlhttpRequest({
          method: 'GET',
          url: url,
          onreadystatechange: onreadystatechange
        });
      } else {
        xhr = (function() {
          if (window.XMLHttpRequest) {
            return new XMLHttpRequest;
          } else if (window.ActiveXObject) {
            try {
              return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (_error) {
              _ = _error;
              try {
                return new ActiveXObject('Microsoft.XMLHTTP');
              } catch (_error) {
                _ = _error;
                return null;
              }
            }
          }
        })();
        if (!xhr) {
          return null;
        }
        xhr.onreadystatechange = onreadystatechange;
        xhr.open('GET', url, true);
        xhr.send();
        return xhr;
      }
    };

    Oven.prototype.grab = function(name, url, callback, bypass_cache) {
      var code, data, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (bypass_cache == null) {
        bypass_cache = false;
      }
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced",
            funcname: "Oven.grab"
          });
          _this.xhr(url, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return code = arguments[0];
              };
            })(),
            lineno: 216
          }), bypass_cache);
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (typeof code === "undefined" || code === null) {
            if (callback) {
              callback(null);
            }
            return;
          }
          data = _this.parse(name, url, code);
          if (callback) {
            return callback(data);
          }
        };
      })(this));
    };

    Oven.prototype.install = function(name, url, callback, bypass_cache) {
      var data, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (bypass_cache == null) {
        bypass_cache = false;
      }
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced",
            funcname: "Oven.install"
          });
          _this.grab(name, url, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return data = arguments[0];
              };
            })(),
            lineno: 225
          }), bypass_cache);
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (data) {
            if (name) {
              data.name = name;
            }
            (function(__iced_k) {
              if (data.missing != null) {
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced",
                    funcname: "Oven.install"
                  });
                  _this.install_all(data.missing, __iced_deferrals.defer({
                    lineno: 229
                  }), bypass_cache);
                  __iced_deferrals._fulfill();
                })(function() {
                  return __iced_k(delete data.missing);
                });
              } else {
                return __iced_k();
              }
            })(function() {
              _this.add(data.name, data);
              console.log('Oven::install ' + data.name);
              return __iced_k(callback ? callback(data) : void 0);
            });
          } else {
            return __iced_k();
          }
        };
      })(this));
    };

    Oven.prototype.install_all = function(deps, callback, bypass_cache) {
      var dep_name, dep_url, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (bypass_cache == null) {
        bypass_cache = false;
      }
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced",
            funcname: "Oven.install_all"
          });
          for (dep_name in deps) {
            dep_url = deps[dep_name];
            _this.install(dep_name, dep_url, __iced_deferrals.defer({
              lineno: 238
            }), bypass_cache);
          }
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (callback) {
            return callback();
          }
        };
      })(this));
    };

    Oven.prototype.parse = function(name, url, code) {
      var data, dep, dep_url, ex, field, reg, result, value, _, _ref2, _ref3;
      data = {};
      data.deps = [];
      data.opts = [];
      reg = /(?:\n|^)\s*OVEN::(\w+)\s+(.*)/g;
      while (result = reg.exec(code)) {
        _ = result[0], field = result[1], value = result[2];
        if (field === 'require') {
          _ref2 = value.split(/\s+/), dep = _ref2[0], dep_url = _ref2[1];
          data.deps.push(dep);
          if (!this.installed(dep)) {
            if (data.missing == null) {
              data.missing = {};
            }
            data.missing[dep] = dep_url;
          }
        } else if (field === 'optional') {
          _ref3 = value.split(/\s+/), dep = _ref3[0], dep_url = _ref3[1];
          data.opts.push(dep);
        } else if (['deps', 'opts', 'builtin', 'disabled'].indexOf(field) < 0) {
          data[field] = value;
        }
      }
      data.url = url;
      data.last_update = new Date;
      if (data.version == null) {
        data.version = 0;
      }
      if (data.name == null) {
        data.name = name != null ? name : url;
      }
      if (data.display == null) {
        data.display = data.name;
      }
      if (data.lang) {
        this.run('oven.lang.' + data.lang);
        try {
          data.code = oven.api.lang[data.lang](code);
        } catch (_error) {
          ex = _error;
          console.log("Error compiling " + data.name + " with " + data.lang + ":");
          console.log(ex.toString());
        }
      } else {
        data.code = code;
      }
      return data;
    };

    Oven.prototype.sync = function(callback, bypass_cache) {
      var data, name, now, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (bypass_cache == null) {
        bypass_cache = false;
      }
      console.log('Oven::sync');
      now = new Date();
      (function(_this) {
        return (function(__iced_k) {
          var _ref2;
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced",
            funcname: "Oven.sync"
          });
          if (now - new Date(_this.storage['ExtOvenUpdateDate']) > _this.sync_interval) {
            if (_this.updateUrl) {
              (function(autocb) {
                var code, ___iced_passed_deferral1, __iced_deferrals, __iced_k;
                __iced_k = autocb;
                ___iced_passed_deferral1 = iced.findDeferral(arguments);
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral1,
                    filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced"
                  });
                  _this.xhr(_this.updateUrl, __iced_deferrals.defer({
                    assign_fn: (function() {
                      return function() {
                        return code = arguments[0];
                      };
                    })(),
                    lineno: 285
                  }), bypass_cache || !_this.storage['ExtOvenCode']);
                  __iced_deferrals._fulfill();
                })(function() {
                  if (typeof code !== "undefined" && code !== null) {
                    _this.storage['ExtOvenCode'] = code;
                    autocb(_this.storage['ExtOvenUpdateDate'] = now);
                    return;
                  }
                  autocb();
                  return;
                });
              })(__iced_deferrals.defer({
                lineno: 290
              }));
            }
          }
          _ref2 = _this.snippets;
          for (name in _ref2) {
            data = _ref2[name];
            if (data.url !== null && !_this.snippets[name].disabled) {
              if (now - new Date(data.last_update) > _this.sync_interval) {
                (function(autocb, name, builtin) {
                  var ___iced_passed_deferral1, __iced_deferrals, __iced_k;
                  __iced_k = autocb;
                  ___iced_passed_deferral1 = iced.findDeferral(arguments);
                  (function(__iced_k) {
                    __iced_deferrals = new iced.Deferrals(__iced_k, {
                      parent: ___iced_passed_deferral1,
                      filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced"
                    });
                    _this.install(name, data.url, __iced_deferrals.defer({
                      lineno: 295
                    }), bypass_cache);
                    __iced_deferrals._fulfill();
                  })(function() {
                    autocb(_this.snippets[name].builtin = builtin);
                    return;
                  });
                })(__iced_deferrals.defer({
                  lineno: 297
                }), name, data.builtin);
              } else {
                _this.snippets[name].last_update = now;
              }
            }
          }
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          _this.save();
          if (callback) {
            return callback();
          }
        };
      })(this));
    };

    Oven.prototype.cook = function() {
      var name, _results;
      for (name in this.snippets) {
        if (name.indexOf('oven.lang.' === 0)) {
          this.run(name);
        }
      }
      _results = [];
      for (name in this.snippets) {
        _results.push(this.run(name));
      }
      return _results;
    };

    Oven.prototype.run = function(name) {
      var data, dep, opt, _i, _j, _len, _len1, _ref2, _ref3;
      if (this.status[name] !== 'loaded' && !this.snippets[name].disabled) {
        data = this.snippets[name];
        _ref2 = data.deps;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dep = _ref2[_i];
          this.run(dep);
        }
        if (data.opts) {
          _ref3 = data.opts;
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            opt = _ref3[_j];
            if (this.installed(opt)) {
              this.run(opt);
            }
          }
        }
        console.log('Oven::run ' + name);
        this.execute(this.snippets[name].code, name);
        return this.status[name] = 'loaded';
      }
    };

    Oven.prototype.execute = function(code, name) {
      var fn;
      if (name == null) {
        name = 'OVEN.execute';
      }
      fn = eval("//# sourceURL=" + name + ".oven.js\n(function (oven) { try {\n  \n" + code + "\n\n} catch (ex) { console.log(ex.toString()); } })");
      return fn(this.api);
    };

    Oven.prototype.installed = function(name) {
      return this.snippets[name] != null;
    };

    Oven.prototype.has = function(name) {
      return this.status[name] === 'loaded';
    };

    Oven.prototype.add = function(name, data) {
      this.snippets[name] = data;
      return data.last_update = new Date();
    };

    Oven.prototype.remove = function(name) {
      var data, snip, snips, _i, _len, _ref2, _results;
      delete this.snippets[name];
      snips = [];
      _ref2 = this.snippets;
      for (snip in _ref2) {
        data = _ref2[snip];
        if (data.deps.indexOf(name) >= 0) {
          snips.push(snip);
        }
      }
      _results = [];
      for (_i = 0, _len = snips.length; _i < _len; _i++) {
        snip = snips[_i];
        _results.push(this.remove(snip));
      }
      return _results;
    };

    Oven.prototype.enable = function(name) {
      var data, dep, _i, _len, _ref2;
      data = this.snippets[name];
      _ref2 = data.deps;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        dep = _ref2[_i];
        this.enable(dep);
      }
      if (data.disabled) {
        console.log('OVEN::enable ' + name);
        return delete data.disabled;
      }
    };

    Oven.prototype.disable = function(name) {
      var data, snip, _ref2, _results;
      console.log('OVEN::disable ' + name);
      this.snippets[name].disabled = true;
      _ref2 = this.snippets;
      _results = [];
      for (snip in _ref2) {
        data = _ref2[snip];
        if (data.deps.indexOf(name) >= 0) {
          _results.push(this.disable(snip));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Oven;

  })();

  oven = new Oven;

  window.ExtOvenManager = oven;

  (function(_this) {
    return (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        filename: "/run/media/meow/hdd/backup/catland/20140628/home/meow/workspace/oven/oven.user.iced"
      });
      d = __iced_deferrals.defer({
        lineno: 373
      });
      onready = function() {
        var _ref2;
        if ((_ref2 = document.querySelector('base')) != null ? _ref2.href.match(/^https:\/\/plus\.google\.com(\/u\/\d+)?\/?/) : void 0) {
          return d();
        }
      };
      if (document.readyState !== 'loading') {
        onready();
      } else {
        document.addEventListener('DOMContentLoaded', onready);
      }
      oven.load(__iced_deferrals.defer({
        lineno: 381
      }));
      __iced_deferrals._fulfill();
    });
  })(this)((function(_this) {
    return function() {
      oven.cook();
      if (window.self === window.top) {
        return window.addEventListener('load', function() {
          return oven.sync(null, 'bypass_cache');
        });
      }
    };
  })(this));

}).call(this);
