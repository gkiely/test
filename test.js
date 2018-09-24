const Immutable = require('immutable');
const assert = require('assert');
const transformErrors = require('./transformErrors');

describe('Pex tests', () => {
  it('Concatenate all errors to a single string for each object key separated by dot .', () => {
    const error = Immutable.fromJS({
      name: ['This field is required', 'Another error'],
      age: ['Only numeric characters are allowed'],
    });

    const result = transformErrors(error);

    // transformed
    assert.deepEqual(result.toJS(), {
      name: 'This field is required. Another error.',
      age: 'Only numeric characters are allowed.'
    });
  });

  it('should convert nested structures to a flat structure', () => {
    const error = Immutable.fromJS({
      name: {
        first: ['Only alphanumeric characters are allowed'],
        last: ['Only alphanumeric characters are allowed'],
      },
      names: [{}, {
        first: ['Only alphanumeric characters are allowed'],
        last: ['Only alphanumeric characters are allowed'],
      }, {}],
    });

    const result = transformErrors(error);

    // transformed
    assert.deepEqual(result.toJS(), {
      name: 'Only alphanumeric characters are allowed.',
      names: 'Only alphanumeric characters are allowed.',
    });
  });


  it('should preserve nested structure when key parameter matches object key', () => {
    const error = Immutable.fromJS({
      name: {
        first: ['Only alphanumeric characters are allowed'],
        last: ['Only alphanumeric characters are allowed'],
      },
      names: [{}, {
        first: ['Only alphanumeric characters are allowed'],
        last: ['Only alphanumeric characters are allowed'],
      }, {}]
    });

    const result = transformErrors(error, 'names');

    // transformed
    assert.deepEqual(result.toJS(), {
      name: 'Only alphanumeric characters are allowed.',
      names: [{}, {
        first: 'Only alphanumeric characters are allowed.',
        last: 'Only alphanumeric characters are allowed.',
      }, {}]
    });
  });


  it('should tranform errors', () => {
    // example error object returned from API converted to Immutable.Map
    const errors = Immutable.fromJS({
      name: ['This field is required'],
      age: ['This field is required', 'Only numeric characters are allowed'],
      urls: [{}, {}, {
        site: {
          code: ['This site code is invalid'],
          id: ['Unsupported id'],
        }
      }],
      url: {
        site: {
          code: ['This site code is invalid'],
          id: ['Unsupported id'],
        }
      },
      tags: [{}, {
        non_field_errors: ['Only alphanumeric characters are allowed'],
        another_error: ['Only alphanumeric characters are allowed'],
        third_error: ['Third error']
      }, {}, {
        non_field_errors: [
          'Minumum length of 10 characters is required',
          'Only alphanumeric characters are allowed',
        ],
      }],
      tag: {
        nested: {
          non_field_errors: ['Only alphanumeric characters are allowed'],
        },
      },
    });

    // in this specific case,
    // errors for `url` and `urls` keys should be nested
    // see expected object below
    const result = transformErrors(errors, 'url', 'urls');

    assert.deepEqual(result.toJS(), {
      name: 'This field is required.',
      age: 'This field is required. Only numeric characters are allowed.',
      urls: [{}, {}, {
        site: {
          code: 'This site code is invalid.',
          id: 'Unsupported id.',
        },
      }],
      url: {
        site: {
          code: 'This site code is invalid.',
          id: 'Unsupported id.',
        },
      },
      tags: 'Only alphanumeric characters are allowed. Third error. ' +
        'Minumum length of 10 characters is required.',
      tag: 'Only alphanumeric characters are allowed.',
    });
  });
});
