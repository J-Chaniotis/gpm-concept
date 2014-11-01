
  var loadData = function (id, cb) {
  $.get('/user/' + id, function (err, user) {
    if (err) {
      return cb(err, null);
    }
    $.get('/country/' + user.countryCode, function (err, country) {
      if (err) {
        return cb(err, null);
      }
      $.get('/orders/' + id, function (err, orders) {
        if (err) {
          return cb(err, null);
        }
        $.get('relatedProducts/' + id, function (err, products) {
          if (err) {
            return cb(err, null);
          }
          // service logic, i.e gather all data into a single object
          return cb(null, data);
        });
      });
    });
  });
};

// sample usage
loadData(someid, function (err, data) {
  // service logic
});



var loadData = function (id, cb) {
    var handleError = function (err) {
    return cb(err, null);
  }
    var user = await $.get('/user/' + id) OR handleError;
    var country = await $.get('/country/' + user.countryCode) OR handleError;
    var orders = await  $.get('/orders/' + id) OR  handleError;
    var relatedProducts = await $.get('relatedProducts/' + id) OR handleError;

  // service logic, i.e gather all data into a single object
  return cb(null, data);
};


let await = macro {
  case {_ $assign $fn(.)... ($args ...) OR $err ; $rest...}=>{return #{
    $fn (.)...($args..., function (e, $assign){
  if(e){
   return $err(e);
  }
      $rest...
    })
  }}
}

let var = macro {
    // extend var and its name to await
    case {_ $name = await $val}=>{return#{await $name $val}}
    // ignore normal asignments
    case {_ $name = $val}=>{return#{var $name = $val}}
}

