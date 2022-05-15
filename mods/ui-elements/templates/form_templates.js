module.exports = (app) => {

    return `
    <section id="page-title" class="mb-6">
    <div class="container clearfix">
      <h1 class="saito-color-primary">Forms and Selects</h1>
    </div>
  
  </section>
  
  <div class="fancy-title title-border">
    <h4>Basic Form</h4>
  </div>

  <form>
     <div class="saito-form-header">
        <h2>Register</h2>
        
     </div>
   
     <div class="saito-form-body">
          <div class="saito-form-group">
                <p class="saito-label">
                  Name
               </p>
              <div class="saito-input-group">
              
                  <input placeholder="Insert Name" />
                 
              </div>
          </div>
          <div class="saito-form-group">
               <p class="saito-label">
                  Age
              </p>
              <div class="saito-input-group">
              
                  <input placeholder="Insert Age" />
              </div>
          </div>
          <div class="saito-form-group">
               <p class="saito-label">
                  Place of Birth
              </p>
              <div class="saito-input-group">
              
                  <input placeholder="Insert Age" />
              </div>
          </div>
     </div>
   
     <div class="saito-form-footer">
          <button class="saito-btn-secondary">Submit</button>
     </div>
  </form>

  <div class="fancy-title title-border mt-6">
    <h4>Forms with grids</h4>
  </div>

  <form>
    <div class="saito-form-header">
       <h2>Apply</h2>
       
    </div>
  
    <div class="saito-form-body">
      <div class="row">
        <div class="saito-form-group col-md-12">
          <p class="saito-label">
            Saito Address
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert Name" />
           
        </div>
       </div>
        <div class="saito-form-group col-md-3">
          <p class="saito-label">
            Location
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert Location" />
           
        </div>
       </div>
      </div>
      <div class="row">
        <div class="saito-form-group col-md-6">
          <p class="saito-label">
           Age
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert Name" />
           
        </div>
       </div>
        <div class="saito-form-group col-md-6">
          <p class="saito-label">
            Something Else
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert Something Else" />
           
        </div>
       </div>
      </div>
      <div class="row">
        <div class="saito-form-group col-md-9">
          <p class="saito-label">
           Fire Sign
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert firesign" />
           
        </div>
       </div>
        <div class="saito-form-group col-md-3">
          <p class="saito-label">
            Another Thing
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert Another thing" />
           
        </div>
       </div>
      </div>
      
     
    </div>
  
    <div class="saito-form-footer">
         <button class="saito-btn-secondary">Submit</button>
    </div>
 </form>


 <div class="fancy-title title-border mt-6">
  <h4>Form with Select Input</h4>
</div>

  <form>
    <div class="saito-form-header">
       <h2>Select Something</h2>
       
    </div>
  
    <div class="saito-form-body">
      <div class="row">
        <div class="saito-form-group col-md-6">
          <p class="saito-label">
           Name
         </p>
        <div class="saito-input-group">
        
           <input  placeholder="Name"/>
           
        </div>
       </div>
       <div class="saito-form-group col-md-6">
        <p class="saito-label">
         Select Gender
       </p>
      <div class="saito-input-group">
      
          <select>
            <option>
              Male
            </option>
            <option>
              Female
            </option>
          </select>
         
      </div>
     </div>
      </div>

      <div class="row">
        <div class="saito-form-group col-md-9">
          <p class="saito-label">
           Fire Sign
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert firesign" />
           
        </div>
       </div>
        <div class="saito-form-group col-md-3">
          <p class="saito-label">
            Another Thing
         </p>
        <div class="saito-input-group">
        
            <input placeholder="Insert Another thing" />
           
        </div>
       </div>
      </div>
    
     

      
     
    </div>
  
    <div class="saito-form-footer">
         <button class="saito-btn-secondary">Submit</button>
    </div>
 </form>
        `

}