import React from "react";

const  Button = ({text}) =>{

  return (
    <button onClick={()=> salert("Button clicked")}>{text}</button>
  );
}

export default Button