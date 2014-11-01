let await = macro {
  case {_ $asign $fn ($args); $rest...}=>{return #{
    $fn($args, function ($asign){
      $rest...
    })
  }}
  case {_ $fn ($args); $rest...}=>{return #{
    $fn($args, function (){
      $rest...
    })
  }}
}

let var = macro {
    case {_ $name = await $val}=>{return#{await $name $val}}
    case {_ $name = $val}=>{return#{var $name = $val}}
}