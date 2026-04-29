// object-isEqual.js - v5.2.0 (Added snapshot option)
(function(global){
"use strict";
const Object_is=Object.is;
const nativeIsArray=Array.isArray;
const nativeIsView=ArrayBuffer.isView;
const Object_keys=Object.keys;
const Object_getOwnPropertySymbols=Object.getOwnPropertySymbols;
const Object_getOwnPropertyDescriptor=Object.getOwnPropertyDescriptor;
const propIsEnum=Object.prototype.propertyIsEnumerable;
const originalToString=Object.prototype.toString;
const Number_valueOf=Number.prototype.valueOf;
const Boolean_valueOf=Boolean.prototype.valueOf;
const String_valueOf=String.prototype.valueOf;
const Date_getTime=Date.prototype.getTime;
const Map_prototype_entries=Map.prototype.entries;
const Set_prototype_values=Set.prototype.values;

function typeTag(v){return originalToString.call(v).slice(8,-1)}
function sameValueZero(x,y){return x===y||(x!==x&&y!==y)}

// Atomically read a value via descriptor to avoid triggering getters
function snapshotValue(obj,key){
var desc=Object_getOwnPropertyDescriptor(obj,key);
if(desc&&"value"in desc)return desc.value;
return obj[key]
}

// Create a shallow snapshot of own enumerable properties
function createSnapshot(obj){
if(typeof obj!=="object"||obj===null)return obj;
if(nativeIsArray(obj)){
var arr=[];
for(var i=0;i<obj.length;i++)arr.push(snapshotValue(obj,i));
var syms=Object_getOwnPropertySymbols(obj).filter(function(s){return propIsEnum.call(obj,s)});
for(var j=0;j<syms.length;j++)arr[syms[j]]=snapshotValue(obj,syms[j]);
return arr}
var tag=typeTag(obj);
if(tag==="Map"){var m=new Map();var entries=Map_prototype_entries.call(obj);
var entry=entries.next();
while(!entry.done){m.set(entry.value[0],entry.value[1]);entry=entries.next()}
return m}
if(tag==="Set"){var s=new Set();var values=Set_prototype_values.call(obj);
var val=values.next();
while(!val.done){s.add(val.value);val=values.next()}
return s}
if(tag==="Date")return new Date(Date_getTime.call(obj));
if(tag==="RegExp")return new RegExp(obj.source,obj.flags);
var snap={};
var keys=Object_keys(obj);
for(var k=0;k<keys.length;k++){var key=keys[k];snap[key]=snapshotValue(obj,key)}
var symbols=Object_getOwnPropertySymbols(obj).filter(function(s){return propIsEnum.call(obj,s)});
for(var l=0;l<symbols.length;l++){var sym=symbols[l];snap[sym]=snapshotValue(obj,sym)}
return snap}

function isEqual(v1,v2,opts){
if(v1===v2)return true;
opts=Object.assign({strict:false,customComparators:{},maxDepth:1000,maxSize:10000,safe:true,snapshot:false},opts);
if(opts.snapshot){v1=createSnapshot(v1);v2=createSnapshot(v2)}
return deepEqual(v1,v2,new WeakMap(),0,opts)}

function deepEqual(a,b,visited,depth,opts){
if(depth>opts.maxDepth)throw new RangeError("Object.isEqual: Maximum recursion depth exceeded");
if(typeof a!=="object"||a===null||typeof b!=="object"||b===null)return opts.strict?Object_is(a,b):sameValueZero(a,b);
if(visited.has(a))return visited.get(a)===b;
visited.set(a,b);
var tagA=typeTag(a),tagB=typeTag(b);
if(tagA!==tagB)return false;
if(typeof a==="function"||typeof b==="function")return false;
var globalCmp=opts.customComparators[Symbol.for("*")];
if(typeof globalCmp==="function"){try{return!!globalCmp(a,b)}catch(e){if(opts.safe)return false;throw e}}
switch(tagA){
case"Number":return sameValueZero(Number_valueOf.call(a),Number_valueOf.call(b));
case"Boolean":return sameValueZero(Boolean_valueOf.call(a),Boolean_valueOf.call(b));
case"String":return sameValueZero(String_valueOf.call(a),String_valueOf.call(b));
case"Date":return sameValueZero(Date_getTime.call(a),Date_getTime.call(b));
case"RegExp":return a.source===b.source&&a.flags===b.flags;
case"Map":return compareMaps(a,b,visited,depth,opts);
case"Set":return compareSets(a,b,visited,depth,opts);
case"Promise":case"WeakMap":case"WeakSet":return false;
default:if(tagA.endsWith("Error")){
var nameA=snapshotValue(a,"name"),nameB=snapshotValue(b,"name");
var msgA=snapshotValue(a,"message"),msgB=snapshotValue(b,"message");
return nameA===nameB&&msgA===msgB}}
if(nativeIsArray(a)&&nativeIsArray(b)){if(a.length!==b.length)return false;return compareObjects(a,b,visited,depth,opts)}
return compareObjects(a,b,visited,depth,opts)}

function compareMaps(a,b,visited,depth,opts){
if(a.size>opts.maxSize||b.size>opts.maxSize)throw new RangeError("Object.isEqual: Maximum collection size exceeded");
if(a.size!==b.size)return false;
var eB=[],entriesB=Map_prototype_entries.call(b),eb=entriesB.next();
while(!eb.done){eB.push(eb.value);eb=entriesB.next()}
var entriesA=Map_prototype_entries.call(a),ea=entriesA.next();
while(!ea.done){var kA=ea.value[0],vA=ea.value[1],found=false;
for(var i=0;i<eB.length;i++){var kB=eB[i][0],vB=eB[i][1];
try{if(deepEqual(kA,kB,visited,depth+1,opts)&&deepEqual(vA,vB,visited,depth+1,opts)){found=true;eB.splice(i,1);break}}
catch(e){if(!opts.safe)throw e;return false}}
if(!found)return false;ea=entriesA.next()}
return true}

function compareSets(a,b,visited,depth,opts){
if(a.size>opts.maxSize||b.size>opts.maxSize)throw new RangeError("Object.isEqual: Maximum collection size exceeded");
if(a.size!==b.size)return false;
var aB=[],valsB=Set_prototype_values.call(b),vb=valsB.next();
while(!vb.done){aB.push(vb.value);vb=valsB.next()}
var valsA=Set_prototype_values.call(a),va=valsA.next();
while(!va.done){var eA=va.value,found=false;
for(var i=0;i<aB.length;i++){
try{if(deepEqual(eA,aB[i],visited,depth+1,opts)){found=true;aB.splice(i,1);break}}
catch(e){if(!opts.safe)throw e;return false}}
if(!found)return false;va=valsA.next()}
return true}

function compareObjects(a,b,visited,depth,opts){
try{
var symsA=Object_getOwnPropertySymbols(a).filter(function(s){return propIsEnum.call(a,s)});
var symsB=Object_getOwnPropertySymbols(b).filter(function(s){return propIsEnum.call(b,s)});
var kA=Object_keys(a).concat(symsA),kB=Object_keys(b).concat(symsB);
if(kA.length!==kB.length)return false;
for(var i=0;i<kA.length;i++){
var key=kA[i],cmp=opts.customComparators[key];
if(typeof cmp==="function"){var valA,valB;
try{valA=snapshotValue(a,key);valB=snapshotValue(b,key)}catch(e){if(opts.safe)return false;throw e}
if(!cmp(valA,valB))return false}
else{var vA,vB;
try{vA=snapshotValue(a,key);vB=snapshotValue(b,key)}catch(e){if(opts.safe)return false;throw e}
if(typeof vA==="function"&&typeof vB==="function")continue;
if(!deepEqual(vA,vB,visited,depth+1,opts))return false}}
return true}
catch(e){if(opts.safe)return false;throw e}}

Object.defineProperty(Object,"isEqual",{value:isEqual,writable:false,configurable:false,enumerable:false})
})(typeof globalThis!=="undefined"?globalThis:(typeof self!=="undefined"?self:this));
