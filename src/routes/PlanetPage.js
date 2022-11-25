import { transform } from 'lodash';
import React from 'react';
import {FaMapMarker} from 'react-icons/fa'
import{MdPersonPinCircle} from 'react-icons/md'


function Planet(){


  return (
    <div
      style={{
        display: 'flex',
        flexDirection:'column',
        //justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        minWidth:'100vw'
      }}  
     >
      <div id='Gamer'
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'end',
          minHeight: '80vh',
          minWidth:'100vh'
        }}
      >


          <div 
            style={{
              
              minHeight: 450,
              minWidth: 450,
              borderRadius: '50%',
              backgroundImage: `url("https://as1.ftcdn.net/v2/jpg/04/75/82/66/1000_F_475826660_j6bBIUggy3xtcXpmRRQfeKB1DCvtj67y.jpg")`,
              backgroundPosition: 'center',
              backgroundSize: '700px, 700px',
              zIndex:0,
              position: 'fixed'
              
             
            
            }}
          >
        
          </div>
          <FaMapMarker
            style={{
              height: 80,
              width: 80,
              color: 'aliceblue',
              transform: 'translate(-225px, -225px)',
              zIndex:1,
              position: 'fixed'
            }}
          />
           <FaMapMarker
            style={{
              height: 80,
              width: 80,
              color: 'aliceblue',
              transform: 'translate(225px, -225px)',
              zIndex:1,
              position: 'fixed'
            }}
          />
          <MdPersonPinCircle
            style={{
              height: 95,
              width: 95,
              color: 'aliceblue',
              transform: 'translate(0px, -450px)',
              zIndex:1,
              position: 'fixed'
            }}
          />
          <FaMapMarker
            style={{
              height: 80,
              width: 80,
              color: 'aliceblue',
              transform: 'translate(-159px, -384px)',
              zIndex:1,
              position: 'fixed'
            }}
          />
           <FaMapMarker
            style={{
              height: 80,
              width: 80,
              color: 'aliceblue',
              transform: 'translate(159px, -384px)',
              zIndex:1,
              position: 'fixed'
            }}
          />
           
          


      

            
      </div>
      
     <h1
      style={{
        backgroundColor:'black',
        //opacity:.5,
        padding:'20px',
        borderRadius:'25%',
        transform: 'translate(0px, 550px)',
        position: 'fixed',
        border: '1px solid white',
        color:'white',
        textShadow: '2px 2px 18px white'
   





      }}
     >
      SPACED OUT PRIME
     </h1>

 

      </div>
  );
}







export default Planet;







/*
function Planet() {

    
	return (
        <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
       


        <div style={{
          height: 50,
          width: 50,
          borderRadius: '50%',
          backgroundColor: 'white',
          zIndex:1,
          //transform: 'translate(-250px, 250px)'
        }}
        >
       
       <div style={{
          height: 50,
          width: 50,
          borderRadius: '50%',
          backgroundColor: 'white',
          zIndex:1,
         transform: 'translate(56px, -159px)'
          
        }}
        >
        
        </div>
            
        </div>

        <div style={{
          height: 450,
          width: 450,
          borderRadius: '50%',
         
          zIndex:0,
        }}
        >
             <div style={{
          height: 350,
          width: 350,
          borderRadius: '50%',
          backgroundImage: `url("https://toppng.com/uploads/preview/planet-png-11553974602aci6gted5v.png")`,
          backgroundPosition: 'center',
      

          zIndex:1,
          transform: 'translate(50px, 50px)'
        }}
        >
        
        </div>


            
        </div>

        <div style={{
          height: 50,
          width: 50,
          borderRadius: '50%',
          //backgroundColor: 'white',
          
          zIndex:1,
          //transform: 'translate(-250px, 250px)'
        }}
        >
          <FaMapMarker/>
          <div style={{
          height: 50,
          width: 50,
          borderRadius: '50%',
          backgroundColor: 'white',
          zIndex:1,
          transform: 'translate(-250px, -250px)'
        }}
        ></div>


        <div style={{
          height: 50,
          width: 50,
          borderRadius: '50%',
          backgroundColor: 'white',
          zIndex:1,
          transform: 'translate(-65px, -219px)'
        }}
        ></div>
            
        </div>
        
      </div>
	);
}
*/
