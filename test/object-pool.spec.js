var should = require('should');
var op = require('./../app/object-pool');

describe('Object Pool', function () {
  it('should create a new constructor token', function () {
    var generator = op.generate(function () { });
    should.exist(generator);
    should.exist(generator.constructor);
  });

  it('should create a new constructor token', function () {
    var generator = op.generate({});
    should.exist(generator);
    should.exist(generator.item);
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

  it('should offload 2 out of 3 items', function () {
    var pool = new op.$Pool();
    var item = {};
    pool.release(item);
    pool.release(item);
    pool.release(item);
    pool.offload(2);
    pool.count().should.equal(1);
  });

  it('should offload 3 out of 2 items', function () {
    var pool = new op.$Pool();
    var item = {};
    pool.release(item);
    pool.release(item);
    pool.offload(3);
    pool.count().should.equal(0);
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

describe('Constructor Generator', function () {
  var generator;
  function Point() {
    this.x = 0;
    this.y = 0;
  }

  function initPoint(x, y) {
    this.x = x;
    this.y = y;
  }

  function destructor() {
    this.x = 0;
    this.y = 0;
  }

  beforeEach(function () {
    generator = op.generate(Point, { count: 10, init: initPoint, clear:destructor });
  });

  it('Generator should exist', function () {
    should.exist(generator);
    should.exist(generator.constructor);
  });

  it('Generator should contain 10 points', function () {
    generator.count().should.equal(10);
  });

  it('Generator should release a point', function () {
    var point = generator.get(1, 2);
    point.x.should.equal(1);
    point.y.should.equal(2);
    generator.count().should.equal(9);
    generator.release(point);
    point.x.should.equal(0);
    point.y.should.equal(0);
    generator.count().should.equal(10);
  });


});

describe('Clone Generator', function () {
  var generator;
  function clone(point) {
    return { x: point.x, y: point.y };
  }

  function initPoint(x, y) {
    this.x = x;
    this.y = y;
  }

  function destructor() {
    this.x = 0;
    this.y = 0;
  }

  beforeEach(function () {
    generator = op.generate({ x: 0, y: 0 }, { count: 10, init: initPoint, clear: destructor, clone:clone });
  });

  it('Generator should exist', function () {
    should.exist(generator);
    should.exist(generator.item);

  });

  it('Generator should contain 10 points', function () {
    generator.count().should.equal(10);
  });

  it('Generator should release a point', function () {
    var point = generator.get(1, 2);
    point.x.should.equal(1);
    point.y.should.equal(2);
    generator.count().should.equal(9);
    generator.release(point);
    point.x.should.equal(0);
    point.y.should.equal(0);
    generator.count().should.equal(10);
  });


});