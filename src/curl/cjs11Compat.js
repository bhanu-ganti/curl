/**
 (c) copyright 2011 unscriptable.com / John Hann
 */
/**
 * @experimental
 */
define(function () {


	var doc, globalEval /*, findRequiresRx, myId*/;

//	findRequiresRx = /require\s*\(\s*['"](\w+)['"]\s*\)/,

//	function nextId (index) {
//		var varname = '', part;
//		do {
//			part = index % 26;
//			varname += String.fromCharCode(part + 65);
//			index -= part;
//		}
//		while (index > 0);
//		return 'curl$' + varname;
//	}

//	/**
//	 * @description Finds the require() instances in the source text of a cjs
//	 * 	 module and collects them. If removeRequires is true, it also replaces
//	 * 	 them with a unique variable name. All unique require()'d module ids
//	 * 	 are assigned a unique variable name to be used in the define(deps)
//	 * 	 that will be constructed to wrap the cjs module.
//	 * @param source - source code of cjs module
//	 * @param moduleIds - hashMap (object) to receive pairs of moduleId /
//	 *   unique variable name
//	 * @param removeRequires - if truthy, replaces all require() instances with
//	 *   a unique variable
//	 * @return - source code of cjs module, possibly with require()s replaced
//	 */
//	function parseDepModuleIds (source, moduleIds, removeRequires) {
//		var index = 0;
//		// fast parse
//		source = source.replace(findRequiresRx, function (match, id) {
//			if (!moduleIds[id]) {
//				moduleIds[id] = nextId(index++);
//				moduleIds.push(id);
//			}
//			return removeRequires ? moduleIds[id] : match;
//		});
//		return source;
//	}

	// evaluate in global context.
	// see http://perfectionkills.com/global-eval-what-are-the-options/
	globalEval = eval;

	doc = document;

	function wrapSource (source, resourceId) {
		return "define('" + resourceId + "'," +
			"['require','exports','module'],function(require,exports,module){" +
			source + "\n});\n";
	}

	var injectSource = function (el, source) {
		// got this from Stoyan Stefanov (http://www.phpied.com/dynamic-script-and-style-elements-in-ie/)
		injectSource = ('text' in el) ?
			function (el, source) { el.text = source; } :
			function (el, source) { el.appendChild(doc.createTextNode(source)); };
		injectSource(el, source);
	};

	function injectScript (source) {
		var el = doc.createElement('script');
		injectSource(el, source);
		doc.body.appendChild(el);
	}

	return {
		'load': function (resourceId, require, loaded, config) {
			// TODO: extract xhr from text! plugin and use that instead?
			require(['text!' + resourceId + '.js', 'curl/_privileged'], function (source, priv) {
				var moduleMap;

				// find (and replace?) dependencies
				moduleMap = priv.core.extractCjsDeps(source);
				//source = parseDepModuleIds(source, moduleMap, config.replaceRequires);

				// get deps
				require(moduleMap, function () {

					// wrap source in a define
					source = wrapSource(source, resourceId);

					if (config.injectScript) {
						injectScript(source);
					}
					else {
						globalEval(source);
					}

					// call loaded now that the module is defined
					loaded(require(resourceId));

				});

			});
		}
	};

});
