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

  it('should have an array generator', function () {
    should.exist(op.array);
    var arr = op.array.get();
    should.exist(arr);
    should.exist(arr.length);
    arr.length.should.equal(0);
    arr.push("Hello");
    op.array.release(arr);
    arr.length.should.equal(0);
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

  it('should delete 2 out of 3 items', function () {
    var pool = new op.$Pool();
    var item = {};
    pool.release(item);
    pool.release(item);
    pool.release(item);
    pool.delete(2);
    pool.count().should.equal(1);
  });

  it('should delete 3 out of 2 items', function () {
    var pool = new op.$Pool();
    var item = {};
    pool.release(item);
    pool.release(item);
    pool.delete(3);
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

  it('Generator should delete 5 points', function () {
    generator.delete(5);
    generator.count().should.equal(5);
  });

  it('Generator should delete fifth of the points', function () {
    generator.delete(0.2);
    generator.count().should.equal(8);
  });

  it('Generator should create 5 more points', function () {
    generator.create(5);
    generator.count().should.equal(15);
  });

  it('Generator be initialized with data', function () {
    generator = op.generate({}, { data: [1, 2, 3] });
    generator.count().should.equal(3);
    should.strictEqual(generator.options.data, null);
  });

  it('Generator be initialized with data and count', function () {
    generator = op.generate({}, { data: [1, 2, 3], count:5 });
    generator.count().should.equal(5);
    should.strictEqual(generator.options.data, null);
  });

  it('Generator with static regeneration should not return null', function () {
    generator = op.generate({}, { regenerate: 1 });
    generator.count().should.equal(0);
    var item = generator.get();
    generator.count().should.equal(0);
    should.exist(item);
  });

  it('Generator with dynamic regeneration should not return null', function () {
    generator = op.generate({}, { regenerate: function () { return 3;} });
    generator.count().should.equal(0);
    var item = generator.get();
    generator.count().should.equal(2);
    should.exist(item);
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

  it('Generator should delete 5 points', function () {
    generator.delete(5);
    generator.count().should.equal(5);
  });

  it('Generator should delete fifth of the points', function () {
    generator.delete(0.2);
    generator.count().should.equal(8);
  });

  it('Generator should create 5 more points', function () {
    generator.create(5);
    generator.count().should.equal(15);
  });


  it('Generator should clone using the default clone method', function () {
    generator = op.generate({ x: 0, y: 0 }, { count: 2});
    should.exist(generator.clone);
    generator.count().should.equal(2);
    var item = generator.get();
    should.exist(item.x);
    should.exist(item.y);
    item.x.should.equal(0);
    item.y.should.equal(0);
  });

  it('Generator be initialized with data', function () {
    generator = op.generate({}, { data: [1, 2, 3] });
    generator.count().should.equal(3);
    should.strictEqual(generator.options.data, null);
  });

  it('Generator be initialized with data and count', function () {
    generator = op.generate({}, { data: [1, 2, 3], count: 5 });
    generator.count().should.equal(5);
    should.strictEqual(generator.options.data, null);
  });

  it('Generator with static regeneration should not return null', function () {
    generator = op.generate({}, { regenerate: 1 });
    generator.count().should.equal(0);
    var item = generator.get();
    generator.count().should.equal(0);
    should.exist(item);
  });

  it('Generator with dynamic regeneration should not return null', function () {
    generator = op.generate({}, { regenerate: function () { return 3; } });
    generator.count().should.equal(0);
    var item = generator.get();
    generator.count().should.equal(2);
    should.exist(item);
  });

});