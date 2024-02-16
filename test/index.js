'use strict';

var test = require('tape');
var v = require('es-value-fixtures');
var forEach = require('for-each');
var inspect = require('object-inspect');
var hasPropertyDescriptors = require('has-property-descriptors')();
var assign = require('object.assign');
var getOwnPropertyDescriptors = require('object.getownpropertydescriptors');

var defineAccessorProperty = require('../');

test('defineAccessorProperty', function (t) {
	t.test('argument validation', function (st) {
		forEach(v.primitives, function (nonObject) {
			st['throws'](
				// @ts-expect-error
				function () { defineAccessorProperty(nonObject, 'key', { get: function () {} }); },
				TypeError,
				'throws on non-object `obj`: ' + inspect(nonObject)
			);

			st['throws'](
				// @ts-expect-error
				function () { defineAccessorProperty({}, 'key', nonObject); },
				TypeError,
				'throws on non-object `options`: ' + inspect(nonObject)
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			st['throws'](
				// @ts-expect-error
				function () { defineAccessorProperty({}, nonPropertyKey, { get: function () {} }); },
				TypeError,
				'throws on non-PropertyKey input: ' + inspect(nonPropertyKey)
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			if (nonBoolean !== null) {
				st['throws'](
					// @ts-expect-error
					function () { defineAccessorProperty({}, 'key', { get: function () {}, nonEnumerable: nonBoolean }); },
					TypeError,
					'throws on non-boolean `nonEnumerable`: ' + inspect(nonBoolean)
				);

				st['throws'](
					// @ts-expect-error
					function () { defineAccessorProperty({}, 'key', { get: function () {}, nonConfigurable: nonBoolean }); },
					TypeError,
					'throws on non-boolean `nonConfigurable`: ' + inspect(nonBoolean)
				);

				st['throws'](
					// @ts-expect-error
					function () { defineAccessorProperty({}, 'key', { get: function () {}, loose: nonBoolean }); },
					TypeError,
					'throws on non-boolean `loose`: ' + inspect(nonBoolean)
				);
			}
		});

		forEach(v.nonFunctions, function (nonFunction) {
			if (typeof nonFunction !== 'undefined') {
				st['throws'](
					// @ts-expect-error
					function () { defineAccessorProperty({}, 'key', { get: nonFunction }); },
					TypeError,
					'throws on non-function `get`: ' + inspect(nonFunction)
				);

				st['throws'](
					// @ts-expect-error
					function () { defineAccessorProperty({}, 'key', { get: nonFunction, set: function () {} }); },
					TypeError,
					'throws on non-function `get` with function `set`: ' + inspect(nonFunction)
				);

				st['throws'](
					// @ts-expect-error
					function () { defineAccessorProperty({}, 'key', { set: nonFunction }); },
					TypeError,
					'throws on non-function `set`: ' + inspect(nonFunction)
				);

				st['throws'](
					// @ts-expect-error
					function () { defineAccessorProperty({}, 'key', { get: function () {}, set: nonFunction }); },
					TypeError,
					'throws on function `get` with non-function `set`: ' + inspect(nonFunction)
				);
			}
		});

		st.end();
	});

	forEach([undefined, true, false], function (loose) {
		/** @type {unknown} */ var value = 'getter';
		var getter = function () { return value; };
		var setter = /** @type {(x: unknown) => void} */ function (x) { value = x; };

		t.test('has descriptors (loose: `' + loose + '`)', { skip: !hasPropertyDescriptors }, function (st) {
			/** @type {Record<PropertyKey, unknown>} */
			var obj = {};

			value = 'getter';
			defineAccessorProperty(
				obj,
				'key',
				assign({ get: getter, set: setter }, typeof loose === 'boolean' && { loose: loose })
			);

			st.equal(obj.key, 'getter', 'normal: getter works (loose: `' + loose + '`)');

			obj.key = 'set 1';
			st.equal(obj.key, 'set 1', 'normal: setter works (loose: `' + loose + '`)');

			st.deepEqual(
				getOwnPropertyDescriptors(obj),
				{
					key: {
						configurable: true,
						enumerable: true,
						get: getter,
						set: setter
					}
				}
			);

			st.doesNotThrow(function () { delete obj.key; });

			value = 'getter';
			defineAccessorProperty(
				obj,
				'keyE',
				assign({ get: getter, set: setter, nonEnumerable: true }, typeof loose === 'boolean' && { loose: loose })
			);

			st.equal(obj.keyE, 'getter', 'nonEnum: getter works (loose: `' + loose + '`)');

			obj.keyE = 'set E';
			st.equal(obj.keyE, 'set E', 'nonEnum: setter works (loose: `' + loose + '`)');

			st.deepEqual(
				getOwnPropertyDescriptors(obj),
				{
					keyE: {
						configurable: true,
						enumerable: false,
						get: getter,
						set: setter
					}
				}
			);

			st.doesNotThrow(function () { delete obj.keyE; });

			value = 'getter';
			defineAccessorProperty(
				obj,
				'onlyG',
				assign({ get: getter, nonEnumerable: true }, typeof loose === 'boolean' && { loose: loose })
			);

			st.equal(obj.onlyG, 'getter', 'getter works (loose: `' + loose + '`)');

			st['throws'](
				function () { obj.onlyG = 'set onlyG'; },
				TypeError,
				'setting fails without a setter (loose: `' + loose + '`)'
			);

			st.deepEqual(
				getOwnPropertyDescriptors(obj),
				{
					onlyG: {
						configurable: true,
						enumerable: false,
						get: getter,
						set: undefined
					}
				}
			);

			st.doesNotThrow(function () { delete obj.onlyG; });

			value = 'getter';
			defineAccessorProperty(
				obj,
				'onlyS',
				assign({ set: setter, nonEnumerable: true }, typeof loose === 'boolean' && { loose: loose })
			);

			st.equal(obj.onlyS, undefined, 'no getter yields undefined (loose: `' + loose + '`)');

			st.doesNotThrow(function () { obj.onlyS = 'set onlyS'; });
			st.equal(value, 'set onlyS', 'setter works (loose: `' + loose + '`)');

			st.deepEqual(
				getOwnPropertyDescriptors(obj),
				{
					onlyS: {
						configurable: true,
						enumerable: false,
						get: undefined,
						set: setter
					}
				}
			);

			defineAccessorProperty(
				obj,
				'onlyS',
				assign({ get: getter, set: setter, nonEnumerable: null }, typeof loose === 'boolean' && { loose: loose })
			);
			st.equal(obj.onlyS, 'set onlyS', 'getter now works (loose: `' + loose + '`)');
			st.deepEqual(
				getOwnPropertyDescriptors(obj),
				{
					onlyS: {
						configurable: true,
						enumerable: false,
						get: getter,
						set: setter
					}
				}
			);

			st.doesNotThrow(function () { delete obj.onlyS; });

			value = 'getter';
			defineAccessorProperty(
				obj,
				'keyC',
				assign({ get: getter, set: setter, nonConfigurable: true }, typeof loose === 'boolean' && { loose: loose })
			);

			st.equal(obj.keyC, 'getter', 'getter works (loose: `' + loose + '`)');

			obj.keyC = 'set C';
			st.equal(obj.keyC, 'set C', 'setter works (loose: `' + loose + '`)');

			st['throws'](
				function () { delete obj.keyC; },
				TypeError,
				'can not delete non-configurable accessor property (loose: `' + loose + '`)'
			);

			st.deepEqual(
				getOwnPropertyDescriptors(obj),
				{
					keyC: {
						configurable: false,
						enumerable: true,
						get: getter,
						set: setter
					}
				}
			);

			value = 'getter';
			defineAccessorProperty(
				obj,
				'keyC',
				assign({ get: getter, set: setter, nonConfigurable: null }, typeof loose === 'boolean' && { loose: loose })
			);

			st.deepEqual(
				getOwnPropertyDescriptors(obj),
				{
					keyC: {
						configurable: false,
						enumerable: true,
						get: getter,
						set: setter
					}
				},
				'null nonConfigurable changes nothing (loose: `' + loose + '`)'
			);

			st.end();
		});

		t.test('no descriptors (loose: `' + loose + '`)', { skip: hasPropertyDescriptors }, function (st) {
			st['throws'](
				function () {
					defineAccessorProperty(
						{},
						'key',
						assign({ get: getter, nonConfigurable: true }, typeof loose === 'boolean' && { loose: loose })
					);
				},
				SyntaxError,
				'nonConfigurable: true always throws (loose: `' + loose + '`)'
			);

			st['throws'](
				function () {
					defineAccessorProperty(
						{},
						'key',
						assign({ get: getter, nonEnumerable: true }, typeof loose === 'boolean' && { loose: loose })
					);
				},
				SyntaxError,
				'nonEnumerable: true always throws (loose: `' + loose + '`)'
			);

			st['throws'](
				function () {
					defineAccessorProperty(
						{},
						'key',
						assign({ get: getter, set: setter }, typeof loose === 'boolean' && { loose: loose })
					);
				},
				SyntaxError,
				'setter always throws (loose: `' + loose + '`)'
			);

			if (loose) {
				/** @type {Record<PropertyKey, unknown>} */
				var obj = {};

				defineAccessorProperty(
					obj,
					'key',
					{ get: getter, loose: true }
				);

				st.equal(obj.key, 'getter', 'getter works (loose: `' + loose + '`)');
			} else {
				st['throws'](
					function () {
						defineAccessorProperty(
							{},
							'key',
							assign({ get: getter }, typeof loose === 'boolean' && { loose: loose })
						);
					},
					SyntaxError,
					'getter always throws (loose: `' + loose + '`)'
				);
			}

			st.end();
		});
	});

	t.end();
});
