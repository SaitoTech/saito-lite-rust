import React from "react";

const Button = require('./Button').default;

const App = (app) => {
    console.log(app, "saito app")
    return (
        <div>
         <h1>Hello from React !</h1>
         <Button text="click me"/>
        </div>
  
    );
   
}

export default App