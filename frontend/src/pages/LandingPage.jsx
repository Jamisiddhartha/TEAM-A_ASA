import React from "react";
import { Link } from "react-router-dom";

import uidaiLogo from "../assets/uidai-logo.jpg";

import heroImage from "../assets/aadhaar.png";

import securityIcon from "../assets/security.png";

import trackIcon from "../assets/track.jpeg";

import secureIcon from "../assets/secure.jpeg";

 

const LandingPage = () => {

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col">

 

      <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-50">

        <div className="max-w-screen-xl mx-auto px-8 py-3 flex items-center">

 

          <div className="flex items-center gap-3">

            <img src={uidaiLogo} className="h-10" />

            <div>

              <h1 className="text-xl font-semibold">

                <span style={{color:"#FFE600"}}>UIDAI</span>

              </h1>

              <p className="text-xs text-gray-500">ASA Onboarding</p>

            </div>

          </div>

 

          <nav className="hidden md:flex items-center ml-auto gap-6 text-sm text-gray-700">

            <a href="#" className="hover:text-orange-500 cursor-pointer">Home</a>

            <a href="#" className="hover:text-orange-500 cursor-pointer">About</a>

            <a href="#" className="hover:text-orange-500 cursor-pointer">Onboarding Process</a>
            <a href="#" className="hover:text-orange-500 cursor-pointer">Guidelines</a>
           

          </nav>

          <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-6">
           <Link 
to="/register"
className="px-3 md:px-4 py-2 rounded-md font-semibold text-black bg-[#FFE600] hover:bg-[#e6cf00] active:scale-95 transition-all duration-200 shadow-sm"
>
Register
</Link>
         <Link 
to="/login"
className="px-3 md:px-4 py-2 rounded-md font-semibold text-black bg-[#FFE600] hover:bg-[#e6cf00] active:scale-95 transition-all duration-200 shadow-sm"
>
Login
</Link>
          </div>

        </div>

      </header>

   
      <section className="w-full min-h-screen bg-center bg-cover bg-no-repeat

      flex items-center" style={{ backgroundImage: `url(${heroImage})` }}>

 

        <div className="pl-4 md:pl-8">

          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">

            Authentication Service

            <br />

           <span style={{color:"#FFE600"}}>Agency Portal</span>

          </h2>

 

          <p className="mt-6 text-lg text-gray-600 max-w-md">

            Secure platform to apply & manage ASA onboarding and access services in a transparent manner.

          </p>

 

          <div className="mt-8 flex flex-col md:flex-row gap-4">
                <Link
to="/login"
className="px-6 py-3 text-center text-black bg-[#FFE600] rounded-lg font-medium hover:bg-[#e6cf00] active:scale-95 transition-all duration-200 shadow-md"
>
Apply Now
</Link>

 

            <a

              href="#"

              className="px-6 py-3 text-center border border-gray-300 rounded-lg hover:bg-gray-100 font-medium active:scale-95 transition-all duration-200"

            >

              Learn More

            </a>

          </div>

        </div>

 

      </section>

 

      <section className="bg-gray-100 py-5 pb-20">

        <div className="max-w-screen-xl mx-auto px-2 text-center">

 

          <h3 className="text-3xl font-semibold text-gray-800">

           Key <span style={{color:"#FFE600"}}>Features</span>

          </h3>

 

          <div className="grid md:grid-cols-3 gap-8 mt-12">

 

            <div className="bg-white p-8 rounded-xl shadow-lg

            hover:scale-110 transition duration-300">

              <img src={securityIcon} className="h-16 mx-auto mb-4" />

              <h4 className="text-lg font-semibold">Security Authentication</h4>

              <p className="text-gray-500 mt-2 text-sm">

                Robust security measures to protect your data and privacy

              </p>

            </div>

 

            <div className="bg-white p-8 rounded-xl shadow-lg

            hover:scale-110 transition duration-300">

              <img src={trackIcon} className="h-16 mx-auto mb-4" />

              <h4 className="text-lg font-semibold">Track Application Status</h4>

              <p className="text-gray-500 mt-2 text-sm">

                Get real-time updates on your application progress

              </p>

            </div>

 

            <div className="bg-white p-8 rounded-xl shadow-lg

            hover:scale-110 transition duration-300">

              <img src={secureIcon} className="h-16 mx-auto mb-4" />

              <h4 className="text-lg font-semibold">Transparent Process</h4>

              <p className="text-gray-500 mt-2 text-sm">

                Experience a fully digital and transparent onboarding process

              </p>

            </div>

 

          </div>

        </div>

      </section>

 

      <footer className="bg-white border-t py-4 fixed bottom-0 left-0 w-full z-50">

        <div className="max-w-screen-xl mx-auto px-8 flex items-center justify-between text-sm text-gray-500">

 

          <div className="flex items-center gap-2">

            <img src={uidaiLogo} className="h-6" />

            <span>UIDAI ASA Portal</span>

          </div>

 

          <div className="flex gap-6">

            <a href="#">Contact</a>

            <a href="#">Privacy</a>

            <a href="#">Terms</a>

          </div>

 

        </div>

      </footer>

 

    </div>

  );

};

 

export default LandingPage;

 