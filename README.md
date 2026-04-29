# object-isEqual

Deep structural equality polyfill for ECMAScript — TC39 Stage 0 Proposal

## Version 5.2.0 — Now with snapshot option

## Features
- Recursive comparison with cycle detection
- Supports all native types (Object, Array, Map, Set, Date, RegExp, TypedArrays, etc.)
- SameValueZero by default, strict mode available
- Custom per-key or global comparators
- **NEW: snapshot option** — atomic reads via descriptors, prevents mutation during comparison
- Security hardened: anti-Symbol.toStringTag spoofing, cross-realm safe, DoS limits
- Zero dependencies

## Quick Start
 + "" + ` + "" + ash
npm install object-is-equal
 + "" + ` + "" + 

 + "" + ` + "" + js
require('object-is-equal');
Object.isEqual({a:1}, {a:1}); // true
Object.isEqual(0, -0, { strict: true }); // false
Object.isEqual(obj1, obj2, { snapshot: true }); // atomic comparison
 + "" + ` + "" + 

## Documentation
- https://dwight-trujillo.github.io/object-isEqual/

## License
MIT