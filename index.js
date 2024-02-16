'use strict';

var $defineProperty = require('es-define-property');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var gopd = require('gopd');

/** @type {import('.')} */
module.exports = function defineAccessorProperty(obj, property, options) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new $TypeError('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new $TypeError('`property` must be a string or a symbol`');
	}
	if (!options || typeof options !== 'object') {
		throw new $TypeError('`options` must be an object');
	}

	var get = options.get;
	var set = options.set;
	if (
		(!get && !set)
		|| (typeof get !== 'function' && typeof get !== 'undefined')
		|| (typeof set !== 'function' && typeof set !== 'undefined')
	) {
		throw new $TypeError('At least one of `get` and `set` must be provided, and if provided, must be functions.');
	}

	if ('loose' in options && typeof options.loose !== 'boolean') {
		throw new $TypeError('`loose`, if provided, must be a boolean');
	}
	if ('nonConfigurable' in options && typeof options.nonConfigurable !== 'boolean' && options.nonConfigurable !== null) {
		throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
	}
	if ('nonEnumerable' in options && typeof options.nonEnumerable !== 'boolean' && options.nonEnumerable !== null) {
		throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
	}

	var nonEnumerable = options.nonEnumerable;
	var nonConfigurable = options.nonConfigurable;
	var loose = !!options.loose;

	/* @type {false | TypedPropertyDescriptor<unknown>} */
	var desc = !!gopd
		&& $defineProperty
		&& (nonConfigurable === null || nonEnumerable === null)
		&& gopd(obj, property);

	if ($defineProperty) {
		$defineProperty(obj, property, {
			configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
			get: options.get,
			set: options.set
		});
	} else if (loose && options.get && !options.set && !nonEnumerable && !nonConfigurable) {
		// must fall back to [[Set]], and was not explicitly asked to make a setter, non-enumerable, or non-configurable
		obj[property] = options.get.call(obj); // eslint-disable-line no-param-reassign
	} else {
		throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}
};
