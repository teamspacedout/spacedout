import { transform } from 'lodash';
import React from 'react';
import {FaMapMarker} from 'react-icons/fa'
import{MdPersonPinCircle} from 'react-icons/md'
import PlanetOrbit from "../components/PlanetOrbit";
import PlanetButton from "../components/PlanetButton";
import Planet from "../components/Planet";
import NamePlate from "../components/NamePlate";
import NavBar from "../components/NavBar"
import {FaAirbnb, FaFacebook, FaGoogle, FaInstagram, FaMagic, FaTiktok, FaTumblr, FaYahoo} from "react-icons/fa";



function PlanetPage(){


  return (
    <>
    <NavBar></NavBar>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      
      



    }}>
      
      <div class="grid grid-cols-1 gap-4">

<div>
      <PlanetOrbit scale={"225%"}
                    defaultPlanet= {<Planet img = "/assests/planets/Ice/4.png" scale={"125%"}/>}
                    remainPlanets = {[<PlanetButton scale={.75}/>, <PlanetButton scale={.75}/> ,  <PlanetButton scale={.75}/>]}
      />
</div>

      <div style={{
        display: 'inline-block',
        zIndex:'1',
        transform: 'translate(0px, 20px)'
      }}>
      <NamePlate name={"SPACED OUT PRIME"}></NamePlate>
      </div>
      

      
            
          

      </div>

    </div>
    </>
  );
}







export default PlanetPage;







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
