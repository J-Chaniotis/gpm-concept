
/*
Sweet.js version: 0.7.0
node.js 0.10.30
http://www.integralist.co.uk/posts/understanding-recursion-in-functional-javascript-programming/
install node.js and npm install -g sweet.js
run with: sjs tailCallOptimization.sjs | node
*/
var tco = function (f) {
  var value, active = false, accumulated = [];

  return function accumulator() {
    accumulated.push(arguments);

    if (!active) {
      active = true;
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift());
      }

      active = false;
      return value;
    }

  };
};


let  tailFunction = macro {
   /*
   function inside object
   var o = {
      example: tailFunction () {...}
   }
   */
   case infix {$name :|tailFunction ($args (,) ...) { $body ... }} => {
     return #{$name: tco(function ($args (,) ...){
        $body ...
    })}
  }
  /*
  function expression
  var example = tailFunction () {...}
  */
  case {_ ($args (,) ...) { $body ... }} => {
    return #{tco(function ($args (,) ...){
        $body ...
    })}
  }
  /*
  function declaration and named function expression
  tailFunction example () {...}
  var example = tailFunction example () {...}
  */
  case {_ $name ($args (,) ...) { $body ... }} => {
    return #{function $name(){
        if(! $name.__tco) {
            $name.__tco = tco(function ($args (,) ...) {
                $body...
            });
        }
        return $name.__tco.apply($name.__tco, arguments);
    }}
  }
}



// Function declaration
tailFunction sum1(x, y) {
  return y > 0 ? sum1(x + 1, y - 1) : x;
}
console.log(sum1(1,90000));


// Function expression
var sum2 = tailFunction (x,y) {
  return y > 0 ? sum2(x + 1, y - 1) : x;
};
console.log(sum2(1,90000));


// Inside object
var o = {
  sum: tailFunction (x, y) {
    return y > 0 ? o.sum(x + 1, y - 1) : x;
  }
};
console.log(o.sum(1,90000));


// Named function expression
var sum3 = tailFunction sum3 (x,y) {
  return y > 0 ? sum3(x + 1, y - 1) : x;
};
console.log(sum3(1,90000));
