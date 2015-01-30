var Feed = (function() {

  const GROUP_TYPE = 1

  const RELOAD = 1
  const RESET = 2
  const ENTRY_NEW = 3
  const ENTRY_INIT = 4
  const ENTRY_MORE = 5
  const HIDE = 6
  const SHOW = 7
  const ENTRY = 8

  const AUTHENTICATED = 100
  const AUTHENTICATION_REQUIRED = 101
  const AUTHENTICATION_FAILED = 102
  const LOGGED_OUT = 103

  /** @type {Feed} */
  var localCache = {}

  /** @type {Object} */
  var globalOptions = {
    feedId: '',
    outputContainerId: 'defaultContainerId',
    defaultElementLayout: '',
    defaultElementCount: 0
  };

  /** @type {Object} */
  var globalCredential = {
    username: null,
    token: null,
    method: 'basic'
  };

  function Feed(id, options, channel) {

    /** @type {String} */
    this.id = id;

    /** @type {Channel} */
    this.channel = channel;

    /** @type {Array} */
    this.entryList = [];

    /** @type {Object} */
    if (this.channel.options.transport == 'ws') {
      if (this.channel._socket == undefined) {
        this.socket = this.channel.getWebSocketConnection();
      } else {
        this.socket = this.channel._socket;
      }
    } else if (this.channel.options.transport == 'lp') {
      this.socket = this.channel.getLongPoolingConnection();
    }

    /** @type {Object} */
    this.options = _extend(globalOptions, options);

    /** @type {Function} */
    this.stylerFunction = options.stylerFunction || this._stylerFunction;

    /** @type {DOM} */
    this.outputContainer = document.getElementById(this.options.outputContainerId);

    this.bindChannel(this.channel);

    /** @type {Object} */
    this._handlers = {};
  }

  Feed.prototype.on = function(type, callback) {
    switch (name) {
      case 'reload':
        type = RELOAD
        break;
      case 'reset':
        type = RESET
        break;
      case 'entry':
        type = ENTRY_NEW
        break;
      case 'entry-init':
        type = ENTRY_INIT
        break;
      case 'entry-more':
        type = ENTRY_MORE
        break;
      case 'hide':
        type = HIDE
        break;
      case 'show':
        type = SHOW
        break;
      case 'entry':
        type = ENTRY
        break;
      default:
        return false;
        break;
    }
    if (this._handlers[type] == undefined) {
      this._handlers[type] = []
    }
    this._handlers[type].push(callback);
    return true;
  }

  Feed.prototype.onData = function(feedEvent) {
    switch (feedEvent.type) {
      case RELOAD:
        this.onReload(feedEvent.ts)
        break;
      case RESET:
        this.onReset(feedEvent.ts)
        break;
      case ENTRY_NEW:
        this.onEntryNew(feedEvent.ts, feedEvent.content)
        break;
      case ENTRY_INIT:
        this.onEntryInit(feedEvent.ts, feedEvent.content)
        break;
      case ENTRY_MORE:
        this.onEntryMore(feedEvent.ts, feedEvent.content)
        break;
      case HIDE:
        this.onHide(feedEvent.ts)
        break;
      case SHOW:
        this.onShow(feedEvent.ts)
        break;
      case ENTRY:
        this.onEntry(feedEvent.ts, feedEvent.content)
        break;
    }
  }

  // Events callbacks

  Feed.prototype.onReload = function(timestamp) {
    for (var i in this._handlers[RELOAD]) {
      this._handlers[RELOAD][i].call(this, chid, timestamp);
    }
  }

  Feed.prototype.onReset = function(timestamp) {
    for (var i in this._handlers[RESET]) {
      this._handlers[RESET][i].call(this, chid, timestamp);
    }
  }

  Feed.prototype.onEntryNew = function(timestamp, data) {
    entry = new Entry(data, {styler: this.stylerFunction});

    this.addEntry(entry)

    for (var i in this._handlers[ENTRY_NEW]) {
      this._handlers[ENTRY_NEW][i].call(this, timestamp, entry);
    }
  }

  Feed.prototype.onEntryInit = function(timestamp, data) {
    entries = JSON.parse(data);

    for (var i in this._handlers[ENTRY_INIT]) {
      this._handlers[ENTRY_INIT][i].call(this, timestamp, entries);
    }
  }

  Feed.prototype.onEntryMore = function(timestamp, data) {
    entries = JSON.parse(data);

    for (var i in this._handlers[ENTRY_MORE]) {
      this._handlers[ENTRY_MORE][i].call(this, timestamp, entries);
    }
  }

  Feed.prototype.onHide = function(timestamp) {
    for (var i in this._handlers[HIDE]) {
      this._handlers[HIDE][i].call(this, timestamp);
    }
  }

  Feed.prototype.onShow = function(timestamp) {
    for (var i in this._handlers[SHOW]) {
      this._handlers[SHOW][i].call(this, timestamp);
    }
  }

  Feed.prototype.onEntry = function(timestamp, content) {
    entryEvent = new EntryEvent(content);

    for (var i in this._handlers[ENTRY]) {
      this._handlers[ENTRY][i].call(this, timestamp, entryEvent);
    }
  }

  // Entries management

  Feed.prototype.addEntry = function(entry) {
    entry.setParent(this);
    this.entryList.push(entry);

    this.outputContainer.innerHTML = '<div id="' + entry.getViewId() + '"></div>' + this.outputContainer.innerHTML;

    entry.render();
  }

  Feed.prototype.deleteEntry = function(id) {
  }

  Feed.prototype.updateEntry = function(id, data) {
  }

  Feed.prototype.findEntry = function(id) {
  }

  // UI

  Feed.prototype.render = function(id) {
    for (var i in this.entryList) {
      this.entryList[i].render();
    }
  }

  // Handlers

  Feed.prototype.bindChannel = function(channel) {
    var self = this;
    channel.on('message', function(chid, ts, systemEvent) {
      if (systemEvent.type == GROUP_TYPE) {
        feedEvent = new FeedEvent(systemEvent.content);
        if (feedEvent.id == self.id || feedEvent.id == '*') {
          self.onData(feedEvent);
        }
      }
    });
  }

  // Stylers

  Feed.prototype._stylerFunction = function(data) {
    return JSON.stringify(data);
  }

  // Helpers

  var _extend = function(a, b) {
    var c = {}, prop;
    for (prop in a) {
      if (a.hasOwnProperty(prop)) {
        c[prop] = a[prop];
      }
    }
    for (prop in b) {
      if (b.hasOwnProperty(prop)) {
        c[prop] = b[prop];
      }
    }
    return c;
  }

  return Feed;

})();
