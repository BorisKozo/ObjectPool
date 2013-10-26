Object Pool - Object pool library for Node.js and the browser 
============================================================
[![Build Status](https://travis-ci.org/BorisKozo/ObjectPool.png?branch=master)](https://travis-ci.org/BorisKozo/ObjectPool)

 The Object Pool mechanism allows you to consume object from a given
pool of objects instead of creating and disposing them. The main
use case for the object pool is to reduce the footprint of garbage 
collection for memory consuming applications. The main usage is probably for
games where objects are created and destroyed very quickly especially when
dealing with particles.

## Installation
For Node.js 
````
npm install objectpool
````
For the browser you can install via [Bower](http://bower.io/)

````
bower install objectpool
````
or by copying [object-pool.min.js](/app/object-pool.min.js)

## Documentation

This readme file contains basic usage examples and 
details on the full API, including methods, 
attributes and events.

## Object Pool

Object Pool is a static object which allows you to create object pool generators.
The generators are used to retrieve and release an object.

### Accessing the Object Pool Object

In Node.js
```js
var op = require('objectpool');
```

In the browser
```html
 <scrip t src="/path/to/object-pool/object-pool.min.js"></script>
```

```js
var op = window.ObjectPool;
```
Note that you can delete the ```ObjectPool``` property from the window object once you copy it locally;

### Basic usage

You create a generator by calling the ```generate(object, [options])``` function.
There are two types of generators, a constructor generator which creates new items
using a constructor function
```js
  var generator = op.generate(function () { this.x = 0; this.y = 0; }); //This generator will generate objects with x and y properties
```

and a clone generator which generates new items by cloning the provided item:
```js
  var generator = op.generate( {x = 0, y = 0}); //This generator will generate objects with x and y properties
```

### Options

When creating a generator you may supply an ```options``` object that has the following properties

#### Options#count

The number of object to instantiate when the generator is created.

```js
 function Point() {
    this.x = 0;
    this.y = 0;
  }

  var generator = op.generate(Point, { count: 10});
  //Generator contains 10 points created using the Point constructor function
```

#### Options#init

A function that will be called for any object retrieved by this generator. 
The functions receives the returned object as ```this``` so you can simply reuse the constructor.

```js
 function Point() {
    this.x = 0;
    this.y = 0;
  }

  function initPoint(x, y) {
    this.x = x;
    this.y = y;
  }

  var generator = op.generate(Point, { count: 10, init: initPoint });
  var point = generator.get(1,2); //returns a point with x = 1 and y = 2
```

#### Options#clear

A function that will be called for every object released back into the pool of this generator.

```js
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

  var generator = op.generate(Point, { count: 10, init: initPoint, clear:destructor });
  var point = generator.get(1,2);
  generator.release(point); //
  console.log(point.x,point.y) // 00
```

#### Options#regenerate

A number or a function returning a number which indicates how many objects
the generator should create if you try to retrieve an object but there are no
objects left in the pool. If this property is unspecified then no new objects
are created.

```js
  var generator = op.generate({}, { regenerate: 1 });
  var item = generator.get(); //item == {}
```

```js
  var generator = op.generate({});
  var item = generator.get(); //item == null
```

#### Options#data

An array of objects to be initially added to the pool. If the length
of the array less than the value of ```count``` option then more objects
are generated until the generator contains ```count``` objects. If the length
of the array is greater than ```count``` then ```count``` is ignored. The objects
from the array are copied by reference to the generator pool.

```js
  var generator = op.generate({}, { data: [1, 2, 3], count: 5 });
  console.log(generator.count()); //5
  console.log(generator.get()); //1
```

#### Options#clone

**For item generators only**
A function that will be called to instantiate a new object within the generator pool.
If unspecified then the default shallow clone will be used.

```js
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

  var generator = op.generate({ x: 0, y: 0 }, { count: 10, init: initPoint, clear: destructor, clone:clone });
```

## Object Pool Generator

The generator holds the pool of objects and allows you to get an object
from the pool or release an object into the pool.

### Basic Usage

```js
  function Point(x,y) {
    this.x = x;
    this.y = y;
  }

  var generator = op.generate(Point, { count: 100, init: Point }); // Creates a pool of 100 points
  var point = generator.get(0,0); // retrieves a point from the pool
  
  ... Do stuff with point ...
  
  generator.release(point); //returns the point to the pool
  
```

### Generator#get([params])

Retrieves an object from the pool. The pool has no reference to the object therefore 
if the application doesn't reference the returned object it is eligible for garbage collection.
If the ```init``` function was specified in the generator options, it will be applied to the
returned object with the arguments provided to the get function.
If the pool is empty (i.e. contains 0 objects) and ```regenerate``` was not provided in the generator options
```null``` is returned.

```js
  function Point(x,y) {
    this.x = x;
    this.y = y;
  }

  var generator = op.generate(Point, { count: 100, init: Point }); // Creates a pool of 100 points
  var point = generator.get(0,0); // retrieves a point from the pool
```

### Generator#release(object)

Releases an object into the generator object pool. if ```clear``` function was
supplied in the generator options it will be applied on the released object passing
```this``` as the released object to the function. There is no restriction on the released
object (i.e. it can be an object that was not retrieved by the generator).
Once the object is released into the generator pool it is referenced by the pool
and is not eligible for garbage collection. You may still use the object after
it is released to the generator pool, the object within the pool is affected.

```js
  function Point(x,y) {
    this.x = x;
    this.y = y;
  }

  var generator = op.generate(Point); 
  var point = new Point(1,2); 
  generator.release(point); //returns the point to the pool
  console.log(generator.count()); // 1
```

### Generator#delete(n)

Deletes objects from the generator pool. 
If n>=1, deletes at most n objects from the generator pool.
if n<1, deletes ```count*n``` objects from the pool. The objects
are completely removed from the pool and are eligible for garbage collection.

```js
  function Point(x,y) {
    this.x = x;
    this.y = y;
  }

  var generator = op.generate(Point, { count: 105 }); // Creates a pool of 105 points

  generator.delete(5);
  console.log(generator.count()); // 100
  generator.delete(0.5); 
  console.log(generator.count()); // 50
```

### Generator#create(n)

Creates n objects and releases them into the pool. The creation method
is the one appropriate for the generator (constructor or cloning) and
uses the constructor function or the clone method provided when the
generator was created.

```js
  function Point(x,y) {
    this.x = x;
    this.y = y;
  }

  var generator = op.generate(Point); // Creates an empty pool
  generator.create(10);
  console.log(generator.count()); // 10
```

### Generator#count

A function that returns the number of objects in the generator pool

 ```js
  function Point(x,y) {
    this.x = x;
    this.y = y;
  }

  var generator = op.generate({}, { count: 3 }); 
  console.log(generator.count()); // 3
```

## Generating Arrays

The Object Pool Object comes with a build in array generator.

```js
var arr = op.array.get(); // returns []
```

This is a preconfigured clone based generator that has nothing special about it.
It is there for your convenience.

## Tests and Examples

The tests are using the ```mocha``` farmework. To run the tests do
```npm test```

There is a particle example using object pools for the browser in the example directory (see example.html).
You can run it directly from the browser. The example was written by Jarrod Overson (@jsoverson), the 
original sources are (here)[http://html5hub.com/build-a-javascript-particle-system].


## Legal Mumbo Jumbo (MIT License)
Copyright (c) 2013 Boris Kozorovitzky, 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
