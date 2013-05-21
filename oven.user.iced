###
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
    
###

###
// ==UserScript==
// @name 		Google+ Userscript Framework
// @namespace		http://project.quietmusic.org/2012/userscript/oven/
// @description		Google+ Userscript Framework
// @include *
// @grant GM_xmlhttpRequest
// @run-at document-start
// ==/UserScript==
###

return unless location.href.indexOf('https://plus.google.com/') == 0

if not window.ExtOvenEval
  update_code = window.localStorage['ExtOvenCode']
  if update_code?
    window.ExtOvenEval = true
    eval '//@ sourceURL=OvenCode.user.js\n' + update_code
    return
else
  # if window['chrome']? and not window.chrome['extension']?
  if true
    # Userscripts in Chrome cannot access iframes.
    # However, Chrome extensions can.
    on_frame_loaded = (e) ->
      return unless e.target.src.indexOf('https://plus.google.com/') == 0
      return if e.target.contentWindow.ExtOvenEval
      e.target.contentWindow.ExtOvenEval = true
      e.target.contentWindow.eval(window.localStorage['ExtOvenCode'])

    MutationObserver = window.MutationObserver ? window.WebKitMutationObserver
    observer = new MutationObserver (mutations) ->
      mutations.forEach (mutation) ->
        if mutation.type == 'childList' and mutation.addedNodes
            for el in mutation.addedNodes
              if el.tagName == 'IFRAME'
                el.addEventListener 'load', on_frame_loaded, false
              if el.querySelector and (result = el.querySelectorAll('iframe'))
                for ell in result
                  ell.addEventListener 'load', on_frame_loaded, false

    observer.observe document,
      childList: true
      subtree: true
    

class Oven
  constructor: ->
    @api =
      lang: {}
      manager: this
    @snippets = {}
    @status = {}
    @storage = window.localStorage
    @sync_interval = 0
    @version = 0
    @updateUrl = (@storage['ExtOvenUpdateUrl'] ?
        'https://github.com/quietlynn/oven/raw/master/oven.user.js')

  load: (callback) ->
    snip = @storage['ExtOvenSnippets']
    if not snip
      @init =>
        @load(callback)
      return false
    if @version > @storage['ExtOvenVersion']
      @update =>
        @load(callback)
    for name in JSON.parse @storage['ExtOvenSnippets']
      data = JSON.parse @storage['ExtOvenSnippet_' + name]
      @snippets[name] = data
    callback() if callback
    return true

  version_compare: (v1, v2) ->
    sv1 = v1.split "."
    sv2 = v2.split "."
    for i in [0..(sv1.length - 1)]
      return 1 if sv2.length - 1 < i
      i1 = parseInt sv1[i]
      i2 = parseInt sv2[i]
      return 1 if i1 > i2
      return -1 if i1 < i2

    return 0 if sv1.length == sv2.length
    return -1

  init: (callback) ->
    @storage['ExtOvenUpdateDate'] = new Date()
    @storage['ExtOvenVersion'] = @version
    @snippets =
      'oven.lang.coffee':
        deps: ['oven.lang.iced']
        code: 'oven.lang.coffee = oven.lang.iced;'
        url: null
        builtin: true
      'oven.lang.iced':
        deps: ['io.github.maxtaco.iced.compiler']
        code: '''
          oven.lang.iced = function (source) {
            return CoffeeScript.compile(source, {runtime: 'window'});
          }
        '''
        url: null
        builtin: true

    await @install(
      'io.github.maxtaco.iced.compiler',
      'https://github.com/maxtaco/coffee-script/raw/gh-pages/extras/coffee-script.js',
      defer(data), 'bypass_cache')
    if data
      await @install(
        'oven.ui',
        'https://github.com/quietlynn/oven-gplus/raw/master/oven_ui.oven.iced',
        defer(data), 'bypass_cache')

      if data
        for name of @snippets
          @snippets[name].builtin = true
        @save()
        callback() if callback

  panic: ->
    for name of @storage
      delete @storage[name] if name.indexOf('ExtOven') == 0

  update: (callback) ->
    # Update storage format...
    @storage['ExtOvenVersion'] = @version
    callback()

  save: ->
    console.log 'Oven::save'
    names = []
    for name, data of @snippets
      @storage['ExtOvenSnippet_' + name] = JSON.stringify data
      names.push name
    @storage['ExtOvenSnippets'] = JSON.stringify names

  xhr: (url, callback, bypass_cache=false) ->
    if bypass_cache
      url += (if (/\?/).test(url) then "&" else "?") + (new Date()).getTime()

    onreadystatechange = (xhr) ->
      xhr = xhr.target if xhr.target
      if xhr.readyState == 4
        if callback
          if xhr.status == 200
            callback xhr.responseText
          else
            console.log "OVEN::xhr ERROR #{xhr.status}: #{xhr.responseText}"
            callback null

    if GM_xmlhttpRequest?
      return GM_xmlhttpRequest(
        method: 'GET'
        url: url
        onreadystatechange: onreadystatechange
      )
    else
      xhr =
        if window.XMLHttpRequest
          new XMLHttpRequest
        else if window.ActiveXObject
          try
            new ActiveXObject 'Msxml2.XMLHTTP'
          catch _
            try
              new ActiveXObject 'Microsoft.XMLHTTP'
            catch _
              null

      return null if not xhr

      xhr.onreadystatechange = onreadystatechange
      xhr.open 'GET', url, true
      xhr.send()
      return xhr

  grab: (name, url, callback, bypass_cache=false) ->
    await @xhr url, defer(code), bypass_cache
    if not code?
      callback(null) if callback
      return
    data = @parse name, url, code

    callback data if callback

  install: (name, url, callback, bypass_cache=false) ->
    await @grab name, url, defer(data), bypass_cache
    if data
      data.name = name if name
      if data.missing?
        await @install_all data.missing, defer(), bypass_cache
        delete data.missing
      @add data.name, data
      console.log 'Oven::install ' + data.name
      callback data if callback
  
  install_all: (deps, callback, bypass_cache=false) ->
    await
      for dep_name, dep_url of deps
        @install dep_name, dep_url, defer(), bypass_cache
    callback() if callback

  parse: (name, url, code) ->
    data = {}
    data.deps = []
    data.opts = []
    reg = /(?:\n|^)\s*OVEN::(\w+)\s+(.*)/g
    while result = reg.exec(code)
      [_, field, value] = result
      if field == 'require'
        [dep, dep_url] = value.split /\s+/
        data.deps.push dep
        if not @has(dep)
          data.missing ?= {}
          data.missing[dep] = dep_url
      else if field == 'optional'
        [dep, dep_url] = value.split /\s+/
        data.opts.push dep
      else if ['deps', 'opts', 'builtin', 'disabled'].indexOf(field) < 0
        data[field] = value
    
    data.url = url
    data.last_update = new Date
    data.version ?= 0
    data.name ?= name ? url
    data.display ?= data.name

    if data.lang
      @run 'oven.lang.' + data.lang
      try
        data.code = oven.api.lang[data.lang](code)
      catch ex
        console.log "Error compiling #{data.name} with #{data.lang}:"
        console.log ex.toString()
    else
      data.code = code

    return data
    
  sync: (callback, bypass_cache=false) ->
    console.log 'Oven::sync'
    now = new Date()
    await
      if now - new Date(@storage['ExtOvenUpdateDate']) > @sync_interval
        if @updateUrl
          ((autocb) =>
            await @xhr @updateUrl, defer(code),
              bypass_cache or not @storage['ExtOvenCode']
            if code?
              @storage['ExtOvenCode'] = code
              @storage['ExtOvenUpdateDate'] = now
          )(defer())
      for name, data of @snippets
        if data.url != null and not @snippets[name].disabled
          if now - new Date(data.last_update) > @sync_interval
            ((autocb, name, builtin) =>
              await @install name, data.url, defer(), bypass_cache
              @snippets[name].builtin = builtin
            )(defer(), name, data.builtin)
          else
            @snippets[name].last_update = now
    @save()
    callback() if callback

  cook: ->
    # Run language handlers first.
    for name of @snippets
      if name.indexOf 'oven.lang.' == 0
        @run name
    for name of @snippets
      @run name

  run: (name) ->
    if @status[name] != 'loaded' and not @snippets[name].disabled
      data = @snippets[name]
      for dep in data.deps
        @run dep
      if data.opts
        for opt in data.opts
          @run opt if @has(opt)
      console.log 'Oven::run ' + name
      @execute @snippets[name].code, name
      @status[name] = 'loaded'

  execute: (code, name='OVEN.execute') ->
    fn = eval """
    //@ sourceURL=#{name}.oven.js
    (function (oven) { try {
      
    #{code}
    
    } catch (ex) { console.log(ex.toString()); } })
    """
    fn(@api)

  has: (name) -> @snippets[name]?

  add: (name, data) ->
    @snippets[name] = data
    data.last_update = new Date()

  remove: (name) ->
    delete @snippets[name]
    snips = []
    for snip, data of @snippets
      if data.deps.indexOf(name) >= 0
        snips.push snip

    for snip in snips
      @remove snip

  enable: (name) ->
    data = @snippets[name]
    for dep in data.deps
      @enable dep
    if data.disabled
      console.log 'OVEN::enable ' + name
      delete data.disabled

  disable: (name) ->
    console.log 'OVEN::disable ' + name
    @snippets[name].disabled = true
    for snip, data of @snippets
      if data.deps.indexOf(name) >= 0
        @disable snip


oven = new Oven

window.ExtOvenManager = oven

await
  d = defer()
  onready = ->
    if document.querySelector('base')?.href.match(/^https:\/\/plus\.google\.com(\/u\/\d+)?\/?/)
      d()
  if document.readyState != 'loading'
    onready()
  else
    document.addEventListener 'DOMContentLoaded', onready
  oven.load defer()
oven.cook()
if window.self == window.top
  window.addEventListener 'load', ->
    oven.sync()
