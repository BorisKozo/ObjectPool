var should = require('should');
var op = require('./../app/object-pool');

describe('Object Pool', function () {
  it('should create a new constructor token', function () {
    should.exist(op.generate());
    });
});

describe('Pool', function () {

  it('should create a pool', function () {
    var pool = new op.$Pool();
    should.exist(pool);
  });

  it('should release an object into the pool', function () {
    var pool = new op.$Pool();
    pool.release({});
    pool.count().should.equal(1);
  });

  it('should get an object from the pool', function () {
    var pool = new op.$Pool();
    var item = {};
    pool.release(item);
    var item2 = pool.get();
    item.should.equal(item2);
  });

  it('should be empty if we got all the items', function () {
    var pool = new op.$Pool();
    var item = {};
    pool.release(item);
    var item2 = pool.get();
    pool.count().should.equal(0);
    item2 = pool.get();
    should.strictEqual(null,item2);
  });


});

describe('ConstructorGenerator', function () {
  var generator;
  function Point() {
    this.x = 0;
    this.y = 0;
  }

  function InitPoint(x, y) {
    this.x = x;
    this.y = y;
  }

  beforeEach(function () {
    generator = op.generate(Point, { count: 10, init: InitPoint });
  });

  it('Generator should exist', function () {
    should.exist(generator);
  });

  it('Generator should contain 10 points', function () {
    generator.count().should.equal(10);
  });


});