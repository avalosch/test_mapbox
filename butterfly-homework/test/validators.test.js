'use strict';

const { validateButterfly, validateUser, validateRating } = require('../src/validators');

describe('validateButterfly', () => {
  const validButterfly = {
    commonName: 'Butterfly Name',
    species: 'Species name',
    article: 'http://example.com/article'
  };

  it('is ok for a valid butterfly', () => {
    const result = validateButterfly(validButterfly);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateButterfly({});
    }).toThrow('The following properties have invalid values:');

    expect(() => {
      validateButterfly({
        ...validButterfly,
        commonName: 123
      });
    }).toThrow('commonName must be a string.');

    expect(() => {
      validateButterfly({
        extra: 'field',
        ...validButterfly
      });
    }).toThrow('The following keys are invalid: extra');
  });
});

describe('validateUser', () => {
  const validUser = {
    username: 'test-user'
  };

  it('is ok for a valid user', () => {
    const result = validateUser(validUser);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateUser({});
    }).toThrow('username is required');

    expect(() => {
      validateUser({
        extra: 'field',
        ...validUser
      });
    }).toThrow('The following keys are invalid: extra');

    expect(() => {
      validateUser({
        username: [555]
      });
    }).toThrow('username must be a string');
  });
});

describe('validateRating', () => {
  const validRating = {
    id: 'OOWzUaHLsK',
    rating: 5,
    butterfly: 'Blue'
  };

  it('is ok for a valid user', () => {
    const result = validateRating(validRating);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateRating({ id:'some_id', butterfly:'butterflies' });
    }).toThrow('rating is required');

    expect(() => {
      validateRating({
        extra: 'field',
        ...validRating
      });
    }).toThrow('The following keys are invalid: extra');

    expect(() => {
      validateRating({
        id: [555]
      });
    }).toThrow('id must be a string');
  });
});
