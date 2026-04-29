// object-isEqual.js - v5.1.0
(function(global){
"use strict";
const Object_is=Object.is;
const nativeIsArray=Array.isArray;
const nativeIsView=ArrayBuffer.isView;
const Object_keys=Object.keys;
const Object_getOwnPropertySymbols=Object.getOwnPropertySymbols;
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
function isEqual(v1,v2,opts){
if(v1===v2)return true;
opts=Object.assign({strict:false,customComparators:{},maxDepth:1000,maxSize:10000,safe:true},opts);
return deepEqual(v1,v2,new WeakMap(),0,opts)}
function deepEqual(a,b,visited,depth,opts){
if(depth>opts.maxDepth)throw new RangeError("Max depth");
if(typeof a!=="object"||a===null||typeof b!=="object"||b===null)return opts.strict?Object_is(a,b):sameValueZero(a,b);
if(visited.has(a))return visited.get(a)===b;
visited.set(a,b);
const tagA=typeTag(a),tagB=typeTag(b);
if(tagA!==tagB)return false;
if(typeof a==="function"||typeof b==="function")return false;
switch(tagA){
case"Date":return sameValueZero(Date_getTime.call(a),Date_getTime.call(b));
case"RegExp":return a.source===b.source&&a.flags===b.flags;
case"Map":return compareMaps(a,b,visited,depth,opts);
case"Set":return compareSets(a,b,visited,depth,opts);
case"Promise":case"WeakMap":case"WeakSet":return false;
default:if(tagA.endsWith("Error"))return a.name===b.name&&a.message===b.message}
if(nativeIsArray(a)&&nativeIsArray(b)){if(a.length!==b.length)return false;return compareObjects(a,b,visited,depth,opts)}
return compareObjects(a,b,visited,depth,opts)}
function compareMaps(a,b,visited,depth,opts){
if(a.size!==b.size)return false;
const eB=[...Map_prototype_entries.call(b)];
for(const[kA,vA]of Map_prototype_entries.call(a)){let f=false;
for(let i=0;i<eB.length;i++){const[kB,vB]=eB[i];
if(deepEqual(kA,kB,visited,depth+1,opts)&&deepEqual(vA,vB,visited,depth+1,opts)){f=true;eB.splice(i,1);break}}
if(!f)return false}return true}
function compareSets(a,b,visited,depth,opts){
if(a.size!==b.size)return false;
const aB=[...Set_prototype_values.call(b)];
for(const eA of Set_prototype_values.call(a)){let f=false;
for(let i=0;i<aB.length;i++){if(deepEqual(eA,aB[i],visited,depth+1,opts)){f=true;aB.splice(i,1);break}}
if(!f)return false}return true}
function compareObjects(a,b,visited,depth,opts){
const kA=Object_keys(a).concat(Object_getOwnPropertySymbols(a).filter(s=>propIsEnum.call(a,s)));
const kB=Object_keys(b).concat(Object_getOwnPropertySymbols(b).filter(s=>propIsEnum.call(b,s)));
if(kA.length!==kB.length)return false;
for(const k of kA){const cmp=opts.customComparators[k];
if(typeof cmp==="function"){if(!cmp(a[k],b[k]))return false}
else{if(typeof a[k]==="function"&&typeof b[k]==="function")continue;if(!deepEqual(a[k],b[k],visited,depth+1,opts))return false}}
return true}
Object.defineProperty(Object,"isEqual",{value:isEqual,writable:false,configurable:false,enumerable:false})
})(typeof globalThis!=="undefined"?globalThis:(typeof self!=="undefined"?self:this));
