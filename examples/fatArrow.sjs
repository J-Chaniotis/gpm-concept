macro => {
    rule infix { ( $arg:ident (,) ... ) | { $body ... $last:expr } } => {
        (function x( $arg (,) ... ) {
            $( $body) ...
            return $last
        }).bind(this);
    }
    rule infix { ( $arg:ident (,) ... ) | $last:expr } => {
        (function x( $arg (,) ... ) {
            return $last
        }).bind(this);
    }
    rule infix { () | { $body ... $last:expr } } => {
        (function x( ) { 
            $body ...;
            return $last
        }).bind(this);
    }
    rule infix { $x | { $body ... $last:expr } } => {
        (function x($x) { 
            $body ...;
            return $last
        }).bind(this);
    }
    rule infix { $x | $last:expr } => {
        (function x($x) { 
            return $last
        }).bind(this);
    }
}

//Todo, examples