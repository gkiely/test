const Immutable = require('immutable');

/**
 * Keeps nested structure while also concatenating error messsages
 * @param  {List|Map} obj object to be transformed
 * @return {List|Map}     transformed object
 */
const transformToNestedCollection = function (obj){
  return obj.map(item => {
    if(Immutable.Map.isMap(item)){
      return transformToNestedCollection(item);
    }
    else{
      return transformToFlatCollection(item);
    }
  });
};

/**
 * Flattens List|Map, removes duplicates, flattens, joins to string
 * @param  {List|Map} obj object to be transformed
 * @return {string}
 */
const transformToFlatCollection = function (obj){
  return obj
  .toSet()
  .flatten()
  .map(item => item + '.')
  .join(' ');
};

/**
 * Combines and concatenates object values into simplifed structure
 * @param  {object} obj   object to be transformed
 * @param  {string} keys  keys to ignore/keep nested structure
 * @return {object}       transformed object
 */
const transformErrors = function(obj, ...keys){
  return obj
  .map((o, k) => {
    if(keys.includes(k)){
      return transformToNestedCollection(o);
    }
    else{
      return transformToFlatCollection(o);
    }
  });
};

module.exports = transformErrors;
