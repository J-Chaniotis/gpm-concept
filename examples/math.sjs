/*
Sweet.js version: 0.7.0
node.js 0.10.30
install node.js and npm install -g sweet.js
run with: sjs math.sjs | node
*/

let of = macro{rule {}=>{}}

let square = macro {rule {_ $val}=>{Math.pow($val, 2)}}

let squareRoot = macro {rule {$val}=>{Math.sqrt($val)}}

let plus = macro{rule infix{_ $a|$b}=>{$a + $b}}

let log =  macro {rule {$body... ;} => {console.log($body...)}}

let hypotenuse = macro {
  rule {_ $a  $b}=>{squareRoot((square of $a) plus (square of $b))}
}

log hypotenuse of 3 4;
log square of 3;
