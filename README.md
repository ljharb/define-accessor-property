# define-accessor-property <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

Define an accessor property on an object. In an engine without descriptors, in loose mode, when only a getter is provided, nonEnumerable is false, and nonConfigurable is false, wil fall back to assignment - otherwise, it will throw.

The two `non*` options can also be passed `null`, which will use the existing state if available.

The `loose` option will mean that if you attempt to set a nonconfigurable/nonwritable accessor property with `set`, in an environment without descriptor support, it will fall back to normal assignment (and eagerly evaluate the getter).

## Usage

```javascript
var defineAccessorProperty = require('define-accessor-property');
var assert = require('assert');

var str = 'value';
var strThunk = function () { return str; };
var strSetter = function (v) { str = v; };
var random = function () { return Math.random(); };

var obj = {};
defineAccessorProperty(
	obj,
	'key',
	{
		get: strThunk,
		set: strSetter,
	}
);
defineAccessorProperty(
	obj,
	'key2',
	{
		get: random, // at least one of "get" or "set" must be provided
		nonConfigurable: true, // optional
		nonEnumerable: true, // optional
		loose: false, // optional
	}
);

assert.deepEqual(
	Object.getOwnPropertyDescriptors(obj),
	{
		key: {
			configurable: true,
			enumerable: true,
			get: strThunk,
			set: strSetter,
		},
		key2: {
			configurable: false,
			enumerable: false,
			get: random,
			set: undefined,
		},
	}
);
```

[package-url]: https://npmjs.org/package/define-accessor-property
[npm-version-svg]: https://versionbadg.es/ljharb/define-accessor-property.svg
[deps-svg]: https://david-dm.org/ljharb/define-accessor-property.svg
[deps-url]: https://david-dm.org/ljharb/define-accessor-property
[dev-deps-svg]: https://david-dm.org/ljharb/define-accessor-property/dev-status.svg
[dev-deps-url]: https://david-dm.org/ljharb/define-accessor-property#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/define-accessor-property.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/define-accessor-property.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/define-accessor-property.svg
[downloads-url]: https://npm-stat.com/charts.html?package=define-accessor-property
[codecov-image]: https://codecov.io/gh/ljharb/define-accessor-property/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/ljharb/define-accessor-property/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/ljharb/define-accessor-property
[actions-url]: https://github.com/ljharb/define-accessor-property/actions
