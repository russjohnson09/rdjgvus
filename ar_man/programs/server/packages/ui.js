(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Deps = Package.deps.Deps;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var OrderedDict = Package['ordered-dict'].OrderedDict;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var ObserveSequence = Package['observe-sequence'].ObserveSequence;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var UI, Handlebars, reportUIException, _extend, Component, findComponentWithProp, findComponentWithHelper, getComponentData, updateTemplateInstance, currentTemplateInstance, AttributeHandler, makeAttributeHandler, ElementAttributesUpdater, currentComponent;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/exceptions.js                                                                                  //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
                                                                                                              // 1
var debugFunc;                                                                                                // 2
                                                                                                              // 3
// Meteor UI calls into user code in many places, and it's nice to catch exceptions                           // 4
// propagated from user code immediately so that the whole system doesn't just                                // 5
// break.  Catching exceptions is easy; reporting them is hard.  This helper                                  // 6
// reports exceptions.                                                                                        // 7
//                                                                                                            // 8
// Usage:                                                                                                     // 9
//                                                                                                            // 10
// ```                                                                                                        // 11
// try {                                                                                                      // 12
//   // ... someStuff ...                                                                                     // 13
// } catch (e) {                                                                                              // 14
//   reportUIException(e);                                                                                    // 15
// }                                                                                                          // 16
// ```                                                                                                        // 17
//                                                                                                            // 18
// An optional second argument overrides the default message.                                                 // 19
                                                                                                              // 20
reportUIException = function (e, msg) {                                                                       // 21
  if (! debugFunc)                                                                                            // 22
    // adapted from Deps                                                                                      // 23
    debugFunc = function () {                                                                                 // 24
      return (typeof Meteor !== "undefined" ? Meteor._debug :                                                 // 25
              ((typeof console !== "undefined") && console.log ? console.log :                                // 26
               function () {}));                                                                              // 27
    };                                                                                                        // 28
                                                                                                              // 29
  // In Chrome, `e.stack` is a multiline string that starts with the message                                  // 30
  // and contains a stack trace.  Furthermore, `console.log` makes it clickable.                              // 31
  // `console.log` supplies the space between the two arguments.                                              // 32
  debugFunc()(msg || 'Exception in Meteor UI:', e.stack || e.message);                                        // 33
};                                                                                                            // 34
                                                                                                              // 35
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/base.js                                                                                        //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
UI = {};                                                                                                      // 1
                                                                                                              // 2
// A very basic operation like Underscore's `_.extend` that                                                   // 3
// copies `src`'s own, enumerable properties onto `tgt` and                                                   // 4
// returns `tgt`.                                                                                             // 5
_extend = function (tgt, src) {                                                                               // 6
  for (var k in src)                                                                                          // 7
    if (src.hasOwnProperty(k))                                                                                // 8
      tgt[k] = src[k];                                                                                        // 9
  return tgt;                                                                                                 // 10
};                                                                                                            // 11
                                                                                                              // 12
// Defines a single non-enumerable, read-only property                                                        // 13
// on `tgt`.                                                                                                  // 14
// It won't be non-enumerable in IE 8, so its                                                                 // 15
// non-enumerability can't be relied on for logic                                                             // 16
// purposes, it just makes things prettier in                                                                 // 17
// the dev console.                                                                                           // 18
var _defineNonEnum = function (tgt, name, value) {                                                            // 19
  try {                                                                                                       // 20
    Object.defineProperty(tgt, name, {value: value});                                                         // 21
  } catch (e) {                                                                                               // 22
    // IE < 9                                                                                                 // 23
    tgt[name] = value;                                                                                        // 24
  }                                                                                                           // 25
  return tgt;                                                                                                 // 26
};                                                                                                            // 27
                                                                                                              // 28
// Named function (like `function Component() {}` below) make                                                 // 29
// inspection in debuggers more descriptive. In IE, this sets the                                             // 30
// value of the `Component` var in the function scope in which it's                                           // 31
// executed. We already have a top-level `Component` var so we create                                         // 32
// a new function scope to not write it over in IE.                                                           // 33
(function () {                                                                                                // 34
                                                                                                              // 35
  // Components and Component kinds are the same thing, just                                                  // 36
  // objects; there are no constructor functions, no `new`,                                                   // 37
  // and no `instanceof`.  A Component object is like a class,                                                // 38
  // until it is inited, at which point it becomes more like                                                  // 39
  // an instance.                                                                                             // 40
  //                                                                                                          // 41
  // `y = x.extend({ ...new props })` creates a new Component                                                 // 42
  // `y` with `x` as its prototype, plus additional properties                                                // 43
  // on `y` itself.  `extend` is used both to subclass and to                                                 // 44
  // create instances (and the hope is we can gloss over the                                                  // 45
  // difference in the docs).                                                                                 // 46
  UI.Component = (function (constr) {                                                                         // 47
                                                                                                              // 48
    // Make sure the "class name" that Chrome infers for                                                      // 49
    // UI.Component is "Component", and that                                                                  // 50
    // `new UI.Component._constr` (which is what `extend`                                                     // 51
    // does) also produces objects whose inferred class                                                       // 52
    // name is "Component".  Chrome's name inference rules                                                    // 53
    // are a little mysterious, but a function name in                                                        // 54
    // the source code (as in `function Component() {}`)                                                      // 55
    // seems to be reliable and high precedence.                                                              // 56
    var C = new constr;                                                                                       // 57
    _defineNonEnum(C, '_constr', constr);                                                                     // 58
    _defineNonEnum(C, '_super', null);                                                                        // 59
    return C;                                                                                                 // 60
  })(function Component() {});                                                                                // 61
})();                                                                                                         // 62
                                                                                                              // 63
_extend(UI, {                                                                                                 // 64
  nextGuid: 2, // Component is 1!                                                                             // 65
                                                                                                              // 66
  isComponent: function (obj) {                                                                               // 67
    return obj && UI.isKindOf(obj, UI.Component);                                                             // 68
  },                                                                                                          // 69
  // `UI.isKindOf(a, b)` where `a` and `b` are Components                                                     // 70
  // (or kinds) asks if `a` is or descends from                                                               // 71
  // (transitively extends) `b`.                                                                              // 72
  isKindOf: function (a, b) {                                                                                 // 73
    while (a) {                                                                                               // 74
      if (a === b)                                                                                            // 75
        return true;                                                                                          // 76
      a = a._super;                                                                                           // 77
    }                                                                                                         // 78
    return false;                                                                                             // 79
  },                                                                                                          // 80
  // use these to produce error messages for developers                                                       // 81
  // (though throwing a more specific error message is                                                        // 82
  // even better)                                                                                             // 83
  _requireNotDestroyed: function (c) {                                                                        // 84
    if (c.isDestroyed)                                                                                        // 85
      throw new Error("Component has been destroyed; can't perform this operation");                          // 86
  },                                                                                                          // 87
  _requireInited: function (c) {                                                                              // 88
    if (! c.isInited)                                                                                         // 89
      throw new Error("Component must be inited to perform this operation");                                  // 90
  },                                                                                                          // 91
  _requireDom: function (c) {                                                                                 // 92
    if (! c.dom)                                                                                              // 93
      throw new Error("Component must be built into DOM to perform this operation");                          // 94
  }                                                                                                           // 95
});                                                                                                           // 96
                                                                                                              // 97
Component = UI.Component;                                                                                     // 98
                                                                                                              // 99
_extend(UI.Component, {                                                                                       // 100
  kind: "Component",                                                                                          // 101
  guid: "1",                                                                                                  // 102
  dom: null,                                                                                                  // 103
  // Has this Component ever been inited?                                                                     // 104
  isInited: false,                                                                                            // 105
  // Has this Component been destroyed?  Only inited Components                                               // 106
  // can be destroyed.                                                                                        // 107
  isDestroyed: false,                                                                                         // 108
  // Component that created this component (typically also                                                    // 109
  // the DOM containment parent).                                                                             // 110
  // No child pointers (except in `dom`).                                                                     // 111
  parent: null,                                                                                               // 112
                                                                                                              // 113
  // create a new subkind or instance whose proto pointer                                                     // 114
  // points to this, with additional props set.                                                               // 115
  extend: function (props) {                                                                                  // 116
    // this function should never cause `props` to be                                                         // 117
    // mutated in case people want to reuse `props` objects                                                   // 118
    // in a mixin-like way.                                                                                   // 119
                                                                                                              // 120
    if (this.isInited)                                                                                        // 121
      // Disallow extending inited Components so that                                                         // 122
      // inited Components don't inherit instance-specific                                                    // 123
      // properties from other inited Components, just                                                        // 124
      // default values.                                                                                      // 125
      throw new Error("Can't extend an inited Component");                                                    // 126
                                                                                                              // 127
    var constr;                                                                                               // 128
    var constrMade = false;                                                                                   // 129
    if (props && props.kind) {                                                                                // 130
      // If `kind` is different from super, set a constructor.                                                // 131
      // We used to set the function name here so that components                                             // 132
      // printed better in the console, but we took it out because                                            // 133
      // of CSP (and in hopes that Chrome finally adds proper                                                 // 134
      // displayName support).                                                                                // 135
      constr = function () {};                                                                                // 136
      constrMade = true;                                                                                      // 137
    } else {                                                                                                  // 138
      constr = this._constr;                                                                                  // 139
    }                                                                                                         // 140
                                                                                                              // 141
    // We don't know where we're getting `constr` from --                                                     // 142
    // it might be from some supertype -- just that it has                                                    // 143
    // the right function name.  So set the `prototype`                                                       // 144
    // property each time we use it as a constructor.                                                         // 145
    constr.prototype = this;                                                                                  // 146
                                                                                                              // 147
    var c = new constr;                                                                                       // 148
    if (constrMade)                                                                                           // 149
      c._constr = constr;                                                                                     // 150
                                                                                                              // 151
    if (props)                                                                                                // 152
      _extend(c, props);                                                                                      // 153
                                                                                                              // 154
    // for efficient Component instantiations, we assign                                                      // 155
    // as few things as possible here.                                                                        // 156
    _defineNonEnum(c, '_super', this);                                                                        // 157
    c.guid = String(UI.nextGuid++);                                                                           // 158
                                                                                                              // 159
    return c;                                                                                                 // 160
  }                                                                                                           // 161
});                                                                                                           // 162
                                                                                                              // 163
//callChainedCallback = function (comp, propName, orig) {                                                     // 164
  // Call `comp.foo`, `comp._super.foo`,                                                                      // 165
  // `comp._super._super.foo`, and so on, but in reverse                                                      // 166
  // order, and only if `foo` is an "own property" in each                                                    // 167
  // case.  Furthermore, the passed value of `this` should                                                    // 168
  // remain `comp` for all calls (which is achieved by                                                        // 169
  // filling in `orig` when recursing).                                                                       // 170
//  if (comp._super)                                                                                          // 171
//    callChainedCallback(comp._super, propName, orig || comp);                                               // 172
//                                                                                                            // 173
//  if (comp.hasOwnProperty(propName))                                                                        // 174
//    comp[propName].call(orig || comp);                                                                      // 175
//};                                                                                                          // 176
                                                                                                              // 177
                                                                                                              // 178
// Returns 0 if the nodes are the same or either one contains the other;                                      // 179
// otherwise, -1 if a comes before b, or else 1 if b comes before a in                                        // 180
// document order.                                                                                            // 181
// Requires: `a` and `b` are element nodes in the same document tree.                                         // 182
var compareElementIndex = function (a, b) {                                                                   // 183
  // See http://ejohn.org/blog/comparing-document-position/                                                   // 184
  if (a === b)                                                                                                // 185
    return 0;                                                                                                 // 186
  if (a.compareDocumentPosition) {                                                                            // 187
    var n = a.compareDocumentPosition(b);                                                                     // 188
    return ((n & 0x18) ? 0 : ((n & 0x4) ? -1 : 1));                                                           // 189
  } else {                                                                                                    // 190
    // Only old IE is known to not have compareDocumentPosition (though Safari                                // 191
    // originally lacked it).  Thankfully, IE gives us a way of comparing elements                            // 192
    // via the "sourceIndex" property.                                                                        // 193
    if (a.contains(b) || b.contains(a))                                                                       // 194
      return 0;                                                                                               // 195
    return (a.sourceIndex < b.sourceIndex ? -1 : 1);                                                          // 196
  }                                                                                                           // 197
};                                                                                                            // 198
                                                                                                              // 199
findComponentWithProp = function (id, comp) {                                                                 // 200
  while (comp) {                                                                                              // 201
    if (typeof comp[id] !== 'undefined')                                                                      // 202
      return comp;                                                                                            // 203
    comp = comp.parent;                                                                                       // 204
  }                                                                                                           // 205
  return null;                                                                                                // 206
};                                                                                                            // 207
                                                                                                              // 208
// Look up the component's chain of parents until we find one with                                            // 209
// `__helperHost` set (a component that can have helpers defined on it,                                       // 210
// i.e. a template).                                                                                          // 211
var findHelperHostComponent = function (comp) {                                                               // 212
  while (comp) {                                                                                              // 213
    if (comp.__helperHost) {                                                                                  // 214
      return comp;                                                                                            // 215
    }                                                                                                         // 216
    comp = comp.parent;                                                                                       // 217
  }                                                                                                           // 218
  return null;                                                                                                // 219
};                                                                                                            // 220
                                                                                                              // 221
findComponentWithHelper = function (id, comp) {                                                               // 222
  while (comp) {                                                                                              // 223
    if (comp.__helperHost) {                                                                                  // 224
      if (typeof comp[id] !== 'undefined')                                                                    // 225
        return comp;                                                                                          // 226
      else                                                                                                    // 227
        return null;                                                                                          // 228
    }                                                                                                         // 229
    comp = comp.parent;                                                                                       // 230
  }                                                                                                           // 231
  return null;                                                                                                // 232
};                                                                                                            // 233
                                                                                                              // 234
getComponentData = function (comp) {                                                                          // 235
  comp = findComponentWithProp('data', comp);                                                                 // 236
  return (comp ?                                                                                              // 237
          (typeof comp.data === 'function' ?                                                                  // 238
           comp.data() : comp.data) :                                                                         // 239
          null);                                                                                              // 240
};                                                                                                            // 241
                                                                                                              // 242
updateTemplateInstance = function (comp) {                                                                    // 243
  // Populate `comp.templateInstance.{firstNode,lastNode,data}`                                               // 244
  // on demand.                                                                                               // 245
  var tmpl = comp.templateInstance;                                                                           // 246
  tmpl.data = getComponentData(comp);                                                                         // 247
                                                                                                              // 248
  if (comp.dom && !comp.isDestroyed) {                                                                        // 249
    tmpl.firstNode = comp.dom.startNode().nextSibling;                                                        // 250
    tmpl.lastNode = comp.dom.endNode().previousSibling;                                                       // 251
    // Catch the case where the DomRange is empty and we'd                                                    // 252
    // otherwise pass the out-of-order nodes (end, start)                                                     // 253
    // as (firstNode, lastNode).                                                                              // 254
    if (tmpl.lastNode && tmpl.lastNode.nextSibling === tmpl.firstNode)                                        // 255
      tmpl.lastNode = tmpl.firstNode;                                                                         // 256
  } else {                                                                                                    // 257
    // on 'created' or 'destroyed' callbacks we don't have a DomRange                                         // 258
    tmpl.firstNode = null;                                                                                    // 259
    tmpl.lastNode = null;                                                                                     // 260
  }                                                                                                           // 261
};                                                                                                            // 262
                                                                                                              // 263
_extend(UI.Component, {                                                                                       // 264
  // We implement the old APIs here, including how data is passed                                             // 265
  // to helpers in `this`.                                                                                    // 266
  helpers: function (dict) {                                                                                  // 267
    _extend(this, dict);                                                                                      // 268
  },                                                                                                          // 269
  events: function (dict) {                                                                                   // 270
    var events;                                                                                               // 271
    if (this.hasOwnProperty('_events'))                                                                       // 272
      events = this._events;                                                                                  // 273
    else                                                                                                      // 274
      events = (this._events = []);                                                                           // 275
                                                                                                              // 276
    _.each(dict, function (handler, spec) {                                                                   // 277
      var clauses = spec.split(/,\s+/);                                                                       // 278
      // iterate over clauses of spec, e.g. ['click .foo', 'click .bar']                                      // 279
      _.each(clauses, function (clause) {                                                                     // 280
        var parts = clause.split(/\s+/);                                                                      // 281
        if (parts.length === 0)                                                                               // 282
          return;                                                                                             // 283
                                                                                                              // 284
        var newEvents = parts.shift();                                                                        // 285
        var selector = parts.join(' ');                                                                       // 286
        events.push({events: newEvents,                                                                       // 287
                     selector: selector,                                                                      // 288
                     handler: handler});                                                                      // 289
      });                                                                                                     // 290
    });                                                                                                       // 291
  }                                                                                                           // 292
});                                                                                                           // 293
                                                                                                              // 294
// XXX we don't really want this to be a user-visible callback,                                               // 295
// it's just a particular signal we need from DomRange.                                                       // 296
UI.Component.notifyParented = function () {                                                                   // 297
  var self = this;                                                                                            // 298
  for (var comp = self; comp; comp = comp._super) {                                                           // 299
    var events = (comp.hasOwnProperty('_events') && comp._events) || null;                                    // 300
    if ((! events) && comp.hasOwnProperty('events') &&                                                        // 301
        typeof comp.events === 'object') {                                                                    // 302
      // Provide limited back-compat support for `.events = {...}`                                            // 303
      // syntax.  Pass `comp.events` to the original `.events(...)`                                           // 304
      // function.  This code must run only once per component, in                                            // 305
      // order to not bind the handlers more than once, which is                                              // 306
      // ensured by the fact that we only do this when `comp._events`                                         // 307
      // is falsy, and we cause it to be set now.                                                             // 308
      UI.Component.events.call(comp, comp.events);                                                            // 309
      events = comp._events;                                                                                  // 310
    }                                                                                                         // 311
    _.each(events, function (esh) { // {events, selector, handler}                                            // 312
      // wrap the handler here, per instance of the template that                                             // 313
      // declares the event map, so we can pass the instance to                                               // 314
      // the event handler.                                                                                   // 315
      var wrappedHandler = function (event) {                                                                 // 316
        var comp = UI.DomRange.getContainingComponent(event.currentTarget);                                   // 317
        var data = comp && getComponentData(comp);                                                            // 318
        var args = _.toArray(arguments);                                                                      // 319
        updateTemplateInstance(self);                                                                         // 320
        return Deps.nonreactive(function () {                                                                 // 321
          // put self.templateInstance as the second argument                                                 // 322
          args.splice(1, 0, self.templateInstance);                                                           // 323
          // Don't want to be in a deps context, even if we were somehow                                      // 324
          // triggered synchronously in an existing deps context                                              // 325
          // (the `blur` event can do this).                                                                  // 326
          // XXX we should probably do what Spark did and block all                                           // 327
          // event handling during our DOM manip.  Many apps had weird                                        // 328
          // unanticipated bugs until we did that.                                                            // 329
          return esh.handler.apply(data === null ? {} : data, args);                                          // 330
        });                                                                                                   // 331
      };                                                                                                      // 332
                                                                                                              // 333
      self.dom.on(esh.events, esh.selector, wrappedHandler);                                                  // 334
    });                                                                                                       // 335
  }                                                                                                           // 336
                                                                                                              // 337
  if (self.rendered) {                                                                                        // 338
    // Defer rendered callback until flush time.                                                              // 339
    Deps.afterFlush(function () {                                                                             // 340
      if (! self.isDestroyed) {                                                                               // 341
        updateTemplateInstance(self);                                                                         // 342
        self.rendered.call(self.templateInstance);                                                            // 343
      }                                                                                                       // 344
    });                                                                                                       // 345
  }                                                                                                           // 346
};                                                                                                            // 347
                                                                                                              // 348
// past compat                                                                                                // 349
UI.Component.preserve = function () {                                                                         // 350
  Meteor._debug("The 'preserve' method on templates is now unnecessary and deprecated.");                     // 351
};                                                                                                            // 352
                                                                                                              // 353
// Gets the data context of the enclosing component that rendered a                                           // 354
// given element                                                                                              // 355
UI.getElementData = function (el) {                                                                           // 356
  var comp = UI.DomRange.getContainingComponent(el);                                                          // 357
  return comp && getComponentData(comp);                                                                      // 358
};                                                                                                            // 359
                                                                                                              // 360
var jsUrlsAllowed = false;                                                                                    // 361
UI._allowJavascriptUrls = function () {                                                                       // 362
  jsUrlsAllowed = true;                                                                                       // 363
};                                                                                                            // 364
UI._javascriptUrlsAllowed = function () {                                                                     // 365
  return jsUrlsAllowed;                                                                                       // 366
};                                                                                                            // 367
                                                                                                              // 368
UI._templateInstance = function () {                                                                          // 369
  var currentComp = currentComponent.get();                                                                   // 370
  if (! currentComp) {                                                                                        // 371
    throw new Error("You can only call UI._templateInstance() from within" +                                  // 372
                    " a helper function.");                                                                   // 373
  }                                                                                                           // 374
                                                                                                              // 375
  // Find the enclosing component that is a template. (`currentComp`                                          // 376
  // could be, for example, an #if or #with, and we want the component                                        // 377
  // that is the surrounding template.)                                                                       // 378
  var template = findHelperHostComponent(currentComp);                                                        // 379
  if (! template) {                                                                                           // 380
    throw new Error("Current component is not inside a template?");                                           // 381
  }                                                                                                           // 382
                                                                                                              // 383
  // Lazily update the template instance for this helper, and do it only                                      // 384
  // once.                                                                                                    // 385
  if (! currentTemplateInstance) {                                                                            // 386
    updateTemplateInstance(template);                                                                         // 387
    currentTemplateInstance = template.templateInstance;                                                      // 388
  }                                                                                                           // 389
  return currentTemplateInstance;                                                                             // 390
};                                                                                                            // 391
                                                                                                              // 392
// Returns the data context of the parent which is 'numLevels' above the                                      // 393
// component. Same behavior as {{../..}} in a template, with 'numLevels'                                      // 394
// occurrences of '..'.                                                                                       // 395
UI._parentData = function (numLevels) {                                                                       // 396
  var component = currentComponent.get();                                                                     // 397
  while (component && numLevels >= 0) {                                                                       // 398
    // Decrement numLevels every time we find a new data context. Break                                       // 399
    // once we have reached numLevels < 0.                                                                    // 400
    if (component.data !== undefined && --numLevels < 0) {                                                    // 401
      break;                                                                                                  // 402
    }                                                                                                         // 403
    component = component.parent;                                                                             // 404
  }                                                                                                           // 405
                                                                                                              // 406
  if (! component) {                                                                                          // 407
    return null;                                                                                              // 408
  }                                                                                                           // 409
                                                                                                              // 410
  return getComponentData(component);                                                                         // 411
};                                                                                                            // 412
                                                                                                              // 413
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/attrs.js                                                                                       //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
                                                                                                              // 1
// An AttributeHandler object is responsible for updating a particular attribute                              // 2
// of a particular element.  AttributeHandler subclasses implement                                            // 3
// browser-specific logic for dealing with particular attributes across                                       // 4
// different browsers.                                                                                        // 5
//                                                                                                            // 6
// To define a new type of AttributeHandler, use                                                              // 7
// `var FooHandler = AttributeHandler.extend({ update: function ... })`                                       // 8
// where the `update` function takes arguments `(element, oldValue, value)`.                                  // 9
// The `element` argument is always the same between calls to `update` on                                     // 10
// the same instance.  `oldValue` and `value` are each either `null` or                                       // 11
// a Unicode string of the type that might be passed to the value argument                                    // 12
// of `setAttribute` (i.e. not an HTML string with character references).                                     // 13
// When an AttributeHandler is installed, an initial call to `update` is                                      // 14
// always made with `oldValue = null`.  The `update` method can access                                        // 15
// `this.name` if the AttributeHandler class is a generic one that applies                                    // 16
// to multiple attribute names.                                                                               // 17
//                                                                                                            // 18
// AttributeHandlers can store custom properties on `this`, as long as they                                   // 19
// don't use the names `element`, `name`, `value`, and `oldValue`.                                            // 20
//                                                                                                            // 21
// AttributeHandlers can't influence how attributes appear in rendered HTML,                                  // 22
// only how they are updated after materialization as DOM.                                                    // 23
                                                                                                              // 24
AttributeHandler = function (name, value) {                                                                   // 25
  this.name = name;                                                                                           // 26
  this.value = value;                                                                                         // 27
};                                                                                                            // 28
                                                                                                              // 29
AttributeHandler.prototype.update = function (element, oldValue, value) {                                     // 30
  if (value === null) {                                                                                       // 31
    if (oldValue !== null)                                                                                    // 32
      element.removeAttribute(this.name);                                                                     // 33
  } else {                                                                                                    // 34
    element.setAttribute(this.name, value);                                                                   // 35
  }                                                                                                           // 36
};                                                                                                            // 37
                                                                                                              // 38
AttributeHandler.extend = function (options) {                                                                // 39
  var curType = this;                                                                                         // 40
  var subType = function AttributeHandlerSubtype(/*arguments*/) {                                             // 41
    AttributeHandler.apply(this, arguments);                                                                  // 42
  };                                                                                                          // 43
  subType.prototype = new curType;                                                                            // 44
  subType.extend = curType.extend;                                                                            // 45
  if (options)                                                                                                // 46
    _.extend(subType.prototype, options);                                                                     // 47
  return subType;                                                                                             // 48
};                                                                                                            // 49
                                                                                                              // 50
/// Apply the diff between the attributes of "oldValue" and "value" to "element."                             // 51
//                                                                                                            // 52
// Each subclass must implement a parseValue method which takes a string                                      // 53
// as an input and returns a dict of attributes. The keys of the dict                                         // 54
// are unique identifiers (ie. css properties in the case of styles), and the                                 // 55
// values are the entire attribute which will be injected into the element.                                   // 56
//                                                                                                            // 57
// Extended below to support classes, SVG elements and styles.                                                // 58
                                                                                                              // 59
var DiffingAttributeHandler = AttributeHandler.extend({                                                       // 60
  update: function (element, oldValue, value) {                                                               // 61
    if (!this.getCurrentValue || !this.setValue || !this.parseValue)                                          // 62
      throw new Error("Missing methods in subclass of 'DiffingAttributeHandler'");                            // 63
                                                                                                              // 64
    var oldAttrsMap = oldValue ? this.parseValue(oldValue) : {};                                              // 65
    var newAttrsMap = value ? this.parseValue(value) : {};                                                    // 66
                                                                                                              // 67
    // the current attributes on the element, which we will mutate.                                           // 68
                                                                                                              // 69
    var attrString = this.getCurrentValue(element);                                                           // 70
    var attrsMap = attrString ? this.parseValue(attrString) : {};                                             // 71
                                                                                                              // 72
    _.each(_.keys(oldAttrsMap), function (t) {                                                                // 73
      if (! (t in newAttrsMap))                                                                               // 74
        delete attrsMap[t];                                                                                   // 75
    });                                                                                                       // 76
                                                                                                              // 77
    _.each(_.keys(newAttrsMap), function (t) {                                                                // 78
      attrsMap[t] = newAttrsMap[t];                                                                           // 79
    });                                                                                                       // 80
                                                                                                              // 81
    this.setValue(element, _.values(attrsMap).join(' '));                                                     // 82
  }                                                                                                           // 83
});                                                                                                           // 84
                                                                                                              // 85
var ClassHandler = DiffingAttributeHandler.extend({                                                           // 86
  // @param rawValue {String}                                                                                 // 87
  getCurrentValue: function (element) {                                                                       // 88
    return element.className;                                                                                 // 89
  },                                                                                                          // 90
  setValue: function (element, className) {                                                                   // 91
    element.className = className;                                                                            // 92
  },                                                                                                          // 93
  parseValue: function (attrString) {                                                                         // 94
    var tokens = {};                                                                                          // 95
                                                                                                              // 96
    _.each(attrString.split(' '), function(token) {                                                           // 97
      if (token)                                                                                              // 98
        tokens[token] = token;                                                                                // 99
    });                                                                                                       // 100
    return tokens;                                                                                            // 101
  }                                                                                                           // 102
});                                                                                                           // 103
                                                                                                              // 104
var SVGClassHandler = ClassHandler.extend({                                                                   // 105
  getCurrentValue: function (element) {                                                                       // 106
    return element.className.baseVal;                                                                         // 107
  },                                                                                                          // 108
  setValue: function (element, className) {                                                                   // 109
    element.setAttribute('class', className);                                                                 // 110
  }                                                                                                           // 111
});                                                                                                           // 112
                                                                                                              // 113
var StyleHandler = DiffingAttributeHandler.extend({                                                           // 114
  getCurrentValue: function (element) {                                                                       // 115
    return element.getAttribute('style');                                                                     // 116
  },                                                                                                          // 117
  setValue: function (element, style) {                                                                       // 118
    if (style === '') {                                                                                       // 119
      element.removeAttribute('style');                                                                       // 120
    } else {                                                                                                  // 121
      element.setAttribute('style', style);                                                                   // 122
    }                                                                                                         // 123
  },                                                                                                          // 124
                                                                                                              // 125
  // Parse a string to produce a map from property to attribute string.                                       // 126
  //                                                                                                          // 127
  // Example:                                                                                                 // 128
  // "color:red; foo:12px" produces a token {color: "color:red", foo:"foo:12px"}                              // 129
  parseValue: function (attrString) {                                                                         // 130
    var tokens = {};                                                                                          // 131
                                                                                                              // 132
    // Regex for parsing a css attribute declaration, taken from css-parse:                                   // 133
    // https://github.com/reworkcss/css-parse/blob/7cef3658d0bba872cde05a85339034b187cb3397/index.js#L219     // 134
    var regex = /(\*?[-#\/\*\\\w]+(?:\[[0-9a-z_-]+\])?)\s*:\s*(?:\'(?:\\\'|.)*?\'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+[;\s]*/g;
    var match = regex.exec(attrString);                                                                       // 136
    while (match) {                                                                                           // 137
      // match[0] = entire matching string                                                                    // 138
      // match[1] = css property                                                                              // 139
      // Prefix the token to prevent conflicts with existing properties.                                      // 140
                                                                                                              // 141
      // XXX No `String.trim` on Safari 4. Swap out $.trim if we want to                                      // 142
      // remove strong dep on jquery.                                                                         // 143
      tokens[' ' + match[1]] = match[0].trim ?                                                                // 144
        match[0].trim() : $.trim(match[0]);                                                                   // 145
                                                                                                              // 146
      match = regex.exec(attrString);                                                                         // 147
    }                                                                                                         // 148
                                                                                                              // 149
    return tokens;                                                                                            // 150
  }                                                                                                           // 151
});                                                                                                           // 152
                                                                                                              // 153
var BooleanHandler = AttributeHandler.extend({                                                                // 154
  update: function (element, oldValue, value) {                                                               // 155
    var name = this.name;                                                                                     // 156
    if (value == null) {                                                                                      // 157
      if (oldValue != null)                                                                                   // 158
        element[name] = false;                                                                                // 159
    } else {                                                                                                  // 160
      element[name] = true;                                                                                   // 161
    }                                                                                                         // 162
  }                                                                                                           // 163
});                                                                                                           // 164
                                                                                                              // 165
var ValueHandler = AttributeHandler.extend({                                                                  // 166
  update: function (element, oldValue, value) {                                                               // 167
    element.value = value;                                                                                    // 168
  }                                                                                                           // 169
});                                                                                                           // 170
                                                                                                              // 171
// attributes of the type 'xlink:something' should be set using                                               // 172
// the correct namespace in order to work                                                                     // 173
var XlinkHandler = AttributeHandler.extend({                                                                  // 174
  update: function(element, oldValue, value) {                                                                // 175
    var NS = 'http://www.w3.org/1999/xlink';                                                                  // 176
    if (value === null) {                                                                                     // 177
      if (oldValue !== null)                                                                                  // 178
        element.removeAttributeNS(NS, this.name);                                                             // 179
    } else {                                                                                                  // 180
      element.setAttributeNS(NS, this.name, this.value);                                                      // 181
    }                                                                                                         // 182
  }                                                                                                           // 183
});                                                                                                           // 184
                                                                                                              // 185
// cross-browser version of `instanceof SVGElement`                                                           // 186
var isSVGElement = function (elem) {                                                                          // 187
  return 'ownerSVGElement' in elem;                                                                           // 188
};                                                                                                            // 189
                                                                                                              // 190
var isUrlAttribute = function (tagName, attrName) {                                                           // 191
  // Compiled from http://www.w3.org/TR/REC-html40/index/attributes.html                                      // 192
  // and                                                                                                      // 193
  // http://www.w3.org/html/wg/drafts/html/master/index.html#attributes-1                                     // 194
  var urlAttrs = {                                                                                            // 195
    FORM: ['action'],                                                                                         // 196
    BODY: ['background'],                                                                                     // 197
    BLOCKQUOTE: ['cite'],                                                                                     // 198
    Q: ['cite'],                                                                                              // 199
    DEL: ['cite'],                                                                                            // 200
    INS: ['cite'],                                                                                            // 201
    OBJECT: ['classid', 'codebase', 'data', 'usemap'],                                                        // 202
    APPLET: ['codebase'],                                                                                     // 203
    A: ['href'],                                                                                              // 204
    AREA: ['href'],                                                                                           // 205
    LINK: ['href'],                                                                                           // 206
    BASE: ['href'],                                                                                           // 207
    IMG: ['longdesc', 'src', 'usemap'],                                                                       // 208
    FRAME: ['longdesc', 'src'],                                                                               // 209
    IFRAME: ['longdesc', 'src'],                                                                              // 210
    HEAD: ['profile'],                                                                                        // 211
    SCRIPT: ['src'],                                                                                          // 212
    INPUT: ['src', 'usemap', 'formaction'],                                                                   // 213
    BUTTON: ['formaction'],                                                                                   // 214
    BASE: ['href'],                                                                                           // 215
    MENUITEM: ['icon'],                                                                                       // 216
    HTML: ['manifest'],                                                                                       // 217
    VIDEO: ['poster']                                                                                         // 218
  };                                                                                                          // 219
                                                                                                              // 220
  if (attrName === 'itemid') {                                                                                // 221
    return true;                                                                                              // 222
  }                                                                                                           // 223
                                                                                                              // 224
  var urlAttrNames = urlAttrs[tagName] || [];                                                                 // 225
  return _.contains(urlAttrNames, attrName);                                                                  // 226
};                                                                                                            // 227
                                                                                                              // 228
// To get the protocol for a URL, we let the browser normalize it for                                         // 229
// us, by setting it as the href for an anchor tag and then reading out                                       // 230
// the 'protocol' property.                                                                                   // 231
if (Meteor.isClient) {                                                                                        // 232
  var anchorForNormalization = document.createElement('A');                                                   // 233
}                                                                                                             // 234
                                                                                                              // 235
var getUrlProtocol = function (url) {                                                                         // 236
  if (Meteor.isClient) {                                                                                      // 237
    anchorForNormalization.href = url;                                                                        // 238
    return (anchorForNormalization.protocol || "").toLowerCase();                                             // 239
  } else {                                                                                                    // 240
    throw new Error('getUrlProtocol not implemented on the server');                                          // 241
  }                                                                                                           // 242
};                                                                                                            // 243
                                                                                                              // 244
// UrlHandler is an attribute handler for all HTML attributes that take                                       // 245
// URL values. It disallows javascript: URLs, unless                                                          // 246
// UI._allowJavascriptUrls() has been called. To detect javascript:                                           // 247
// urls, we set the attribute on a dummy anchor element and then read                                         // 248
// out the 'protocol' property of the attribute.                                                              // 249
var origUpdate = AttributeHandler.prototype.update;                                                           // 250
var UrlHandler = AttributeHandler.extend({                                                                    // 251
  update: function (element, oldValue, value) {                                                               // 252
    var self = this;                                                                                          // 253
    var args = arguments;                                                                                     // 254
                                                                                                              // 255
    if (UI._javascriptUrlsAllowed()) {                                                                        // 256
      origUpdate.apply(self, args);                                                                           // 257
    } else {                                                                                                  // 258
      var isJavascriptProtocol = (getUrlProtocol(value) === "javascript:");                                   // 259
      if (isJavascriptProtocol) {                                                                             // 260
        Meteor._debug("URLs that use the 'javascript:' protocol are not " +                                   // 261
                      "allowed in URL attribute values. " +                                                   // 262
                      "Call UI._allowJavascriptUrls() " +                                                     // 263
                      "to enable them.");                                                                     // 264
        origUpdate.apply(self, [element, oldValue, null]);                                                    // 265
      } else {                                                                                                // 266
        origUpdate.apply(self, args);                                                                         // 267
      }                                                                                                       // 268
    }                                                                                                         // 269
  }                                                                                                           // 270
});                                                                                                           // 271
                                                                                                              // 272
// XXX make it possible for users to register attribute handlers!                                             // 273
makeAttributeHandler = function (elem, name, value) {                                                         // 274
  // generally, use setAttribute but certain attributes need to be set                                        // 275
  // by directly setting a JavaScript property on the DOM element.                                            // 276
  if (name === 'class') {                                                                                     // 277
    if (isSVGElement(elem)) {                                                                                 // 278
      return new SVGClassHandler(name, value);                                                                // 279
    } else {                                                                                                  // 280
      return new ClassHandler(name, value);                                                                   // 281
    }                                                                                                         // 282
  } else if (name === 'style') {                                                                              // 283
    return new StyleHandler(name, value);                                                                     // 284
  } else if ((elem.tagName === 'OPTION' && name === 'selected') ||                                            // 285
             (elem.tagName === 'INPUT' && name === 'checked')) {                                              // 286
    return new BooleanHandler(name, value);                                                                   // 287
  } else if ((elem.tagName === 'TEXTAREA' || elem.tagName === 'INPUT')                                        // 288
             && name === 'value') {                                                                           // 289
    // internally, TEXTAREAs tracks their value in the 'value'                                                // 290
    // attribute just like INPUTs.                                                                            // 291
    return new ValueHandler(name, value);                                                                     // 292
  } else if (name.substring(0,6) === 'xlink:') {                                                              // 293
    return new XlinkHandler(name.substring(6), value);                                                        // 294
  } else if (isUrlAttribute(elem.tagName, name)) {                                                            // 295
    return new UrlHandler(name, value);                                                                       // 296
  } else {                                                                                                    // 297
    return new AttributeHandler(name, value);                                                                 // 298
  }                                                                                                           // 299
                                                                                                              // 300
  // XXX will need one for 'style' on IE, though modern browsers                                              // 301
  // seem to handle setAttribute ok.                                                                          // 302
};                                                                                                            // 303
                                                                                                              // 304
                                                                                                              // 305
ElementAttributesUpdater = function (elem) {                                                                  // 306
  this.elem = elem;                                                                                           // 307
  this.handlers = {};                                                                                         // 308
};                                                                                                            // 309
                                                                                                              // 310
// Update attributes on `elem` to the dictionary `attrs`, whose                                               // 311
// values are strings.                                                                                        // 312
ElementAttributesUpdater.prototype.update = function(newAttrs) {                                              // 313
  var elem = this.elem;                                                                                       // 314
  var handlers = this.handlers;                                                                               // 315
                                                                                                              // 316
  for (var k in handlers) {                                                                                   // 317
    if (! newAttrs.hasOwnProperty(k)) {                                                                       // 318
      // remove attributes (and handlers) for attribute names                                                 // 319
      // that don't exist as keys of `newAttrs` and so won't                                                  // 320
      // be visited when traversing it.  (Attributes that                                                     // 321
      // exist in the `newAttrs` object but are `null`                                                        // 322
      // are handled later.)                                                                                  // 323
      var handler = handlers[k];                                                                              // 324
      var oldValue = handler.value;                                                                           // 325
      handler.value = null;                                                                                   // 326
      handler.update(elem, oldValue, null);                                                                   // 327
      delete handlers[k];                                                                                     // 328
    }                                                                                                         // 329
  }                                                                                                           // 330
                                                                                                              // 331
  for (var k in newAttrs) {                                                                                   // 332
    var handler = null;                                                                                       // 333
    var oldValue;                                                                                             // 334
    var value = newAttrs[k];                                                                                  // 335
    if (! handlers.hasOwnProperty(k)) {                                                                       // 336
      if (value !== null) {                                                                                   // 337
        // make new handler                                                                                   // 338
        handler = makeAttributeHandler(elem, k, value);                                                       // 339
        handlers[k] = handler;                                                                                // 340
        oldValue = null;                                                                                      // 341
      }                                                                                                       // 342
    } else {                                                                                                  // 343
      handler = handlers[k];                                                                                  // 344
      oldValue = handler.value;                                                                               // 345
    }                                                                                                         // 346
    if (oldValue !== value) {                                                                                 // 347
      handler.value = value;                                                                                  // 348
      handler.update(elem, oldValue, value);                                                                  // 349
      if (value === null)                                                                                     // 350
        delete handlers[k];                                                                                   // 351
    }                                                                                                         // 352
  }                                                                                                           // 353
};                                                                                                            // 354
                                                                                                              // 355
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/render.js                                                                                      //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
                                                                                                              // 1
UI.Component.instantiate = function (parent) {                                                                // 2
  var kind = this;                                                                                            // 3
                                                                                                              // 4
  // check arguments                                                                                          // 5
  if (UI.isComponent(kind)) {                                                                                 // 6
    if (kind.isInited)                                                                                        // 7
      throw new Error("A component kind is required, not an instance");                                       // 8
  } else {                                                                                                    // 9
    throw new Error("Expected Component kind");                                                               // 10
  }                                                                                                           // 11
                                                                                                              // 12
  var inst = kind.extend(); // XXX args go here                                                               // 13
  inst.isInited = true;                                                                                       // 14
                                                                                                              // 15
  // XXX messy to define this here                                                                            // 16
  inst.templateInstance = {                                                                                   // 17
    $: function(selector) {                                                                                   // 18
      // XXX check that `.dom` exists here?                                                                   // 19
      return inst.dom.$(selector);                                                                            // 20
    },                                                                                                        // 21
    findAll: function (selector) {                                                                            // 22
      return $.makeArray(this.$(selector));                                                                   // 23
    },                                                                                                        // 24
    find: function (selector) {                                                                               // 25
      var result = this.$(selector);                                                                          // 26
      return result[0] || null;                                                                               // 27
    },                                                                                                        // 28
    firstNode: null,                                                                                          // 29
    lastNode: null,                                                                                           // 30
    data: null,                                                                                               // 31
    __component__: inst                                                                                       // 32
  };                                                                                                          // 33
                                                                                                              // 34
  inst.parent = (parent || null);                                                                             // 35
                                                                                                              // 36
  if (inst.init)                                                                                              // 37
    inst.init();                                                                                              // 38
                                                                                                              // 39
  if (inst.created) {                                                                                         // 40
    updateTemplateInstance(inst);                                                                             // 41
    inst.created.call(inst.templateInstance);                                                                 // 42
  }                                                                                                           // 43
                                                                                                              // 44
  return inst;                                                                                                // 45
};                                                                                                            // 46
                                                                                                              // 47
UI.Component.render = function () {                                                                           // 48
  return null;                                                                                                // 49
};                                                                                                            // 50
                                                                                                              // 51
var Box = function (func, equals) {                                                                           // 52
  var self = this;                                                                                            // 53
                                                                                                              // 54
  self.func = func;                                                                                           // 55
  self.equals = equals;                                                                                       // 56
                                                                                                              // 57
  self.curResult = null;                                                                                      // 58
                                                                                                              // 59
  self.dep = new Deps.Dependency;                                                                             // 60
                                                                                                              // 61
  self.resultComputation = Deps.nonreactive(function () {                                                     // 62
    return Deps.autorun(function (c) {                                                                        // 63
      var func = self.func;                                                                                   // 64
                                                                                                              // 65
      var newResult = func();                                                                                 // 66
                                                                                                              // 67
      if (! c.firstRun) {                                                                                     // 68
        var equals = self.equals;                                                                             // 69
        var oldResult = self.curResult;                                                                       // 70
                                                                                                              // 71
        if (equals ? equals(newResult, oldResult) :                                                           // 72
            newResult === oldResult) {                                                                        // 73
          // same as last time                                                                                // 74
          return;                                                                                             // 75
        }                                                                                                     // 76
      }                                                                                                       // 77
                                                                                                              // 78
      self.curResult = newResult;                                                                             // 79
      self.dep.changed();                                                                                     // 80
    });                                                                                                       // 81
  });                                                                                                         // 82
};                                                                                                            // 83
                                                                                                              // 84
Box.prototype.stop = function () {                                                                            // 85
  this.resultComputation.stop();                                                                              // 86
};                                                                                                            // 87
                                                                                                              // 88
Box.prototype.get = function () {                                                                             // 89
  if (Deps.active && ! this.resultComputation.stopped)                                                        // 90
    this.dep.depend();                                                                                        // 91
                                                                                                              // 92
  return this.curResult;                                                                                      // 93
};                                                                                                            // 94
                                                                                                              // 95
// Takes a reactive function (call it `inner`) and returns a reactive function                                // 96
// `outer` which is equivalent except in its reactive behavior.  Specifically,                                // 97
// `outer` has the following two special properties:                                                          // 98
//                                                                                                            // 99
// 1. Isolation:  An invocation of `outer()` only invalidates its context                                     // 100
//    when the value of `inner()` changes.  For example, `inner` may be a                                     // 101
//    function that gets one or more Session variables and calculates a                                       // 102
//    true/false value.  `outer` blocks invalidation signals caused by the                                    // 103
//    Session variables changing and sends a signal out only when the value                                   // 104
//    changes between true and false (in this example).  The value can be                                     // 105
//    of any type, and it is compared with `===` unless an `equals` function                                  // 106
//    is provided.                                                                                            // 107
//                                                                                                            // 108
// 2. Value Sharing:  The `outer` function returned by `emboxValue` can be                                    // 109
//    shared between different contexts, for example by assigning it to an                                    // 110
//    object as a method that can be accessed at any time, such as by                                         // 111
//    different templates or different parts of a template.  No matter                                        // 112
//    how many times `outer` is called, `inner` is only called once until                                     // 113
//    it changes.  The most recent value is stored internally.                                                // 114
//                                                                                                            // 115
// Conceptually, an emboxed value is much like a Session variable which is                                    // 116
// kept up to date by an autorun.  Session variables provide storage                                          // 117
// (value sharing) and they don't notify their listeners unless a value                                       // 118
// actually changes (isolation).  The biggest difference is that such an                                      // 119
// autorun would never be stopped, and the Session variable would never be                                    // 120
// deleted even if it wasn't used any more.  An emboxed value, on the other                                   // 121
// hand, automatically stops computing when it's not being used, and starts                                   // 122
// again when called from a reactive context.  This means that when it stops                                  // 123
// being used, it can be completely garbage-collected.                                                        // 124
//                                                                                                            // 125
// If a non-function value is supplied to `emboxValue` instead of a reactive                                  // 126
// function, then `outer` is still a function but it simply returns the value.                                // 127
//                                                                                                            // 128
UI.emboxValue = function (funcOrValue, equals) {                                                              // 129
  if (typeof funcOrValue === 'function') {                                                                    // 130
                                                                                                              // 131
    var func = funcOrValue;                                                                                   // 132
    var box = new Box(func, equals);                                                                          // 133
                                                                                                              // 134
    var f = function () {                                                                                     // 135
      return box.get();                                                                                       // 136
    };                                                                                                        // 137
                                                                                                              // 138
    f.stop = function () {                                                                                    // 139
      box.stop();                                                                                             // 140
    };                                                                                                        // 141
                                                                                                              // 142
    return f;                                                                                                 // 143
                                                                                                              // 144
  } else {                                                                                                    // 145
    var value = funcOrValue;                                                                                  // 146
    var result = function () {                                                                                // 147
      return value;                                                                                           // 148
    };                                                                                                        // 149
    result._isEmboxedConstant = true;                                                                         // 150
    return result;                                                                                            // 151
  }                                                                                                           // 152
};                                                                                                            // 153
                                                                                                              // 154
                                                                                                              // 155
UI.namedEmboxValue = function (name, funcOrValue, equals) {                                                   // 156
  if (! Deps.active) {                                                                                        // 157
    var f = UI.emboxValue(funcOrValue, equals);                                                               // 158
    f.stop();                                                                                                 // 159
    return f;                                                                                                 // 160
  }                                                                                                           // 161
                                                                                                              // 162
  var c = Deps.currentComputation;                                                                            // 163
  if (! c[name])                                                                                              // 164
    c[name] = UI.emboxValue(funcOrValue, equals);                                                             // 165
                                                                                                              // 166
  return c[name];                                                                                             // 167
};                                                                                                            // 168
                                                                                                              // 169
////////////////////////////////////////                                                                      // 170
                                                                                                              // 171
UI.insert = function (renderedTemplate, parentElement, nextNode) {                                            // 172
  if (! renderedTemplate.dom)                                                                                 // 173
    throw new Error("Expected template rendered with UI.render");                                             // 174
                                                                                                              // 175
  UI.DomRange.insert(renderedTemplate.dom, parentElement, nextNode);                                          // 176
};                                                                                                            // 177
                                                                                                              // 178
// Insert a DOM node or DomRange into a DOM element or DomRange.                                              // 179
//                                                                                                            // 180
// One of three things happens depending on what needs to be inserted into what:                              // 181
// - `range.add` (anything into DomRange)                                                                     // 182
// - `UI.DomRange.insert` (DomRange into element)                                                             // 183
// - `elem.insertBefore` (node into element)                                                                  // 184
//                                                                                                            // 185
// The optional `before` argument is an existing node or id to insert before in                               // 186
// the parent element or DomRange.                                                                            // 187
var insert = function (nodeOrRange, parent, before) {                                                         // 188
  if (! parent)                                                                                               // 189
    throw new Error("Materialization parent required");                                                       // 190
                                                                                                              // 191
  if (parent instanceof UI.DomRange) {                                                                        // 192
    parent.add(nodeOrRange, before);                                                                          // 193
  } else if (nodeOrRange instanceof UI.DomRange) {                                                            // 194
    // parent is an element; inserting a range                                                                // 195
    UI.DomRange.insert(nodeOrRange, parent, before);                                                          // 196
  } else {                                                                                                    // 197
    // parent is an element; inserting an element                                                             // 198
    parent.insertBefore(nodeOrRange, before || null); // `null` for IE                                        // 199
  }                                                                                                           // 200
};                                                                                                            // 201
                                                                                                              // 202
// options include:                                                                                           // 203
//   - _nestInCurrentComputation: defaults to false. If true, then                                            // 204
//     `render`'s autoruns will be nested inside the current                                                  // 205
//     computation, so if the current computation is invalidated, then                                        // 206
//     the autoruns set up inside `render` will be stopped. If false,                                         // 207
//     the autoruns will be set up in a fresh Deps context, so                                                // 208
//     invalidating the current computation will have no effect on them.                                      // 209
UI.render = function (kind, parentComponent, options) {                                                       // 210
  options = options || {};                                                                                    // 211
                                                                                                              // 212
  if (kind.isInited)                                                                                          // 213
    throw new Error("Can't render component instance, only component kind");                                  // 214
                                                                                                              // 215
  var inst, content, range;                                                                                   // 216
                                                                                                              // 217
  Deps.nonreactive(function () {                                                                              // 218
                                                                                                              // 219
    inst = kind.instantiate(parentComponent);                                                                 // 220
                                                                                                              // 221
    content = (inst.render && inst.render());                                                                 // 222
                                                                                                              // 223
    range = new UI.DomRange;                                                                                  // 224
    inst.dom = range;                                                                                         // 225
    range.component = inst;                                                                                   // 226
                                                                                                              // 227
    if (! options._nestInCurrentComputation) {                                                                // 228
      materialize(content, range, null, inst);                                                                // 229
    }                                                                                                         // 230
                                                                                                              // 231
  });                                                                                                         // 232
                                                                                                              // 233
  if (options._nestInCurrentComputation) {                                                                    // 234
    materialize(content, range, null, inst);                                                                  // 235
  }                                                                                                           // 236
                                                                                                              // 237
  range.removed = function () {                                                                               // 238
    inst.isDestroyed = true;                                                                                  // 239
    if (inst.destroyed) {                                                                                     // 240
      Deps.nonreactive(function () {                                                                          // 241
        updateTemplateInstance(inst);                                                                         // 242
        inst.destroyed.call(inst.templateInstance);                                                           // 243
      });                                                                                                     // 244
    }                                                                                                         // 245
  };                                                                                                          // 246
                                                                                                              // 247
  return inst;                                                                                                // 248
};                                                                                                            // 249
                                                                                                              // 250
// options are the same as for UI.render.                                                                     // 251
UI.renderWithData = function (kind, data, parentComponent, options) {                                         // 252
  if (! UI.isComponent(kind))                                                                                 // 253
    throw new Error("Component required here");                                                               // 254
  if (kind.isInited)                                                                                          // 255
    throw new Error("Can't render component instance, only component kind");                                  // 256
  if (typeof data === 'function')                                                                             // 257
    throw new Error("Data argument can't be a function");                                                     // 258
                                                                                                              // 259
  return UI.render(kind.extend({data: function () { return data; }}),                                         // 260
                   parentComponent, options);                                                                 // 261
};                                                                                                            // 262
                                                                                                              // 263
var contentEquals = function (a, b) {                                                                         // 264
  if (a instanceof HTML.Raw) {                                                                                // 265
    return (b instanceof HTML.Raw) && (a.value === b.value);                                                  // 266
  } else if (a == null) {                                                                                     // 267
    return (b == null);                                                                                       // 268
  } else {                                                                                                    // 269
    return (a === b) &&                                                                                       // 270
      ((typeof a === 'number') || (typeof a === 'boolean') ||                                                 // 271
       (typeof a === 'string'));                                                                              // 272
  }                                                                                                           // 273
};                                                                                                            // 274
                                                                                                              // 275
UI.InTemplateScope = function (tmplInstance, content) {                                                       // 276
  if (! (this instanceof UI.InTemplateScope))                                                                 // 277
    // called without `new`                                                                                   // 278
    return new UI.InTemplateScope(tmplInstance, content);                                                     // 279
                                                                                                              // 280
  var parentPtr = tmplInstance.parent;                                                                        // 281
  if (parentPtr.__isTemplateWith)                                                                             // 282
    parentPtr = parentPtr.parent;                                                                             // 283
                                                                                                              // 284
  this.parentPtr = parentPtr;                                                                                 // 285
  this.content = content;                                                                                     // 286
};                                                                                                            // 287
                                                                                                              // 288
UI.InTemplateScope.prototype.toHTML = function (parentComponent) {                                            // 289
  return HTML.toHTML(this.content, this.parentPtr);                                                           // 290
};                                                                                                            // 291
                                                                                                              // 292
UI.InTemplateScope.prototype.toText = function (textMode, parentComponent) {                                  // 293
  return HTML.toText(this.content, textMode, this.parentPtr);                                                 // 294
};                                                                                                            // 295
                                                                                                              // 296
// Convert the pseudoDOM `node` into reactive DOM nodes and insert them                                       // 297
// into the element or DomRange `parent`, before the node or id `before`.                                     // 298
var materialize = function (node, parent, before, parentComponent) {                                          // 299
  // XXX should do more error-checking for the case where user is supplying the tags.                         // 300
  // For example, check that CharRef has `html` and `str` properties and no content.                          // 301
  // Check that Comment has a single string child and no attributes.  Etc.                                    // 302
                                                                                                              // 303
  if (node == null) {                                                                                         // 304
    // null or undefined.                                                                                     // 305
    // do nothinge.                                                                                           // 306
  } else if ((typeof node === 'string') || (typeof node === 'boolean') || (typeof node === 'number')) {       // 307
    node = String(node);                                                                                      // 308
    insert(document.createTextNode(node), parent, before);                                                    // 309
  } else if (node instanceof Array) {                                                                         // 310
    for (var i = 0; i < node.length; i++)                                                                     // 311
      materialize(node[i], parent, before, parentComponent);                                                  // 312
  } else if (typeof node === 'function') {                                                                    // 313
                                                                                                              // 314
    var range = new UI.DomRange;                                                                              // 315
    var lastContent = null;                                                                                   // 316
    var rangeUpdater = Deps.autorun(function (c) {                                                            // 317
      var content = node();                                                                                   // 318
      // normalize content a little, for easier comparison                                                    // 319
      if (HTML.isNully(content))                                                                              // 320
        content = null;                                                                                       // 321
      else if ((content instanceof Array) && content.length === 1)                                            // 322
        content = content[0];                                                                                 // 323
                                                                                                              // 324
      // update if content is different from last time                                                        // 325
      if (! contentEquals(content, lastContent)) {                                                            // 326
        lastContent = content;                                                                                // 327
                                                                                                              // 328
        if (! c.firstRun)                                                                                     // 329
          range.removeAll();                                                                                  // 330
                                                                                                              // 331
        materialize(content, range, null, parentComponent);                                                   // 332
      }                                                                                                       // 333
    });                                                                                                       // 334
    range.removed = function () {                                                                             // 335
      rangeUpdater.stop();                                                                                    // 336
      if (node.stop)                                                                                          // 337
        node.stop();                                                                                          // 338
    };                                                                                                        // 339
    // XXXX HACK                                                                                              // 340
    if (Deps.active && node.stop) {                                                                           // 341
      Deps.onInvalidate(function () {                                                                         // 342
        node.stop();                                                                                          // 343
      });                                                                                                     // 344
    }                                                                                                         // 345
    insert(range, parent, before);                                                                            // 346
  } else if (node instanceof HTML.Tag) {                                                                      // 347
    var tagName = node.tagName;                                                                               // 348
    var elem;                                                                                                 // 349
    if (HTML.isKnownSVGElement(tagName) && document.createElementNS) {                                        // 350
      elem = document.createElementNS('http://www.w3.org/2000/svg', tagName);                                 // 351
    } else {                                                                                                  // 352
      elem = document.createElement(node.tagName);                                                            // 353
    }                                                                                                         // 354
                                                                                                              // 355
    var rawAttrs = node.attrs;                                                                                // 356
    var children = node.children;                                                                             // 357
    if (node.tagName === 'textarea') {                                                                        // 358
      rawAttrs = (rawAttrs || {});                                                                            // 359
      rawAttrs.value = children;                                                                              // 360
      children = [];                                                                                          // 361
    };                                                                                                        // 362
                                                                                                              // 363
    if (rawAttrs) {                                                                                           // 364
      var attrComp = Deps.autorun(function (c) {                                                              // 365
        var attrUpdater = c.updater;                                                                          // 366
        if (! attrUpdater) {                                                                                  // 367
          attrUpdater = c.updater = new ElementAttributesUpdater(elem);                                       // 368
        }                                                                                                     // 369
                                                                                                              // 370
        try {                                                                                                 // 371
          var attrs = HTML.evaluateAttributes(rawAttrs, parentComponent);                                     // 372
          var stringAttrs = {};                                                                               // 373
          if (attrs) {                                                                                        // 374
            for (var k in attrs) {                                                                            // 375
              stringAttrs[k] = HTML.toText(attrs[k], HTML.TEXTMODE.STRING,                                    // 376
                                           parentComponent);                                                  // 377
            }                                                                                                 // 378
            attrUpdater.update(stringAttrs);                                                                  // 379
          }                                                                                                   // 380
        } catch (e) {                                                                                         // 381
          reportUIException(e);                                                                               // 382
        }                                                                                                     // 383
      });                                                                                                     // 384
      UI.DomBackend.onElementTeardown(elem, function () {                                                     // 385
        attrComp.stop();                                                                                      // 386
      });                                                                                                     // 387
    }                                                                                                         // 388
    materialize(children, elem, null, parentComponent);                                                       // 389
                                                                                                              // 390
    insert(elem, parent, before);                                                                             // 391
  } else if (typeof node.instantiate === 'function') {                                                        // 392
    // component                                                                                              // 393
    var instance = UI.render(node, parentComponent, {                                                         // 394
      _nestInCurrentComputation: true                                                                         // 395
    });                                                                                                       // 396
                                                                                                              // 397
    // Call internal callback, which may take advantage of the current                                        // 398
    // Deps computation.                                                                                      // 399
    if (instance.materialized)                                                                                // 400
      instance.materialized(instance.dom);                                                                    // 401
                                                                                                              // 402
    insert(instance.dom, parent, before);                                                                     // 403
  } else if (node instanceof HTML.CharRef) {                                                                  // 404
    insert(document.createTextNode(node.str), parent, before);                                                // 405
  } else if (node instanceof HTML.Comment) {                                                                  // 406
    insert(document.createComment(node.sanitizedValue), parent, before);                                      // 407
  } else if (node instanceof HTML.Raw) {                                                                      // 408
    // Get an array of DOM nodes by using the browser's HTML parser                                           // 409
    // (like innerHTML).                                                                                      // 410
    var htmlNodes = UI.DomBackend.parseHTML(node.value);                                                      // 411
    for (var i = 0; i < htmlNodes.length; i++)                                                                // 412
      insert(htmlNodes[i], parent, before);                                                                   // 413
  } else if (Package['html-tools'] && (node instanceof Package['html-tools'].HTMLTools.Special)) {            // 414
    throw new Error("Can't materialize Special tag, it's just an intermediate rep");                          // 415
  } else if (node instanceof UI.InTemplateScope) {                                                            // 416
    materialize(node.content, parent, before, node.parentPtr);                                                // 417
  } else {                                                                                                    // 418
    // can't get here                                                                                         // 419
    throw new Error("Unexpected node in htmljs: " + node);                                                    // 420
  }                                                                                                           // 421
};                                                                                                            // 422
                                                                                                              // 423
                                                                                                              // 424
                                                                                                              // 425
// XXX figure out the right names, and namespace, for these.                                                  // 426
// for example, maybe some of them go in the HTML package.                                                    // 427
UI.materialize = materialize;                                                                                 // 428
                                                                                                              // 429
UI.body = UI.Component.extend({                                                                               // 430
  kind: 'body',                                                                                               // 431
  contentParts: [],                                                                                           // 432
  render: function () {                                                                                       // 433
    return this.contentParts;                                                                                 // 434
  },                                                                                                          // 435
  // XXX revisit how body works.                                                                              // 436
  INSTANTIATED: false,                                                                                        // 437
  __helperHost: true                                                                                          // 438
});                                                                                                           // 439
                                                                                                              // 440
UI.block = function (renderFunc) {                                                                            // 441
  return UI.Component.extend({ render: renderFunc });                                                         // 442
};                                                                                                            // 443
                                                                                                              // 444
UI.toHTML = function (content, parentComponent) {                                                             // 445
  return HTML.toHTML(content, parentComponent);                                                               // 446
};                                                                                                            // 447
                                                                                                              // 448
UI.toRawText = function (content, parentComponent) {                                                          // 449
  return HTML.toText(content, HTML.TEXTMODE.STRING, parentComponent);                                         // 450
};                                                                                                            // 451
                                                                                                              // 452
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/builtins.js                                                                                    //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
                                                                                                              // 1
UI.If = function (argFunc, contentBlock, elseContentBlock) {                                                  // 2
  checkBlockHelperArguments('If', argFunc, contentBlock, elseContentBlock);                                   // 3
                                                                                                              // 4
  var f = function () {                                                                                       // 5
    var emboxedCondition = emboxCondition(argFunc);                                                           // 6
    f.stop = function () {                                                                                    // 7
      emboxedCondition.stop();                                                                                // 8
    };                                                                                                        // 9
    if (emboxedCondition())                                                                                   // 10
      return contentBlock;                                                                                    // 11
    else                                                                                                      // 12
      return elseContentBlock || null;                                                                        // 13
  };                                                                                                          // 14
                                                                                                              // 15
  return f;                                                                                                   // 16
};                                                                                                            // 17
                                                                                                              // 18
                                                                                                              // 19
UI.Unless = function (argFunc, contentBlock, elseContentBlock) {                                              // 20
  checkBlockHelperArguments('Unless', argFunc, contentBlock, elseContentBlock);                               // 21
                                                                                                              // 22
  var f = function () {                                                                                       // 23
    var emboxedCondition = emboxCondition(argFunc);                                                           // 24
    f.stop = function () {                                                                                    // 25
      emboxedCondition.stop();                                                                                // 26
    };                                                                                                        // 27
    if (! emboxedCondition())                                                                                 // 28
      return contentBlock;                                                                                    // 29
    else                                                                                                      // 30
      return elseContentBlock || null;                                                                        // 31
  };                                                                                                          // 32
                                                                                                              // 33
  return f;                                                                                                   // 34
};                                                                                                            // 35
                                                                                                              // 36
// Returns true if `a` and `b` are `===`, unless they are of a mutable type.                                  // 37
// (Because then, they may be equal references to an object that was mutated,                                 // 38
// and we'll never know.  We save only a reference to the old object; we don't                                // 39
// do any deep-copying or diffing.)                                                                           // 40
UI.safeEquals = function (a, b) {                                                                             // 41
  if (a !== b)                                                                                                // 42
    return false;                                                                                             // 43
  else                                                                                                        // 44
    return ((!a) || (typeof a === 'number') || (typeof a === 'boolean') ||                                    // 45
            (typeof a === 'string'));                                                                         // 46
};                                                                                                            // 47
                                                                                                              // 48
// Unlike Spacebars.With, there's no else case and no conditional logic.                                      // 49
//                                                                                                            // 50
// We don't do any reactive emboxing of `argFunc` here; it should be done                                     // 51
// by the caller if efficiency and/or number of calls to the data source                                      // 52
// is important.                                                                                              // 53
UI.With = function (argFunc, contentBlock) {                                                                  // 54
  checkBlockHelperArguments('With', argFunc, contentBlock);                                                   // 55
                                                                                                              // 56
  var block = contentBlock;                                                                                   // 57
  if ('data' in block) {                                                                                      // 58
    // XXX TODO: get religion about where `data` property goes                                                // 59
    block = UI.block(function () {                                                                            // 60
      return contentBlock;                                                                                    // 61
    });                                                                                                       // 62
  }                                                                                                           // 63
                                                                                                              // 64
  block.data = function () {                                                                                  // 65
    throw new Error("Can't get data for component kind");                                                     // 66
  };                                                                                                          // 67
                                                                                                              // 68
  block.init = function () {                                                                                  // 69
    this.data = UI.emboxValue(argFunc, UI.safeEquals);                                                        // 70
  };                                                                                                          // 71
                                                                                                              // 72
  block.materialized = function () {                                                                          // 73
    var self = this;                                                                                          // 74
    if (Deps.active) {                                                                                        // 75
      Deps.onInvalidate(function () {                                                                         // 76
        self.data.stop();                                                                                     // 77
      });                                                                                                     // 78
    }                                                                                                         // 79
  };                                                                                                          // 80
  block.materialized.isWith = true;                                                                           // 81
                                                                                                              // 82
  return block;                                                                                               // 83
};                                                                                                            // 84
                                                                                                              // 85
UI.Each = function (argFunc, contentBlock, elseContentBlock) {                                                // 86
  checkBlockHelperArguments('Each', argFunc, contentBlock, elseContentBlock);                                 // 87
                                                                                                              // 88
  return UI.EachImpl.extend({                                                                                 // 89
    __sequence: argFunc,                                                                                      // 90
    __content: contentBlock,                                                                                  // 91
    __elseContent: elseContentBlock                                                                           // 92
  });                                                                                                         // 93
};                                                                                                            // 94
                                                                                                              // 95
var checkBlockHelperArguments = function (which, argFunc, contentBlock, elseContentBlock) {                   // 96
  if (typeof argFunc !== 'function')                                                                          // 97
    throw new Error('First argument to ' + which + ' must be a function');                                    // 98
  if (! UI.isComponent(contentBlock))                                                                         // 99
    throw new Error('Second argument to ' + which + ' must be a template or UI.block');                       // 100
  if (elseContentBlock && ! UI.isComponent(elseContentBlock))                                                 // 101
    throw new Error('Third argument to ' + which + ' must be a template or UI.block if present');             // 102
};                                                                                                            // 103
                                                                                                              // 104
// Returns a function that computes `!! conditionFunc()` except:                                              // 105
//                                                                                                            // 106
// - Empty array is considered falsy                                                                          // 107
// - The result is UI.emboxValue'd (doesn't trigger invalidation                                              // 108
//   as long as the condition stays truthy or stays falsy)                                                    // 109
var emboxCondition = function (conditionFunc) {                                                               // 110
  return UI.namedEmboxValue('if/unless', function () {                                                        // 111
    // `condition` is emboxed; it is always a function,                                                       // 112
    // and it only triggers invalidation if its return                                                        // 113
    // value actually changes.  We still need to isolate                                                      // 114
    // the calculation of whether it is truthy or falsy                                                       // 115
    // in order to not re-render if it changes from one                                                       // 116
    // truthy or falsy value to another.                                                                      // 117
    var cond = conditionFunc();                                                                               // 118
                                                                                                              // 119
    // empty arrays are treated as falsey values                                                              // 120
    if (cond instanceof Array && cond.length === 0)                                                           // 121
      return false;                                                                                           // 122
    else                                                                                                      // 123
      return !! cond;                                                                                         // 124
  });                                                                                                         // 125
};                                                                                                            // 126
                                                                                                              // 127
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/each.js                                                                                        //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
UI.EachImpl = Component.extend({                                                                              // 1
  typeName: 'Each',                                                                                           // 2
  render: function (modeHint) {                                                                               // 3
    var self = this;                                                                                          // 4
    var content = self.__content;                                                                             // 5
    var elseContent = self.__elseContent;                                                                     // 6
                                                                                                              // 7
    if (modeHint === 'STATIC') {                                                                              // 8
      // This is a hack.  The caller gives us a hint if the                                                   // 9
      // value we return will be static (in HTML or text)                                                     // 10
      // or dynamic (materialized DOM).  The dynamic path                                                     // 11
      // returns `null` and then we populate the DOM from                                                     // 12
      // the `materialized` callback.                                                                         // 13
      //                                                                                                      // 14
      // It would be much cleaner to always return the same                                                   // 15
      // value here, and to have that value be some special                                                   // 16
      // object that encapsulates the logic for populating                                                    // 17
      // the #each using a mode-agnostic interface that                                                       // 18
      // works for HTML, text, and DOM.  Alternatively, we                                                    // 19
      // could formalize the current pattern, e.g. defining                                                   // 20
      // a method like component.populate(domRange) and one                                                   // 21
      // like renderStatic() or even renderHTML / renderText.                                                 // 22
      var parts = _.map(                                                                                      // 23
        ObserveSequence.fetch(self.__sequence()),                                                             // 24
        function (item) {                                                                                     // 25
          return content.extend({data: function () {                                                          // 26
            return item;                                                                                      // 27
          }});                                                                                                // 28
        });                                                                                                   // 29
                                                                                                              // 30
      if (parts.length) {                                                                                     // 31
        return parts;                                                                                         // 32
      } else {                                                                                                // 33
        return elseContent;                                                                                   // 34
      }                                                                                                       // 35
      return parts;                                                                                           // 36
    } else {                                                                                                  // 37
      return null;                                                                                            // 38
    }                                                                                                         // 39
  },                                                                                                          // 40
  materialized: function () {                                                                                 // 41
    var self = this;                                                                                          // 42
                                                                                                              // 43
    var range = self.dom;                                                                                     // 44
                                                                                                              // 45
    var content = self.__content;                                                                             // 46
    var elseContent = self.__elseContent;                                                                     // 47
                                                                                                              // 48
    // if there is an else clause, keep track of the number of                                                // 49
    // rendered items.  use this to display the else clause when count                                        // 50
    // becomes zero, and remove it when count becomes positive.                                               // 51
    var itemCount = 0;                                                                                        // 52
    var addToCount = function(delta) {                                                                        // 53
      if (!elseContent) // if no else, no need to keep track of count                                         // 54
        return;                                                                                               // 55
                                                                                                              // 56
      if (itemCount + delta < 0)                                                                              // 57
        throw new Error("count should never become negative");                                                // 58
                                                                                                              // 59
      if (itemCount === 0) {                                                                                  // 60
        // remove else clause                                                                                 // 61
        range.removeAll();                                                                                    // 62
      }                                                                                                       // 63
      itemCount += delta;                                                                                     // 64
      if (itemCount === 0) {                                                                                  // 65
        UI.materialize(elseContent, range, null, self);                                                       // 66
      }                                                                                                       // 67
    };                                                                                                        // 68
                                                                                                              // 69
    this.observeHandle = ObserveSequence.observe(function () {                                                // 70
      return self.__sequence();                                                                               // 71
    }, {                                                                                                      // 72
      addedAt: function (id, item, i, beforeId) {                                                             // 73
        addToCount(1);                                                                                        // 74
        id = LocalCollection._idStringify(id);                                                                // 75
                                                                                                              // 76
        var data = item;                                                                                      // 77
        var dep = new Deps.Dependency;                                                                        // 78
                                                                                                              // 79
        // function to become `comp.data`                                                                     // 80
        var dataFunc = function () {                                                                          // 81
          dep.depend();                                                                                       // 82
          return data;                                                                                        // 83
        };                                                                                                    // 84
        // Storing `$set` on `comp.data` lets us                                                              // 85
        // access it from `changed`.                                                                          // 86
        dataFunc.$set = function (v) {                                                                        // 87
          data = v;                                                                                           // 88
          dep.changed();                                                                                      // 89
        };                                                                                                    // 90
                                                                                                              // 91
        if (beforeId)                                                                                         // 92
          beforeId = LocalCollection._idStringify(beforeId);                                                  // 93
                                                                                                              // 94
        var renderedItem = UI.render(content.extend({data: dataFunc}), self);                                 // 95
        range.add(id, renderedItem.dom, beforeId);                                                            // 96
      },                                                                                                      // 97
      removedAt: function (id, item) {                                                                        // 98
        addToCount(-1);                                                                                       // 99
        range.remove(LocalCollection._idStringify(id));                                                       // 100
      },                                                                                                      // 101
      movedTo: function (id, item, i, j, beforeId) {                                                          // 102
        range.moveBefore(                                                                                     // 103
          LocalCollection._idStringify(id),                                                                   // 104
          beforeId && LocalCollection._idStringify(beforeId));                                                // 105
      },                                                                                                      // 106
      changedAt: function (id, newItem, atIndex) {                                                            // 107
        range.get(LocalCollection._idStringify(id)).component.data.$set(newItem);                             // 108
      }                                                                                                       // 109
    });                                                                                                       // 110
                                                                                                              // 111
    // on initial render, display the else clause if no items                                                 // 112
    addToCount(0);                                                                                            // 113
  },                                                                                                          // 114
  destroyed: function () {                                                                                    // 115
    if (this.__component__.observeHandle)                                                                     // 116
      this.__component__.observeHandle.stop();                                                                // 117
  }                                                                                                           // 118
});                                                                                                           // 119
                                                                                                              // 120
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/fields.js                                                                                      //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
                                                                                                              // 1
var global = (function () { return this; })();                                                                // 2
                                                                                                              // 3
currentComponent = new Meteor.EnvironmentVariable();                                                          // 4
                                                                                                              // 5
// Searches for the given property in `comp` or a parent,                                                     // 6
// and returns it as is (without call it if it's a function).                                                 // 7
var lookupComponentProp = function (comp, prop) {                                                             // 8
  comp = findComponentWithProp(prop, comp);                                                                   // 9
  var result = (comp ? comp.data : null);                                                                     // 10
  if (typeof result === 'function')                                                                           // 11
    result = _.bind(result, comp);                                                                            // 12
  return result;                                                                                              // 13
};                                                                                                            // 14
                                                                                                              // 15
// Component that's a no-op when used as a block helper like                                                  // 16
// `{{#foo}}...{{/foo}}`. Prints a warning that it is deprecated.                                             // 17
var noOpComponent = function (name) {                                                                         // 18
  return Component.extend({                                                                                   // 19
    kind: 'NoOp',                                                                                             // 20
    render: function () {                                                                                     // 21
      Meteor._debug("{{#" + name + "}} is now unnecessary and deprecated.");                                  // 22
      return this.__content;                                                                                  // 23
    }                                                                                                         // 24
  });                                                                                                         // 25
};                                                                                                            // 26
                                                                                                              // 27
// This map is searched first when you do something like `{{#foo}}` in                                        // 28
// a template.                                                                                                // 29
var builtInComponents = {                                                                                     // 30
  // for past compat:                                                                                         // 31
  'constant': noOpComponent("constant"),                                                                      // 32
  'isolate': noOpComponent("isolate")                                                                         // 33
};                                                                                                            // 34
                                                                                                              // 35
_extend(UI.Component, {                                                                                       // 36
  // Options:                                                                                                 // 37
  //                                                                                                          // 38
  // - template {Boolean} If true, look at the list of templates after                                        // 39
  //   helpers and before data context.                                                                       // 40
  lookup: function (id, opts) {                                                                               // 41
    var self = this;                                                                                          // 42
    var template = opts && opts.template;                                                                     // 43
    var result;                                                                                               // 44
    var comp;                                                                                                 // 45
                                                                                                              // 46
    if (!id)                                                                                                  // 47
      throw new Error("must pass id to lookup");                                                              // 48
                                                                                                              // 49
    if (/^\./.test(id)) {                                                                                     // 50
      // starts with a dot. must be a series of dots which maps to an                                         // 51
      // ancestor of the appropriate height.                                                                  // 52
      if (!/^(\.)+$/.test(id)) {                                                                              // 53
        throw new Error("id starting with dot must be a series of dots");                                     // 54
      }                                                                                                       // 55
                                                                                                              // 56
      var compWithData = findComponentWithProp('data', self);                                                 // 57
      for (var i = 1; i < id.length; i++) {                                                                   // 58
        compWithData = compWithData ? findComponentWithProp('data', compWithData.parent) : null;              // 59
      }                                                                                                       // 60
                                                                                                              // 61
      return (compWithData ? compWithData.data : null);                                                       // 62
                                                                                                              // 63
    } else if ((comp = findComponentWithHelper(id, self))) {                                                  // 64
      // found a property or method of a component                                                            // 65
      // (`self` or one of its ancestors)                                                                     // 66
      var result = comp[id];                                                                                  // 67
                                                                                                              // 68
    } else if (_.has(builtInComponents, id)) {                                                                // 69
      return builtInComponents[id];                                                                           // 70
                                                                                                              // 71
    // Code to search the global namespace for capitalized names                                              // 72
    // like component classes, `Template`, `StringUtils.foo`,                                                 // 73
    // etc.                                                                                                   // 74
    //                                                                                                        // 75
    // } else if (/^[A-Z]/.test(id) && (id in global)) {                                                      // 76
    //   // Only look for a global identifier if `id` is                                                      // 77
    //   // capitalized.  This avoids having `{{name}}` mean                                                  // 78
    //   // `window.name`.                                                                                    // 79
    //   result = global[id];                                                                                 // 80
    //   return function (/*arguments*/) {                                                                    // 81
    //     var data = getComponentData(self);                                                                 // 82
    //     if (typeof result === 'function')                                                                  // 83
    //       return result.apply(data, arguments);                                                            // 84
    //     return result;                                                                                     // 85
    //   };                                                                                                   // 86
    } else if (template && _.has(Template, id)) {                                                             // 87
      return Template[id];                                                                                    // 88
                                                                                                              // 89
    } else if ((result = UI._globalHelper(id))) {                                                             // 90
                                                                                                              // 91
    } else {                                                                                                  // 92
      // Resolve id `foo` as `data.foo` (with a "soft dot").                                                  // 93
      return function (/* arguments */) {                                                                     // 94
        var data = getComponentData(self);                                                                    // 95
        if (template && !(data && _.has(data, id)))                                                           // 96
          throw new Error("Can't find template, helper or data context " +                                    // 97
                          "key: " + id);                                                                      // 98
        if (! data)                                                                                           // 99
          return data;                                                                                        // 100
        var result = data[id];                                                                                // 101
        if (typeof result === 'function')                                                                     // 102
          return result.apply(data, arguments);                                                               // 103
        return result;                                                                                        // 104
      };                                                                                                      // 105
    }                                                                                                         // 106
                                                                                                              // 107
    if (typeof result === 'function' && ! result._isEmboxedConstant) {                                        // 108
      // Wrap the function `result`, binding `this` to `getComponentData(self)`.                              // 109
      // This creates a dependency when the result function is called.                                        // 110
      // Don't do this if the function is really just an emboxed constant.                                    // 111
      return function (/*arguments*/) {                                                                       // 112
        var args = arguments;                                                                                 // 113
        return currentComponent.withValue(self, function () {                                                 // 114
          currentTemplateInstance = null; // lazily computed, since `updateTemplateInstance` is a little slow // 115
          var data = getComponentData(self);                                                                  // 116
          return result.apply(data === null ? {} : data, args);                                               // 117
        });                                                                                                   // 118
      };                                                                                                      // 119
    } else {                                                                                                  // 120
      return result;                                                                                          // 121
    };                                                                                                        // 122
  },                                                                                                          // 123
  lookupTemplate: function (id) {                                                                             // 124
    return this.lookup(id, {template: true});                                                                 // 125
  },                                                                                                          // 126
  get: function (id) {                                                                                        // 127
    // support `this.get()` to get the data context.                                                          // 128
    if (id === undefined)                                                                                     // 129
      id = ".";                                                                                               // 130
                                                                                                              // 131
    var result = this.lookup(id);                                                                             // 132
    return (typeof result === 'function' ? result() : result);                                                // 133
  },                                                                                                          // 134
  set: function (id, value) {                                                                                 // 135
    var comp = findComponentWithProp(id, this);                                                               // 136
    if (! comp || ! comp[id])                                                                                 // 137
      throw new Error("Can't find field: " + id);                                                             // 138
    if (typeof comp[id] !== 'function')                                                                       // 139
      throw new Error("Not a settable field: " + id);                                                         // 140
    comp[id](value);                                                                                          // 141
  }                                                                                                           // 142
});                                                                                                           // 143
                                                                                                              // 144
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/ui/handlebars_backcompat.js                                                                       //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
// XXX this file no longer makes sense in isolation.  take it apart as                                        // 1
// part file reorg on the 'ui' package                                                                        // 2
var globalHelpers = {};                                                                                       // 3
                                                                                                              // 4
UI.registerHelper = function (name, func) {                                                                   // 5
  globalHelpers[name] = func;                                                                                 // 6
};                                                                                                            // 7
                                                                                                              // 8
UI._globalHelper = function (name) {                                                                          // 9
  return globalHelpers[name];                                                                                 // 10
};                                                                                                            // 11
                                                                                                              // 12
Handlebars = {};                                                                                              // 13
Handlebars.registerHelper = UI.registerHelper;                                                                // 14
                                                                                                              // 15
// Utility to HTML-escape a string.                                                                           // 16
UI._escape = Handlebars._escape = (function() {                                                               // 17
  var escape_map = {                                                                                          // 18
    "<": "&lt;",                                                                                              // 19
    ">": "&gt;",                                                                                              // 20
    '"': "&quot;",                                                                                            // 21
    "'": "&#x27;",                                                                                            // 22
    "`": "&#x60;", /* IE allows backtick-delimited attributes?? */                                            // 23
    "&": "&amp;"                                                                                              // 24
  };                                                                                                          // 25
  var escape_one = function(c) {                                                                              // 26
    return escape_map[c];                                                                                     // 27
  };                                                                                                          // 28
                                                                                                              // 29
  return function (x) {                                                                                       // 30
    return x.replace(/[&<>"'`]/g, escape_one);                                                                // 31
  };                                                                                                          // 32
})();                                                                                                         // 33
                                                                                                              // 34
// Return these from {{...}} helpers to achieve the same as returning                                         // 35
// strings from {{{...}}} helpers                                                                             // 36
Handlebars.SafeString = function(string) {                                                                    // 37
  this.string = string;                                                                                       // 38
};                                                                                                            // 39
Handlebars.SafeString.prototype.toString = function() {                                                       // 40
  return this.string.toString();                                                                              // 41
};                                                                                                            // 42
                                                                                                              // 43
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.ui = {
  UI: UI,
  Handlebars: Handlebars
};

})();
